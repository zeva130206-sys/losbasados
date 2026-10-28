import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  Filter,
  Flame,
  Gauge,
  Gamepad2,
  Heart,
  Menu,
  Monitor,
  Moon,
  Music2,
  Pencil,
  Pause,
  Play,
  Search,
  Shield,
  Sparkles,
  Sun,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import CommunityMissions from "./CommunityMissions";

type Game = {
  id: string;
  title: string;
  image: string;
  catalogImage?: string;
  heroMediaUrl?: string;
  heroMediaType?: "image" | "video";
  heroPoster?: string;
  heroButtonLabel?: string;
  desc?: string;
  category?: string | string[];
  size?: string;
  downloadsCount?: number;
  avgRating?: number;
  featured?: boolean;
  ageRestricted?: boolean;
  onlineStatus?: string;
  gamepadStatus?: boolean;
  versions?: unknown[];
  installGuide?: string;
  downloadUrl?: string;
};
type User = { id?: string; name: string; avatar?: string; isAdult?: boolean; isMod?: boolean };
type FriendRecord = Record<string, Record<string, { name?: string; avatar?: string } | string | boolean>>;
type RegisteredUser = { name?: string; avatar?: string; email?: string };
type OnlineUser = { name: string; avatar?: string; device?: string };
type News = { id?: string; title: string; date?: string; content?: string };
type Social = Record<string, string>;
type FooterContent = { credits: string; tagline: string; eyebrow: string; title: string; description: string };
type FloatingAd = { id: string; title: string; videoUrl: string; targetGameId: string; position: "top-left" | "top-right" | "bottom-left" | "bottom-right"; intervalMinutes: number; active: boolean };
type View = "home" | "catalog" | "community" | "wishlist";
type LaunchOrigin = { x: number; y: number };

declare global {
  interface Window {
    openGameModal?: (id: string, origin?: LaunchOrigin) => void;
    toggleFav?: (event: Event, id: string) => void;
    openPublicProfile?: (name: string, avatar?: string) => void;
    openPrivateChatWith?: (name: string) => void;
    openAdminEditModal?: (event: Event, id: string) => void;
    editNews?: (id: string) => void;
    __LOS_BASADOS_MEDIA_API__?: string;
    getLosBasadosAuthToken?: () => Promise<string | null>;
    __LOS_BASADOS__?: Record<string, unknown>;
  }
}

const BASE = import.meta.env.BASE_URL;
const fallbackGame: Game = {
  id: "default-1",
  title: "Mario Kart Wii (PC Port)",
  image: "assets/img/MarioKartWii.png",
  desc: "Vuelve a las pistas con el clásico de carreras de Nintendo. Revisa sus versiones y detalles para PC.",
  category: ["Carreras", "Pantalla Compartida", "Windows"],
  size: "2.9 GB",
  downloadsCount: 154,
  featured: true,
  onlineStatus: "online",
  gamepadStatus: true,
};
const footerSocials = [
  { id: "youtube", label: "YouTube", icon: "fa-youtube" },
  { id: "telegram", label: "Telegram", icon: "fa-telegram" },
  { id: "discord", label: "Discord", icon: "fa-discord" },
  { id: "facebook", label: "Facebook", icon: "fa-facebook-f" },
  { id: "instagram", label: "Instagram", icon: "fa-instagram" },
  { id: "tiktok", label: "TikTok", icon: "fa-tiktok" },
];
const defaultFooterContent: FooterContent = {
  credits: "Creado por VAZE · Colaboran ENFURT, ENDFURT y ESVA",
  tagline: "Comunidad hecha para jugar.",
  eyebrow: "LOS BASADOS · COMUNIDAD",
  title: "La partida continúa aquí.",
  description: "Sigue las novedades y encuentra a la comunidad también fuera del juego.",
};

function socialHref(value?: string) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function asset(path?: string) {
  if (!path) return `${BASE}assets/img/favicon.png`;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${BASE}${path.replace(/^\/+/, "")}`;
}

function gameCategories(game: Game) {
  return Array.isArray(game.category) ? game.category : game.category ? [game.category] : [];
}

function invokeLegacy(id: string) {
  document.getElementById(id)?.click();
}

function getInitial<T>(name: string, fallback: T): T {
  return (window.__LOS_BASADOS__?.[name] as T | undefined) ?? fallback;
}

function Header(props: {
  view: View;
  onNavigate: (view: View) => void;
  search: string;
  onSearch: (value: string) => void;
  theme: "dark" | "light";
  onTheme: () => void;
  performanceMode: boolean;
  onTogglePerformance: () => void;
  user: User | null;
  online: number;
  onCommunity: () => void;
  onWishlist: () => void;
  favoritesCount: number;
  mobileMenu: boolean;
  onMobileMenu: () => void;
}) {
  const {
    view, onNavigate, search, onSearch, theme, onTheme, performanceMode, onTogglePerformance, user, online, onCommunity, onWishlist, favoritesCount,
    mobileMenu, onMobileMenu,
  } = props;

  return (
    <header className="lb-header">
      <a className="lb-brand" href="#/home" onClick={(event) => { event.preventDefault(); onNavigate("home"); }} aria-label="Los Basados, inicio">
        <span className="lb-brand-mark"><Gamepad2 size={23} strokeWidth={1.8} /></span>
        <span>LOS <b>BASADOS</b></span>
      </a>

      <button className="lb-mobile-menu" type="button" onClick={onMobileMenu} aria-label={mobileMenu ? "Cerrar menú" : "Abrir menú"}>
        {mobileMenu ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={`lb-nav${mobileMenu ? " is-open" : ""}`} aria-label="Navegación principal">
        <button className={view === "home" ? "is-active" : ""} type="button" onClick={() => onNavigate("home")}>Inicio</button>
        <button className={view === "catalog" ? "is-active" : ""} type="button" onClick={() => onNavigate("catalog")}>Catálogo</button>
        <button className={view === "community" ? "is-active" : ""} type="button" onClick={onCommunity}>Comunidad</button>
      </nav>

      <label className="lb-search">
        <Search size={17} aria-hidden="true" />
        <input
          aria-label="Buscar juegos"
          value={search}
          onFocus={() => { if (view !== "catalog") onNavigate("catalog"); }}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Busca tu siguiente juego"
        />
        {search ? <button type="button" onClick={() => onSearch("")} aria-label="Limpiar búsqueda"><X size={14} /></button> : <kbd>/</kbd>}
      </label>

      <div className="lb-header-actions">
        <button className={`lb-icon-button lb-wishlist-nav${view === "wishlist" ? " is-active" : ""}`} type="button" onClick={onWishlist} aria-label={`Mi lista de juegos, ${favoritesCount} guardados`} title="Mi lista"><Heart size={17} /><span>{favoritesCount}</span></button>
        <button className="lb-icon-button" type="button" onClick={onTheme} aria-label={`Cambiar a tema ${theme === "dark" ? "claro" : "oscuro"}`} title={`Tema ${theme === "dark" ? "claro" : "oscuro"}`}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className={`lb-icon-button lb-performance-button${performanceMode ? " is-active" : ""}`} type="button" onClick={onTogglePerformance} aria-pressed={performanceMode} aria-label={performanceMode ? "Desactivar modo rendimiento" : "Activar modo rendimiento"} title="Modo rendimiento">
          <Gauge size={17} />
        </button>
        <button className="lb-icon-button lb-audio-button" type="button" onClick={() => invokeLegacy("btnToggleAudio")} aria-label="Activar o desactivar música" title="Música">
          <Music2 size={17} />
        </button>
        <button className="lb-icon-button lb-online-button" type="button" onClick={onCommunity} aria-label={`${online} usuarios en línea`} title="Comunidad en línea">
          <Users size={17} /><span>{online}</span>
        </button>
        <button className="lb-icon-button" type="button" onClick={() => invokeLegacy("btnNotif")} aria-label="Abrir notificaciones" title="Notificaciones"><Bell size={17} /></button>
        {user?.isMod && <button className="lb-icon-button lb-mod-button" type="button" onClick={() => invokeLegacy("btnAdminPanel")} aria-label="Abrir panel de moderación" title="Panel de moderación"><Shield size={17} /></button>}
        <button className="lb-login-button" type="button" onClick={() => invokeLegacy("btnAuth")} aria-label={user?.name ? `Perfil de ${user.name}` : "Iniciar sesión"}>
          {user?.avatar ? <img src={user.avatar} alt="" /> : null}
          <span>{user?.name || "Ingresar"}</span><ArrowUpRight size={14} />
        </button>
      </div>
    </header>
  );
}

function HeroShowcase(props: {
  game: Game;
  featured: Game[];
  index: number;
  setIndex: (index: number) => void;
  onHoverChange: (hovered: boolean) => void;
  onOpenGame: (game: Game, origin?: HTMLElement) => void;
  onCatalog: () => void;
  performanceMode: boolean;
}) {
  const { game, featured, index, setIndex, onHoverChange, onOpenGame, onCatalog, performanceMode } = props;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), { stiffness: 90, damping: 22 });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [4, -4]), { stiffness: 90, damping: 22 });
  const reducedMotion = useReducedMotion();
  const [heroVideoActive, setHeroVideoActive] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [loadedHeroVideoUrl, setLoadedHeroVideoUrl] = useState("");
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const heroMediaUrl = game.heroMediaUrl || "";
  const heroMediaType = game.heroMediaType || (/\.mp4(?:$|\?)|\.webm(?:$|\?)/i.test(heroMediaUrl) ? "video" : "image");
  const heroPoster = asset(game.heroPoster || game.catalogImage || game.image);

  useEffect(() => {
    setHeroVideoActive(false);
    setHeroVideoReady(false);
    setLoadedHeroVideoUrl("");
    return () => {
      const video = heroVideoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [game.id, heroMediaUrl]);

  const startHeroVideo = () => {
    if (heroMediaType !== "video" || !heroMediaUrl) return;
    setHeroVideoReady(false);
    setLoadedHeroVideoUrl(heroMediaUrl);
    setHeroVideoActive(true);
  };
  const stopHeroVideo = () => {
    const video = heroVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute("src");
      video.load();
    }
    setHeroVideoActive(false);
    setHeroVideoReady(false);
    setLoadedHeroVideoUrl("");
  };

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || !heroVideoActive || loadedHeroVideoUrl !== heroMediaUrl) return;
    video.load();
    void video.play().catch((error: DOMException) => {
      if (error.name !== "NotAllowedError") console.warn("No se pudo reproducir el video destacado", error);
    });
  }, [heroVideoActive, heroMediaUrl, loadedHeroVideoUrl]);

  const movePointer = (event: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion || performanceMode || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const resetPointer = () => { pointerX.set(0); pointerY.set(0); };
  const finishSwipe = (event: React.PointerEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.pointerType !== "touch") return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 52 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2 || featured.length < 2) return;
    stopHeroVideo();
    setIndex((index + (deltaX < 0 ? 1 : -1) + featured.length) % featured.length);
  };
  useEffect(() => {
    if (performanceMode) stopHeroVideo();
  }, [performanceMode]);

  return (
    <section className="lb-hero" onPointerDown={(event) => { if (event.pointerType === "touch") touchStart.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={finishSwipe} onPointerCancel={() => { touchStart.current = null; }} onPointerMove={movePointer} onPointerLeave={(event) => { resetPointer(); if (event.pointerType === "mouse") { stopHeroVideo(); onHoverChange(false); } }} onPointerEnter={(event) => { if (event.pointerType === "mouse") { onHoverChange(true); if (!performanceMode) startHeroVideo(); } }} aria-label="Juego destacado">
      <AnimatePresence mode="wait">
        <motion.div
          className="lb-hero-backdrop"
          key={`backdrop-${game.id}`}
          style={{ backgroundImage: `url("${heroPoster}")` }}
          initial={{ opacity: 0, scale: 1.07 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.025 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      <div className="lb-hero-vignette" />
      <motion.div className="lb-hero-frame" style={reducedMotion ? undefined : { rotateX, rotateY }}>
        <div className="lb-hero-copy">
          <motion.div
            key={`copy-${game.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 22, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <div className="lb-eyebrow"><span className="lb-live-dot" /> SELECCIÓN LOS BASADOS <span className="lb-eyebrow-line" /></div>
            <div className="lb-week-label"><Sparkles size={13} /> SELECCIÓN DESTACADA</div>
            <h1>{game.title}</h1>
            <p className="lb-hero-description">{game.desc || "Descubre todos los detalles, versiones y requisitos para empezar tu próxima aventura."}</p>
            <div className="lb-hero-meta">
              <span><Gamepad2 size={14} /> {gameCategories(game).slice(0, 2).join(" · ") || "Multiplataforma"}</span>
              {game.size && <span><Monitor size={14} /> {game.size}</span>}
              {Number(game.downloadsCount) > 0 && <span><Flame size={14} /> {Number(game.downloadsCount).toLocaleString("es-PE")} descargas</span>}
              {game.ageRestricted && <span className="lb-age-tag">+18</span>}
            </div>
            <div className="lb-hero-buttons">
              <button className="lb-primary-cta" type="button" onClick={(event) => onOpenGame(game, event.currentTarget)}><Download size={17} /> {game.heroButtonLabel || "VER VERSIONES Y DESCARGAR"} <ArrowUpRight size={16} /></button>
              <button className="lb-secondary-cta" type="button" onClick={onCatalog}>Explorar catálogo <ArrowRight size={15} /></button>
            </div>
          </motion.div>
        </div>

        <motion.div className="lb-hero-art" style={reducedMotion ? undefined : { rotateX, rotateY }}>
          <motion.div className="lb-art-glow" animate={reducedMotion ? undefined : { opacity: [0.35, 0.62, 0.35], scale: [0.96, 1.05, 0.96] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
          {heroMediaType === "video" && heroMediaUrl ? (
            <>
              <img className={`lb-hero-video-poster${heroVideoReady ? " is-hidden" : ""}`} src={heroPoster} alt={`Imagen de ${game.title}`} loading="eager" decoding="async" />
              <video
                ref={heroVideoRef}
                key={`video-${game.id}-${heroMediaUrl}`}
                className={`lb-hero-media-video${heroVideoReady ? " is-active" : ""}`}
                poster={heroPoster}
                src={loadedHeroVideoUrl === heroMediaUrl ? asset(heroMediaUrl) : undefined}
                muted
                loop
                playsInline
                preload="none"
                aria-label={`Video destacado de ${game.title}`}
                onCanPlay={() => { if (heroVideoActive) setHeroVideoReady(true); }}
                onError={() => { console.warn("No se pudo cargar el video destacado"); stopHeroVideo(); }}
              />
            </>
          ) : (
            <motion.img
              key={`art-${game.id}`}
              src={asset(heroMediaUrl || game.catalogImage || game.image)}
              alt={`Arte de ${game.title}`}
              loading="eager"
              decoding="async"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.86, rotateY: -11, x: 30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              onError={(event) => { event.currentTarget.src = asset(fallbackGame.image); }}
            />
          )}
          <div className="lb-art-reflection" />
        </motion.div>
      </motion.div>

      <div className="lb-hero-bottom">
        {featured.length > 1 && (
          <div className="lb-hero-switcher" aria-label="Cambiar juego destacado">
            <button type="button" aria-label="Destacado anterior" onClick={() => setIndex((index - 1 + featured.length) % featured.length)}><ArrowLeft size={16} /></button>
            <div className="lb-progress-dots">
              {featured.slice(0, 8).map((item, dotIndex) => <button key={item.id} className={dotIndex === index ? "is-active" : ""} aria-label={`Ver ${item.title}`} aria-pressed={dotIndex === index} onClick={() => setIndex(dotIndex)} />)}
            </div>
            <button type="button" aria-label="Siguiente destacado" onClick={() => setIndex((index + 1) % featured.length)}><ArrowRight size={16} /></button>
          </div>
        )}
      </div>
    </section>
  );
}

function GameCard(props: { game: Game; user: User | null; favorite: boolean; onOpen: (game: Game, origin?: HTMLElement) => void; onFavorite: (game: Game) => void; compact?: boolean }) {
  const { game, user, favorite, onOpen, onFavorite, compact } = props;
  const locked = Boolean(game.ageRestricted && (!user || !user.isAdult));
  const cats = gameCategories(game);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -7, rotateX: -1.2, rotateY: 1.4 }}
      transition={{ type: "spring", stiffness: 270, damping: 24 }}
      className={`lb-game-card${compact ? " is-compact" : ""}${locked ? " is-locked" : ""}`}
      onClick={(event) => locked ? invokeLegacy("btnAuth") : onOpen(game, event.currentTarget)}
      tabIndex={0}
      onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter") locked ? invokeLegacy("btnAuth") : onOpen(game, event.currentTarget); }}
      aria-label={locked ? `${game.title}, contenido +18` : `Ver detalles de ${game.title}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="lb-card-image">
        <img src={asset(game.catalogImage || game.image)} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = asset(fallbackGame.catalogImage || fallbackGame.image); }} />
        <div className="lb-card-shade" />
        <div className="lb-card-topline">
          <span className="lb-card-type">{cats.slice(0, 2).join(" · ") || "JUEGO"}</span>
          {game.ageRestricted && <span className="lb-age-tag">+18</span>}
        </div>
        {user?.isMod && <button className="lb-card-admin-edit" type="button" onClick={(event) => { event.stopPropagation(); window.openAdminEditModal?.(event.nativeEvent, game.id); }} aria-label={`Editar ${game.title}`} title="Editar juego"><Pencil size={14} /></button>}
        {!locked && <button className={`lb-favorite${favorite ? " is-favorite" : ""}`} type="button" aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"} onClick={(event) => { event.stopPropagation(); onFavorite(game); }}><Heart size={16} fill={favorite ? "currentColor" : "none"} /></button>}
        <div className="lb-card-image-title"><span>{game.onlineStatus === "online" ? "MULTIJUGADOR" : "DESCUBRE"}</span><strong>{game.title}</strong></div>
        {locked && <div className="lb-locked-overlay"><Shield size={22} /><b>CONTENIDO +18</b><span>Inicia sesión para verificar acceso</span></div>}
      </div>
      <div className="lb-card-body">
        <div className="lb-card-category">{cats.slice(0, 3).join(" / ") || "MULTIPLATAFORMA"}</div>
        <h3>{game.title}</h3>
        {!compact && <p>{game.desc || "Conoce las versiones disponibles, revisa sus requisitos y elige cómo jugar."}</p>}
        {Number(game.avgRating) > 0 && <span className="lb-card-rating"><b>★</b> {Number(game.avgRating).toFixed(1)} <small>VALORACIÓN DE LA COMUNIDAD</small></span>}
        <div className="lb-card-footer">
          <span>{game.size || "Ver tamaño"}</span>
          <span><Download size={13} /> {Number(game.downloadsCount || 0).toLocaleString("es-PE")}</span>
          <button type="button" onClick={(event) => { event.stopPropagation(); locked ? invokeLegacy("btnAuth") : onOpen(game, event.currentTarget); }} aria-label={`Ver ${game.title}`}>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function HomePage(props: {
  games: Game[]; featured: Game[]; heroIndex: number; setHeroIndex: (index: number) => void; setHeroHovered: (hovered: boolean) => void; footer: FooterContent;
  user: User | null; favorites: string[]; news: News[]; socials: Social; online: number;
  performanceMode: boolean;
  onOpenGame: (game: Game, origin?: HTMLElement) => void; onFavorite: (game: Game) => void; onCatalog: () => void;
  onCommunity: () => void;
}) {
  const { games, featured, heroIndex, setHeroIndex, setHeroHovered, footer, user, favorites, news, socials, online, performanceMode, onOpenGame, onFavorite, onCatalog, onCommunity } = props;
  const heroGame = featured[heroIndex] || featured[0] || fallbackGame;
  const trending = [...games].sort((a, b) => Number(b.downloadsCount || 0) - Number(a.downloadsCount || 0)).filter((game) => !game.ageRestricted).slice(0, 4);
  const collection = [
    { index: "01", title: "UNA NUEVA AVENTURA", detail: "Historias para perderte durante horas", tone: "red", icon: <Sparkles size={18} /> },
    { index: "02", title: "JUEGA EN COMPAÑÍA", detail: "Encuentra juegos para compartir", tone: "violet", icon: <Users size={18} /> },
    { index: "03", title: "CLÁSICOS QUE VUELVEN", detail: "Revive tus favoritos en nuevas plataformas", tone: "gold", icon: <Gamepad2 size={18} /> },
  ];

  return (
    <motion.main key="home" className="lb-page lb-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.32 }}>
      <HeroShowcase game={heroGame} featured={featured} index={heroIndex} setIndex={setHeroIndex} onHoverChange={setHeroHovered} onOpenGame={onOpenGame} onCatalog={onCatalog} performanceMode={performanceMode} />

      <section className="lb-editorial-row lb-container">
        <div className="lb-editorial-heading">
          <span className="lb-overline">ELIGE TU PRÓXIMO DESTINO</span>
          <h2>Hay un mundo<br /><em>esperando por ti.</em></h2>
          <p>Juegos seleccionados para descubrir, compartir y volver a jugar.</p>
        </div>
        <div className="lb-collection-grid">
          {collection.map((item, i) => (
            <motion.button className={`lb-collection-card tone-${item.tone}`} key={item.index} onClick={item.tone === "violet" ? onCommunity : onCatalog} whileHover={{ y: -6, scale: 1.012 }} transition={{ type: "spring", stiffness: 250, damping: 20 }}>
              <span className="lb-collection-index">{item.index} / EXPERIENCIA</span>
              <span className="lb-collection-icon">{item.icon}</span>
              <strong>{item.title}</strong><span>{item.detail}</span><ArrowUpRight className="lb-collection-arrow" size={18} />
              <i className="lb-collection-glow" />
            </motion.button>
          ))}
        </div>
      </section>

      <section className="lb-section lb-container">
        <div className="lb-section-heading">
          <div><span className="lb-overline"><Flame size={13} /> EN LA COMUNIDAD</span><h2>Los más buscados</h2><p>Los juegos que están despertando más interés.</p></div>
          <button className="lb-text-link" onClick={onCatalog}>Ver toda la biblioteca <ArrowRight size={16} /></button>
        </div>
        {trending.length ? <div className="lb-trending-grid">{trending.map((game) => <GameCard key={game.id} game={game} user={user} favorite={favorites.includes(game.id)} onOpen={onOpenGame} onFavorite={onFavorite} compact />)}</div> : <div className="lb-empty-state"><Gamepad2 size={28} /><p>La biblioteca está preparando su próxima aventura.</p></div>}
      </section>

      <section className="lb-community-band lb-container" id="community">
        <div className="lb-community-copy"><span className="lb-overline"><span className="lb-live-dot" /> PUNTO DE ENCUENTRO</span><h2>No juegas solo.</h2><p>Únete a Los Basados, conversa con la comunidad y descubre qué están jugando los demás.</p><button className="lb-primary-cta" onClick={onCommunity}><Users size={16} /> ENTRAR A LA COMUNIDAD <ArrowUpRight size={15} /></button></div>
        <div className="lb-community-signal"><div className="lb-signal-ring ring-one" /><div className="lb-signal-ring ring-two" /><div className="lb-signal-core"><Users size={24} /><strong>{online}</strong><span>EN LÍNEA</span></div><div className="lb-signal-label">LOS BASADOS<br /><b>ONLINE</b></div></div>
        <div className="lb-social-list">{footerSocials.map(({ id, label }) => { const href = socialHref(socials[id]); return href ? <a key={id} href={href} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={14} /></a> : null; })}</div>
      </section>

      <section className="lb-live-feature lb-container">
        <div className="lb-live-copy"><span className="lb-overline"><span className="lb-live-dot" /> EN DIRECTO</span><h2>La partida<br />también se mira.</h2><p>Conéctate al canal de VAZE_z06 y acompaña a la comunidad en vivo.</p><a href="https://www.twitch.tv/vaze_z06" target="_blank" rel="noreferrer">ABRIR CANAL <ArrowUpRight size={14} /></a></div>
        <div className="lb-live-screen"><iframe title="Canal de Twitch de VAZE_z06" loading="lazy" allowFullScreen src={`https://player.twitch.tv/?channel=vaze_z06&parent=${window.location.hostname || "localhost"}&parent=localhost&parent=127.0.0.1&muted=true`} /><div className="lb-live-screen-label"><span className="lb-live-dot" /> VAZE_Z06 <b>STREAM EN VIVO</b></div></div>
      </section>

      {news.length > 0 && <section className="lb-section lb-container lb-news-section"><div className="lb-section-heading"><div><span className="lb-overline">DIARIO DE PARTIDA</span><h2>Noticias & novedades</h2></div><span className="lb-news-count">{String(news.length).padStart(2, "0")} ACTUALIZACIONES</span></div><div className="lb-news-grid">{news.slice(0, 3).map((item, i) => <article key={item.id || item.title} className="lb-news-card"><span>0{i + 1} <i /> {item.date || "LOS BASADOS"}</span>{user?.isMod && item.id && <button className="lb-news-edit" type="button" onClick={() => window.editNews?.(item.id!)} aria-label={`Editar noticia ${item.title}`}><Pencil size={14} /> Editar</button>}<h3>{item.title}</h3><p>{item.content}</p></article>)}</div></section>}

      <footer className="lb-footer lb-home-footer lb-container">
        <div className="lb-footer-brand-panel">
          <a className="lb-brand" href="#/home" onClick={(event) => { event.preventDefault(); window.location.hash = "/home"; }}><span className="lb-brand-mark"><Gamepad2 size={25} /></span><span>LOS <b>BASADOS</b></span></a>
          <strong className="lb-footer-copyright">© 2026 LOS BASADOS</strong>
          <span className="lb-footer-credits">{footer.credits}</span>
          <span className="lb-footer-tagline">{footer.tagline}</span>
        </div>
        <section className="lb-footer-community" aria-label="Redes sociales">
          <div className="lb-footer-community-copy">
            <span className="lb-footer-eyebrow">{footer.eyebrow}</span>
            <h2>{footer.title}</h2>
            <p>{footer.description}</p>
          </div>
          <div className="lb-footer-socials">
            {footerSocials.map(({ id, label, icon }) => { const href = socialHref(socials[id]); return href ? (
              <a key={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                <i className={`fab ${icon}`} aria-hidden="true" />
              </a>
            ) : null; })}
            {!footerSocials.some(({ id }) => socialHref(socials[id])) && <span className="lb-footer-social-empty">Pronto compartiremos nuestros canales.</span>}
          </div>
        </section>
      </footer>
    </motion.main>
  );
}

function CatalogPage(props: {
  games: Game[]; genres: string[]; user: User | null; favorites: string[];
  search: string; onSearch: (value: string) => void; onOpenGame: (game: Game, origin?: HTMLElement) => void; onFavorite: (game: Game) => void;
}) {
  const { games, genres, user, favorites, search, onSearch, onOpenGame, onFavorite } = props;
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState("popular");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [platform, setPlatform] = useState("all");
  const [sizeRange, setSizeRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const categories = ["Todos", ...genres.filter((genre) => genre.toLowerCase() !== "todos"), "Favoritos"];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = games.filter((game) => {
      const cats = gameCategories(game);
      const matchesCategory = category === "Todos" || category === "Favoritos" || cats.some((cat) => cat.toLowerCase() === category.toLowerCase());
      const matchesFavorites = !(onlyFavorites || category === "Favoritos") || favorites.includes(game.id);
      const matchesSearch = !query || `${game.title} ${game.desc || ""} ${cats.join(" ")}`.toLowerCase().includes(query);
      const matchesPlatform = platform === "all" || cats.some((cat) => cat.toLowerCase().includes(platform.toLowerCase())) || `${game.title} ${game.desc || ""}`.toLowerCase().includes(platform.toLowerCase());
      const sizeNumber = Number.parseFloat((game.size || "").replace(/[^0-9.]/g, "")) || 0;
      const sizeGb = /mb/i.test(game.size || "") ? sizeNumber / 1024 : sizeNumber;
      const matchesSize = sizeRange === "all" || (sizeRange === "light" ? sizeGb < 1 : sizeRange === "medium" ? sizeGb >= 1 && sizeGb <= 5 : sizeGb > 5);
      return matchesCategory && matchesFavorites && matchesSearch && matchesPlatform && matchesSize;
    });
    return list.sort((a, b) => sort === "popular"
      ? Number(b.downloadsCount || 0) - Number(a.downloadsCount || 0)
      : sort === "az" ? a.title.localeCompare(b.title, "es") : b.title.localeCompare(a.title, "es"));
  }, [games, category, onlyFavorites, favorites, search, sort, platform, sizeRange]);

  return (
    <motion.main key="catalog" className="lb-page lb-catalog-page" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.32 }}>
      <section className="lb-catalog-heading lb-container">
        <div><span className="lb-overline">LA BIBLIOTECA</span><h1>Elige tu próxima<br /><em>partida.</em></h1><p>Explora {games.length} juegos, encuentra el tuyo y revisa sus versiones y requisitos.</p></div>
        <div className="lb-catalog-counter"><span>COLECCIÓN</span><strong>{String(games.length).padStart(2, "0")}</strong><small>JUEGOS DISPONIBLES</small></div>
      </section>

      <section className="lb-catalog-controls lb-container" aria-label="Filtros del catálogo">
        <div className="lb-category-scroller">{categories.map((item) => <button key={item} className={`lb-category-chip${category === item ? " is-selected" : ""}`} onClick={() => { setCategory(item); if (item !== "Favoritos") setOnlyFavorites(false); }} type="button">{item === "Favoritos" && <Heart size={13} />} {item}</button>)}</div>
        <div className="lb-sort-row">
          <button className={`lb-favorites-toggle${onlyFavorites ? " is-on" : ""}`} onClick={() => setOnlyFavorites((value) => !value)} type="button"><Heart size={14} /> MIS FAVORITOS <span>{favorites.length}</span></button>
          <div className="lb-sort-actions">
            <button className={`lb-filter-toggle${showFilters ? " is-open" : ""}`} type="button" onClick={() => setShowFilters((value) => !value)}><Filter size={13} /> FILTROS <ChevronDown size={13} /></button>
            <label className="lb-sort-select">ORDENAR <ChevronDown size={13} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar juegos"><option value="popular">Más buscados</option><option value="az">Nombre A—Z</option><option value="za">Nombre Z—A</option></select></label>
          </div>
        </div>
        <AnimatePresence initial={false}>{showFilters && <motion.div className="lb-advanced-filters" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}><label>PLATAFORMA<select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="all">Todas</option><option value="windows">Windows / PC</option><option value="android">Android</option><option value="iso">ISO / ROM</option></select></label><label>TAMAÑO<select value={sizeRange} onChange={(event) => setSizeRange(event.target.value)}><option value="all">Cualquiera</option><option value="light">Menos de 1 GB</option><option value="medium">1 a 5 GB</option><option value="heavy">Más de 5 GB</option></select></label><button type="button" onClick={() => { setPlatform("all"); setSizeRange("all"); setCategory("Todos"); setOnlyFavorites(false); onSearch(""); }}>RESTABLECER</button></motion.div>}</AnimatePresence>
      </section>

      <section className="lb-catalog-results lb-container">
        <div className="lb-results-heading"><span>{filtered.length} RESULTADOS</span><i /><span>{category.toUpperCase()}</span></div>
        {filtered.length ? <motion.div layout className="lb-catalog-grid"><AnimatePresence mode="popLayout">{filtered.map((game) => <GameCard key={game.id} game={game} user={user} favorite={favorites.includes(game.id)} onOpen={onOpenGame} onFavorite={onFavorite} />)}</AnimatePresence></motion.div> : <div className="lb-empty-state"><CircleHelp size={28} /><h3>No encontramos ese juego</h3><p>Prueba con otro título o cambia la categoría seleccionada.</p><button className="lb-secondary-cta" type="button" onClick={() => { onSearch(""); setCategory("Todos"); setOnlyFavorites(false); setPlatform("all"); setSizeRange("all"); }}>Limpiar filtros <X size={14} /></button></div>}
      </section>
      <footer className="lb-footer lb-container"><button className="lb-text-link" onClick={() => window.location.hash = "/home"}><ArrowLeft size={14} /> Volver al inicio</button><span>LOS BASADOS · DESCUBRE QUÉ JUGAR</span><span>CONTENIDO +18 CON ACCESO VERIFICADO</span></footer>
    </motion.main>
  );
}

function WishlistPage(props: { games: Game[]; user: User | null; favorites: string[]; alertIds: string[]; onOpen: (game: Game, origin?: HTMLElement) => void; onFavorite: (game: Game) => void; onToggleAlert: (id: string) => void; onCatalog: () => void }) {
  const { games, user, favorites, alertIds, onOpen, onFavorite, onToggleAlert, onCatalog } = props;
  const savedGames = games.filter((game) => favorites.includes(game.id));
  return (
    <motion.main className="lb-page lb-wishlist-page" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.34 }}>
      <section className="lb-wishlist-heading lb-container"><div><span className="lb-overline"><Heart size={13} /> TU COLECCIÓN PERSONAL</span><h1>Tu próxima partida,<br /><em>guardada aquí.</em></h1><p>Reúne los juegos que te interesan y activa avisos cuando publiquemos cambios de versiones o descarga.</p></div><div className="lb-wishlist-stats"><strong>{String(savedGames.length).padStart(2, "0")}</strong><span>JUEGOS GUARDADOS</span><i /><span>{alertIds.filter((id) => favorites.includes(id)).length} AVISOS ACTIVOS EN ESTE DISPOSITIVO</span></div></section>
      <section className="lb-wishlist-results lb-container">
        {savedGames.length ? <div className="lb-wishlist-grid">{savedGames.map((game) => <article className="lb-wishlist-item" key={game.id}><GameCard game={game} user={user} favorite={favorites.includes(game.id)} onOpen={onOpen} onFavorite={onFavorite} /><button className={`lb-wishlist-alert${alertIds.includes(game.id) ? " is-active" : ""}`} type="button" onClick={() => onToggleAlert(game.id)}><Bell size={14} />{alertIds.includes(game.id) ? "AVISO ACTIVADO" : "AVISARME DE NOVEDADES"}<span>{alertIds.includes(game.id) ? "Este dispositivo" : ""}</span></button></article>)}</div> : <div className="lb-empty-state lb-wishlist-empty"><Heart size={27} /><h2>Tu lista empieza con un favorito.</h2><p>Guarda juegos desde el catálogo y vuelve aquí cuando quieras continuar.</p><button className="lb-primary-cta" type="button" onClick={onCatalog}>EXPLORAR CATÁLOGO <ArrowRight size={15} /></button></div>}
      </section>
      <footer className="lb-footer lb-container"><span>MI LISTA · LOS BASADOS</span><span>Los avisos se muestran aquí cuando el juego cambia en la biblioteca.</span><button onClick={onCatalog}>Volver al catálogo <ArrowRight size={14} /></button></footer>
    </motion.main>
  );
}

function FloatingAdNotice(props: { ad: FloatingAd; onClose: () => void; onOpen: () => void; performanceMode: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ad, onClose, onOpen, performanceMode } = props;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || performanceMode) return;
    const playWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void video.play().catch((error: DOMException) => {
          if (error.name !== "NotAllowedError") console.warn("No se pudo reproducir el anuncio", error);
        });
      } else {
        video.pause();
      }
    };
    document.addEventListener("visibilitychange", playWhenVisible);
    playWhenVisible();
    return () => {
      document.removeEventListener("visibilitychange", playWhenVisible);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [ad.id, ad.videoUrl, performanceMode]);

  return (
    <aside className={`lb-floating-ad lb-floating-ad--${ad.position}`} aria-label={`Anuncio: ${ad.title}`}>
      <button className="lb-floating-ad__open" type="button" onClick={onOpen} aria-label={`Ver ${ad.title}`}>
        {!performanceMode && <video ref={videoRef} src={asset(ad.videoUrl)} muted loop playsInline preload="metadata" />}
        <span className="lb-floating-ad__title">{ad.title}</span>
      </button>
      <button className="lb-floating-ad__close" type="button" onClick={onClose} aria-label="Cerrar anuncio"><X size={16} /></button>
      <span className="lb-floating-ad__label">ANUNCIO</span>
    </aside>
  );
}

function LocalRadio() {
  const [tracks, setTracks] = useState<Array<{ name: string; url: string }>>([]);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrls = useRef<string[]>([]);
  const currentTrack = tracks[selectedTrack];

  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const selectTracks = (files: FileList | null) => {
    if (!files?.length) return;
    const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"));
    if (!audioFiles.length) {
      setError("Selecciona archivos de audio compatibles.");
      return;
    }
    if (audioFiles.length !== files.length) setError("Se omitieron archivos que no son audio.");
    else setError("");
    audioRef.current?.pause();
    setIsPlaying(false);
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current = audioFiles.map((file) => URL.createObjectURL(file));
    setTracks(audioFiles.map((file, index) => ({ name: file.name, url: objectUrls.current[index] })));
    setSelectedTrack(0);
  };

  const playTrack = (index = selectedTrack) => {
    const track = tracks[index];
    const player = audioRef.current;
    if (!track || !player) {
      setError("Añade tus pistas de audio propias o con licencia para reproducirlas.");
      setIsOpen(true);
      return;
    }
    setSelectedTrack(index);
    if (player.src !== track.url) {
      player.src = track.url;
      player.load();
    }
    player.muted = muted;
    setError("");
    void player.play().then(() => setIsPlaying(true)).catch((playError: DOMException) => {
      setIsPlaying(false);
      setError(playError.message || "No se pudo reproducir esta pista.");
    });
  };

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    playTrack();
  };

  return (
    <aside className={`lb-local-radio${isOpen ? " is-open" : ""}`} aria-label="Reproductor de audio local">
      {isOpen && <div className="lb-local-radio-panel">
        <header><span><Music2 size={15} /> RADIO · TUS PISTAS</span><button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar radio"><X size={15} /></button></header>
        <p>Reproduce archivos propios o con licencia, directamente desde tu dispositivo.</p>
        <label className="lb-radio-file"><input type="file" accept="audio/*" multiple onChange={(event) => { selectTracks(event.currentTarget.files); event.currentTarget.value = ""; }} />Añadir pistas</label>
        {tracks.length > 0 && <select aria-label="Seleccionar pista" value={selectedTrack} onChange={(event) => { const next = Number(event.target.value); setSelectedTrack(next); if (isPlaying) playTrack(next); }}>
          {tracks.map((track, index) => <option key={`${track.name}-${index}`} value={index}>{track.name}</option>)}
        </select>}
        {error && <span className="lb-radio-error" role="status">{error}</span>}
        <div className="lb-radio-controls">
          <button type="button" onClick={togglePlayback} aria-label={isPlaying ? "Pausar reproducción" : "Reproducir"}>{isPlaying ? <Pause size={17} /> : <Play size={17} />}</button>
          <span>{currentTrack?.name || "Sin pista seleccionada"}</span>
          <button type="button" onClick={() => { const nextMuted = !muted; setMuted(nextMuted); if (audioRef.current) audioRef.current.muted = nextMuted; }} aria-label={muted ? "Activar sonido" : "Silenciar"}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
        </div>
      </div>}
      <button className="lb-radio-toggle" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-label={isOpen ? "Cerrar mini radio" : "Abrir mini radio"} title="Mini radio">
        <Music2 size={17} /><span>Radio</span>
      </button>
      <audio ref={audioRef} hidden onEnded={() => { if (tracks.length > 1) playTrack((selectedTrack + 1) % tracks.length); else setIsPlaying(false); }} />
    </aside>
  );
}

function CommunityPage(props: { visible: boolean; online: number; user: User | null; games: Game[]; friends: FriendRecord; registeredUsers: Record<string, RegisteredUser>; onlineUsers: OnlineUser[]; chatRef: RefObject<HTMLDivElement>; requestsRef: RefObject<HTMLDivElement>; dmRef: RefObject<HTMLDivElement> }) {
  const { visible, online, user, games, friends, registeredUsers, onlineUsers, chatRef, requestsRef, dmRef } = props;
  const friendRecords = user?.name ? Object.entries(friends[user.name] || {}).map(([key, value]) => {
    const detail = typeof value === "object" && value ? value : {};
    const name = (typeof detail === "object" && detail.name) || (typeof value === "string" ? value : key);
    const profile = Object.values(registeredUsers).find((item) => item.name?.toLocaleLowerCase() === name.toLocaleLowerCase());
    const onlineRecord = onlineUsers.find((item) => item.name?.toLocaleLowerCase() === name.toLocaleLowerCase());
    return { name, avatar: (typeof detail === "object" && detail.avatar) || profile?.avatar || onlineRecord?.avatar, online: Boolean(onlineRecord) };
  }).filter((friend) => friend.name) : [];
  return (
    <motion.main
      className="lb-page lb-community-page"
      aria-hidden={!visible}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ display: visible ? "block" : "none" }}
    >
      <section className="lb-community-hero lb-container">
        <div>
          <span className="lb-overline"><span className="lb-live-dot" /> PUNTO DE ENCUENTRO</span>
          <h1>El juego se disfruta.<br /><em>La comunidad lo hace inolvidable.</em></h1>
          <p>Conversa, encuentra con quién jugar y cuéntanos qué juego debería llegar a la biblioteca.</p>
        </div>
        <div className="lb-community-live-count"><span>AHORA MISMO</span><strong>{online.toString().padStart(2, "0")}</strong><small><i /> BASADOS CONECTADOS</small></div>
      </section>
      <section className="lb-community-content lb-container">
        <div className="lb-community-section-heading"><div><span className="lb-overline">TU LOBBY</span><h2>La party empieza aquí.</h2><p>Coordina una partida, comparte una captura y encuentra compañeros.</p></div><span className="lb-community-secure"><span className="lb-live-dot" /> {online} JUGADORES CONECTADOS</span></div>
        <div className="lb-community-workspace">
          <aside className="lb-community-roster">
            <section className="lb-roster-panel"><header><div><span className="lb-overline">TU CíRCULO</span><h3>Amigos</h3></div><span className="lb-roster-count">{friendRecords.length}</span></header>
              {user ? friendRecords.length ? <ul className="lb-friends-list">{friendRecords.map((friend) => <li key={friend.name} className="lb-friend-card"><button className="lb-friend-profile" type="button" onClick={() => window.openPublicProfile?.(friend.name, friend.avatar)}><span className="lb-friend-avatar"><img src={friend.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(friend.name)}`} alt="" loading="lazy" decoding="async" /><i className={friend.online ? "is-online" : ""} /></span><span className="lb-friend-meta"><strong>{friend.name}</strong><small>{friend.online ? "En línea" : "Desconectado"}</small></span></button><button className="lb-friend-message" type="button" aria-label={`Enviar mensaje a ${friend.name}`} onClick={() => window.openPrivateChatWith?.(friend.name)}><ArrowUpRight size={15} /></button></li>)}</ul> : <div className="lb-roster-empty"><Users size={20} /><strong>Aún no hay amigos</strong><span>Visita el perfil de alguien para conectar.</span></div> : <div className="lb-roster-empty"><Users size={20} /><strong>Entra a tu cuenta</strong><span>Inicia sesión para ver tu círculo.</span></div>}
            </section>
            <section className="lb-roster-panel lb-online-panel"><header><div><span className="lb-overline">EN ESTE LOBBY</span><h3>En línea</h3></div><span className="lb-roster-count is-live">{online}</span></header><ul className="users-list" id="onlineUsersList" /></section>
          </aside>
          <section className="lb-community-room">
            <header className="lb-room-toolbar"><div><span className="lb-room-kicker"><i /> SALA PÚBLICA</span><strong>General</strong></div><div className="lb-room-controls"><div className="lb-community-tabs"><button type="button" id="btnTabChat" className="is-active" onClick={() => (window as any).switchForumTab?.("chat")}>Chat general</button><button type="button" id="btnTabRequests" onClick={() => (window as any).switchForumTab?.("requests")}>Pedir un juego</button></div><span className="lb-room-online"><b id="onlineCountModal">{online}</b> conectados</span></div></header>
            <div className="lb-community-chat-host" ref={chatRef} />
            <div className="lb-community-requests-host" ref={requestsRef} />
            <div className="lb-community-dm-host" ref={dmRef} />
          </section>
        </div>
        <CommunityMissions games={games} user={user} isMod={Boolean(user?.isMod)} />
      </section>
      <footer className="lb-footer lb-container"><span>LOS BASADOS · CONECTA. JUEGA. COMPARTE.</span><span>CHAT GENERAL · PEDIR JUEGO</span><span>{online} EN LÍNEA</span></footer>
    </motion.main>
  );
}

export default function ShowcaseApp({ communityChatHost, communityRequestsHost, communityDmHost }: { communityChatHost: RefObject<HTMLDivElement>; communityRequestsHost: RefObject<HTMLDivElement>; communityDmHost: RefObject<HTMLDivElement> }) {
  const [games, setGames] = useState<Game[]>(() => getInitial<Game[]>("games", []));
  const [genres, setGenres] = useState<string[]>(() => getInitial<string[]>("genres", []));
  const [news, setNews] = useState<News[]>(() => getInitial<News[]>("news", []));
  const [socials, setSocials] = useState<Social>(() => getInitial<Social>("social", {}));
  const [footer, setFooter] = useState<FooterContent>(() => ({ ...defaultFooterContent, ...getInitial<Partial<FooterContent>>("footer", {}) }));
  const [ads, setAds] = useState<FloatingAd[]>(() => getInitial<FloatingAd[]>("ads", []));
  const [visibleAd, setVisibleAd] = useState<FloatingAd | null>(null);
  const adCursor = useRef(0);
  const [online, setOnline] = useState<number>(() => getInitial<number>("online", 0));
  const [friends, setFriends] = useState<FriendRecord>(() => getInitial<FriendRecord>("friends", {}));
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, RegisteredUser>>(() => getInitial<Record<string, RegisteredUser>>("registeredUsers", {}));
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(() => getInitial<OnlineUser[]>("onlineUsers", []));
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("basados_favs") || "[]"); } catch { return []; }
  });
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("basados_user") || "null"); } catch { return null; }
  });
  const [view, setView] = useState<View>(() => window.location.hash.includes("catalog") ? "catalog" : window.location.hash.includes("community") ? "community" : window.location.hash.includes("wishlist") ? "wishlist" : "home");
  const [search, setSearch] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroHovered, setHeroHovered] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [wishlistAlerts, setWishlistAlerts] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("basados_wishlist_alerts") || "[]"); } catch { return []; }
  });
  const [wishlistNotice, setWishlistNotice] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try { return localStorage.getItem("losbasados-theme") === "light" ? "light" : "dark"; } catch { return "dark"; }
  });
  const [performanceMode, setPerformanceMode] = useState(() => {
    try { return localStorage.getItem("losbasados-performance-mode") === "true"; } catch { return false; }
  });
  const reducedMotion = useReducedMotion();
  const featured = useMemo(() => {
    const eligible = games.filter((game) => !game.ageRestricted || user?.isAdult);
    const selected = eligible.filter((game) => game.featured);
    return [...(selected.length ? selected : eligible)].sort((a, b) => Number(Boolean(a.ageRestricted)) - Number(Boolean(b.ageRestricted)) || Number(b.downloadsCount || 0) - Number(a.downloadsCount || 0));
  }, [games, user?.isAdult]);

  useEffect(() => {
    const listen = <T,>(name: string, setter: (value: T) => void) => {
      const handler = (event: Event) => setter((event as CustomEvent<T>).detail);
      window.addEventListener(`losbasados:${name}`, handler);
      return () => window.removeEventListener(`losbasados:${name}`, handler);
    };
    const cleanups = [
      listen<Game[]>("games", setGames), listen<string[]>("genres", setGenres),
      listen<News[]>("news", setNews), listen<Social>("social", setSocials), listen<FooterContent>("footer", (value) => setFooter({ ...defaultFooterContent, ...value })),
      listen<number>("online", setOnline), listen<FriendRecord>("friends", setFriends),
      listen<Record<string, RegisteredUser>>("registeredUsers", setRegisteredUsers), listen<OnlineUser[]>("onlineUsers", setOnlineUsers),
      listen<string[]>("favorites", setFavorites),
      listen<User | null>("user", setUser),
      listen<FloatingAd[]>("ads", setAds),
    ];
    const syncHash = () => {
      const nextView = window.location.hash.includes("catalog") ? "catalog" : window.location.hash.includes("community") ? "community" : window.location.hash.includes("wishlist") ? "wishlist" : "home";
      setView(nextView);
      if (nextView !== "home") setHeroHovered(false);
      setMobileMenu(false);
    };
    window.addEventListener("hashchange", syncHash);
    document.documentElement.dataset.theme = theme;
    return () => { cleanups.forEach((cleanup) => cleanup()); window.removeEventListener("hashchange", syncHash); };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.performance = performanceMode ? "low" : "full";
  }, [performanceMode]);

  useEffect(() => {
    const activeAds = ads.filter((ad) => ad.active && ad.videoUrl && ad.targetGameId);
    if (!activeAds.length || visibleAd) return;
    const selected = activeAds[adCursor.current % activeAds.length];
    const delay = Math.max(1, Number(selected.intervalMinutes) || 30) * 60_000;
    const timer = window.setTimeout(() => setVisibleAd(selected), delay);
    return () => window.clearTimeout(timer);
  }, [ads, visibleAd]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".lb-search input")?.focus();
      }
      if (event.key === "Escape" && document.activeElement === document.querySelector(".lb-search input")) {
        setSearch("");
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#08080b" : "#f0eef1");
    try { localStorage.setItem("losbasados-theme", theme); } catch { /* Theme remains active for this session. */ }
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem("basados_wishlist_alerts", JSON.stringify(wishlistAlerts)); } catch { /* Keep alerts active for this session. */ }
  }, [wishlistAlerts]);

  useEffect(() => {
    if (!games.length) return;
    let previous: Record<string, string> = {};
    try { previous = JSON.parse(localStorage.getItem("basados_game_signatures") || "{}"); } catch { previous = {}; }
    const next = Object.fromEntries(games.map((game) => [game.id, JSON.stringify({ title: game.title, size: game.size, downloadUrl: game.downloadUrl, versions: (game.versions || []).map((version: any) => [version?.name, version?.downloadUrl]), installGuide: game.installGuide })]));
    const changed = games.filter((game) => wishlistAlerts.includes(game.id) && previous[game.id] && previous[game.id] !== next[game.id]);
    try { localStorage.setItem("basados_game_signatures", JSON.stringify(next)); } catch { /* Change detection remains available for this session. */ }
    if (changed.length) setWishlistNotice(changed.length === 1 ? `Hay novedades para ${changed[0].title}, guardado en tu lista.` : `Hay novedades en ${changed.length} juegos de tu lista.`);
  }, [games, wishlistAlerts]);

  useEffect(() => {
    if (!wishlistNotice) return;
    const timer = window.setTimeout(() => setWishlistNotice(null), 7000);
    return () => window.clearTimeout(timer);
  }, [wishlistNotice]);

  useEffect(() => {
    if (reducedMotion || performanceMode || featured.length < 2 || view !== "home" || heroHovered) return;
    const timer = window.setInterval(() => setHeroIndex((index) => (index + 1) % featured.length), 8200);
    return () => window.clearInterval(timer);
  }, [featured.length, heroHovered, performanceMode, reducedMotion, view]);

  const navigate = (next: View) => {
    setView(next);
    if (next !== "home") setHeroHovered(false);
    setMobileMenu(false);
    if (window.location.hash !== `#/${next}`) window.location.hash = `/${next}`;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };
  const openGame = (game: Game, origin?: HTMLElement) => {
    if (game.ageRestricted && (!user || !user.isAdult)) { invokeLegacy("btnAuth"); return; }
    const rect = origin?.getBoundingClientRect();
    window.openGameModal?.(game.id, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined);
  };
  const toggleFavorite = (game: Game) => {
    const removing = favorites.includes(game.id);
    if (window.toggleFav) {
      window.toggleFav(new Event("click"), game.id);
      setFavorites(() => { try { return JSON.parse(localStorage.getItem("basados_favs") || "[]"); } catch { return []; } });
      if (removing) setWishlistAlerts((items) => items.filter((id) => id !== game.id));
    }
  };
  const toggleWishlistAlert = (id: string) => setWishlistAlerts((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const changeSearch = (value: string) => {
    setSearch(value);
    if (value && view !== "catalog") navigate("catalog");
  };
  const togglePerformanceMode = () => setPerformanceMode((enabled) => {
    const next = !enabled;
    try { localStorage.setItem("losbasados-performance-mode", String(next)); } catch { /* The preference still applies until the page closes. */ }
    return next;
  });

  return (
    <div className={`lb-app theme-${theme}`}>
      <Header view={view} onNavigate={navigate} onCommunity={() => navigate("community")} onWishlist={() => navigate("wishlist")} favoritesCount={favorites.length} search={search} onSearch={changeSearch} theme={theme} onTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")} performanceMode={performanceMode} onTogglePerformance={togglePerformanceMode} user={user} online={online} mobileMenu={mobileMenu} onMobileMenu={() => setMobileMenu((current) => !current)} />
      <AnimatePresence>{wishlistNotice && <motion.div className="lb-wishlist-toast" role="status" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><Bell size={16} /><span>{wishlistNotice}</span><button type="button" onClick={() => setWishlistNotice(null)} aria-label="Cerrar aviso"><X size={15} /></button></motion.div>}</AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        {view === "home" ? <HomePage key="home-page" games={games} featured={featured} heroIndex={heroIndex} setHeroIndex={setHeroIndex} setHeroHovered={setHeroHovered} footer={footer} user={user} favorites={favorites} news={news} socials={socials} online={online} performanceMode={performanceMode} onOpenGame={openGame} onFavorite={toggleFavorite} onCatalog={() => navigate("catalog")} onCommunity={() => navigate("community")} /> : view === "catalog" ? <CatalogPage key="catalog-page" games={games.length ? games : [fallbackGame]} genres={genres} user={user} favorites={favorites} search={search} onSearch={setSearch} onOpenGame={openGame} onFavorite={toggleFavorite} /> : view === "wishlist" ? <WishlistPage key="wishlist-page" games={games} user={user} favorites={favorites} alertIds={wishlistAlerts} onOpen={openGame} onFavorite={toggleFavorite} onToggleAlert={toggleWishlistAlert} onCatalog={() => navigate("catalog")} /> : null}
      </AnimatePresence>
      <CommunityPage visible={view === "community"} online={online} user={user} games={games} friends={friends} registeredUsers={registeredUsers} onlineUsers={onlineUsers} chatRef={communityChatHost} requestsRef={communityRequestsHost} dmRef={communityDmHost} />
      <AnimatePresence>{visibleAd && <motion.div key={visibleAd.id} initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 12 }}><FloatingAdNotice ad={visibleAd} onClose={() => { adCursor.current += 1; setVisibleAd(null); }} onOpen={() => { const target = games.find((game) => game.id === visibleAd.targetGameId); setVisibleAd(null); if (target) openGame(target); }} performanceMode={performanceMode} /></motion.div>}</AnimatePresence>
      <LocalRadio />
    </div>
  );
}
