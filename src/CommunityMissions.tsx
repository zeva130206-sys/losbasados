import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";

export type CommunityMissionGame = {
  id: string;
  title: string;
};

export type CommunityMissionsUser = {
  id?: string;
  name: string;
} | null;

export type CommunityMissionsProps = {
  games: CommunityMissionGame[];
  user: CommunityMissionsUser;
  isMod: boolean;
};

type Mission = {
  id: string;
  title: string;
  description: string;
  linkedGameId: string;
  linkedGameTitle: string;
  evidenceType: "image" | "video";
  rewardXp: number;
};

type Submission = {
  id: string;
  missionTitle: string;
  displayName: string;
  evidenceUrl: string;
  evidenceType: "image" | "video";
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

type LeaderboardEntry = {
  uid: string;
  displayName: string;
  xp: number;
  badges: string[];
};

declare global {
  interface Window {
    __LOS_BASADOS_MEDIA_API__?: string;
    compressMissionImage?: (file: File) => Promise<Blob>;
    getLosBasadosAuthToken?: () => Promise<string | null>;
  }
}

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);
const imageLimit = 1024 * 1024;
const videoLimit = 24 * 1024 * 1024;

function apiUrl(path: string) {
  const base = window.__LOS_BASADOS_MEDIA_API__?.replace(/\/+$/, "");
  if (!base) throw new Error("El servicio de misiones no está configurado.");
  return `${base}${path}`;
}

async function authHeaders() {
  const token = await window.getLosBasadosAuthToken?.();
  if (!token) throw new Error("Inicia sesión con un correo verificado para continuar.");
  return { Authorization: `Bearer ${token}` };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init);
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `La solicitud falló (${response.status}).`);
  return payload;
}

async function videoDuration(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<number>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error("No se pudieron leer los metadatos del video."));
      video.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

export default function CommunityMissions({ games, user, isMod }: CommunityMissionsProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedMission, setSelectedMission] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameId, setGameId] = useState(games[0]?.id || "");
  const [requiredEvidenceType, setRequiredEvidenceType] = useState<"image" | "video">("image");
  const [rewardXp, setRewardXp] = useState(100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selectedMissionRecord = missions.find((mission) => mission.id === selectedMission);

  const refresh = useCallback(async () => {
    const [missionData, leaderboardData] = await Promise.all([
      requestJson<{ missions: Mission[] }>("/api/missions"),
      requestJson<{ leaderboard: LeaderboardEntry[] }>("/api/leaderboard"),
    ]);
    setMissions(missionData.missions);
    setLeaderboard(leaderboardData.leaderboard);
    window.dispatchEvent(new CustomEvent("losbasados:community-badges", {
      detail: leaderboardData.leaderboard.map(({ uid, badges }) => ({ uid, badges })),
    }));
    if (isMod) {
      const headers = await authHeaders();
      const reviewData = await requestJson<{ submissions: Submission[] }>("/api/missions/submissions", { headers });
      setSubmissions(reviewData.submissions);
    }
  }, [isMod]);

  useEffect(() => {
    refresh().catch((loadError: unknown) => setError(readableError(loadError)));
  }, [refresh]);

  useEffect(() => {
    const handleRefreshRequest = () => {
      refresh().catch((loadError: unknown) => setError(readableError(loadError)));
    };
    window.addEventListener("losbasados:request-community-badges", handleRefreshRequest);
    return () => window.removeEventListener("losbasados:request-community-badges", handleRefreshRequest);
  }, [refresh]);

  const onEvidenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEvidence(event.target.files?.[0] || null);
    setError("");
    setNotice("");
  };

  const submitEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setNotice("");
    if (!selectedMission || !evidence) {
      setError("Selecciona una misión y adjunta una imagen o video.");
      return;
    }
    setBusy(true);
    try {
      const isImage = imageTypes.has(evidence.type);
      const isVideo = videoTypes.has(evidence.type);
      if (!isImage && !isVideo) {
        throw new Error("Usa JPEG, PNG o WebP de hasta 1 MB, o MP4/WebM de hasta 24 MB.");
      }
      if (selectedMissionRecord?.evidenceType !== (isVideo ? "video" : "image")) {
        throw new Error(`Esta misión requiere ${selectedMissionRecord?.evidenceType === "video" ? "un video" : "una imagen"}.`);
      }
      const uploadFile = isImage && evidence.size > imageLimit
        ? await window.compressMissionImage?.(evidence)
        : evidence;
      if (!uploadFile) throw new Error("La compresión de imagen no está disponible. Recarga la página e inténtalo de nuevo.");
      if (uploadFile.size > (isImage ? imageLimit : videoLimit)) {
        throw new Error("La captura supera 1 MB incluso después de comprimirla. Usa una imagen de menor tamaño.");
      }
      if (isVideo) {
        const duration = await videoDuration(evidence);
        if (!Number.isFinite(duration) || duration <= 0 || duration > 30) {
          throw new Error("El video debe durar 30 segundos o menos.");
        }
      }
      const headers = await authHeaders();
      const upload = await fetch(apiUrl("/api/media"), {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": uploadFile.type,
          "X-Media-Scope": isVideo ? "mission-video" : "mission-evidence",
        },
        body: uploadFile,
      });
      const uploadResult = await upload.json() as { url?: string; error?: string };
      if (!upload.ok || !uploadResult.url) throw new Error(uploadResult.error || "No se pudo subir la evidencia.");
      await requestJson("/api/missions/submissions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: selectedMission, evidenceUrl: uploadResult.url }),
      });
      setNotice("Evidencia enviada. Un moderador la revisará pronto.");
      setEvidence(null);
      form.reset();
      await refresh();
    } catch (submitError: unknown) {
      setError(readableError(submitError));
    } finally {
      setBusy(false);
    }
  };

  const createMission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const headers = await authHeaders();
      const game = games.find((item) => item.id === gameId);
      if (!game) throw new Error("Selecciona un juego válido.");
      await requestJson("/api/missions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, linkedGameId: game.id, linkedGameTitle: game.title, evidenceType: requiredEvidenceType, rewardXp }),
      });
      setTitle("");
      setDescription("");
      setNotice("Misión creada.");
      await refresh();
    } catch (createError: unknown) {
      setError(readableError(createError));
    } finally {
      setBusy(false);
    }
  };

  const review = async (submissionId: string, decision: "approve" | "reject") => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const headers = await authHeaders();
      await requestJson(`/api/missions/submissions/${encodeURIComponent(submissionId)}/review`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      setNotice(decision === "approve" ? "Evidencia aprobada; EXP aplicado de forma segura." : "Evidencia rechazada.");
      await refresh();
    } catch (reviewError: unknown) {
      setError(readableError(reviewError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lb-missions" aria-labelledby="lb-missions-title">
      <style>{`
        .lb-missions{--mission-card:#141923;--mission-line:#2b3441;color:#eef2f8;padding:24px 0}
        .lb-missions *{box-sizing:border-box}
        .lb-missions h2,.lb-missions h3{margin:0 0 12px}
        .lb-missions p{color:#aab5c5;line-height:1.55}
        .lb-mission-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
        .lb-mission-card,.lb-mission-panel{background:var(--mission-card);border:1px solid var(--mission-line);border-radius:14px;padding:18px}
        .lb-mission-card p{min-height:48px}
        .lb-mission-meta{display:flex;justify-content:space-between;gap:12px;color:#b8c5d6;font-size:.88rem;flex-wrap:wrap}
        .lb-mission-form{display:grid;gap:10px;margin-top:18px}
        .lb-mission-form input,.lb-mission-form textarea,.lb-mission-form select{width:100%;border:1px solid var(--mission-line);border-radius:8px;background:#0d1118;color:inherit;padding:10px;font:inherit}
        .lb-mission-form textarea{min-height:90px;resize:vertical}
        .lb-mission-button{border:0;border-radius:8px;background:#a5ef68;color:#111;padding:10px 14px;font-weight:700;cursor:pointer}
        .lb-mission-button:disabled{opacity:.55;cursor:wait}
        .lb-mission-error,.lb-mission-notice{margin:12px 0;padding:10px 12px;border-radius:8px}
        .lb-mission-error{background:#421f27;color:#ffd9df}.lb-mission-notice{background:#173622;color:#c9ffd5}
        .lb-mission-review{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--mission-line)}
        .lb-mission-review a{color:#a5ef68}.lb-mission-review-actions{display:flex;gap:8px}
        .lb-mission-leader{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--mission-line)}
        @media(max-width:600px){.lb-mission-review{grid-template-columns:1fr}.lb-mission-review-actions{flex-wrap:wrap}}
      `}</style>
      <h2 id="lb-missions-title">Misiones de la comunidad</h2>
      <p>Completa retos, comparte evidencia y gana EXP. Las imágenes y videos se revisan antes de otorgar recompensas.</p>
      {error && <div className="lb-mission-error" role="alert">{error}</div>}
      {notice && <div className="lb-mission-notice" role="status">{notice}</div>}

      <div className="lb-mission-grid">
        {missions.map((mission) => (
          <article className="lb-mission-card" key={mission.id}>
            <h3>{mission.title}</h3>
            <p>{mission.description}</p>
            <div className="lb-mission-meta"><span>🎮 {mission.linkedGameTitle}</span><span>{mission.evidenceType === "video" ? "Video requerido" : "Captura requerida"}</span><strong>{mission.rewardXp} EXP</strong></div>
          </article>
        ))}
        {!missions.length && <p>Aún no hay misiones activas.</p>}
      </div>

      <div className="lb-mission-panel" style={{ marginTop: 18 }}>
        <h3>Enviar evidencia</h3>
        {!user && <p>Inicia sesión con un correo verificado para participar.</p>}
        <form className="lb-mission-form" onSubmit={submitEvidence}>
          <select aria-label="Misión" value={selectedMission} onChange={(event) => setSelectedMission(event.target.value)} required>
            <option value="">Elige una misión</option>
            {missions.map((mission) => <option value={mission.id} key={mission.id}>{mission.title}</option>)}
          </select>
          <select value={requiredEvidenceType} onChange={(event) => setRequiredEvidenceType(event.target.value === "video" ? "video" : "image")} aria-label="Tipo de evidencia" required>
            <option value="image">Requiere captura de pantalla</option>
            <option value="video">Requiere video corto (máximo 30 s)</option>
          </select>
          <input type="file" accept={selectedMissionRecord?.evidenceType === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} onChange={onEvidenceChange} required />
          <small>Las capturas grandes se comprimen a WebP (máximo 1 MB). Video MP4/WebM: hasta 24 MB y 30 segundos.</small>
          <button className="lb-mission-button" type="submit" disabled={!user || busy || !missions.length}>{busy ? "Procesando…" : "Enviar evidencia"}</button>
        </form>
      </div>

      {isMod && (
        <div className="lb-mission-grid" style={{ marginTop: 18 }}>
          <section className="lb-mission-panel">
            <h3>Crear misión</h3>
            <form className="lb-mission-form" onSubmit={createMission}>
              <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={80} placeholder="Título (3–80 caracteres)" required />
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={1200} placeholder="Descripción (10–1200 caracteres)" required />
              <select value={gameId} onChange={(event) => setGameId(event.target.value)} required>
                <option value="">Juego vinculado</option>
                {games.map((game) => <option value={game.id} key={game.id}>{game.title}</option>)}
              </select>
              <input type="number" value={rewardXp} onChange={(event) => setRewardXp(Number(event.target.value))} min={10} max={5000} step={1} required aria-label="Recompensa EXP" />
              <button className="lb-mission-button" type="submit" disabled={busy || !games.length}>Crear misión</button>
            </form>
          </section>
          <section className="lb-mission-panel">
            <h3>Revisar evidencias</h3>
            {submissions.filter((submission) => submission.status === "pending").map((submission) => (
              <article className="lb-mission-review" key={submission.id}>
                <div>
                  <strong>{submission.missionTitle}</strong><br />
                  <span>{submission.displayName || "Jugador"} · {new Date(submission.submittedAt).toLocaleDateString()}</span><br />
                  <a href={submission.evidenceUrl} target="_blank" rel="noopener noreferrer">Abrir evidencia ({submission.evidenceType})</a>
                </div>
                <div className="lb-mission-review-actions">
                  <button className="lb-mission-button" type="button" disabled={busy} onClick={() => review(submission.id, "approve")}>Aprobar</button>
                  <button className="lb-mission-button" type="button" disabled={busy} onClick={() => review(submission.id, "reject")}>Rechazar</button>
                </div>
              </article>
            ))}
            {!submissions.some((submission) => submission.status === "pending") && <p>No hay evidencias pendientes.</p>}
          </section>
        </div>
      )}

      <section className="lb-mission-panel" style={{ marginTop: 18 }}>
        <h3>Clasificación EXP</h3>
        {leaderboard.map((entry, index) => (
          <div className="lb-mission-leader" key={`${entry.displayName}-${index}`}>
            <span>#{index + 1} {entry.displayName} {entry.badges?.length ? "🏅" : ""}</span><strong>{entry.xp} EXP</strong>
          </div>
        ))}
        {!leaderboard.length && <p>La clasificación aparecerá cuando se aprueben evidencias.</p>}
      </section>
    </section>
  );
}
