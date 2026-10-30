import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Expand,
  Gamepad2,
  ImagePlus,
  Pencil,
  Play,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";

type BasedGame = {
  id: string;
  title: string;
  description: string;
  genre: string;
  mode: "singleplayer" | "multiplayer";
  players: number;
  rating: number;
  thumbnailUrl: string;
  previewUrl: string;
  gameUrl: string;
  createdAt: string;
};

type BasedGameForm = {
  title: string;
  description: string;
  genre: string;
  mode: "singleplayer" | "multiplayer";
  players: string;
  rating: string;
  gameUrl: string;
};

type BasedGamesProps = {
  isMod: boolean;
  initialAdminOpen: boolean;
  onAdminOpenChange: (open: boolean) => void;
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

const emptyForm: BasedGameForm = {
  title: "",
  description: "",
  genre: "",
  mode: "singleplayer",
  players: "1",
  rating: "0",
  gameUrl: "",
};

function apiUrl(path: string) {
  const base = window.__LOS_BASADOS_MEDIA_API__?.replace(/\/+$/, "");
  if (!base) throw new Error("El servicio de Juegos Basados no está configurado.");
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

async function verifyImageRatio(file: File) {
  if (!imageTypes.has(file.type)) throw new Error("La portada debe ser JPEG, PNG o WebP.");
  const bitmap = await createImageBitmap(file);
  try {
    if (Math.abs(bitmap.width / bitmap.height - 1.6) > 0.02) {
      throw new Error("La portada debe tener proporción 16:10.");
    }
  } finally {
    bitmap.close();
  }
}

async function readVideoDuration(file: File) {
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

async function uploadMedia(file: File, scope: "based-game-cover" | "based-game-preview") {
  const isImage = imageTypes.has(file.type);
  const isVideo = videoTypes.has(file.type);
  if ((scope === "based-game-cover" && !isImage) || (scope === "based-game-preview" && !isVideo)) {
    throw new Error(scope === "based-game-cover"
      ? "Elige una imagen JPEG, PNG o WebP."
      : "Elige un video MP4 o WebM.");
  }

  let uploadFile: Blob = file;
  if (isImage) {
    await verifyImageRatio(file);
    if (file.size > imageLimit) {
      const compressed = await window.compressMissionImage?.(file);
      if (!compressed) throw new Error("La compresión de imagen no está disponible. Recarga la página e inténtalo de nuevo.");
      uploadFile = compressed;
    }
    if (uploadFile.size > imageLimit) throw new Error("La portada supera 1 MB incluso después de comprimirla.");
  } else {
    if (file.size > videoLimit) throw new Error("El video de preview no puede superar 24 MB.");
    const duration = await readVideoDuration(file);
    if (!Number.isFinite(duration) || duration <= 0 || duration > 30) {
      throw new Error("El video de preview debe durar 30 segundos o menos.");
    }
  }

  const headers = await authHeaders();
  const response = await fetch(apiUrl("/api/media"), {
    method: "POST",
    headers: { ...headers, "Content-Type": uploadFile.type, "X-Media-Scope": scope },
    body: uploadFile,
  });
  const payload = await response.json().catch(() => ({})) as { url?: string; error?: string };
  if (!response.ok || !payload.url) throw new Error(payload.error || "No se pudo subir el archivo.");
  return payload.url;
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function gameIdFromHash() {
  return window.location.hash.match(/^#\/based-games\/([0-9a-f-]{36})$/i)?.[1] || "";
}

function validGameUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && value.length <= 1500;
  } catch {
    return false;
  }
}

function BasedGameCard({ game, onOpen }: { game: BasedGame; onOpen: (game: BasedGame) => void }) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const playPreview = () => {
    if (prefersReducedMotion || document.documentElement.dataset.performance === "low") return;
    const video = previewRef.current;
    if (video) void video.play().catch(() => undefined);
  };
  const stopPreview = () => {
    const video = previewRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <article
      className="lb-based-card"
      onMouseEnter={playPreview}
      onMouseLeave={stopPreview}
      onFocus={playPreview}
      onBlur={stopPreview}
    >
      <button className="lb-based-card-open" type="button" onClick={() => onOpen(game)} aria-label={`Ver ${game.title}`}>
        <span className="lb-based-card-media">
          <img src={game.thumbnailUrl} alt="" loading="lazy" decoding="async" />
          {game.previewUrl && <video ref={previewRef} src={game.previewUrl} muted loop playsInline preload="none" aria-hidden="true" />}
          <span className="lb-based-card-shade" />
          <span className={`lb-based-mode is-${game.mode}`}>{game.mode === "multiplayer" ? "MULTIPLAYER" : "SINGLEPLAYER"}</span>
          <span className="lb-based-card-play"><Play size={17} fill="currentColor" /> Ver juego</span>
        </span>
        <span className="lb-based-card-copy">
          <span className="lb-based-card-genre">{game.genre}</span>
          <strong>{game.title}</strong>
          <span className="lb-based-card-meta">
            <span><Users size={14} /> {game.players} {game.players === 1 ? "jugador" : "jugadores"}</span>
            <span><Star size={14} fill="currentColor" /> {Number(game.rating).toFixed(1)}</span>
          </span>
        </span>
      </button>
    </article>
  );
}

export default function BasedGames({ isMod, initialAdminOpen, onAdminOpenChange }: BasedGamesProps) {
  const [games, setGames] = useState<BasedGame[]>([]);
  const [selectedId, setSelectedId] = useState(gameIdFromHash);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [managing, setManaging] = useState(false);
  const [editing, setEditing] = useState<BasedGame | null>(null);
  const [form, setForm] = useState<BasedGameForm>(emptyForm);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [recommendationVisible, setRecommendationVisible] = useState(true);
  const gameFrameRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const data = await requestJson<{ games: BasedGame[] }>("/api/based-games");
    setGames(data.games);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    refresh()
      .catch((loadError: unknown) => { if (active) setError(readError(loadError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);

  useEffect(() => {
    const syncRoute = () => {
      setSelectedId(gameIdFromHash());
      setPlaying(false);
      setError("");
    };
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    if (initialAdminOpen) setManaging(true);
  }, [initialAdminOpen]);

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(thumbnail);
    setThumbnailPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnail]);

  useEffect(() => {
    if (!preview) {
      setVideoPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(preview);
    setVideoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [preview]);

  useEffect(() => {
    if (!playing) return;
    const frame = gameFrameRef.current;
    const focusFrame = () => frame?.focus({ preventScroll: true });
    const frameTimer = window.requestAnimationFrame(focusFrame);
    return () => window.cancelAnimationFrame(frameTimer);
  }, [playing, selectedId]);

  const selectedGame = games.find((game) => game.id === selectedId);
  const recommendedGame = useMemo(
    () => games.find((game) => game.id !== selectedGame?.id),
    [games, selectedGame?.id],
  );

  const openGame = (game: BasedGame) => {
    setPlaying(false);
    setError("");
    window.location.hash = `/based-games/${game.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const returnToCatalog = () => {
    setPlaying(false);
    window.location.hash = "/based-games";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setThumbnail(null);
    setPreview(null);
  };

  const beginEdit = (game: BasedGame) => {
    setEditing(game);
    setForm({
      title: game.title,
      description: game.description,
      genre: game.genre,
      mode: game.mode,
      players: String(game.players),
      rating: String(game.rating),
      gameUrl: game.gameUrl,
    });
    setThumbnail(null);
    setPreview(null);
    setError("");
    setNotice("");
  };

  const updateForm = <K extends keyof BasedGameForm>(key: K, value: BasedGameForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectThumbnail = (event: ChangeEvent<HTMLInputElement>) => {
    setThumbnail(event.target.files?.[0] || null);
    setError("");
  };

  const selectPreview = (event: ChangeEvent<HTMLInputElement>) => {
    setPreview(event.target.files?.[0] || null);
    setError("");
  };

  const saveGame = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!validGameUrl(form.gameUrl.trim())) throw new Error("El enlace del juego debe ser una URL HTTPS válida.");
      if (!thumbnail && !editing?.thumbnailUrl) throw new Error("Añade una portada 16:10.");
      const thumbnailUrl = thumbnail
        ? await uploadMedia(thumbnail, "based-game-cover")
        : editing!.thumbnailUrl;
      const previewUrl = preview
        ? await uploadMedia(preview, "based-game-preview")
        : editing?.previewUrl || "";
      const headers = await authHeaders();
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        genre: form.genre.trim(),
        players: Number(form.players),
        rating: Number(form.rating),
        thumbnailUrl,
        previewUrl,
        gameUrl: form.gameUrl.trim(),
      };
      await requestJson(
        editing ? `/api/based-games/${encodeURIComponent(editing.id)}` : "/api/based-games",
        {
          method: editing ? "PUT" : "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      await refresh();
      resetForm();
      setNotice(editing ? "Juego actualizado." : "Juego publicado en Juegos Basados.");
    } catch (saveError: unknown) {
      setError(readError(saveError));
    } finally {
      setBusy(false);
    }
  };

  const deleteGame = async (game: BasedGame) => {
    if (!window.confirm(`¿Eliminar "${game.title}" de Juegos Basados?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const headers = await authHeaders();
      await requestJson(`/api/based-games/${encodeURIComponent(game.id)}`, { method: "DELETE", headers });
      if (selectedId === game.id) returnToCatalog();
      await refresh();
      if (editing?.id === game.id) resetForm();
      setNotice("Juego eliminado.");
    } catch (deleteError: unknown) {
      setError(readError(deleteError));
    } finally {
      setBusy(false);
    }
  };

  const openFullscreen = async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.requestFullscreen();
      gameFrameRef.current?.focus({ preventScroll: true });
    } catch (fullscreenError: unknown) {
      setError(readError(fullscreenError));
    }
  };

  const chooseRecommendation = () => {
    if (recommendedGame) openGame(recommendedGame);
  };

  return (
    <main className="lb-page lb-based-page">
      {selectedGame ? (
        <section className="lb-based-detail lb-container">
          <button className="lb-based-back" type="button" onClick={returnToCatalog}>
            <ArrowLeft size={16} /> Juegos Basados
          </button>
          <div className="lb-based-detail-hero">
            <img src={selectedGame.thumbnailUrl} alt="" />
            <div className="lb-based-detail-shade" />
            <div className="lb-based-detail-copy">
              <span className="lb-overline"><Gamepad2 size={14} /> JUEGO ORIGINAL · {selectedGame.genre.toUpperCase()}</span>
              <h1>{selectedGame.title}</h1>
              <p>{selectedGame.description}</p>
              <div className="lb-based-detail-meta">
                <span className={`lb-based-mode is-${selectedGame.mode}`}>{selectedGame.mode === "multiplayer" ? "MULTIPLAYER" : "SINGLEPLAYER"}</span>
                <span><Users size={15} /> {selectedGame.players} {selectedGame.players === 1 ? "jugador" : "jugadores"}</span>
                <span><Star size={15} fill="currentColor" /> {Number(selectedGame.rating).toFixed(1)}</span>
              </div>
              {!playing && <button className="lb-primary-cta" type="button" onClick={() => { setError(""); setPlaying(true); }}>
                <Play size={16} fill="currentColor" /> JUGAR EN EL NAVEGADOR <ArrowUpRight size={15} />
              </button>}
            </div>
          </div>

          {playing && (
            <section className="lb-based-player-section" aria-label={`Juego ${selectedGame.title}`}>
              <div className="lb-based-player-shell" ref={playerRef}>
                <div className="lb-based-player-toolbar">
                  <span><span className="lb-live-dot" /> PARTIDA ACTIVA · HAZ CLIC EN EL JUEGO PARA USAR EL TECLADO</span>
                  <div>
                    <button type="button" onClick={openFullscreen} aria-label="Pantalla completa"><Expand size={15} /> Pantalla completa</button>
                    <button type="button" onClick={() => setPlaying(false)} aria-label="Cerrar juego"><X size={15} /> Cerrar</button>
                  </div>
                </div>
                <div className="lb-based-player">
                  <iframe
                    key={selectedGame.id}
                    ref={gameFrameRef}
                    src={selectedGame.gameUrl}
                    title={`Juego ${selectedGame.title}`}
                    sandbox="allow-scripts allow-pointer-lock"
                    allow="fullscreen; gamepad"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    tabIndex={0}
                    onLoad={() => gameFrameRef.current?.focus({ preventScroll: true })}
                  />
                </div>
              </div>
            </section>
          )}

          {error && <div className="lb-based-alert is-error" role="alert">{error}</div>}
          {recommendedGame && recommendationVisible && !playing && (
            <aside className="lb-based-recommendation" aria-label="Recomendación de Juegos Basados">
              <button type="button" className="lb-based-recommendation-close" onClick={() => setRecommendationVisible(false)} aria-label="Cerrar recomendación"><X size={15} /></button>
              <img src={recommendedGame.thumbnailUrl} alt="" loading="lazy" />
              <div><span>PRUEBA TAMBIÉN</span><strong>{recommendedGame.title}</strong><button type="button" onClick={chooseRecommendation}>Descubrir <ArrowUpRight size={13} /></button></div>
            </aside>
          )}
        </section>
      ) : (
        <>
          <section className="lb-based-heading lb-container">
            <div>
              <span className="lb-overline"><Gamepad2 size={14} /> HECHOS POR LOS BASADOS</span>
              <h1>Juegos <em>Basados.</em></h1>
              <p>Creaciones originales de la comunidad, listas para jugar desde el navegador.</p>
            </div>
            <div className="lb-based-count"><strong>{String(games.length).padStart(2, "0")}</strong><span>JUEGOS ORIGINALES</span></div>
          </section>
          <section className="lb-based-results lb-container">
            {isMod && (
              <div className="lb-based-admin-toolbar">
                <span><ShieldCheck size={16} /> HERRAMIENTAS DE MODERACIÓN</span>
                <button className="lb-primary-cta" type="button" onClick={() => { setManaging((value) => !value); onAdminOpenChange(!managing); }}>
                  {managing ? <X size={15} /> : <Plus size={15} />} {managing ? "CERRAR GESTIÓN" : "GESTIONAR JUEGOS"}
                </button>
              </div>
            )}

            {error && <div className="lb-based-alert is-error" role="alert">{error}</div>}
            {notice && <div className="lb-based-alert is-success" role="status">{notice}</div>}

            {managing && isMod && (
              <section className="lb-based-manager" aria-label="Gestión de Juegos Basados">
                <div className="lb-based-manager-heading">
                  <div><span className="lb-based-kicker">PANEL DE MODERACIÓN</span><h2>{editing ? "Editar juego" : "Publicar un juego"}</h2></div>
                  {editing && <button type="button" onClick={resetForm}><Plus size={14} /> Nuevo juego</button>}
                </div>
                <form className="lb-based-form" onSubmit={saveGame}>
                  <label className="lb-based-field">Título<input value={form.title} maxLength={80} required minLength={2} onChange={(event) => updateForm("title", event.target.value)} placeholder="Nombre del juego" /></label>
                  <label className="lb-based-field">Descripción<textarea value={form.description} maxLength={1200} required minLength={10} onChange={(event) => updateForm("description", event.target.value)} placeholder="Cuenta de qué trata y cómo se juega." /></label>
                  <div className="lb-based-form-row">
                    <label className="lb-based-field">Género<input value={form.genre} maxLength={40} minLength={2} required onChange={(event) => updateForm("genre", event.target.value)} placeholder="Arcade, puzzle, aventura…" /></label>
                    <label className="lb-based-field">Modo<select value={form.mode} onChange={(event) => updateForm("mode", event.target.value as BasedGameForm["mode"])}><option value="singleplayer">Singleplayer</option><option value="multiplayer">Multiplayer</option></select></label>
                    <label className="lb-based-field">Jugadores<input type="number" min={1} max={1000} step={1} required value={form.players} onChange={(event) => updateForm("players", event.target.value)} /></label>
                    <label className="lb-based-field">Calificación<input type="number" min={0} max={5} step={0.1} required value={form.rating} onChange={(event) => updateForm("rating", event.target.value)} /></label>
                  </div>
                  <label className="lb-based-field">URL HTTPS del juego HTML<input type="url" required value={form.gameUrl} onChange={(event) => updateForm("gameUrl", event.target.value)} placeholder="https://tus-juegos.example/juego/index.html" /><small>Usa una URL HTTPS a tu juego publicado. El iframe se ejecuta aislado del sitio.</small></label>
                  <div className="lb-based-upload-grid">
                    <label className="lb-based-upload"><ImagePlus size={18} /><strong>{thumbnail?.name || (editing ? "Cambiar portada 16:10" : "Portada 16:10")}</strong><small>JPG, PNG o WebP · máximo 1 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectThumbnail} /></label>
                    <label className="lb-based-upload"><Video size={18} /><strong>{preview?.name || (editing?.previewUrl ? "Cambiar video de preview" : "Video de preview opcional")}</strong><small>MP4/WebM · máximo 24 MB · 30 segundos</small><input type="file" accept="video/mp4,video/webm" onChange={selectPreview} /></label>
                  </div>
                  {(thumbnailPreview || editing?.thumbnailUrl) && <div className="lb-based-upload-preview"><img src={thumbnailPreview || editing?.thumbnailUrl} alt="Vista previa de portada" />{(videoPreview || editing?.previewUrl) && <video src={videoPreview || editing?.previewUrl} muted controls playsInline />}</div>}
                  {error && <div className="lb-based-alert is-error" role="alert">{error}</div>}
                  <div className="lb-based-form-actions">
                    {editing && <button type="button" className="lb-based-secondary" onClick={resetForm} disabled={busy}>Cancelar edición</button>}
                    <button className="lb-primary-cta" type="submit" disabled={busy}>{busy ? "GUARDANDO…" : editing ? "GUARDAR CAMBIOS" : "PUBLICAR JUEGO"} <ArrowUpRight size={15} /></button>
                  </div>
                </form>

                <div className="lb-based-admin-list">
                  <h3>Juegos publicados</h3>
                  {games.map((game) => (
                    <article key={game.id}>
                      <img src={game.thumbnailUrl} alt="" />
                      <div><strong>{game.title}</strong><span>{game.genre} · {game.mode === "multiplayer" ? "Multiplayer" : "Singleplayer"}</span></div>
                      <button type="button" onClick={() => beginEdit(game)} disabled={busy} aria-label={`Editar ${game.title}`}><Pencil size={15} /></button>
                      <button type="button" onClick={() => deleteGame(game)} disabled={busy} aria-label={`Eliminar ${game.title}`}><Trash2 size={15} /></button>
                    </article>
                  ))}
                  {!games.length && <p>Aún no hay juegos publicados.</p>}
                </div>
              </section>
            )}

            {loading ? <div className="lb-based-empty"><span className="lb-live-dot" /> CARGANDO JUEGOS…</div>
              : games.length ? <div className="lb-based-grid">{games.map((game) => <BasedGameCard key={game.id} game={game} onOpen={openGame} />)}</div>
                : !error && <div className="lb-based-empty"><Gamepad2 size={30} /><strong>La primera partida está por comenzar.</strong><span>Pronto encontrarás aquí los juegos originales de la comunidad.</span></div>}
          </section>
        </>
      )}

      <footer className="lb-footer lb-container"><button className="lb-based-back" type="button" onClick={() => { window.location.hash = "/home"; }}><ArrowLeft size={14} /> Volver al inicio</button><span>LOS BASADOS · JUEGOS ORIGINALES</span><span>CREACIONES DE LA COMUNIDAD</span></footer>
    </main>
  );
}
