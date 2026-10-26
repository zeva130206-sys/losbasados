// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAdTk5ODylCJ13iifDlYcNGqNk84clxghQ",
    authDomain: "los-basados.firebaseapp.com",
    databaseURL: "https://los-basados-default-rtdb.firebaseio.com",
    projectId: "los-basados",
    messagingSenderId: "669430555076",
    appId: "1:669430555076:web:6ca4e4ea23fdfbb8344491",
    measurementId: "G-3EF05XGSY1"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const messagesRef = db.ref('chat_messages');
const onlineUsersRef = db.ref('online_users');
const usersRef = db.ref('users');
const gamesRef = db.ref('games');
const newsRef = db.ref('news');
const genresRef = db.ref('genres');
const commentsRef = db.ref('comments');
const reportsRef = db.ref('reports');
const requestsRef = db.ref('game_requests');
const socialRef = db.ref('social_links');
const footerRef = db.ref('footer_content');
const userScreenshotsRef = db.ref('screenshots');
const friendsRef = db.ref('user_friends');
const privateChatRef = db.ref('private_messages');
const notificationsRef = db.ref('user_notifications');
const adsRef = db.ref('floating_ads');

function publishLosBasadosState(name, detail) {
    window.__LOS_BASADOS__ = window.__LOS_BASADOS__ || {};
    window.__LOS_BASADOS__[name] = detail;
    window.dispatchEvent(new CustomEvent(`losbasados:${name}`, { detail }));
}

// CLAVE API OFICIAL Y ESTABLE DE GIPHY CON FALLBACK
const GIPHY_API_KEY = 'DJB4CZoGHwHHM7q9EKUr8fstYUxpBwFw';

// DICCIONARIO COMPLETO DE EMOJIS POR CATEGORÍA
const EMOJI_DATA = {
    smileys: ["😀","😃","😄","😁","😆","😅","😂","🤣","🥲","☺️","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕"],
    people: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄"],
    animals: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🦟","🦗","🕷️","🦂","🐢","🐍","蜥","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","鹿","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🐓","🦃","🦤","🦚","🦜","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🦔"],
    food: ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🫓","🥪","🌮","🌯","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯"],
    activities: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️","🤺","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚵","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🎟️","🎫","🎪","🤹","🎭","🎨","🎬","🎤","🎧","🎼","🎵","🎶","🥁","🎷","🎺","🎸","🪕","🎻","🎲","♟️","🎯","🎳","🎮","🎰","🧩"],
    travel: ["🚗","🚕","🚙","🚌","🦽","🛺","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🦯","🦼","🛴","🚲","🛵","🏍️","🛺","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚝","🚋","🚎","✈️","🛫","🛬","🛩️","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🛳️","⚙️","⚓","⛽","🚧","🚦","🚥","🗺️","🗿","🗽","🗼","🏰","🏯","🏟️","🎡","🎢","🎠"],
    objects: ["⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","💡","🔦","🏮","🪔","🕯️","🧯","🛢️","💸","💵","💴","💶","💷","🪙","💰","💳","💎","⚖️","🧰","🔧","🔨","⚒️","🛠️","⛏️","🪓","🔌","🔋"],
    symbols: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","🆚","💮","🉐","秘","祝","㊗️","㊎","㊍","⛔","🅰️","🅱️","🆎","🆑","🅾️","💦","💨","💫","💬","🗯️","💭","💤"]
};

// IMAGEN POR DEFECTO PARA FALLBACKS
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x225/0f0f14/ff003c?text=Imagen+No+Disponible';

// AUDIO SYNTHWAVE / LO-FI DE FONDO
const bgAudio = new Audio();
bgAudio.preload = 'none';
bgAudio.loop = true;
bgAudio.volume = 0.2;
let isAudioPlaying = false;

// EFECTO DE SONIDO POP AL HACER CLICK
function playClickSound() {
    let context;
    try {
        context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, context.currentTime);
        gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.addEventListener('ended', () => { void context.close(); }, { once: true });
        osc.start();
        osc.stop(context.currentTime + 0.05);
    } catch (error) {
        if (context && context.state !== 'closed') void context.close();
        console.warn("No se pudo reproducir el sonido de interfaz", error);
    }
}

// DATOS BASE INICIALES
const defaultGames = [
    {
        id: "default-1",
        title: "Mario Kart Wii (PC Port)",
        category: ["Carreras", "Pantalla Compartida", "Windows"],
        size: "2.9 GB",
        server: "MediaFire",
        image: "assets/img/MarioKartWii.png",
        downloadUrl: "https://ouo.io/gx2F6LP",
        versions: [
            { name: "Versión Portable v1.0", downloadUrl: "https://ouo.io/gx2F6LP", server: "MediaFire" },
            { name: "Versión HD Modpack", downloadUrl: "https://ouo.io/gx2F6LP", server: "MediaFire" }
        ],
        fixOnlineServer: "",
        fixOnlineUrl: "",
        featured: true,
        ageRestricted: false,
        onlineStatus: "online",
        gamepadStatus: true,
        downloadsCount: 154,
        specs: {
            so: "Windows 7 / 8 / 10 / 11 (64-bits)",
            cpu: "Intel Core i3 / AMD FX equivalente",
            ram: "4 GB RAM",
            gpu: "Intel HD 4000 / Nvidia GT 710"
        },
        desc: "El clásico juego de carreras totalmente adaptado para PC.",
        embed: ""
    }
];

const defaultGenres = ["Carreras", "Acción", "Supervivencia", "Retro", "Android", "Windows", "ISO", "Pantalla Compartida"];

const defaultNews = [
    { id: "news-1", title: "Actualización v2.1 de LOS BASADOS", date: "15 SEPT, 2026", content: "Añadidos contadores de descargas, reporte de links caídos, filtros de mando/online y creador de peticiones." },
    { id: "news-2", title: "Nuevos Ports Optimizados", date: "12 SEPT, 2026", content: "Optimizando los instaladores para que corran en PC y móviles de gama baja/media." }
];

const socialNetworks = [
    { id: 'discord', label: 'Discord', icon: 'fa-discord', className: 'discord-btn', placeholderHost: 'discord.gg' },
    { id: 'telegram', label: 'Telegram', icon: 'fa-telegram', className: 'telegram-btn', placeholderHost: 't.me' },
    { id: 'youtube', label: 'YouTube', icon: 'fa-youtube', className: 'youtube-btn', placeholderHost: 'youtube.com' },
    { id: 'instagram', label: 'Instagram', icon: 'fa-instagram', className: 'instagram-btn', placeholderHost: 'instagram.com' },
    { id: 'tiktok', label: 'TikTok', icon: 'fa-tiktok', className: 'tiktok-btn', placeholderHost: 'tiktok.com' },
    { id: 'facebook', label: 'Facebook', icon: 'fa-facebook', className: 'facebook-btn', placeholderHost: 'facebook.com' }
];

function cleanSocialLinks(data) {
    const links = {};
    socialNetworks.forEach(({ id, placeholderHost }) => {
        const value = data && typeof data[id] === 'string' ? data[id].trim() : '';
        if (!value) {
            links[id] = '';
            return;
        }
        try {
            const url = new URL(value);
            const host = url.hostname.replace(/^www\./i, '').toLowerCase();
            const isGenericPlaceholder = host === placeholderHost && url.pathname === '/' && !url.search && !url.hash;
            links[id] = (url.protocol === 'https:' || url.protocol === 'http:') && !isGenericPlaceholder ? url.href : '';
        } catch {
            links[id] = '';
        }
    });
    return links;
}

// ESTADO GLOBAL
let currentUser = JSON.parse(localStorage.getItem('basados_user')) || null;
let favorites = JSON.parse(localStorage.getItem('basados_favs')) || [];
let loadedGames = [];
let loadedGenres = [];
let loadedNews = [];
let loadedReports = [];
let loadedRequests = [];
let loadedSocialLinks = cleanSocialLinks({});
let loadedFooterContent = {
    credits: "Creado por VAZE · Colaboran ENFURT, ENDFURT y ESVA",
    tagline: "Comunidad hecha para jugar.",
    eyebrow: "LOS BASADOS · COMUNIDAD",
    title: "La partida continúa aquí.",
    description: "Sigue las novedades y encuentra a la comunidad también fuera del juego."
};
let loadedAds = [];
let currentOnlineList = [];
let loadedScreenshots = {};
let loadedFriendsData = {};
let loadedRegisteredUsers = {}; // Cache global de usuarios para renderizado de avatares de amigos
let loadedUserNotifications = [];
let activeProfileViewName = "";
let activePrivateChatPartner = null;
let privateChatListener = null;
const privateNotificationListeners = new Map();
let myUserRef = null;
let currentDeviceInfo = { type: 'pc', os: 'windows' };

let selectedRating = 5;
let currentActiveGameCommentsRef = null;
let activeCommentMenu = null;
let profilePreviewObjectUrl = "";

document.addEventListener('click', (event) => {
    if (activeCommentMenu && !activeCommentMenu.parentElement.contains(event.target)) {
        activeCommentMenu.classList.remove('active');
        activeCommentMenu = null;
    }
});

let carouselIndex = 0;
let carouselTimer = null;

const MODERATOR_EMAILS = [
    "esva@losbasados.com",
    "jesuslazarinos0@gmail.com",
    "cargoso@gmail.com"
];

// ELEMENTOS DOM
const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const btnAuth = document.getElementById('btnAuth');
const userBtnText = document.getElementById('userBtnText');
const userAvatarNav = document.getElementById('userAvatarNav');
const btnAdminPanel = document.getElementById('btnAdminPanel');

// DETECTOR DE DISPOSITIVOS
function detectDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const width = window.innerWidth;
    
    let type = 'pc';
    let os = 'unknown';
    let iconClass = 'fa-desktop';
    let textLabel = 'PC / Windows';
    const isConsole = /(PlayStation|Nintendo Switch|Xbox)/i.test(ua);
    const isTelevision = /(SmartTV|Smart-TV|Tizen|webOS|GoogleTV|Android TV|HbbTV|Roku)/i.test(ua);

    if (/android/i.test(ua)) os = 'android';
    else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) os = 'ios';
    else if (/Win/i.test(ua)) os = 'windows';
    else if (/Mac/i.test(ua)) os = 'mac';
    else if (/Linux/i.test(ua)) os = 'linux';

    const isTabletUA = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);
    
    if (isConsole) {
        type = 'console';
        iconClass = 'fa-gamepad';
        textLabel = /PlayStation/i.test(ua) ? 'PlayStation' : /Nintendo/i.test(ua) ? 'Nintendo' : 'Xbox';
    } else if (isTelevision) {
        type = 'tv';
        iconClass = 'fa-tv';
        textLabel = 'Smart TV';
    } else if (isTabletUA || (width >= 600 && width <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))) {
        type = 'tablet';
        iconClass = 'fa-tablet-alt';
        textLabel = os === 'android' ? 'Tablet Android' : (os === 'ios' ? 'iPad OS' : 'Tablet');
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua) || width < 600) {
        type = 'mobile';
        iconClass = 'fa-mobile-alt';
        textLabel = os === 'android' ? 'Android Mobile' : (os === 'ios' ? 'iPhone / iOS' : 'Smartphone');
    } else {
        type = 'pc';
        iconClass = 'fa-desktop';
        textLabel = os === 'windows' ? 'PC Windows' : 'Escritorio';
    }

    currentDeviceInfo = { type, os, label: textLabel, icon: iconClass };

    document.body.classList.remove('device-pc', 'device-mobile', 'device-tablet', 'device-console', 'device-tv', 'os-android', 'os-ios');
    document.body.classList.add(`device-${type}`, `os-${os}`);

    const deviceBadge = document.getElementById('deviceBadge');
    const deviceIcon = document.getElementById('deviceIcon');
    const deviceText = document.getElementById('deviceText');

    if (deviceBadge && deviceIcon && deviceText) {
        deviceIcon.className = `fas ${iconClass}`;
        deviceText.textContent = textLabel;
    }
}

// FORMATO DE GÉNEROS
function formatGameGenres(category) {
    if (!category) return "General";
    
    let genresArr = [];
    if (Array.isArray(category)) {
        genresArr = category;
    } else if (typeof category === 'string') {
        genresArr = category.split(',').map(s => s.trim());
    }

    if (genresArr.length === 0) return "General";
    if (genresArr.length === 1) return genresArr[0];
    if (genresArr.length === 2) return `${genresArr[0]}, ${genresArr[1]}`;
    return `${genresArr[0]}, ${genresArr[1]}, más...`;
}

// CALCULAR EDAD
function calculateAgeInfo(birthdateString) {
    if (!birthdateString) return { age: 0, isAdult: false, label: "Edad no registrada" };
    
    const birthDate = new Date(birthdateString);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    const isAdult = age >= 18;
    return {
        age: age,
        isAdult: isAdult,
        label: isAdult ? `Mayor de edad (${age} años)` : `Menor de edad (${age} años)`
    };
}

document.addEventListener('DOMContentLoaded', () => {
    detectDevice();
    window.addEventListener('resize', detectDevice);
    updateUserUI();
    setupEventListeners();
    setupChatInteractiveControls();
    setupPrivateChatInteractiveControls();
    initRealtimeFirebase();
    updateTwitchEmbedParentDomain();
    setupFilterToggle();
    setupAudioToggle();

    document.addEventListener('click', (e) => {
        if (e.target.closest('button, .cat-btn, .game-card, .social-btn')) {
            playClickSound();
        }
    });
});

// REPRODUCTOR AUDIO
function setupAudioToggle() {
    const btnAudio = document.getElementById('btnToggleAudio');
    if (!btnAudio) return;

    btnAudio.addEventListener('click', () => {
        if (isAudioPlaying) {
            bgAudio.pause();
            btnAudio.classList.remove('playing');
            isAudioPlaying = false;
        } else {
            if (!bgAudio.src) bgAudio.src = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';
            bgAudio.play().then(() => {
                btnAudio.classList.add('playing');
                isAudioPlaying = true;
            }).catch(() => {});
        }
    });
}

// EMBED TWITCH DOMINIO
function updateTwitchEmbedParentDomain() {
    const twitchIframe = document.querySelector('.twitch-player-container iframe');
    if (twitchIframe) {
        const currentHost = window.location.hostname || 'localhost';
        twitchIframe.src = `https://player.twitch.tv/?channel=vaze_z06&parent=${currentHost}&parent=localhost&parent=127.0.0.1&muted=true`;
    }
}

// MENÚ DESPLEGABLE DE CHAT GENERAL (+)
function setupChatInteractiveControls() {
    const moreBtn = document.getElementById('chatMoreBtn');
    const moreMenu = document.getElementById('chatMoreMenu');
    const imageInput = document.getElementById('chatImageInput');

    const emojiPopover = document.getElementById('emojiPopover');
    const giphyPopover = document.getElementById('giphyPopover');

    if (!moreBtn || !moreMenu) return;

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenu.classList.toggle('active');
        moreBtn.classList.toggle('active');
        emojiPopover.classList.add('hidden');
        giphyPopover.classList.add('hidden');
    });

    document.addEventListener('click', () => {
        moreMenu.classList.remove('active');
        moreBtn.classList.remove('active');
    });

    document.getElementById('btnMenuImage').addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) uploadAndSendMedia(file, messagesRef);
        imageInput.value = '';
    });

    document.getElementById('btnMenuEmoji').addEventListener('click', () => {
        moreMenu.classList.remove('active');
        emojiPopover.classList.remove('hidden');
        renderEmojiCategory('smileys', 'emojiGrid', 'chatInput');
    });

    document.getElementById('closeEmojiPopover').addEventListener('click', () => {
        emojiPopover.classList.add('hidden');
    });

    document.getElementById('emojiCategories').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('#emojiCategories button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderEmojiCategory(e.target.dataset.cat, 'emojiGrid', 'chatInput');
        }
    });

    document.getElementById('btnMenuGiphy').addEventListener('click', () => {
        moreMenu.classList.remove('active');
        giphyPopover.classList.remove('hidden');
        fetchGiphyGifs('trending', 'giphyResultsGrid', (gifUrl) => {
            messagesRef.push({
                author: currentUser ? currentUser.name : "Invitado Basado",
                avatar: currentUser ? currentUser.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
                text: gifUrl,
                timestamp: Date.now()
            });
            giphyPopover.classList.add('hidden');
        });
    });

    document.getElementById('closeGiphyPopover').addEventListener('click', () => {
        giphyPopover.classList.add('hidden');
    });

    let giphyTimer;
    document.getElementById('giphySearchInput').addEventListener('input', (e) => {
        clearTimeout(giphyTimer);
        const query = e.target.value.trim();
        giphyTimer = setTimeout(() => {
            fetchGiphyGifs(query || 'trending', 'giphyResultsGrid', (gifUrl) => {
                messagesRef.push({
                    author: currentUser ? currentUser.name : "Invitado Basado",
                    avatar: currentUser ? currentUser.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
                    text: gifUrl,
                    timestamp: Date.now()
                });
                giphyPopover.classList.add('hidden');
            });
        }, 400);
    });
}

// CONTROLES INTERACTIVOS EN CHAT PRIVADO (DM) (+)
function setupPrivateChatInteractiveControls() {
    const moreBtn = document.getElementById('privateChatMoreBtn');
    const moreMenu = document.getElementById('privateChatMoreMenu');
    const imageInput = document.getElementById('privateChatImageInput');
    const emojiPopover = document.getElementById('privateEmojiPopover');
    const giphyPopover = document.getElementById('privateGiphyPopover');

    if (!moreBtn || !moreMenu) return;

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenu.classList.toggle('active');
        moreBtn.classList.toggle('active');
        emojiPopover.classList.add('hidden');
        giphyPopover.classList.add('hidden');
    });

    document.getElementById('btnPrivateMenuImage').addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentUser && activePrivateChatPartner) {
            const chatId = [currentUser.name, activePrivateChatPartner].sort().join('_CHAT_');
            uploadAndSendMedia(file, privateChatRef.child(chatId), true);
        }
        imageInput.value = '';
    });

    document.getElementById('btnPrivateMenuEmoji').addEventListener('click', () => {
        moreMenu.classList.remove('active');
        emojiPopover.classList.remove('hidden');
        renderEmojiCategory('smileys', 'privateEmojiGrid', 'privateChatInput');
    });

    document.getElementById('closePrivateEmojiPopover').addEventListener('click', () => {
        emojiPopover.classList.add('hidden');
    });

    document.getElementById('privateEmojiCategories').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('#privateEmojiCategories button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderEmojiCategory(e.target.dataset.cat, 'privateEmojiGrid', 'privateChatInput');
        }
    });

    document.getElementById('btnPrivateMenuGiphy').addEventListener('click', () => {
        moreMenu.classList.remove('active');
        giphyPopover.classList.remove('hidden');
        fetchGiphyGifs('trending', 'privateGiphyResultsGrid', (gifUrl) => {
            if (currentUser && activePrivateChatPartner) {
                const chatId = [currentUser.name, activePrivateChatPartner].sort().join('_CHAT_');
                privateChatRef.child(chatId).push({
                    sender: currentUser.name,
                    text: gifUrl,
                    timestamp: Date.now()
                });
            }
            giphyPopover.classList.add('hidden');
        });
    });

    document.getElementById('closePrivateGiphyPopover').addEventListener('click', () => {
        giphyPopover.classList.add('hidden');
    });

    let giphyTimer;
    document.getElementById('privateGiphySearchInput').addEventListener('input', (e) => {
        clearTimeout(giphyTimer);
        const query = e.target.value.trim();
        giphyTimer = setTimeout(() => {
            fetchGiphyGifs(query || 'trending', 'privateGiphyResultsGrid', (gifUrl) => {
                if (currentUser && activePrivateChatPartner) {
                    const chatId = [currentUser.name, activePrivateChatPartner].sort().join('_CHAT_');
                    privateChatRef.child(chatId).push({
                        sender: currentUser.name,
                        text: gifUrl,
                        timestamp: Date.now()
                    });
                }
                giphyPopover.classList.add('hidden');
            });
        }, 400);
    });
}

function renderEmojiCategory(cat, gridId, inputId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    const emojis = EMOJI_DATA[cat] || [];
    emojis.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.addEventListener('click', () => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value += emoji;
                input.focus();
            }
        });
        grid.appendChild(span);
    });
}

// BÚSQUEDA ROBUSTA DE GIPHY CON FALLBACK DE RESPUESTA
function fetchGiphyGifs(query, targetGridId, onSelectCallback) {
    const grid = document.getElementById(targetGridId);
    if (!grid) return;
    grid.innerHTML = '<p style="color:#aaa; font-size:0.8rem; grid-column:1/-1;">Cargando GIFs...</p>';

    const isSearch = query && query !== 'trending';
    const endpoint = isSearch ? 'search' : 'trending';
    const queryParam = isSearch ? `&q=${encodeURIComponent(query)}` : '';
    const url = `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${GIPHY_API_KEY}&limit=16${queryParam}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            grid.innerHTML = '';
            if (data && data.data && data.data.length > 0) {
                data.data.forEach(gif => {
                    const gifUrl = gif.images && gif.images.fixed_height ? gif.images.fixed_height.url : gif.images.original.url;
                    const img = document.createElement('img');
                    img.src = gifUrl;
                    img.addEventListener('click', () => {
                        if (onSelectCallback) onSelectCallback(gifUrl);
                    });
                    grid.appendChild(img);
                });
            } else {
                grid.innerHTML = '<p style="color:#aaa; font-size:0.8rem; grid-column:1/-1;">No se encontraron GIFs.</p>';
            }
        })
        .catch(err => {
            console.warn("Giphy API Key principal falló, intentando respaldo...", err);
            // Fallback con GIFs Populares Estáticos / Públicos si falla la API
            grid.innerHTML = '';
            const fallbackGifs = [
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3E1azNnYnR5dTRiNzIxbTFtdjVpZzRqNDJ3MjdvYndud3c1cjZtOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1Q87I1i8xM1m/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzRvbG5tZ3Y1eGgyZHJscTZmNG9ycnEzaTR3N3A4OGdqejRpd3dveCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ju7l5y9osyymQ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTV6cm41eXF5MGlwZGVydnA2OHBnNHRiaHF0ZXkxdnV0c3V4NG1meCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d48u3oS7PqC0245S/giphy.gif"
            ];
            fallbackGifs.forEach(gifUrl => {
                const img = document.createElement('img');
                img.src = gifUrl;
                img.addEventListener('click', () => {
                    if (onSelectCallback) onSelectCallback(gifUrl);
                });
                grid.appendChild(img);
            });
        });
}

function compressImageToWebp(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 10 * 1024 * 1024) {
            reject(new Error("La imagen seleccionada supera el límite de 10 MB."));
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const context = canvas.getContext('2d');
            if (!context) {
                image.onload = null;
                image.onerror = null;
                image.src = '';
                canvas.width = 0;
                canvas.height = 0;
                URL.revokeObjectURL(objectUrl);
                reject(new Error("No se pudo procesar la imagen en este navegador."));
                return;
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            image.onload = null;
            image.onerror = null;
            image.src = '';
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(objectUrl);
                canvas.width = 0;
                canvas.height = 0;
                if (blob) resolve(blob);
                else reject(new Error("No se pudo convertir la imagen a WebP."));
            }, 'image/webp', 0.78);
        };
        image.onerror = () => {
            image.onload = null;
            image.onerror = null;
            image.src = '';
            URL.revokeObjectURL(objectUrl);
            reject(new Error("No se pudo abrir la imagen seleccionada."));
        };
        image.src = objectUrl;
    });
}

function validateVideoDuration(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const objectUrl = URL.createObjectURL(file);
        let timeout = 0;
        const finish = (error) => {
            window.clearTimeout(timeout);
            video.onloadedmetadata = null;
            video.onerror = null;
            video.removeAttribute('src');
            video.load();
            URL.revokeObjectURL(objectUrl);
            if (error) reject(error);
            else resolve();
        };
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            if (!Number.isFinite(video.duration) || video.duration > 30) {
                finish(new Error("El video debe durar 30 segundos o menos."));
                return;
            }
            finish();
        };
        video.onerror = () => finish(new Error("Este navegador no puede procesar ese video. Usa MP4 o WebM."));
        timeout = window.setTimeout(() => finish(new Error("Se agotó el tiempo al comprobar el video.")), 10000);
        video.src = objectUrl;
    });
}

function validateVideoUrlDuration(url) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        let timeout = 0;
        const finish = (error) => {
            window.clearTimeout(timeout);
            video.onloadedmetadata = null;
            video.onerror = null;
            video.removeAttribute('src');
            video.load();
            if (error) reject(error);
            else resolve();
        };
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            if (!Number.isFinite(video.duration) || video.duration > 30) {
                finish(new Error("El video debe durar 30 segundos o menos."));
                return;
            }
            finish();
        };
        video.onerror = () => finish(new Error("No se pudo comprobar la duración del video remoto."));
        timeout = window.setTimeout(() => finish(new Error("Se agotó el tiempo al comprobar el video remoto.")), 10000);
        video.src = url;
    });
}

async function uploadMediaFile(file, folder) {
    const isImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) throw new Error("Selecciona una imagen o un video compatible.");
    if (file.size > 8 * 1024 * 1024) {
        throw new Error("El archivo supera el límite de 8 MB. Reduce su tamaño antes de subirlo.");
    }
    if (isVideo && !['video/mp4', 'video/webm'].includes(file.type)) {
        throw new Error("Formato no compatible. Usa MP4 o WebM.");
    }
    if (isVideo) await validateVideoDuration(file);

    const user = auth.currentUser;
    if (!user || !user.emailVerified) throw new Error("Inicia sesión con un correo verificado para subir archivos.");
    const apiUrl = window.__LOS_BASADOS_MEDIA_API__;
    if (!apiUrl) throw new Error("El servicio seguro de archivos no está configurado (VITE_MEDIA_API_URL).");

    const canConvertToWebp = file.type === 'image/jpeg' || file.type === 'image/png';
    const optimizedBlob = canConvertToWebp ? await compressImageToWebp(file) : file;
    const useWebp = canConvertToWebp && optimizedBlob.type === 'image/webp' && optimizedBlob.size < file.size;
    const blob = useWebp ? optimizedBlob : file;
    const token = await user.getIdToken();
    const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/api/media`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': useWebp ? 'image/webp' : file.type,
            'X-Media-Scope': folder
        },
        body: blob
    });
    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `El servicio de archivos respondió ${response.status}.`);
    }
    const result = await response.json();
    return { url: result.url, type: isImage ? 'image' : 'video' };
}

function uploadAndSendMedia(file, targetFirebaseRef, isDM = false, rating = null, scope = isDM ? 'private' : 'chat') {
    uploadMediaFile(file, scope)
        .then(({ url, type }) => {
            const message = isDM
                ? { sender: currentUser ? currentUser.name : "Invitado", text: '', mediaUrl: url, mediaType: type, timestamp: Date.now() }
                : { author: currentUser ? currentUser.name : "Invitado Basado", avatar: currentUser ? currentUser.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=Guest", text: '', mediaUrl: url, mediaType: type, timestamp: Date.now(), ...(rating ? { rating } : {}) };
            targetFirebaseRef.push(message, (error) => {
                if (error) {
                    console.error("No se pudo guardar el mensaje multimedia en Realtime Database", error);
                    alert(`El archivo se subió, pero no se pudo publicar el mensaje: ${error.message}`);
                }
            });
        })
        .catch((error) => {
            console.error("No se pudo subir la multimedia", error);
            alert(`No se pudo subir la multimedia: ${error.message}`);
        });
}

function renderStoredMedia(mediaUrl, mediaType) {
    if (!mediaUrl) return '';
    const url = escapeGameHTML(mediaUrl);
    if (mediaType === 'video') {
        return `<br><video class="chat-msg-video" controls playsinline preload="none"><source src="${url}"></video>`;
    }
    return `<br><img src="${url}" class="chat-msg-img" loading="lazy" decoding="async" alt="Multimedia compartida" onclick="openImageModal('${url}')" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">`;
}

// FIREBASE EN TIEMPO REAL
function initRealtimeFirebase() {
    // Sincronización continua de usuarios para avatares en lista de amigos
    usersRef.on('value', (snapshot) => {
        loadedRegisteredUsers = snapshot.val() || {};
        publishLosBasadosState('registeredUsers', loadedRegisteredUsers);
        if (activeProfileViewName) {
            renderFriendsList(activeProfileViewName);
        }
    });

    // 1. Juegos
    gamesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const previousCount = loadedGames.length;
            loadedGames = Object.values(data);
            if (previousCount > 0 && loadedGames.length > previousCount) {
                pushNotification('game', '🎮 ¡Nuevo juego disponible!', 'Se ha añadido un nuevo juego al catálogo.');
            }
        } else {
            defaultGames.forEach(g => gamesRef.child(g.id).set(g));
            loadedGames = defaultGames;
        }
        applySorting();
        renderHeroCarousel(loadedGames);
        renderAdminGamesList();
        populateAdminAdGameOptions();
        renderAdminAdsList();
        publishLosBasadosState('games', loadedGames);
    });

    // 2. Categorías
    genresRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            loadedGenres = Object.values(data);
        } else {
            defaultGenres.forEach(g => genresRef.child(g).set({ name: g }));
            loadedGenres = defaultGenres.map(g => ({ name: g }));
        }
        renderCategoriesBar();
        renderAdminGenres();
        populateFilterDropdowns();
        publishLosBasadosState('genres', loadedGenres.map(g => g.name));
    });

    // 3. Noticias
    newsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            loadedNews = Object.values(data);
        } else {
            defaultNews.forEach(n => newsRef.child(n.id).set(n));
            loadedNews = defaultNews;
        }
        renderNews();
        renderAdminNews();
        publishLosBasadosState('news', loadedNews);
    });

    // 4. Redes Sociales
    socialRef.on('value', (snapshot) => {
        loadedSocialLinks = cleanSocialLinks(snapshot.val());
        renderCommunitySocialGrid();
        populateAdminSocialForm();
        publishLosBasadosState('social', loadedSocialLinks);
    });

    footerRef.on('value', (snapshot) => {
        loadedFooterContent = { ...loadedFooterContent, ...(snapshot.val() || {}) };
        populateAdminFooterForm();
        publishLosBasadosState('footer', loadedFooterContent);
    });

    adsRef.on('value', (snapshot) => {
        loadedAds = Object.values(snapshot.val() || {});
        renderAdminAdsList();
        publishLosBasadosState('ads', loadedAds);
    });

    // 5. Capturas de Pantalla
    userScreenshotsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        loadedScreenshots = data || {};
        if (activeProfileViewName) {
            renderUserScreenshots(activeProfileViewName);
        }
    });

    // 6. Amigos
    friendsRef.on('value', (snapshot) => {
        loadedFriendsData = snapshot.val() || {};
        publishLosBasadosState('friends', loadedFriendsData);
        if (activeProfileViewName) {
            renderFriendsList(activeProfileViewName);
        }
    });

    // 7. Reportes de Enlaces
    reportsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        loadedReports = data ? Object.values(data) : [];
        const badge = document.getElementById('reportsBadgeCount');
        if (badge) badge.textContent = loadedReports.length;
        renderAdminReports();
    });

    // 8. Peticiones de Juegos
    requestsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        loadedRequests = data ? Object.values(data) : [];
        renderGameRequests();
    });

    // 9. Chat General
    messagesRef.limitToLast(50).on('value', (snapshot) => {
        const data = snapshot.val();
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        if (data) {
            Object.values(data).forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-msg';

                const mediaPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?|https?:\/\/cdn\.discordapp\.com\/attachments\/[^\s]+|https?:\/\/media\.giphy\.com\/[^\s]+|data:image\/[a-zA-Z]+;base64,[^\s]+)/i;
                let formattedText = msg.text || '';

                if (mediaPattern.test(formattedText)) {
                    formattedText = formattedText.replace(mediaPattern, (url) => {
                        return `<br><img src="${url}" class="chat-msg-img" loading="lazy" decoding="async" onclick="openImageModal('${url}')" title="Ampliar media" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">`;
                    });
                }
                formattedText += renderStoredMedia(msg.mediaUrl, msg.mediaType);

                msgDiv.innerHTML = `
                    <img src="${msg.avatar}" alt="${msg.author}" loading="lazy" decoding="async" onclick="openPublicProfile('${msg.author}', '${msg.avatar}')" onerror="this.onerror=null;this.src='https://api.dicebear.com/7.x/bottts/svg?seed=Guest';">
                    <div class="chat-msg-content">
                        <span class="chat-author" onclick="openPublicProfile('${msg.author}', '${msg.avatar}')">${msg.author}</span>
                        <p class="chat-text">${formattedText}</p>
                    </div>
                `;
                chatMessages.appendChild(msgDiv);
            });
            setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 50);
        }
    });

    // 10. Escuchar Mensajes Privados Entrantes para Notificaciones
    privateChatRef.on('child_added', (snapshot) => {
        const chatId = snapshot.key;
        if (currentUser && chatId.includes(currentUser.name) && !privateNotificationListeners.has(chatId)) {
            const listener = snapshot.ref.limitToLast(1);
            listener.on('child_added', (msgSnap) => {
                const msg = msgSnap.val();
                if (msg && msg.sender !== currentUser.name) {
                    pushNotification('dm', `💬 Mensaje de ${msg.sender}`, msg.mediaUrl ? '[Multimedia enviada]' : (msg.text || ''), msg.sender);
                }
            });
            privateNotificationListeners.set(chatId, listener);
            if (privateNotificationListeners.size > 25) {
                const oldestChatId = privateNotificationListeners.keys().next().value;
                privateNotificationListeners.get(oldestChatId).off('child_added');
                privateNotificationListeners.delete(oldestChatId);
            }
        }
    });

    // 11. Presencia en Vivo
    myUserRef = onlineUsersRef.push();
    myUserRef.onDisconnect().remove();
    updateFirebasePresence();

    onlineUsersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        currentOnlineList = data ? Object.values(data) : [];
        const total = currentOnlineList.length;
        const headerOnlineCount = document.getElementById('onlineCount');
        const communityOnlineCount = document.getElementById('onlineCountModal');
        if (headerOnlineCount) headerOnlineCount.textContent = total;
        if (communityOnlineCount) communityOnlineCount.textContent = total;
        publishLosBasadosState('online', total);
        publishLosBasadosState('onlineUsers', currentOnlineList);
        renderOnlineUsersSidebar();
        if (activeProfileViewName) {
            renderFriendsList(activeProfileViewName);
        }
    });
}

// SISTEMA DE NOTIFICACIONES Y ALERTAS
function pushNotification(type, title, text, senderName = '') {
    const notifObj = {
        id: 'notif-' + Date.now(),
        type,
        title,
        text,
        senderName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    loadedUserNotifications.unshift(notifObj);

    const badge = document.getElementById('notifBadgeCount');
    if (badge) {
        badge.textContent = loadedUserNotifications.length;
        badge.classList.remove('hidden');
    }
    renderNotificationsFeed();
}

function renderNotificationsFeed() {
    const container = document.getElementById('notifFeedContainer');
    if (!container) return;

    if (loadedUserNotifications.length === 0) {
        container.innerHTML = '<p style="color:#aaa; font-size:0.85rem; text-align:center;">No tienes notificaciones pendientes.</p>';
        return;
    }

    container.innerHTML = loadedUserNotifications.map(n => `
        <div class="notif-item-card" onclick="handleNotificationClick('${n.type}', '${n.senderName}')">
            <i class="fas ${n.type === 'dm' ? 'fa-comment-alt' : 'fa-gamepad'}"></i>
            <div>
                <strong style="color:#fff; font-size:0.85rem;">${n.title}</strong>
                <p style="color:#aaa; font-size:0.8rem; margin:2px 0;">${n.text}</p>
                <small style="color:var(--neon-red); font-size:0.7rem;">${n.time}</small>
            </div>
        </div>
    `).join('');
}

window.handleNotificationClick = function(type, senderName) {
    document.getElementById('notifModal').classList.remove('active');
    if (type === 'dm' && senderName) {
        openPrivateChatWith(senderName);
    }
};

function renderCommunitySocialGrid() {
    const grid = document.getElementById('communitySocialGrid');
    if (!grid) return;
    grid.replaceChildren(...socialNetworks.flatMap(({ id, label, icon, className }) => {
        const href = loadedSocialLinks[id];
        if (!href) return [];
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = `social-btn ${className}`;
        const iconElement = document.createElement('i');
        iconElement.className = `fab ${icon}`;
        link.append(iconElement, document.createTextNode(` ${label}`));
        return [link];
    }));
}

function populateAdminSocialForm() {
    document.getElementById('adminLinkDiscord').value = loadedSocialLinks.discord || '';
    document.getElementById('adminLinkTelegram').value = loadedSocialLinks.telegram || '';
    document.getElementById('adminLinkYoutube').value = loadedSocialLinks.youtube || '';
    document.getElementById('adminLinkInstagram').value = loadedSocialLinks.instagram || '';
    document.getElementById('adminLinkTiktok').value = loadedSocialLinks.tiktok || '';
    document.getElementById('adminLinkFacebook').value = loadedSocialLinks.facebook || '';
}

function populateAdminFooterForm() {
    document.getElementById('adminFooterCredits').value = loadedFooterContent.credits;
    document.getElementById('adminFooterTagline').value = loadedFooterContent.tagline;
    document.getElementById('adminFooterEyebrow').value = loadedFooterContent.eyebrow;
    document.getElementById('adminFooterTitle').value = loadedFooterContent.title;
    document.getElementById('adminFooterDescription').value = loadedFooterContent.description;
}

document.getElementById('formAdminSocial').addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedSocial = {
        discord: document.getElementById('adminLinkDiscord').value.trim(),
        telegram: document.getElementById('adminLinkTelegram').value.trim(),
        youtube: document.getElementById('adminLinkYoutube').value.trim(),
        instagram: document.getElementById('adminLinkInstagram').value.trim(),
        tiktok: document.getElementById('adminLinkTiktok').value.trim(),
        facebook: document.getElementById('adminLinkFacebook').value.trim()
    };

    socialRef.set(updatedSocial, (err) => {
        if (err) {
            alert(`No se pudieron guardar las redes sociales: ${err.message}`);
            return;
        }
        alert("✅ Redes sociales actualizadas en tiempo real.");
    });
});

document.getElementById('formAdminFooter').addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedFooter = {
        credits: document.getElementById('adminFooterCredits').value.trim(),
        tagline: document.getElementById('adminFooterTagline').value.trim(),
        eyebrow: document.getElementById('adminFooterEyebrow').value.trim(),
        title: document.getElementById('adminFooterTitle').value.trim(),
        description: document.getElementById('adminFooterDescription').value.trim()
    };
    footerRef.set(updatedFooter, (error) => {
        if (error) {
            alert(`No se pudo guardar el pie de página: ${error.message}`);
            return;
        }
        alert("✅ Pie de página actualizado.");
    });
});

// PERFIL PÚBLICO & SISTEMA DE RED SOCIAL / AMIGOS CON ESTADO EN LÍNEA
window.openPublicProfile = function(name, avatar) {
    activeProfileViewName = name;
    document.getElementById('publicName').textContent = name;
    document.getElementById('publicAvatarImg').src = avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest';

    const postBox = document.getElementById('postScreenshotBox');
    const btnEdit = document.getElementById('btnEditProfileSettings');
    const btnAdd = document.getElementById('btnAddFriend');
    const btnDM = document.getElementById('btnOpenPrivateChat');

    if (currentUser && currentUser.name === name) {
        postBox.classList.remove('hidden');
        btnEdit.classList.remove('hidden');
        btnAdd.classList.add('hidden');
        btnDM.classList.add('hidden');
    } else {
        postBox.classList.add('hidden');
        btnEdit.classList.add('hidden');
        if (currentUser) {
            btnAdd.classList.remove('hidden');
            btnDM.classList.remove('hidden');
            
            const isFriend = loadedFriendsData[currentUser.name] && loadedFriendsData[currentUser.name][name];
            btnAdd.innerHTML = isFriend ? '<i class="fas fa-user-check"></i> Amigos' : '<i class="fas fa-user-plus"></i> Añadir Amigo';
        } else {
            btnAdd.classList.add('hidden');
            btnDM.classList.add('hidden');
        }
    }

    switchSocialProfileTab('screenshots');
    renderUserScreenshots(name);
    renderFriendsList(name);
    document.getElementById('publicProfileModal').classList.add('active');
};

window.toggleAddFriend = function() {
    if (!currentUser || !activeProfileViewName) return;
    const isFriend = loadedFriendsData[currentUser.name] && loadedFriendsData[currentUser.name][activeProfileViewName];

    if (isFriend) {
        friendsRef.child(currentUser.name).child(activeProfileViewName).remove();
        friendsRef.child(activeProfileViewName).child(currentUser.name).remove();
    } else {
        friendsRef.child(currentUser.name).child(activeProfileViewName).set({ name: activeProfileViewName, timestamp: Date.now() });
        friendsRef.child(activeProfileViewName).child(currentUser.name).set({ name: currentUser.name, timestamp: Date.now() });
    }
};

window.switchSocialProfileTab = function(tab) {
    const btnShots = document.getElementById('btnTabScreenshots');
    const btnFriends = document.getElementById('btnTabFriends');
    const contentShots = document.getElementById('socialScreenshotsContent');
    const contentFriends = document.getElementById('socialFriendsContent');

    if (!btnShots || !btnFriends || !contentShots || !contentFriends) return;
    if (tab === 'screenshots') {
        btnShots.classList.add('active'); btnFriends.classList.remove('active');
        contentShots.classList.add('active'); contentFriends.classList.remove('active');
        contentShots.classList.remove('hidden'); contentFriends.classList.add('hidden');
    } else {
        btnFriends.classList.add('active'); btnShots.classList.remove('active');
        contentFriends.classList.add('active'); contentShots.classList.remove('active');
        contentFriends.classList.remove('hidden'); contentShots.classList.add('hidden');
    }
};

function renderUserScreenshots(username) {
    const feed = document.getElementById('screenshotsFeedGrid');
    if (!feed) return;

    const userShots = loadedScreenshots[username] ? Object.values(loadedScreenshots[username]) : [];

    if (userShots.length === 0) {
        feed.innerHTML = '<p style="color:#aaa; font-size:0.85rem; grid-column:1/-1;">Aún no ha subido publicaciones.</p>';
        return;
    }

    feed.innerHTML = userShots.reverse().map(s => `
        <div class="shot-card-item">
            <div class="shot-card-info">
                <strong>${s.title}</strong>
            </div>
            ${s.imageUrl ? `<img src="${s.imageUrl}" loading="lazy" decoding="async" onclick="openImageModal('${s.imageUrl}')" title="Ampliar captura">` : ''}
        </div>
    `).join('');
}

// RENDERIZADO DE AMIGOS CORREGIDO Y CONECTADO A BASE DE DATOS
function renderFriendsList(username) {
    const container = document.getElementById('friendsListContainer');
    const countBadge = document.getElementById('profileFriendsCount');
    if (!container) return;

    const rawFriends = loadedFriendsData[username] || {};
    const userFriends = Object.entries(rawFriends).map(([key, value]) => {
        const record = value && typeof value === 'object' ? value : {};
        return { name: (record.name || (typeof value === 'string' ? value : key)).toString(), avatar: record.avatar || '' };
    }).filter((friend, index, all) => friend.name && all.findIndex(item => item.name.toLocaleLowerCase() === friend.name.toLocaleLowerCase()) === index);
    if (countBadge) countBadge.textContent = userFriends.length;
    container.replaceChildren();

    if (userFriends.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'friends-empty-state';
        empty.textContent = 'Todav?a no hay amigos a?adidos.';
        container.appendChild(empty);
        return;
    }

    const onlineUserNames = new Set(currentOnlineList.map(user => (user.name || '').toLocaleLowerCase()));
    userFriends.forEach(({ name, avatar }) => {
        const registered = Object.values(loadedRegisteredUsers || {}).find(user => (user.name || '').toLocaleLowerCase() === name.toLocaleLowerCase());
        const onlineUser = currentOnlineList.find(user => (user.name || '').toLocaleLowerCase() === name.toLocaleLowerCase());
        const isOnline = onlineUserNames.has(name.toLocaleLowerCase());
        const avatarUrl = avatar || registered?.avatar || onlineUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
        const row = document.createElement('div');
        row.className = 'friend-item-row';
        const profile = document.createElement('button');
        profile.type = 'button';
        profile.className = 'friend-profile-link';
        profile.addEventListener('click', () => window.openPublicProfile(name, avatarUrl));
        const image = document.createElement('img');
        image.src = avatarUrl;
        image.alt = '';
        image.onerror = () => { image.onerror = null; image.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`; };
        const details = document.createElement('span');
        details.className = 'friend-profile-meta';
        const label = document.createElement('strong');
        label.textContent = name;
        const status = document.createElement('small');
        status.className = `status-dot-text ${isOnline ? 'online' : 'offline'}`;
        status.textContent = isOnline ? 'En l?nea' : 'Desconectado';
        details.append(label, status);
        profile.append(image, details);
        row.appendChild(profile);
        if (currentUser) {
            const chatButton = document.createElement('button');
            chatButton.type = 'button';
            chatButton.className = 'btn-secondary btn-sm';
            chatButton.textContent = 'Chat';
            chatButton.addEventListener('click', () => window.openPrivateChatWith(name));
            row.appendChild(chatButton);
        }
        container.appendChild(row);
    });
}

// MENSAJES PRIVADOS DMs
window.openPrivateChatFromProfile = function() {
    if (activeProfileViewName) openPrivateChatWith(activeProfileViewName);
};

window.openPrivateChatWith = function(targetName) {
    if (!currentUser) return;
    activePrivateChatPartner = targetName;
    if (!window.location.hash.includes('community')) window.location.hash = '/community';
    document.getElementById('publicProfileModal')?.classList.remove('active');
    document.querySelector('.lb-community-room')?.classList.add('has-private-chat');

    document.getElementById('privateChatTargetName').textContent = targetName;
    
    let partnerAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${targetName}`;
    if (loadedRegisteredUsers) {
        const found = Object.values(loadedRegisteredUsers).find(u => u.name === targetName);
        if (found && found.avatar) partnerAvatar = found.avatar;
    }
    document.getElementById('privateChatTargetAvatar').src = partnerAvatar;

    const chatId = [currentUser.name, targetName].sort().join('_CHAT_');

    if (privateChatListener) privateChatListener.off();
    privateChatListener = privateChatRef.child(chatId);

    privateChatListener.on('value', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('privateChatMessages');
        container.innerHTML = '';

        if (data) {
            Object.values(data).forEach(msg => {
                const isMine = msg.sender === currentUser.name;
                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-msg';
                msgDiv.style.justifyContent = isMine ? 'flex-end' : 'flex-start';

                const mediaPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?|https?:\/\/cdn\.discordapp\.com\/attachments\/[^\s]+|https?:\/\/media\.giphy\.com\/[^\s]+|data:image\/[a-zA-Z]+;base64,[^\s]+)/i;
                let formattedText = msg.text || '';

                if (mediaPattern.test(formattedText)) {
                    formattedText = formattedText.replace(mediaPattern, (url) => {
                        return `<br><img src="${url}" class="chat-msg-img" loading="lazy" decoding="async" onclick="openImageModal('${url}')" title="Ampliar media" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">`;
                    });
                }
                formattedText += renderStoredMedia(msg.mediaUrl, msg.mediaType);

                msgDiv.innerHTML = `
                    <div class="chat-msg-content" style="${isMine ? 'background:#800020; border-color:var(--neon-red);' : ''}">
                        <span class="chat-author" style="color:${isMine ? '#ff4444' : '#00ff80'};">${msg.sender}</span>
                        <p class="chat-text">${formattedText}</p>
                    </div>
                `;
                container.appendChild(msgDiv);
            });
            setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
        }
    });

    document.getElementById('privateChatModal').classList.add('active');
};

document.getElementById('closePrivateChatModal').addEventListener('click', () => {
    document.getElementById('privateChatModal').classList.remove('active');
    document.querySelector('.lb-community-room')?.classList.remove('has-private-chat');
    if (privateChatListener) privateChatListener.off();
});

document.getElementById('formPrivateChat').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || !activePrivateChatPartner) return;

    const input = document.getElementById('privateChatInput');
    const text = input.value.trim();
    if (!text) return;

    const chatId = [currentUser.name, activePrivateChatPartner].sort().join('_CHAT_');
    privateChatRef.child(chatId).push({
        sender: currentUser.name,
        text: text,
        timestamp: Date.now()
    });

    input.value = '';
});

// SUBIR CAPTURA CON COMPRESIÓN EN CANVAS
document.getElementById('formPostScreenshot').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const title = document.getElementById('shotTitle').value.trim();
    const fileInput = document.getElementById('shotFileInput');
    const file = fileInput.files[0];

    const savePost = (imgUrl = '') => {
        userScreenshotsRef.child(currentUser.name).push({
            title: title,
            imageUrl: imgUrl,
            timestamp: Date.now()
        }, (err) => {
            if (!err) {
                alert("📸 Publicación enviada con éxito.");
                document.getElementById('shotTitle').value = '';
                fileInput.value = '';
            }
        });
    };

    if (file) {
        if (file.size > 1024 * 1024) {
            alert("⚠️ La foto no debe superar 1 MB de peso.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxWidth = 1280;
                const maxHeight = 720;

                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                savePost(compressedBase64);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        savePost('');
    }
});

document.getElementById('closePublicProfileModal').addEventListener('click', () => {
    document.getElementById('publicProfileModal').classList.remove('active');
});

// REPORTAR ENLACE CAÍDO
window.reportGameLink = function(gameId, gameTitle) {
    if (confirm(`¿Quieres reportar el enlace de "${gameTitle}" como caído o dañado?`)) {
        reportsRef.push({
            gameId,
            gameTitle,
            reportedBy: currentUser ? currentUser.name : "Invitado",
            timestamp: Date.now()
        }, (err) => {
            if (!err) alert("✅ Gracias. El reporte ha sido enviado a los moderadores.");
        });
    }
};

function renderAdminReports() {
    const container = document.getElementById('adminReportsList');
    if (!container) return;
    if (loadedReports.length === 0) {
        container.innerHTML = '<p style="color:#aaa; font-size:0.85rem;">No hay enlaces caídos reportados actualmente.</p>';
        return;
    }

    container.innerHTML = loadedReports.map(r => `
        <div class="admin-list-item">
            <div>
                <strong style="color:var(--neon-red);">${r.gameTitle}</strong>
                <small style="color:#aaa; display:block;">Reportado por: ${r.reportedBy}</small>
            </div>
            <button class="btn-secondary btn-sm" onclick="openAdminEditModal(event, '${r.gameId}')">🔧 Resolver / Editar</button>
        </div>
    `).join('');
}

// PESTAÑAS DEL MODAL FORO / COMUNIDAD
window.switchForumTab = function(tab) {
    const btnChat = document.getElementById('btnTabChat');
    const btnReq = document.getElementById('btnTabRequests');
    const chatContent = document.getElementById('forumChatContent');
    const reqContent = document.getElementById('forumRequestsContent');

    if (!btnChat || !btnReq || !chatContent || !reqContent) return;
    if (tab === 'chat') {
        btnChat.classList.add('active'); btnReq.classList.remove('active');
        chatContent.classList.remove('hidden'); reqContent.classList.add('hidden');
    } else {
        btnReq.classList.add('active'); btnChat.classList.remove('active');
        reqContent.classList.remove('hidden'); chatContent.classList.add('hidden');
    }
};

// PETICIONES DE JUEGOS
document.getElementById('formGameRequest').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('reqGameTitle').value.trim();
    const platform = document.getElementById('reqPlatform').value;
    if (!title) return;

    requestsRef.push({
        title,
        platform,
        requestedBy: currentUser ? currentUser.name : "Invitado",
        timestamp: Date.now()
    }, (err) => {
        if (!err) {
            document.getElementById('reqGameTitle').value = '';
        }
    });
});

function renderGameRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    if (loadedRequests.length === 0) {
        container.innerHTML = '<p style="color:#aaa; font-size:0.85rem;">No hay peticiones aún. Sé el primero.</p>';
        return;
    }

    container.innerHTML = loadedRequests.map(r => `
        <div class="request-card-item">
            <div>
                <strong>${r.title}</strong>
                <small style="color:#00a2ff; display:block;">[${r.platform}] - Pedido por ${r.requestedBy}</small>
            </div>
            <span style="font-size:0.75rem; color:#888;"><i class="fas fa-clock"></i> Pendiente</span>
        </div>
    `).join('');
}

// ORDENAR JUEGOS
window.applySorting = function() {
    const sortVal = document.getElementById('sortSelect').value;
    let sorted = [...loadedGames];

    if (sortVal === 'downloads') {
        sorted.sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
    } else if (sortVal === 'rating') {
        sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    }

    renderGames(sorted);
};

// CONTADOR DE DESCARGAS
window.trackDownload = function(gameId) {
    const game = loadedGames.find(g => g.id === gameId);
    if (!game) return;
    const newCount = (game.downloadsCount || 0) + 1;
    gamesRef.child(gameId).update({ downloadsCount: newCount });
};

// LIGHTBOX
window.openImageModal = function(url) {
    let lightbox = document.getElementById('imageLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'imageLightbox';
        lightbox.className = 'image-lightbox';
        lightbox.innerHTML = `
            <div class="image-lightbox-content">
                <button class="image-lightbox-close" onclick="closeImageModal()">&times;</button>
                <img id="lightboxImg" src="" alt="Vista previa">
            </div>
        `;
        document.body.appendChild(lightbox);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeImageModal(); });
    }
    document.getElementById('lightboxImg').src = url;
    lightbox.classList.add('active');
};

window.closeImageModal = function() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) lightbox.classList.remove('active');
};

function updateFirebasePresence() {
    if (!myUserRef) return;
    const name = currentUser ? currentUser.name : "Invitado Basado";
    const avatar = currentUser ? currentUser.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=Guest";
    const devType = currentDeviceInfo.type.toUpperCase();
    myUserRef.set({ name, avatar, device: devType });
}

function renderOnlineUsersSidebar() {
    const usersList = document.getElementById('onlineUsersList');
    if (!usersList) return;
    usersList.innerHTML = '';
    currentOnlineList.forEach(u => {
        const li = document.createElement('li');
        const devTag = u.device ? `<small style="font-size:0.7rem; color:#888;">[${u.device}]</small>` : '';
        li.innerHTML = `<img src="${u.avatar}" alt="${u.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://api.dicebear.com/7.x/bottts/svg?seed=Guest';"> <span>${u.name} ${devTag}</span>`;
        li.onclick = () => openPublicProfile(u.name, u.avatar);
        usersList.appendChild(li);
    });
}

// CARRUSEL DESTACADOS
function renderHeroCarousel(games) {
    const featuredGames = games
        .filter(g => g.featured)
        .sort((a, b) => Number(Boolean(a.ageRestricted)) - Number(Boolean(b.ageRestricted))
            || (Number(b.downloadsCount) || 0) - (Number(a.downloadsCount) || 0));
    const container = document.getElementById('heroCarousel');
    
    if (!featuredGames.length) {
        container.innerHTML = `
            <div class="carousel-slide active" style="background-image: url('assets/img/MarioKartWii.png');">
                <div class="hero-content">
                    <span class="badge">DESTACADO DE LA SEMANA</span>
                    <h2>MARIO KART WII (PC PORT)</h2>
                    <p>El clásico de Wii directo en tu PC con gráficos mejorados.</p>
                    <button class="btn-primary" onclick="openGameModal('default-1')"><i class="fas fa-download"></i> VER VERSIONES Y DESCARGAR</button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = featuredGames.map((game, i) => `
        <div class="carousel-slide ${i === 0 ? 'active' : ''}" role="group" aria-roledescription="diapositiva" aria-label="Destacado ${i + 1} de ${featuredGames.length}: ${game.title}" aria-hidden="${i === 0 ? 'false' : 'true'}" style="background-image: url('${game.image}');">
            <div class="hero-content">
                <span class="badge">DESTACADO DE LA SEMANA</span>
                <h2>${game.title.toUpperCase()} ${game.ageRestricted ? '<span class="badge-18-tag">+18</span>' : ''}</h2>
                <p>${game.desc}</p>
                <div class="hero-meta">
                    <span><i class="fas fa-gamepad"></i> ${(Array.isArray(game.category) ? game.category.slice(0, 2) : [game.category]).join(' · ')}</span>
                    <span><i class="fas fa-hard-drive"></i> ${game.size || 'Tamaño disponible en la ficha'}</span>
                    <span><i class="fas fa-fire"></i> ${Number(game.downloadsCount) ? `${Number(game.downloadsCount).toLocaleString('es-PE')} descargas` : 'Disponible ahora'}</span>
                </div>
                <button class="btn-primary" onclick="openGameModal('${game.id}')">
                    <i class="fas fa-download"></i> VER VERSIONES Y DESCARGAR
                </button>
            </div>
        </div>
    `).join('') + (featuredGames.length > 1 ? `
        <div class="hero-carousel-controls" aria-label="Controles de juegos destacados">
            <button type="button" class="hero-arrow" data-hero-step="-1" aria-label="Juego destacado anterior"><i class="fas fa-arrow-left"></i></button>
            <div class="hero-dots" role="group" aria-label="Seleccionar juego destacado">
                ${featuredGames.map((game, i) => `<button type="button" class="hero-dot ${i === 0 ? 'active' : ''}" data-hero-index="${i}" aria-label="Ver ${game.title}" aria-pressed="${i === 0}"></button>`).join('')}
            </div>
            <button type="button" class="hero-arrow" data-hero-step="1" aria-label="Siguiente juego destacado"><i class="fas fa-arrow-right"></i></button>
        </div>
    ` : '');

    clearInterval(carouselTimer);
    carouselIndex = 0;
    if (featuredGames.length > 1) {
        const showSlide = (index) => {
            const slides = container.querySelectorAll('.carousel-slide');
            if (!slides.length) return;
            carouselIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === carouselIndex);
                slide.setAttribute('aria-hidden', i === carouselIndex ? 'false' : 'true');
            });
            container.querySelectorAll('.hero-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === carouselIndex);
                dot.setAttribute('aria-pressed', i === carouselIndex ? 'true' : 'false');
            });
        };
        const startTimer = () => {
            clearInterval(carouselTimer);
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                carouselTimer = setInterval(() => showSlide(carouselIndex + 1), 7000);
            }
        };
        container.onclick = (event) => {
            const button = event.target.closest('[data-hero-step], [data-hero-index]');
            if (!button) return;
            const index = button.hasAttribute('data-hero-index')
                ? Number(button.dataset.heroIndex)
                : carouselIndex + Number(button.dataset.heroStep);
            showSlide(index);
            startTimer();
        };
        container.onmouseenter = () => clearInterval(carouselTimer);
        container.onmouseleave = startTimer;
        container.onfocusin = () => clearInterval(carouselTimer);
        container.onfocusout = (event) => {
            if (!container.contains(event.relatedTarget)) startTimer();
        };
        startTimer();
    }
}

// CATEGORÍAS
function renderCategoriesBar() {
    const bar = document.getElementById('categoriesBar');
    const select = document.getElementById('adminCategory');
    
    bar.innerHTML = `<button class="cat-btn active" data-cat="all">Todos</button>`;
    select.innerHTML = '';

    let retroIndex = loadedGenres.findIndex(g => g.name.toLowerCase() === 'retro');
    let displayedGenres = retroIndex !== -1 ? loadedGenres.slice(0, retroIndex + 1) : loadedGenres.slice(0, 4);

    displayedGenres.forEach(g => {
        bar.innerHTML += `<button class="cat-btn" data-cat="${g.name}">${g.name}</button>`;
    });

    loadedGenres.forEach(g => {
        select.innerHTML += `<option value="${g.name}">${g.name}</option>`;
    });

    bar.innerHTML += `<button class="cat-btn" data-cat="favs"><i class="fas fa-heart"></i> Favoritos</button>`;
    setupCategoryEvents();
}

function setupCategoryEvents() {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const cat = e.target.dataset.cat;
            if (cat === 'all') {
                renderGames(loadedGames);
            } else if (cat === 'favs') {
                renderGames(loadedGames.filter(g => favorites.includes(g.id)));
            } else {
                renderGames(loadedGames.filter(g => {
                    return Array.isArray(g.category) ? g.category.includes(cat) : g.category === cat;
                }));
            }
        });
    });
}

function setupFilterToggle() {
    const btnToggleFilter = document.getElementById('btnToggleFilter');
    const filterMenu = document.getElementById('filterDropdownMenu');

    if (btnToggleFilter && filterMenu) {
        btnToggleFilter.addEventListener('click', (e) => {
            e.stopPropagation();
            btnToggleFilter.classList.toggle('active');
            filterMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!filterMenu.contains(e.target) && !btnToggleFilter.contains(e.target)) {
                btnToggleFilter.classList.remove('active');
                filterMenu.classList.remove('active');
            }
        });
    }
}

function populateFilterDropdowns() {
    const filterGenreExtra = document.getElementById('filterGenreExtra');
    if (!filterGenreExtra) return;
    filterGenreExtra.innerHTML = '<option value="all">Todos los géneros</option>';
    loadedGenres.forEach(g => {
        filterGenreExtra.innerHTML += `<option value="${g.name}">${g.name}</option>`;
    });
}

window.applyAdvancedFilters = function() {
    const platform = document.getElementById('filterPlatform').value;
    const size = document.getElementById('filterSize').value;
    const extraGenre = document.getElementById('filterGenreExtra').value;

    let filtered = loadedGames.filter(game => {
        let matchesPlatform = true;
        if (platform !== 'all') {
            const categories = Array.isArray(game.category) ? game.category.map(c => c.toLowerCase()) : [game.category.toLowerCase()];
            const titleAndDesc = (game.title + ' ' + game.desc).toLowerCase();
            matchesPlatform = categories.includes(platform.toLowerCase()) || titleAndDesc.includes(platform.toLowerCase());
        }

        let matchesGenre = extraGenre === 'all' || (Array.isArray(game.category) ? game.category.includes(extraGenre) : game.category === extraGenre);

        let matchesSize = true;
        if (size !== 'all' && game.size) {
            const sizeNum = parseFloat(game.size.replace(/[^0-9.]/g, '')) || 0;
            const isMB = game.size.toLowerCase().includes('mb');
            const totalGB = isMB ? sizeNum / 1024 : sizeNum;

            if (size === 'light') matchesSize = totalGB < 1.0;
            else if (size === 'medium') matchesSize = totalGB >= 1.0 && totalGB <= 5.0;
            else if (size === 'heavy') matchesSize = totalGB > 5.0;
        }

        return matchesPlatform && matchesGenre && matchesSize;
    });

    renderGames(filtered);
    document.getElementById('filterDropdownMenu').classList.remove('active');
    document.getElementById('btnToggleFilter').classList.remove('active');
};

window.resetAdvancedFilters = function() {
    document.getElementById('filterPlatform').value = 'all';
    document.getElementById('filterSize').value = 'all';
    document.getElementById('filterGenreExtra').value = 'all';
    renderGames(loadedGames);
    document.getElementById('filterDropdownMenu').classList.remove('active');
    document.getElementById('btnToggleFilter').classList.remove('active');
};

function renderNews() {
    const newsContainer = document.getElementById('newsContainer');
    const isMod = currentUser && (currentUser.isMod || MODERATOR_EMAILS.includes(currentUser.email));

    newsContainer.innerHTML = loadedNews.map(n => `
        <article class="news-card">
            <span class="news-date">${n.date}</span>
            <h4>${n.title}</h4>
            <p>${n.content}</p>
            ${isMod ? `<button onclick="editNews('${n.id}')" style="position:absolute; top:0; right:0; background:none; border:none; color:#ffa500; cursor:pointer;"><i class="fas fa-edit"></i></button>` : ''}
        </article>
    `).join('');
}

// CATÁLOGO DE JUEGOS
function renderGames(data) {
    gamesGrid.innerHTML = '';

    if (!data || data.length === 0) {
        gamesGrid.innerHTML = '<p style="color:#888; grid-column: 1/-1;">No se encontraron juegos con los filtros seleccionados.</p>';
        return;
    }

    const isMod = currentUser && (currentUser.isMod || MODERATOR_EMAILS.includes(currentUser.email));
    const userIsAdult = currentUser && currentUser.isAdult;

    data.forEach(game => {
        const isFav = favorites.includes(game.id);
        const isBlocked = game.ageRestricted && !userIsAdult;

        const card = document.createElement('div');
        card.className = `game-card ${isBlocked ? 'restricted-blur' : ''}`;
        
        let overlayHTML = isBlocked ? `
            <div class="age-lock-overlay">
                <i class="fas fa-user-lock"></i>
                <span class="badge-18">+18 AÑOS</span>
                <p>${currentUser ? 'Para mayores de edad.' : 'Inicia sesión para ver.'}</p>
            </div>
        ` : '';

        const versionCount = (game.versions && game.versions.length) ? game.versions.length : 1;
        const genresFormatted = formatGameGenres(game.category);
        const downloads = game.downloadsCount || 0;

        card.innerHTML = `
            <div class="card-img-wrap">
                <img src="${game.image}" alt="${game.title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">
                
                <div class="card-badges-row">
                    ${game.onlineStatus === 'online' ? '<span class="status-pill online"><i class="fas fa-wifi"></i> Online</span>' : ''}
                    ${game.gamepadStatus ? '<span class="status-pill gamepad"><i class="fas fa-gamepad"></i> Mando</span>' : ''}
                </div>

                ${overlayHTML}
                ${isMod ? `<button class="edit-card-btn" onclick="openAdminEditModal(event, '${game.id}')" title="Editar Juego"><i class="fas fa-edit"></i></button>` : ''}
                ${!isBlocked ? `<button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav(event, '${game.id}')"><i class="fas fa-heart"></i></button>` : ''}
            </div>
            <div class="card-info" ${!isBlocked ? `onclick="openGameModal('${game.id}')"` : ''}>
                <span class="card-cat">${genresFormatted} ${game.ageRestricted ? '<span class="badge-18-tag">+18</span>' : ''}</span>
                <h4>${game.title}</h4>
                <div class="card-meta">
                    <span><i class="fas fa-hdd"></i> ${game.size}</span>
                    <span><i class="fas fa-code-branch"></i> ${versionCount} Ver.</span>
                </div>
                <div class="downloads-counter"><i class="fas fa-fire"></i> ${downloads} descargas</div>
            </div>
        `;

        if (isBlocked) {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-card-btn')) alert("⚠️ Contenido restringido para mayores de 18 años.");
            });
        }

        gamesGrid.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    renderGames(loadedGames.filter(g => g.title.toLowerCase().includes(val)));
});

function toggleFav(e, gameId) {
    e.stopPropagation();
    if (favorites.includes(gameId)) {
        favorites = favorites.filter(id => id !== gameId);
    } else {
        favorites.push(gameId);
    }
    localStorage.setItem('basados_favs', JSON.stringify(favorites));
    renderGames(loadedGames);
    publishLosBasadosState('favorites', favorites);
}

// MODAL JUEGO
function escapeGameHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function openGameModal(id, origin) {
    const game = loadedGames.find(g => g.id === id);
    if (!game) return;

    if (game.ageRestricted && (!currentUser || !currentUser.isAdult)) {
        alert("⚠️ Acceso denegado: Requiere confirmación de edad (+18).");
        return;
    }

    const modalContent = document.getElementById('gameModalContent');
    let embedHTML = game.embed ? `
        <h4 style="color:var(--neon-red); margin: 20px 0 10px 0;"><i class="fas fa-video"></i> Tutorial / Demo:</h4>
        <div class="embed-video-container">${game.embed}</div>
    ` : '';

    const versions = (game.versions && game.versions.length > 0) ? game.versions : [
        { name: "Versión Portable", downloadUrl: game.downloadUrl || "#", server: game.server || "MediaFire" }
    ];

    const firstVersion = versions[0];
    const genresFormatted = formatGameGenres(game.category);

    let fixOnlineHTML = '';
    if (game.fixOnlineUrl) {
        fixOnlineHTML = `
            <div class="fix-online-display-box">
                <h4 style="color:#00ff80; margin-bottom: 5px; font-family: var(--font-head); font-size: 0.95rem;">
                    <i class="fas fa-plug"></i> FIX ONLINE DISPONIBLE
                </h4>
                <p style="color:#ccc; font-size: 0.85rem;">
                    ${escapeGameHTML(game.fixOnlineServer || 'Servidor Online / Steam Fix')}
                </p>
                <a href="${escapeGameHTML(game.fixOnlineUrl)}" target="_blank" rel="noopener noreferrer" class="btn-fix-online-dl">
                    <i class="fas fa-download"></i> DESCARGAR FIX ONLINE
                </a>
            </div>
        `;
    }

    modalContent.innerHTML = `
        <div class="lb-game-detail">
          <section class="lb-game-detail-hero">
            <div class="lb-game-artwork">
              <img class="lb-game-cover" src="${escapeGameHTML(game.image || 'assets/img/favicon.png')}" alt="Portada de ${escapeGameHTML(game.title)}" onerror="this.onerror=null;this.src='assets/img/favicon.png';">
              <span class="lb-game-loot-label"><i></i> JUEGO DESBLOQUEADO</span>
              <span class="lb-game-art-glint"></span>
            </div>
            <div class="lb-game-summary">
              <div class="lb-game-kicker"><span>${escapeGameHTML(genresFormatted)}</span>${game.ageRestricted ? '<b>+18</b>' : ''}</div>
              <h2>${escapeGameHTML(game.title)}</h2>
              <p class="lb-game-description">${escapeGameHTML(game.desc || 'Descubre versiones, requisitos y consejos para empezar a jugar.').replace(/\n/g, '<br>')}</p>
              <div class="lb-game-facts"><span><i class="fas fa-hard-drive"></i> ${escapeGameHTML(game.size || 'Tama&ntilde;o por confirmar')}</span><span><i class="fas fa-download"></i> ${Number(game.downloadsCount || 0).toLocaleString('es-PE')} descargas</span><span><i class="fas fa-gamepad"></i> ${game.gamepadStatus ? 'Compatible con mando' : 'Teclado / Touch'}</span></div>
              <div class="lb-game-primary-actions">
                <button type="button" class="lb-game-wishlist ${favorites.includes(id) ? 'is-saved' : ''}" onclick="toggleFav(event, '${escapeGameHTML(id)}'); this.classList.toggle('is-saved'); this.querySelector('span').textContent = this.classList.contains('is-saved') ? 'GUARDADO EN MI LISTA' : 'GUARDAR EN MI LISTA';" aria-label="${favorites.includes(id) ? 'Quitar de mi lista' : 'Guardar en mi lista'}"><i class="fas fa-heart"></i><span>${favorites.includes(id) ? 'GUARDADO EN MI LISTA' : 'GUARDAR EN MI LISTA'}</span></button>
              </div>
              <div class="version-select-box lb-version-panel">
                <div class="version-custom-dropdown">
                  <button type="button" class="btn-version-dropdown" id="btnDropdownVersions" onclick="toggleVersionMenu(event)">
                    <div class="version-title-group"><i class="fas fa-box-open"></i><span id="displaySelectedVersionName">${escapeGameHTML(firstVersion.name)}</span><i class="fas fa-chevron-down arrow-ver-icon"></i></div>
                    <span class="mediafire-badge" id="displaySelectedVersionServer"><i class="fas fa-cloud-download-alt"></i> ${escapeGameHTML(firstVersion.server || 'MediaFire')}</span>
                  </button>
                  <div class="version-dropdown-list" id="versionDropdownList">
                    ${versions.map((version, index) => `<div class="version-dropdown-item ${index === 0 ? 'active' : ''}" onclick="selectVersionFromDropdown(${index}, '${escapeGameHTML(id)}')"><div class="ver-item-info"><strong>${escapeGameHTML(version.name)}</strong><small>Servidor: ${escapeGameHTML(version.server || 'Servidor externo')}</small></div><i class="fas fa-check check-mark"></i></div>`).join('')}
                  </div>
                </div>
                <a href="${escapeGameHTML(firstVersion.downloadUrl)}" target="_blank" rel="noopener noreferrer" id="btnMainDownloadUrl" onclick="trackDownload('${escapeGameHTML(id)}')" class="btn-primary full-width lb-game-download"><i class="fas fa-download"></i> DESCARGAR JUEGO <span>(<b id="btnDownloadServerText">${escapeGameHTML(firstVersion.server || 'MediaFire')}</b>)</span></a>
                <button type="button" class="report-btn-link lb-report-link" onclick="reportGameLink('${escapeGameHTML(id)}', '${escapeGameHTML(game.title)}')"><i class="fas fa-triangle-exclamation"></i> Reportar enlace roto</button>
              </div>
            </div>
          </section>
          ${fixOnlineHTML ? `<section class="lb-game-extra-panel lb-game-fix-panel">${fixOnlineHTML}</section>` : ''}
          <section class="lb-game-system-panel">
            <div class="lb-game-panel-heading"><span class="lb-game-panel-icon"><i class="fas fa-sliders"></i></span><div><span class="lb-overline">ANTES DE INSTALAR</span><h3>Requisitos del sistema</h3></div></div>
            <div class="lb-spec-grid"><div><small>SISTEMA OPERATIVO</small><strong>${escapeGameHTML(game.specs?.so || 'Windows / Android')}</strong></div><div><small>PROCESADOR</small><strong>${escapeGameHTML(game.specs?.cpu || 'Quad Core')}</strong></div><div><small>MEMORIA RAM</small><strong>${escapeGameHTML(game.specs?.ram || '4 GB')}</strong></div><div><small>GR&Aacute;FICOS</small><strong>${escapeGameHTML(game.specs?.gpu || 'Integrados')}</strong></div></div>
          </section>
          ${game.installGuide ? `<section class="lb-game-guide"><div class="lb-game-panel-heading"><span class="lb-game-panel-icon"><i class="fas fa-list-check"></i></span><div><span class="lb-overline">PASO A PASO</span><h3>Gu&iacute;a de descarga e instalaci&oacute;n</h3></div></div><div class="lb-game-guide-copy">${escapeGameHTML(game.installGuide)}</div></section>` : `<section class="lb-game-guide is-empty"><div class="lb-game-panel-heading"><span class="lb-game-panel-icon"><i class="fas fa-circle-info"></i></span><div><span class="lb-overline">RECOMENDACI&Oacute;N</span><h3>Revisa antes de instalar</h3></div></div><p>Compara los requisitos y la versi&oacute;n elegida. Si el archivo incluye un README o instrucciones propias, s&iacute;guelos para completar la instalaci&oacute;n.</p></section>`}
        ${embedHTML}

        <div class="game-comments-section">
            <h3 class="game-comments-title"><i class="fas fa-star" style="color:#ffca28;"></i> Reseñas & Comentarios</h3>
            
            <div class="rating-overview">
                <div>
                    <span style="font-size:1.4rem; font-weight:800; color:#ffca28;" id="avgRatingVal">0.0</span>
                    <span style="color:#888; font-size:0.9rem;"> / 5.0</span>
                    <div style="font-size:0.75rem; color:#888;" id="totalVotesCount">0 valoraciones</div>
                </div>
                <div id="starsAverageDisplay" style="color:#ffca28; font-size:1.1rem;">☆☆☆☆☆</div>
            </div>

            ${currentUser ? `
                <form id="formGameComment" class="comment-input-box">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.85rem; color:#aaa;">Califica este juego:</span>
                        <div class="star-rating-select" id="starSelector">
                            <i class="fas fa-star active" data-value="1"></i>
                            <i class="fas fa-star active" data-value="2"></i>
                            <i class="fas fa-star active" data-value="3"></i>
                            <i class="fas fa-star active" data-value="4"></i>
                            <i class="fas fa-star active" data-value="5"></i>
                        </div>
                    </div>
                    
                    <div class="chat-input-area" style="margin-top:5px;">
                        <textarea id="gameCommentText" placeholder="Escribe tu reseña..." required style="flex:1;"></textarea>
                        
                        <!-- BOTÓN (+) PARA COMENTARIOS DE JUEGOS -->
                        <div class="chat-more-container">
                            <button type="button" class="btn-more-chat" id="commentMoreBtn" title="Adjuntar archivo, GIF o Emoji">
                                <i class="fas fa-plus"></i>
                            </button>
                            <div class="chat-more-menu" id="commentMoreMenu">
                                <button type="button" id="btnCommentImage"><i class="fas fa-image"></i> Imagen</button>
                                <button type="button" id="btnCommentGiphy"><i class="fas fa-film"></i> GIF</button>
                            </div>
                        </div>
                    </div>

                    <input type="file" id="commentImageInput" accept="image/*,video/mp4,video/webm" style="display:none;">

                    <button type="submit" class="btn-primary" style="align-self:flex-end; margin-top:8px;"><i class="fas fa-paper-plane"></i> PUBLICAR RESEÑA</button>
                </form>
            ` : `
                <div class="login-to-comment-box" style="text-align:center; padding:15px; background:#12121a; border-radius:8px; border:1px solid #28283a; margin-bottom:20px;">
                    <p style="color:#aaa; margin-bottom:10px;"><i class="fas fa-lock"></i> Inicia sesión para comentar y calificar.</p>
                    <button class="btn-primary" style="margin:0 auto; font-size:0.85rem;" onclick="openAuthFromModal()"><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</button>
                </div>
            `}

            <div class="comments-list" id="commentsContainer">
                <p style="color:#666; font-size:0.85rem;">Cargando comentarios...</p>
            </div>
        </div>
    `;

    const gameModal = document.getElementById('gameModal');
    const gameDialog = gameModal.querySelector('.game-modal-box');
    gameModal.classList.remove('is-revealing');
    gameModal.classList.add('active');
    requestAnimationFrame(() => {
        const dialogRect = gameDialog.getBoundingClientRect();
        gameDialog.style.setProperty('--loot-origin-x', `${origin ? origin.x - dialogRect.left : dialogRect.width / 2}px`);
        gameDialog.style.setProperty('--loot-origin-y', `${origin ? origin.y - dialogRect.top : dialogRect.height / 2}px`);
        gameModal.classList.add('is-revealing');
        gameDialog.querySelector('.lb-game-artwork')?.classList.add('is-revealing');
    });
    initGameComments(id);

    if (currentUser) {
        selectedRating = 5;
        setupStarSelector();
        setupCommentInteractiveControls(id);

        document.getElementById('formGameComment').addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('gameCommentText').value.trim();
            if (!text) return;

            commentsRef.child(id).push({
                author: currentUser.name,
                avatar: currentUser.avatar,
                rating: selectedRating,
                text: text,
                timestamp: Date.now()
            }, (err) => {
                if (!err) document.getElementById('gameCommentText').value = '';
            });
        });
    }
}

function setupCommentInteractiveControls(gameId) {
    const moreBtn = document.getElementById('commentMoreBtn');
    const moreMenu = document.getElementById('commentMoreMenu');
    const imageInput = document.getElementById('commentImageInput');

    if (!moreBtn || !moreMenu) return;
    if (activeCommentMenu) activeCommentMenu.classList.remove('active');
    activeCommentMenu = moreMenu;

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenu.classList.toggle('active');
    });

    document.getElementById('btnCommentImage').addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentUser) {
            uploadAndSendMedia(file, commentsRef.child(gameId), false, selectedRating, 'comments');
        }
        imageInput.value = '';
    });

    document.getElementById('btnCommentGiphy').addEventListener('click', () => {
        moreMenu.classList.remove('active');
        activeCommentMenu = null;
        const gifQuery = prompt("Escribe una palabra clave para buscar un GIF:");
        if (gifQuery) {
            fetchGiphyGifs(gifQuery, 'commentsContainer', (gifUrl) => {
                commentsRef.child(gameId).push({
                    author: currentUser.name,
                    avatar: currentUser.avatar,
                    rating: selectedRating,
                    text: gifUrl,
                    timestamp: Date.now()
                });
            });
        }
    });
}

window.toggleVersionMenu = function(e) {
    e.stopPropagation();
    const btn = document.getElementById('btnDropdownVersions');
    const menu = document.getElementById('versionDropdownList');
    if (btn && menu) {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
    }
};

document.addEventListener('click', () => {
    const btn = document.getElementById('btnDropdownVersions');
    const menu = document.getElementById('versionDropdownList');
    if (btn && menu) {
        btn.classList.remove('active');
        menu.classList.remove('active');
    }
});

window.selectVersionFromDropdown = function(index, gameId) {
    const game = loadedGames.find(g => g.id === gameId);
    if (!game || !game.versions || !game.versions[index]) return;

    const selectedVer = game.versions[index];

    document.getElementById('displaySelectedVersionName').textContent = selectedVer.name;
    document.getElementById('displaySelectedVersionServer').innerHTML = `<i class="fas fa-cloud-download-alt"></i> ${selectedVer.server || 'MediaFire'}`;
    document.getElementById('btnDownloadServerText').textContent = selectedVer.server || 'MediaFire';
    document.getElementById('btnMainDownloadUrl').href = selectedVer.downloadUrl;

    document.querySelectorAll('.version-dropdown-item').forEach((item, idx) => {
        if (idx === index) item.classList.add('active');
        else item.classList.remove('active');
    });

    document.getElementById('btnDropdownVersions').classList.remove('active');
    document.getElementById('versionDropdownList').classList.remove('active');
};

window.openAuthFromModal = function() {
    document.getElementById('gameModal').classList.remove('active');
    document.getElementById('authModal').classList.add('active');
};

function setupStarSelector() {
    const stars = document.querySelectorAll('#starSelector i');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const val = parseInt(e.target.dataset.value);
            selectedRating = val;
            stars.forEach((s, idx) => {
                if (idx < val) s.classList.add('active');
                else s.classList.remove('active');
            });
        });
    });
}

function initGameComments(gameId) {
    if (currentActiveGameCommentsRef) currentActiveGameCommentsRef.off();
    currentActiveGameCommentsRef = commentsRef.child(gameId);

    currentActiveGameCommentsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('commentsContainer');
        const avgValEl = document.getElementById('avgRatingVal');
        const votesEl = document.getElementById('totalVotesCount');
        const starsAvgEl = document.getElementById('starsAverageDisplay');

        if (!container) return;

        if (!data) {
            container.innerHTML = '<p style="color:#666; font-size:0.85rem;">Sé el primero en comentar.</p>';
            if (avgValEl) avgValEl.textContent = '0.0';
            if (votesEl) votesEl.textContent = '0 valoraciones';
            if (starsAvgEl) starsAvgEl.textContent = '☆☆☆☆☆';
            return;
        }

        const commentsArray = Object.values(data);
        let totalRating = 0;
        container.innerHTML = '';

        commentsArray.reverse().forEach(c => {
            totalRating += (c.rating || 5);
            const starsHTML = '★'.repeat(c.rating || 5) + '☆'.repeat(5 - (c.rating || 5));
            const dateStr = new Date(c.timestamp).toLocaleDateString();

            const mediaPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?|https?:\/\/cdn\.discordapp\.com\/attachments\/[^\s]+|https?:\/\/media\.giphy\.com\/[^\s]+|data:image\/[a-zA-Z]+;base64,[^\s]+)/i;
            let formattedText = c.text || '';

            if (mediaPattern.test(formattedText)) {
                formattedText = formattedText.replace(mediaPattern, (url) => {
                    return `<br><img src="${url}" class="chat-msg-img" loading="lazy" decoding="async" onclick="openImageModal('${url}')" title="Ampliar media" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">`;
                });
            }
            formattedText += renderStoredMedia(c.mediaUrl, c.mediaType);

            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <img src="${c.avatar}" alt="${c.author}" loading="lazy" decoding="async" onclick="openPublicProfile('${c.author}', '${c.avatar}')" onerror="this.onerror=null;this.src='https://api.dicebear.com/7.x/bottts/svg?seed=Guest';">
                <div class="comment-main">
                    <div class="comment-header">
                        <span class="comment-author" onclick="openPublicProfile('${c.author}', '${c.avatar}')">${c.author}</span>
                        <span class="comment-date">${dateStr}</span>
                    </div>
                    <div class="comment-stars">${starsHTML}</div>
                    <p class="comment-text">${formattedText}</p>
                </div>
            `;
            container.appendChild(item);
        });

        const count = commentsArray.length;
        const avg = (totalRating / count).toFixed(1);

        if (avgValEl) avgValEl.textContent = avg;
        if (votesEl) votesEl.textContent = `${count} ${count === 1 ? 'valoración' : 'valoraciones'}`;
        if (starsAvgEl) {
            const roundedAvg = Math.round(parseFloat(avg));
            starsAvgEl.textContent = '★'.repeat(roundedAvg) + '☆'.repeat(5 - roundedAvg);
        }

        gamesRef.child(gameId).update({ avgRating: parseFloat(avg) });
    });
}

function addVersionField(name = '', downloadUrl = '', server = 'MediaFire') {
    const container = document.getElementById('versionsListContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'version-item-row';
    row.innerHTML = `
        <button type="button" class="btn-del-version" onclick="removeVersionField(this)">&times;</button>
        <div class="form-row">
            <div class="form-group" style="margin-bottom:6px;">
                <label>Nombre de la Versión</label>
                <input type="text" class="ver-name" placeholder="Ej: Portable / v1.0" value="${name}" required>
            </div>
            <div class="form-group" style="margin-bottom:6px;">
                <label>Servidor</label>
                <input type="text" class="ver-server" placeholder="MediaFire" value="${server || 'MediaFire'}">
            </div>
        </div>
        <div class="form-group" style="margin-bottom:0;">
            <label>Link Directo</label>
            <input type="url" class="ver-url" placeholder="https://..." value="${downloadUrl}" required>
        </div>
    `;
    container.appendChild(row);
}

window.removeVersionField = function(btn) {
    const container = document.getElementById('versionsListContainer');
    if (container.children.length > 1) {
        btn.closest('.version-item-row').remove();
    } else {
        alert("El juego debe tener al menos una versión registrada.");
    }
};

document.getElementById('btnAddVersionField').addEventListener('click', () => { addVersionField(); });

function getVersionsFromForm() {
    const rows = document.querySelectorAll('.version-item-row');
    const versions = [];
    rows.forEach(row => {
        const name = row.querySelector('.ver-name').value.trim();
        const server = row.querySelector('.ver-server').value.trim();
        const downloadUrl = row.querySelector('.ver-url').value.trim();

        if (name && downloadUrl) {
            versions.push({ name, server, downloadUrl });
        }
    });
    return versions;
}

function populateAdminAdGameOptions(selectedId = '') {
    const select = document.getElementById('adminAdGameId');
    if (!select) return;
    const selected = selectedId || select.value;
    select.innerHTML = '<option value="">Selecciona el juego o aplicación</option>' + loadedGames
        .map(game => `<option value="${escapeGameHTML(game.id)}">${escapeGameHTML(game.title)}</option>`)
        .join('');
    if (loadedGames.some(game => game.id === selected)) select.value = selected;
}

function renderAdminAdsList() {
    const container = document.getElementById('adminAdsList');
    if (!container) return;
    container.innerHTML = loadedAds.length ? loadedAds.map(ad => {
        const game = loadedGames.find(item => item.id === ad.targetGameId);
        return `<div class="admin-list-item">
            <div><strong>${escapeGameHTML(ad.title)}</strong><small style="color:#aaa;display:block;">${ad.active ? 'Activo' : 'Inactivo'} · ${escapeGameHTML(game ? game.title : 'Destino no disponible')} · cada ${Number(ad.intervalMinutes) || 30} min</small></div>
            <div><button type="button" onclick="editAdminAd('${escapeGameHTML(ad.id)}')" style="background:none;border:0;color:#ffa500;cursor:pointer;margin-right:8px;"><i class="fas fa-edit"></i></button><button type="button" onclick="deleteAdminAd('${escapeGameHTML(ad.id)}')" style="background:none;border:0;color:#ff4444;cursor:pointer;"><i class="fas fa-trash"></i></button></div>
        </div>`;
    }).join('') : '<p style="color:#888;">Todavía no hay anuncios configurados.</p>';
}

function resetAdminAdForm() {
    document.getElementById('formAdminAd').reset();
    document.getElementById('adminAdId').value = '';
    document.getElementById('adminAdInterval').value = '30';
    document.getElementById('btnSaveAdminAd').textContent = 'GUARDAR ANUNCIO';
    document.getElementById('btnCancelAdminAd').classList.add('hidden');
    populateAdminAdGameOptions();
}

window.editAdminAd = function(id) {
    const ad = loadedAds.find(item => item.id === id);
    if (!ad) return;
    document.getElementById('adminAdId').value = ad.id;
    document.getElementById('adminAdTitle').value = ad.title || '';
    document.getElementById('adminAdVideoUrl').value = ad.videoUrl || '';
    populateAdminAdGameOptions(ad.targetGameId);
    document.getElementById('adminAdPosition').value = ad.position || 'top-right';
    document.getElementById('adminAdInterval').value = String(ad.intervalMinutes || 30);
    document.getElementById('adminAdActive').checked = Boolean(ad.active);
    document.getElementById('btnSaveAdminAd').textContent = 'ACTUALIZAR ANUNCIO';
    document.getElementById('btnCancelAdminAd').classList.remove('hidden');
    switchAdminTab('ads');
};

window.deleteAdminAd = function(id) {
    if (confirm('¿Eliminar este anuncio?')) adsRef.child(id).remove().catch(error => {
        console.error('No se pudo eliminar el anuncio', error);
        alert(`No se pudo eliminar el anuncio: ${error.message}`);
    });
};

document.getElementById('adminAdVideoFile').addEventListener('change', async (event) => {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;
    try {
        const { url, type } = await uploadMediaFile(file, 'ads');
        if (type !== 'video') throw new Error('Los anuncios requieren un archivo de video.');
        document.getElementById('adminAdVideoUrl').value = url;
    } catch (error) {
        console.error('No se pudo cargar el video del anuncio', error);
        alert(`No se pudo cargar el video del anuncio: ${error.message}`);
    } finally {
        input.value = '';
    }
});

document.getElementById('formAdminAd').addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('adminAdId').value || `ad-${Date.now()}`;
    const videoUrl = document.getElementById('adminAdVideoUrl').value.trim();
    const intervalMinutes = Number(document.getElementById('adminAdInterval').value);
    if (!Number.isInteger(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 1440) {
        alert('La frecuencia debe ser un número entero entre 1 y 1440 minutos.');
        return;
    }
    const ad = {
        id,
        title: document.getElementById('adminAdTitle').value.trim(),
        videoUrl,
        targetGameId: document.getElementById('adminAdGameId').value,
        position: document.getElementById('adminAdPosition').value,
        intervalMinutes,
        active: document.getElementById('adminAdActive').checked
    };
    if (!/^https?:\/\//i.test(videoUrl)) {
        alert('El video debe tener una URL HTTP o HTTPS válida.');
        return;
    }
    try {
        await validateVideoUrlDuration(videoUrl);
        await adsRef.child(id).set(ad);
        resetAdminAdForm();
    } catch (error) {
        console.error('No se pudo guardar el anuncio', error);
        alert(`No se pudo guardar el anuncio: ${error.message}`);
    }
});

document.getElementById('btnCancelAdminAd').addEventListener('click', resetAdminAdForm);

window.switchAdminTab = function(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));

    if (tab === 'games') {
        document.getElementById('tabAdminGames').classList.add('active');
        document.getElementById('contentAdminGames').classList.remove('hidden');
    } else if (tab === 'news') {
        document.getElementById('tabAdminNews').classList.add('active');
        document.getElementById('contentAdminNews').classList.remove('hidden');
    } else if (tab === 'genres') {
        document.getElementById('tabAdminGenres').classList.add('active');
        document.getElementById('contentAdminGenres').classList.remove('hidden');
    } else if (tab === 'social') {
        document.getElementById('tabAdminSocial').classList.add('active');
        document.getElementById('contentAdminSocial').classList.remove('hidden');
    } else if (tab === 'footer') {
        document.getElementById('tabAdminFooter').classList.add('active');
        document.getElementById('contentAdminFooter').classList.remove('hidden');
    } else if (tab === 'ads') {
        document.getElementById('tabAdminAds').classList.add('active');
        document.getElementById('contentAdminAds').classList.remove('hidden');
        populateAdminAdGameOptions();
        renderAdminAdsList();
    } else if (tab === 'reports') {
        document.getElementById('tabAdminReports').classList.add('active');
        document.getElementById('contentAdminReports').classList.remove('hidden');
    }
};

btnAdminPanel.addEventListener('click', () => {
    resetAdminForm();
    switchAdminTab('games');
    document.getElementById('adminModal').classList.add('active');
});

function openAdminEditModal(e, id) {
    if (e) e.stopPropagation();
    const game = loadedGames.find(g => g.id === id);
    if (!game) return;

    document.getElementById('adminGameId').value = game.id;
    document.getElementById('adminTitle').value = game.title;
    document.getElementById('adminSize').value = game.size;
    document.getElementById('adminServer').value = game.server || 'MediaFire';
    document.getElementById('adminImage').value = game.image;
    document.getElementById('adminHeroMediaUrl').value = game.heroMediaUrl || '';
    document.getElementById('adminHeroMediaType').value = game.heroMediaType || 'image';
    document.getElementById('adminHeroButtonLabel').value = game.heroButtonLabel || '';
    document.getElementById('adminDesc').value = game.desc;
    document.getElementById('adminAgeRestricted').value = game.ageRestricted ? "true" : "false";
    document.getElementById('adminOnlineStatus').value = game.onlineStatus || "offline";
    document.getElementById('adminGamepadStatus').value = game.gamepadStatus ? "true" : "false";
    document.getElementById('adminFixServer').value = game.fixOnlineServer || '';
    document.getElementById('adminFixUrl').value = game.fixOnlineUrl || '';
    document.getElementById('adminFeatured').checked = !!game.featured;

    const selectCat = document.getElementById('adminCategory');
    const categories = Array.isArray(game.category) ? game.category : [game.category];
    Array.from(selectCat.options).forEach(opt => {
        opt.selected = categories.includes(opt.value);
    });

    document.getElementById('adminSo').value = game.specs ? game.specs.so : '';
    document.getElementById('adminCpu').value = game.specs ? game.specs.cpu : '';
    document.getElementById('adminRam').value = game.specs ? game.specs.ram : '';
    document.getElementById('adminGpu').value = game.specs ? game.specs.gpu : '';
    document.getElementById('adminEmbed').value = game.embed || '';
    document.getElementById('adminGuide').value = game.installGuide || '';

    const versionsContainer = document.getElementById('versionsListContainer');
    versionsContainer.innerHTML = '';
    if (game.versions && game.versions.length > 0) {
        game.versions.forEach(v => addVersionField(v.name, v.downloadUrl, v.server));
    } else {
        addVersionField("Versión Portable", game.downloadUrl || '', game.server || 'MediaFire');
    }

    document.getElementById('btnSaveAdminGame').textContent = "ACTUALIZAR JUEGO";
    document.getElementById('btnCancelEdit').classList.remove('hidden');

    switchAdminTab('games');
    document.getElementById('adminModal').classList.add('active');
}

function resetAdminForm() {
    document.getElementById('formAdminGame').reset();
    document.getElementById('adminGameId').value = '';
    document.getElementById('adminImageFileInput').value = '';
    document.getElementById('adminHeroMediaFileInput').value = '';
    document.getElementById('adminHeroMediaUrl').value = '';
    document.getElementById('adminHeroMediaType').value = 'image';
    document.getElementById('adminHeroButtonLabel').value = '';
    document.getElementById('versionsListContainer').innerHTML = '';
    addVersionField();
    document.getElementById('btnSaveAdminGame').textContent = "GUARDAR CAMBIOS";
    document.getElementById('btnCancelEdit').classList.add('hidden');
}

document.getElementById('btnCancelEdit').addEventListener('click', resetAdminForm);

document.getElementById('adminImageFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const { url } = await uploadMediaFile(file, 'hero');
        document.getElementById('adminImage').value = url;
    } catch (error) {
        console.error("No se pudo cargar la portada", error);
        alert(`No se pudo cargar la portada: ${error.message}`);
    } finally {
        e.target.value = '';
    }
});

document.getElementById('adminHeroMediaFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const { url, type } = await uploadMediaFile(file, 'hero');
        document.getElementById('adminHeroMediaUrl').value = url;
        document.getElementById('adminHeroMediaType').value = type;
    } catch (error) {
        console.error("No se pudo cargar el medio del carrusel", error);
        alert(`No se pudo cargar el medio del carrusel: ${error.message}`);
    } finally {
        e.target.value = '';
    }
});

document.getElementById('adminHeroMediaUrl').addEventListener('input', (e) => {
    const value = e.target.value.trim();
    document.getElementById('adminHeroMediaType').value = /\.(mp4|webm)(?:$|[?#])/i.test(value) ? 'video' : 'image';
});

document.getElementById('formAdminGame').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('adminGameId').value || 'game-' + Date.now();
    const title = document.getElementById('adminTitle').value.trim();
    const size = document.getElementById('adminSize').value.trim();
    const server = document.getElementById('adminServer').value.trim();
    const image = document.getElementById('adminImage').value.trim();
    const heroMediaUrl = document.getElementById('adminHeroMediaUrl').value.trim();
    const heroMediaType = heroMediaUrl ? document.getElementById('adminHeroMediaType').value : '';
    const desc = document.getElementById('adminDesc').value.trim();
    const ageRestricted = document.getElementById('adminAgeRestricted').value === "true";
    const onlineStatus = document.getElementById('adminOnlineStatus').value;
    const gamepadStatus = document.getElementById('adminGamepadStatus').value === "true";
    const fixOnlineServer = document.getElementById('adminFixServer').value.trim();
    const fixOnlineUrl = document.getElementById('adminFixUrl').value.trim();
    const featured = document.getElementById('adminFeatured').checked;

    const selectCat = document.getElementById('adminCategory');
    const selectedCategories = Array.from(selectCat.selectedOptions).map(opt => opt.value);
    const versions = getVersionsFromForm();

    const existingGame = loadedGames.find(g => g.id === id);
    const downloadsCount = existingGame ? (existingGame.downloadsCount || 0) : 0;

    const gameData = {
        id,
        title,
        category: selectedCategories.length > 0 ? selectedCategories : ["General"],
        size,
        server,
        image,
        heroMediaUrl,
        heroMediaType,
        heroPoster: image,
        heroButtonLabel: document.getElementById('adminHeroButtonLabel').value.trim(),
        desc,
        ageRestricted,
        onlineStatus,
        gamepadStatus,
        fixOnlineServer,
        fixOnlineUrl,
        featured,
        downloadsCount,
        downloadUrl: versions.length > 0 ? versions[0].downloadUrl : "#",
        versions: versions,
        specs: {
            so: document.getElementById('adminSo').value.trim(),
            cpu: document.getElementById('adminCpu').value.trim(),
            ram: document.getElementById('adminRam').value.trim(),
            gpu: document.getElementById('adminGpu').value.trim()
        },
        embed: document.getElementById('adminEmbed').value.trim(),
        installGuide: document.getElementById('adminGuide').value.trim()
    };

    if (heroMediaType === 'video') {
        try {
            await validateVideoUrlDuration(heroMediaUrl);
        } catch (error) {
            alert(`No se pudo guardar el video destacado: ${error.message}`);
            return;
        }
    }

    gamesRef.child(id).set(gameData, (err) => {
        if (err) {
            alert(`No se pudo guardar el juego: ${err.message}`);
        } else {
            alert("✅ Juego guardado exitosamente.");
            resetAdminForm();
        }
    });
});

function renderAdminGamesList() {
    const container = document.getElementById('adminGamesListContainer');
    if (!container) return;
    container.innerHTML = loadedGames.map(g => `
        <div class="admin-list-item">
            <div>
                <strong>${g.title}</strong>
                <small style="color:#aaa; display:block;">Descargas: ${g.downloadsCount || 0}</small>
            </div>
            <div>
                <button type="button" onclick="openAdminEditModal(event, '${g.id}')" style="background:none; border:none; color:#ffa500; cursor:pointer; margin-right:8px;"><i class="fas fa-edit"></i></button>
                <button type="button" onclick="deleteGame('${g.id}')" style="background:none; border:none; color:#ff4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.filterAdminGamesList = function() {
    const query = document.getElementById('adminGameSearchInput').value.toLowerCase();
    const filtered = loadedGames.filter(g => g.title.toLowerCase().includes(query));
    const container = document.getElementById('adminGamesListContainer');
    container.innerHTML = filtered.map(g => `
        <div class="admin-list-item">
            <div>
                <strong>${g.title}</strong>
                <small style="color:#aaa; display:block;">Descargas: ${g.downloadsCount || 0}</small>
            </div>
            <div>
                <button type="button" onclick="openAdminEditModal(event, '${g.id}')" style="background:none; border:none; color:#ffa500; cursor:pointer; margin-right:8px;"><i class="fas fa-edit"></i></button>
                <button type="button" onclick="deleteGame('${g.id}')" style="background:none; border:none; color:#ff4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
};

window.deleteGame = function(id) {
    if (confirm("¿Seguro de eliminar este juego del catálogo?")) {
        gamesRef.child(id).remove();
    }
};

document.getElementById('formAdminGenre').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('genreName').value.trim();
    if (!name) return;

    genresRef.child(name).set({ name }, (err) => {
        if (!err) document.getElementById('genreName').value = '';
    });
});

function renderAdminGenres() {
    const list = document.getElementById('adminGenreList');
    if (!list) return;
    list.innerHTML = loadedGenres.map(g => `
        <span class="genre-tag-item">
            ${g.name}
            <button type="button" class="btn-del-mini" onclick="deleteGenre('${g.name}')">&times;</button>
        </span>
    `).join('');
}

window.deleteGenre = function(name) {
    if (confirm(`¿Eliminar la categoría "${name}"?`)) {
        genresRef.child(name).remove();
    }
};

document.getElementById('formAdminNews').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('newsId').value || 'news-' + Date.now();
    const title = document.getElementById('newsTitle').value.trim();
    const date = document.getElementById('newsDate').value.trim();
    const content = document.getElementById('newsContent').value.trim();

    newsRef.child(id).set({ id, title, date, content }, (err) => {
        if (!err) resetNewsForm();
    });
});

function renderAdminNews() {
    const list = document.getElementById('adminNewsList');
    if (!list) return;
    list.innerHTML = loadedNews.map(n => `
        <div class="admin-list-item">
            <div>
                <strong>${n.title}</strong>
                <small style="color:#aaa; display:block;">${n.date}</small>
            </div>
            <div>
                <button type="button" onclick="editNews('${n.id}')" style="background:none; border:none; color:#ffa500; cursor:pointer; margin-right:8px;"><i class="fas fa-edit"></i></button>
                <button type="button" onclick="deleteNews('${n.id}')" style="background:none; border:none; color:#ff4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.editNews = function(id) {
    const n = loadedNews.find(item => item.id === id);
    if (!n) return;
    document.getElementById('newsId').value = n.id;
    document.getElementById('newsTitle').value = n.title;
    document.getElementById('newsDate').value = n.date;
    document.getElementById('newsContent').value = n.content;
    document.getElementById('btnSaveNews').textContent = "ACTUALIZAR NOTICIA";
    document.getElementById('btnCancelNewsEdit').classList.remove('hidden');
    switchAdminTab('news');
    document.getElementById('adminModal').classList.add('active');
};

window.deleteNews = function(id) {
    if (confirm("¿Eliminar esta noticia?")) {
        newsRef.child(id).remove();
    }
};

function resetNewsForm() {
    document.getElementById('formAdminNews').reset();
    document.getElementById('newsId').value = '';
    document.getElementById('btnSaveNews').textContent = "GUARDAR NOTICIA";
    document.getElementById('btnCancelNewsEdit').classList.add('hidden');
}

function setupEventListeners() {
    const avatarFileInput = document.getElementById('profileAvatarFile');
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (profilePreviewObjectUrl) URL.revokeObjectURL(profilePreviewObjectUrl);
            if (file.size > 10 * 1024 * 1024) {
                alert("⚠️ La imagen supera el límite de 10 MB.");
                avatarFileInput.value = '';
                return;
            }
            profilePreviewObjectUrl = URL.createObjectURL(file);
            document.getElementById('profileAvatarPreview').src = profilePreviewObjectUrl;
        });
    }

    btnAuth.addEventListener('click', () => {
        if (currentUser) openPublicProfile(currentUser.name, currentUser.avatar);
        else document.getElementById('authModal').classList.add('active');
    });

    document.getElementById('closeAuthModal').addEventListener('click', () => {
        document.getElementById('authModal').classList.remove('active');
    });

    document.getElementById('tabLogin').addEventListener('click', () => {
        document.getElementById('tabLogin').classList.add('active');
        document.getElementById('tabRegister').classList.remove('active');
        document.getElementById('formLogin').classList.add('active');
        document.getElementById('formRegister').classList.remove('active');
    });

    document.getElementById('tabRegister').addEventListener('click', () => {
        document.getElementById('tabRegister').classList.add('active');
        document.getElementById('tabLogin').classList.remove('active');
        document.getElementById('formRegister').classList.add('active');
        document.getElementById('formLogin').classList.remove('active');
    });

    document.getElementById('formLogin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPass').value;
        try {
            const credential = await auth.signInWithEmailAndPassword(email, password);
            if (!credential.user.emailVerified) {
                await credential.user.sendEmailVerification();
                await auth.signOut();
                alert("Verifica tu correo desde el enlace que te enviamos y luego inicia sesión de nuevo.");
                return;
            }

            const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
            let userId;
            let profile;
            if (snapshot.exists()) {
                const record = Object.entries(snapshot.val())[0];
                userId = record[0];
                profile = record[1];
                await usersRef.child(userId).update({ authUid: credential.user.uid });
            } else {
                const legacyUsersSnapshot = await usersRef.once('value');
                const legacyRecord = Object.entries(legacyUsersSnapshot.val() || {}).find(([, item]) => item?.email?.toLowerCase() === email);
                if (legacyRecord) {
                    userId = legacyRecord[0];
                    profile = legacyRecord[1];
                    await usersRef.child(userId).update({ authUid: credential.user.uid });
                } else {
                    const pendingRef = db.ref(`pending_auth_profiles/${credential.user.uid}`);
                    const pendingSnapshot = await pendingRef.once('value');
                    profile = pendingSnapshot.val();
                    if (!profile) throw new Error("No encontramos el perfil. Regístrate para crear una cuenta o contacta al equipo.");
                    userId = credential.user.uid;
                    await usersRef.child(userId).set({ ...profile, authUid: credential.user.uid });
                    await pendingRef.remove();
                }
            }

            const ageInfo = calculateAgeInfo(profile.birthdate);
            currentUser = {
                id: userId,
                name: profile.name,
                email: credential.user.email,
                birthdate: profile.birthdate,
                isAdult: ageInfo.isAdult,
                avatar: profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.name)}`,
                isMod: MODERATOR_EMAILS.includes((credential.user.email || '').toLowerCase())
            };
            localStorage.setItem('basados_user', JSON.stringify(currentUser));
            updateUserUI();
            updateFirebasePresence();
            document.getElementById('authModal').classList.remove('active');
            renderGames(loadedGames);
        } catch (error) {
            console.error("No se pudo iniciar sesión", error);
            alert(`No se pudo iniciar sesión: ${error.message}`);
        }
    });

    document.getElementById('formRegister').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regUser').value.trim();
        const birthdate = document.getElementById('regBirthdate').value;
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPass').value;
        const userData = {
            name,
            birthdate,
            email,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
            isMod: MODERATOR_EMAILS.includes(email.toLowerCase())
        };
        try {
            const credential = await auth.createUserWithEmailAndPassword(email, password);
            await db.ref(`pending_auth_profiles/${credential.user.uid}`).set(userData);
            await credential.user.sendEmailVerification();
            await auth.signOut();
            alert("Cuenta creada. Verifica tu correo antes de iniciar sesión.");
            document.getElementById('tabLogin').click();
        } catch (error) {
            console.error("No se pudo crear la cuenta", error);
            alert(`No se pudo crear la cuenta: ${error.message}`);
        }
    });

    document.getElementById('closeProfileModal').addEventListener('click', () => {
        document.getElementById('profileModal').classList.remove('active');
        if (profilePreviewObjectUrl) URL.revokeObjectURL(profilePreviewObjectUrl);
        profilePreviewObjectUrl = "";
    });

    document.getElementById('formProfile').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const newName = document.getElementById('profileNickname').value.trim();
        const newBirthdate = document.getElementById('profileBirthdate').value;
        const newAvatarUrl = document.getElementById('profileAvatarUrl').value.trim();
        const fileInput = document.getElementById('profileAvatarFile');

        const ageInfo = calculateAgeInfo(newBirthdate);
        currentUser.name = newName;
        currentUser.birthdate = newBirthdate;
        currentUser.isAdult = ageInfo.isAdult;

        const processSave = (finalAvatar) => {
            if (finalAvatar) currentUser.avatar = finalAvatar;

            usersRef.child(currentUser.id).update({
                name: currentUser.name,
                birthdate: currentUser.birthdate,
                avatar: currentUser.avatar
            });

            localStorage.setItem('basados_user', JSON.stringify(currentUser));
            updateUserUI();
            updateFirebasePresence();
            if (profilePreviewObjectUrl) URL.revokeObjectURL(profilePreviewObjectUrl);
            profilePreviewObjectUrl = "";
            document.getElementById('profileModal').classList.remove('active');
            renderGames(loadedGames);
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (file.size > 500 * 1024) {
                alert("⚠️ La imagen supera el peso máximo de 500 KB.");
                return;
            }
            uploadMediaFile(file, 'avatars')
                .then(({ url }) => processSave(url))
                .catch((error) => {
                    console.error("No se pudo subir el avatar", error);
                    alert(`No se pudo actualizar el avatar: ${error.message}`);
                });
        } else if (newAvatarUrl) {
            processSave(newAvatarUrl);
        } else {
            processSave(null);
        }
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        privateNotificationListeners.forEach((listener) => listener.off('child_added'));
        privateNotificationListeners.clear();
        if (privateChatListener) privateChatListener.off();
        privateChatListener = null;
        currentUser = null;
        auth.signOut().catch((error) => console.error("No se pudo cerrar la sesión de Firebase", error));
        localStorage.removeItem('basados_user');
        updateUserUI();
        updateFirebasePresence();
        document.getElementById('profileModal').classList.remove('active');
        document.getElementById('publicProfileModal').classList.remove('active');
        renderGames(loadedGames);
    });

    document.getElementById('closeGameModal').addEventListener('click', () => {
        document.getElementById('gameModal').classList.remove('active');
        if (currentActiveGameCommentsRef) currentActiveGameCommentsRef.off();
        if (activeCommentMenu) activeCommentMenu.classList.remove('active');
        activeCommentMenu = null;
    });

    document.getElementById('closeAdminModal').addEventListener('click', () => {
        document.getElementById('adminModal').classList.remove('active');
    });

    const communityShortcut = document.getElementById('btnOnlineUsers');
    if (communityShortcut) communityShortcut.addEventListener('click', () => { window.location.hash = '/community'; });

    document.getElementById('btnNotif').addEventListener('click', () => {
        document.getElementById('notifModal').classList.add('active');
        const badge = document.getElementById('notifBadgeCount');
        if (badge) badge.classList.add('hidden');
        renderNotificationsFeed();
    });

    document.getElementById('closeNotifModal').addEventListener('click', () => {
        document.getElementById('notifModal').classList.remove('active');
    });

    document.getElementById('formNotif').addEventListener('submit', (e) => {
        e.preventDefault();
        alert("🔔 ¡Te has suscrito a las notificaciones por correo con éxito!");
        document.getElementById('notifModal').classList.remove('active');
    });

    document.getElementById('formChat').addEventListener('submit', (e) => {
        e.preventDefault();
        const chatInput = document.getElementById('chatInput');
        const text = chatInput.value.trim();
        if (!text) return;

        messagesRef.push({
            author: currentUser ? currentUser.name : "Invitado Basado",
            avatar: currentUser ? currentUser.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
            text: text,
            timestamp: Date.now()
        });

        chatInput.value = '';
    });
}

function openProfileModal() {
    if (!currentUser) return;
    if (profilePreviewObjectUrl) URL.revokeObjectURL(profilePreviewObjectUrl);
    profilePreviewObjectUrl = "";
    document.getElementById('profileNickname').value = currentUser.name;
    document.getElementById('profileBirthdate').value = currentUser.birthdate || '';
    document.getElementById('profileAvatarUrl').value = currentUser.avatar || '';
    document.getElementById('profileAvatarPreview').src = currentUser.avatar || '';
    
    const fileInput = document.getElementById('profileAvatarFile');
    if (fileInput) fileInput.value = '';

    const ageInfo = calculateAgeInfo(currentUser.birthdate);
    document.getElementById('profileAgeBadge').value = ageInfo.label;
    document.getElementById('profileModal').classList.add('active');
}

window.selectPresetAvatar = function(url) {
    if (profilePreviewObjectUrl) URL.revokeObjectURL(profilePreviewObjectUrl);
    profilePreviewObjectUrl = "";
    document.getElementById('profileAvatarUrl').value = url;
    document.getElementById('profileAvatarPreview').src = url;
    const fileInput = document.getElementById('profileAvatarFile');
    if (fileInput) fileInput.value = '';
};

function updateUserUI() {
    if (currentUser) {
        userBtnText.textContent = currentUser.name;
        userAvatarNav.src = currentUser.avatar;
        userAvatarNav.classList.remove('hidden');

        if (currentUser.isMod || MODERATOR_EMAILS.includes(currentUser.email)) {
            btnAdminPanel.classList.remove('hidden');
        } else {
            btnAdminPanel.classList.add('hidden');
        }
    } else {
        userBtnText.textContent = "Ingresar";
        userAvatarNav.classList.add('hidden');
        btnAdminPanel.classList.add('hidden');
    }
    publishLosBasadosState('user', currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isAdult: Boolean(currentUser.isAdult),
        isMod: Boolean(currentUser.isMod || MODERATOR_EMAILS.includes(currentUser.email))
    } : null);
}
