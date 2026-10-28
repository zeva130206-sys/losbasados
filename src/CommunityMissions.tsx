import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Camera,
  Check,
  Clock3,
  Gamepad2,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  Video,
} from "lucide-react";

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
  coverUrl?: string;
  coverType?: "image" | "video";
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

async function uploadMedia(file: File, scope: "mission-cover" | "mission-evidence" | "mission-video") {
  const isImage = imageTypes.has(file.type);
  const isVideo = videoTypes.has(file.type);
  if ((scope === "mission-video" && !isVideo) ||
      (scope !== "mission-video" && !isImage && !isVideo)) {
    throw new Error(scope === "mission-video"
      ? "Elige un video MP4 o WebM."
      : "Usa una imagen JPEG, PNG o WebP, o un video MP4/WebM.");
  }
  if (isVideo) {
    if (file.size > videoLimit) throw new Error("El video no puede superar 24 MB.");
    const duration = await videoDuration(file);
    if (!Number.isFinite(duration) || duration <= 0 || duration > 30) {
      throw new Error("El video debe durar 30 segundos o menos.");
    }
  }
  const uploadFile = isImage && file.size > imageLimit
    ? await window.compressMissionImage?.(file)
    : file;
  if (!uploadFile) throw new Error("La compresión de imagen no está disponible. Recarga la página e inténtalo de nuevo.");
  if (isImage && uploadFile.size > imageLimit) {
    throw new Error("La imagen supera 1 MB incluso después de comprimirla.");
  }
  const headers = await authHeaders();
  const upload = await fetch(apiUrl("/api/media"), {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": uploadFile.type,
      "X-Media-Scope": scope,
    },
    body: uploadFile,
  });
  const result = await upload.json() as { url?: string; error?: string; mediaType?: "image" | "video" };
  if (!upload.ok || !result.url) throw new Error(result.error || "No se pudo subir el archivo.");
  return { url: result.url, type: result.mediaType || (isVideo ? "video" : "image") };
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function missionIdFromHash() {
  const match = window.location.hash.match(/^#\/community\/missions\/([0-9a-f-]{36})$/i);
  return match?.[1] || "";
}

function Media({ src, type, className = "" }: { src: string; type: "image" | "video"; className?: string }) {
  return type === "video"
    ? <video className={className} src={src} controls playsInline preload="none" />
    : <img className={className} src={src} alt="" loading="lazy" decoding="async" />;
}

function EvidenceCard({ submission }: { submission: Submission }) {
  const isApproved = submission.status === "approved";
  return (
    <article className="lb-mission-evidence-card">
      <a className="lb-mission-evidence-media" href={submission.evidenceUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir evidencia en una pestaña nueva">
        <Media src={submission.evidenceUrl} type={submission.evidenceType} />
      </a>
      <div className="lb-mission-evidence-copy">
        <strong>{submission.displayName || "Jugador"}</strong>
        <span><Clock3 size={13} /> {new Date(submission.submittedAt).toLocaleDateString()}</span>
        <span className={`lb-mission-status${isApproved ? " is-approved" : ""}`}>
          {isApproved ? <Check size={12} /> : <Clock3 size={12} />}
          {isApproved ? "Misión aprobada" : "En revisión"}
        </span>
      </div>
    </article>
  );
}

export default function CommunityMissions({ games, user, isMod }: CommunityMissionsProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gallery, setGallery] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [detailMissionId, setDetailMissionId] = useState(missionIdFromHash);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameId, setGameId] = useState(games[0]?.id || "");
  const [requiredEvidenceType, setRequiredEvidenceType] = useState<"image" | "video">("image");
  const [rewardXp, setRewardXp] = useState(100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const selectedMission = missions.find((mission) => mission.id === detailMissionId);

  const refresh = useCallback(async () => {
    setError("");
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
    const syncMissionRoute = () => setDetailMissionId(missionIdFromHash());
    const refreshCommunityData = () => {
      syncMissionRoute();
      refresh().catch((loadError: unknown) => setError(readableError(loadError)));
    };
    window.addEventListener("hashchange", syncMissionRoute);
    window.addEventListener("losbasados:request-community-badges", refreshCommunityData);
    return () => {
      window.removeEventListener("hashchange", syncMissionRoute);
      window.removeEventListener("losbasados:request-community-badges", refreshCommunityData);
    };
  }, [refresh]);

  useEffect(() => {
    if (!cover) {
      setCoverPreview("");
      return;
    }
    const url = URL.createObjectURL(cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  useEffect(() => {
    if (!selectedMission) {
      setGallery([]);
      return;
    }
    let active = true;
    requestJson<{ submissions: Submission[] }>(`/api/missions/${encodeURIComponent(selectedMission.id)}/submissions`)
      .then(({ submissions: items }) => { if (active) setGallery(items); })
      .catch((galleryError: unknown) => { if (active) setError(readableError(galleryError)); });
    return () => { active = false; };
  }, [selectedMission]);

  const openMission = (mission: Mission) => {
    const nextHash = `#/community/missions/${encodeURIComponent(mission.id)}`;
    if (window.location.hash === nextHash) setDetailMissionId(mission.id);
    else window.location.hash = nextHash.slice(1);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const returnToMissionList = () => {
    window.location.hash = "/community";
    setDetailMissionId("");
    setEvidence(null);
    setError("");
    setNotice("");
  };

  const onEvidenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEvidence(event.target.files?.[0] || null);
    setError("");
    setNotice("");
  };

  const onCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCover(event.target.files?.[0] || null);
    setError("");
    setNotice("");
  };

  const submitEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setNotice("");
    if (!selectedMission || !evidence) {
      setError("Adjunta la evidencia solicitada para continuar.");
      return;
    }
    setBusy(true);
    try {
      const isVideo = videoTypes.has(evidence.type);
      const isImage = imageTypes.has(evidence.type);
      if ((!isImage && !isVideo) || selectedMission.evidenceType !== (isVideo ? "video" : "image")) {
        throw new Error(`Esta misión requiere ${selectedMission.evidenceType === "video" ? "un video" : "una captura"}.`);
      }
      const uploaded = await uploadMedia(evidence, isVideo ? "mission-video" : "mission-evidence");
      const headers = await authHeaders();
      await requestJson("/api/missions/submissions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: selectedMission.id, evidenceUrl: uploaded.url }),
      });
      setNotice("Evidencia publicada en la misión. Un moderador la revisará para otorgar EXP.");
      setEvidence(null);
      form.reset();
      const { submissions: items } = await requestJson<{ submissions: Submission[] }>(
        `/api/missions/${encodeURIComponent(selectedMission.id)}/submissions`,
      );
      setGallery(items);
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
      const game = games.find((item) => item.id === gameId);
      if (!game) throw new Error("Selecciona un juego válido.");
      if (!cover) throw new Error("Añade una imagen o video para la portada de la misión.");
      const isImage = imageTypes.has(cover.type);
      const isVideo = videoTypes.has(cover.type);
      if (!isImage && !isVideo) throw new Error("La portada debe ser JPEG, PNG, WebP, MP4 o WebM.");
      const uploaded = await uploadMedia(cover, "mission-cover");
      const headers = await authHeaders();
      await requestJson("/api/missions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          linkedGameId: game.id,
          linkedGameTitle: game.title,
          evidenceType: requiredEvidenceType,
          rewardXp,
          coverUrl: uploaded.url,
          coverType: uploaded.type,
        }),
      });
      setTitle("");
      setDescription("");
      setCover(null);
      setNotice("Misión publicada en la comunidad.");
      await refresh();
    } catch (createError: unknown) {
      setError(readableError(createError));
    } finally {
      setBusy(false);
    }
  };

  const review = async (submission: Submission, decision: "approve" | "reject") => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const headers = await authHeaders();
      await requestJson(`/api/missions/submissions/${encodeURIComponent(submission.id)}/review`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      setNotice(decision === "approve" ? "Evidencia aprobada; EXP aplicado de forma segura." : "Evidencia rechazada y retirada de la galería pública.");
      await refresh();
      if (selectedMission) {
        const { submissions: items } = await requestJson<{ submissions: Submission[] }>(
          `/api/missions/${encodeURIComponent(selectedMission.id)}/submissions`,
        );
        setGallery(items);
      }
    } catch (reviewError: unknown) {
      setError(readableError(reviewError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lb-missions" aria-labelledby="lb-missions-title">
      {error && <div className="lb-mission-alert is-error" role="alert">{error}</div>}
      {notice && <div className="lb-mission-alert is-success" role="status">{notice}</div>}

      {selectedMission ? (
        <div className="lb-mission-detail">
          <button className="lb-mission-back" type="button" onClick={returnToMissionList}>
            <ArrowLeft size={16} /> Volver a las misiones
          </button>
          <div className="lb-mission-detail-hero">
            {selectedMission.coverUrl
              ? <Media src={selectedMission.coverUrl} type={selectedMission.coverType || "image"} className="lb-mission-detail-cover" />
              : <div className="lb-mission-detail-placeholder"><Gamepad2 size={42} /></div>}
            <div className="lb-mission-detail-shade" />
            <div className="lb-mission-detail-title">
              <span className="lb-mission-kicker"><Sparkles size={14} /> RETO DE LA COMUNIDAD</span>
              <h2>{selectedMission.title}</h2>
              <span><Gamepad2 size={15} /> {selectedMission.linkedGameTitle}</span>
            </div>
            <strong className="lb-mission-detail-reward"><Award size={17} /> {selectedMission.rewardXp} EXP</strong>
          </div>

          <div className="lb-mission-detail-grid">
            <div className="lb-mission-panel lb-mission-description">
              <span className="lb-mission-kicker">EL DESAFÍO</span>
              <h3>¿Qué tienes que hacer?</h3>
              <p>{selectedMission.description}</p>
              <div className="lb-mission-requirement">
                {selectedMission.evidenceType === "video" ? <Video size={16} /> : <Camera size={16} />}
                <span>Comparte {selectedMission.evidenceType === "video" ? "un video MP4 o WebM de hasta 30 segundos" : "una captura de pantalla"} como evidencia.</span>
              </div>
            </div>
            <div className="lb-mission-panel lb-mission-submit">
              <span className="lb-mission-kicker">PARTICIPA</span>
              <h3>Comparte tu resultado</h3>
              {user ? (
                <form className="lb-mission-form" onSubmit={submitEvidence}>
                  <label className="lb-mission-upload">
                    <input
                      type="file"
                      accept={selectedMission.evidenceType === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
                      onChange={onEvidenceChange}
                      required
                    />
                    <Upload size={19} />
                    <strong>{evidence?.name || (selectedMission.evidenceType === "video" ? "Selecciona tu video" : "Selecciona tu captura")}</strong>
                    <small>{selectedMission.evidenceType === "video" ? "MP4 / WebM · 24 MB · 30 s máx." : "JPG / PNG / WebP · 1 MB máx."}</small>
                  </label>
                  <p className="lb-mission-privacy-note">Tu evidencia será visible en esta página mientras esté pendiente o aprobada. Solo se otorga EXP después de la revisión.</p>
                  <button className="lb-mission-action" type="submit" disabled={busy}>
                    {busy ? "Publicando…" : "Publicar evidencia"} <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <div className="lb-mission-login-note"><ShieldCheck size={20} /><p>Inicia sesión con un correo verificado para participar y publicar tu evidencia.</p></div>
              )}
            </div>
          </div>

          <section className="lb-mission-gallery" aria-labelledby="lb-mission-gallery-title">
            <div className="lb-mission-section-heading">
              <div><span className="lb-mission-kicker"><Camera size={13} /> MURO DE PARTICIPANTES</span><h3 id="lb-mission-gallery-title">Evidencias de la comunidad</h3></div>
              <span>{gallery.length} {gallery.length === 1 ? "participante" : "participantes"}</span>
            </div>
            {gallery.length
              ? <div className="lb-mission-gallery-grid">{gallery.map((item) => <EvidenceCard key={item.id} submission={item} />)}</div>
              : <div className="lb-mission-empty"><ImagePlus size={24} /><strong>Aún no hay evidencias</strong><span>¡Anímate a ser el primero en completar este reto!</span></div>}
          </section>
        </div>
      ) : (
        <>
          <div className="lb-mission-heading">
            <div>
              <span className="lb-mission-kicker"><Sparkles size={14} /> JUEGA, COMPARTE, GANA</span>
              <h2 id="lb-missions-title">Misiones de la comunidad</h2>
              <p>Completa retos, comparte tu partida y gana experiencia junto a otros basados.</p>
            </div>
            <div className="lb-mission-heading-mark"><Trophy size={28} /><span>RECOMPENSAS<br />DE COMUNIDAD</span></div>
          </div>

          <div className="lb-mission-section-heading">
            <div><span className="lb-mission-kicker">RETOS ACTIVOS</span><h3>El próximo logro puede ser tuyo.</h3></div>
            <span>{missions.length} {missions.length === 1 ? "misión" : "misiones"}</span>
          </div>
          {missions.length
            ? <div className="lb-mission-grid">
                {missions.map((mission) => (
                  <article className="lb-mission-card" key={mission.id}>
                    <div className="lb-mission-card-cover">
                      {mission.coverUrl
                        ? <Media src={mission.coverUrl} type={mission.coverType || "image"} />
                        : <div className="lb-mission-card-placeholder"><Gamepad2 size={32} /></div>}
                      <span className="lb-mission-card-reward"><Award size={14} /> {mission.rewardXp} EXP</span>
                    </div>
                    <div className="lb-mission-card-content">
                      <span className="lb-mission-card-game"><Gamepad2 size={13} /> {mission.linkedGameTitle}</span>
                      <h3>{mission.title}</h3>
                      <p>{mission.description}</p>
                      <div className="lb-mission-card-footer">
                        <span>{mission.evidenceType === "video" ? <Video size={14} /> : <Camera size={14} />}
                          {mission.evidenceType === "video" ? "Video" : "Captura"} requerida
                        </span>
                        <button type="button" onClick={() => openMission(mission)}>Ver misión <ArrowRight size={15} /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            : <div className="lb-mission-empty"><Sparkles size={25} /><strong>Pronto habrá nuevos desafíos.</strong><span>Vuelve a revisar para descubrir la próxima misión.</span></div>}

          {isMod && (
            <div className="lb-mission-moderation">
              <section className="lb-mission-panel lb-mission-create">
                <div className="lb-mission-panel-heading"><span className="lb-mission-panel-icon"><ImagePlus size={18} /></span><div><span className="lb-mission-kicker">HERRAMIENTAS DE MODERACIÓN</span><h3>Publicar una misión</h3></div></div>
                <p className="lb-mission-panel-intro">Crea un reto para toda la comunidad. Añade un visual de portada para presentarlo en el catálogo de misiones.</p>
                <form className="lb-mission-form" onSubmit={createMission}>
                  <label className="lb-mission-field"><span>Nombre de la misión</span><input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={80} placeholder="Ej. Completa el primer nivel" required /></label>
                  <label className="lb-mission-field"><span>Detalles del reto</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={1200} placeholder="Explica cómo completar la misión y qué debe verse en la evidencia." required /></label>
                  <label className="lb-mission-field"><span>Juego vinculado</span><select value={gameId} onChange={(event) => setGameId(event.target.value)} required>
                    <option value="">Elige un juego del catálogo</option>
                    {games.map((game) => <option value={game.id} key={game.id}>{game.title}</option>)}
                  </select></label>
                  <label className="lb-mission-field"><span>Tipo de evidencia solicitada</span><select value={requiredEvidenceType} onChange={(event) => setRequiredEvidenceType(event.target.value === "video" ? "video" : "image")} required>
                    <option value="image">Captura de pantalla</option>
                    <option value="video">Video corto (máximo 30 segundos)</option>
                  </select></label>
                  <div className="lb-mission-form-row">
                    <label className="lb-mission-field"><span>Recompensa EXP</span><input type="number" value={rewardXp} onChange={(event) => setRewardXp(Number(event.target.value))} min={10} max={5000} step={1} required /></label>
                    <label className="lb-mission-field"><span>Visual de portada</span><input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={onCoverChange} required /></label>
                  </div>
                  {coverPreview && (
                    <div className="lb-mission-cover-preview">
                      {videoTypes.has(cover?.type || "")
                        ? <video src={coverPreview} controls muted playsInline preload="metadata" />
                        : <img src={coverPreview} alt="Vista previa de portada" />}
                      <span>Vista previa del visual</span>
                    </div>
                  )}
                  <small className="lb-mission-form-hint">Imagen: hasta 1 MB después de comprimir. Video MP4/WebM: hasta 24 MB y 30 segundos.</small>
                  <button className="lb-mission-action" type="submit" disabled={busy || !games.length || !cover}>
                    {busy ? "Publicando…" : "Publicar misión"} <ArrowRight size={16} />
                  </button>
                </form>
              </section>

              <section className="lb-mission-panel lb-mission-review-panel">
                <div className="lb-mission-panel-heading"><span className="lb-mission-panel-icon"><ShieldCheck size={18} /></span><div><span className="lb-mission-kicker">COLA DE REVISIÓN</span><h3>Evidencias pendientes</h3></div><span className="lb-mission-review-count">{submissions.filter((item) => item.status === "pending").length}</span></div>
                <div className="lb-mission-review-list">
                  {submissions.filter((item) => item.status === "pending").map((submission) => (
                    <article className="lb-mission-review" key={submission.id}>
                      <a className="lb-mission-review-media" href={submission.evidenceUrl} target="_blank" rel="noopener noreferrer">
                        <Media src={submission.evidenceUrl} type={submission.evidenceType} />
                      </a>
                      <div className="lb-mission-review-copy">
                        <strong>{submission.missionTitle}</strong>
                        <span>{submission.displayName || "Jugador"} · {new Date(submission.submittedAt).toLocaleDateString()}</span>
                        <div className="lb-mission-review-actions">
                          <button className="lb-mission-approve" type="button" disabled={busy} onClick={() => review(submission, "approve")}><Check size={14} /> Aprobar</button>
                          <button className="lb-mission-reject" type="button" disabled={busy} onClick={() => review(submission, "reject")}>Rechazar</button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {!submissions.some((item) => item.status === "pending") && <div className="lb-mission-empty is-compact"><ShieldCheck size={21} /><span>No hay evidencias pendientes.</span></div>}
                </div>
              </section>
            </div>
          )}

          <section className="lb-mission-leaderboard">
            <div className="lb-mission-section-heading">
              <div><span className="lb-mission-kicker"><Trophy size={13} /> SALÓN DE LOGROS</span><h3>Clasificación de la comunidad</h3></div>
              <span>TOP {leaderboard.length}</span>
            </div>
            {leaderboard.length
              ? <div className="lb-mission-leader-list">{leaderboard.map((entry, index) => (
                  <div className="lb-mission-leader" key={entry.uid}>
                    <span className="lb-mission-leader-rank">{String(index + 1).padStart(2, "0")}</span>
                    <span className="lb-mission-leader-name">{entry.displayName}{entry.badges?.includes("mission-complete") && <Award size={14} aria-label="Misión completada" />}</span>
                    <strong>{entry.xp} <small>EXP</small></strong>
                  </div>
                ))}</div>
              : <div className="lb-mission-empty is-compact"><Trophy size={22} /><span>La clasificación aparecerá cuando se aprueben evidencias.</span></div>}
          </section>
        </>
      )}
    </section>
  );
}
