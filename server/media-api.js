import { createServer } from "node:http";
import { createSign, randomUUID } from "node:crypto";

const requiredEnv = ["FIREBASE_API_KEY", "GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "PUBLIC_SITE_URL", "MODERATOR_EMAILS", "ALLOWED_ORIGINS"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length) {
  console.error(`Faltan variables de entorno requeridas: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const firebaseApiKey = process.env.FIREBASE_API_KEY;
const firebaseDatabaseUrl = "https://los-basados-default-rtdb.firebaseio.com";
const serviceAccountEmail = process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL;
const serviceAccountPrivateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
const githubToken = process.env.GITHUB_TOKEN;
const githubOwner = process.env.GITHUB_OWNER;
const githubRepo = process.env.GITHUB_REPO;
const githubBranch = process.env.GITHUB_BRANCH || "main";
const publicSiteUrl = process.env.PUBLIC_SITE_URL.replace(/\/+$/, "");
const moderators = new Set(process.env.MODERATOR_EMAILS.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
const allowedOrigins = new Set(process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean));
const maxFileBytes = 24 * 1024 * 1024;
const maxConcurrentUploads = 2;
const uploadWindowMs = 60 * 60 * 1000;
const uploadsPerWindow = 12;
const uploadsByUser = new Map();
let concurrentUploads = 0;

const mimeExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);
const allowedScopes = new Set(["chat", "private", "comments", "hero", "ads", "mission-evidence", "mission-video", "mission-cover", "based-game-cover", "based-game-preview"]);
let firebaseAccessToken = "";
let firebaseAccessTokenExpiresAt = 0;

class MissionServiceError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.status = status;
  }
}

function send(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function setCors(request, response) {
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return false;
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Media-Scope");
  return true;
}

async function readBody(request, limit, label = limit <= 1024 * 1024 ? "1 MB" : "24 MB") {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error(`El contenido supera el límite de ${label}.`), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, size);
}

async function readJsonBody(request, limit = 32 * 1024) {
  const body = await readBody(request, limit, "32 KB");
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw new MissionServiceError("El cuerpo de la solicitud no es JSON válido.", 400);
  }
}

async function verifyFirebaseUser(request) {
  const authorization = request.headers.authorization || "";
  const match = authorization.match(/^Bearer ([\w.-]+)$/);
  if (!match) return null;

  const result = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: match[1] }),
    signal: AbortSignal.timeout(8000),
  });
  if (!result.ok) return null;
  const body = await result.json();
  const user = body.users?.[0];
  if (!user?.emailVerified || !user.email || !user.localId) return null;
  return {
    uid: user.localId,
    email: user.email.toLowerCase(),
    displayName: typeof user.displayName === "string" ? user.displayName.trim().slice(0, 60) : "",
  };
}

function matchesSignature(buffer, mime) {
  if (mime === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (mime === "video/mp4") return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  if (mime === "video/webm") return buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return false;
}

function firebaseStoreReady() {
  if (!serviceAccountEmail || !serviceAccountPrivateKey) {
    throw new MissionServiceError("Las misiones y Juegos Basados requieren FIREBASE_SERVICE_ACCOUNT_EMAIL y FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY en el servidor.");
  }
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

async function getFirebaseAccessToken() {
  firebaseStoreReady();
  if (firebaseAccessToken && Date.now() < firebaseAccessTokenExpiresAt - 60_000) return firebaseAccessToken;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(serviceAccountPrivateKey, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new MissionServiceError("No se pudo autenticar la cuenta de servicio de Firebase.");
  const tokenBody = await response.json();
  if (typeof tokenBody.access_token !== "string" || !Number.isFinite(tokenBody.expires_in)) {
    throw new MissionServiceError("Firebase devolvió una respuesta de autenticación inválida.");
  }
  firebaseAccessToken = tokenBody.access_token;
  firebaseAccessTokenExpiresAt = Date.now() + tokenBody.expires_in * 1000;
  return firebaseAccessToken;
}

async function readMissionStore() {
  const token = await getFirebaseAccessToken();
  const response = await fetch(`${firebaseDatabaseUrl}/community_missions.json`, {
    headers: { Authorization: `Bearer ${token}`, "X-Firebase-ETag": "true" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new MissionServiceError(`Realtime Database respondió ${response.status}.`);
  const data = await response.json();
  const etag = response.headers.get("ETag");
  if (!etag) throw new MissionServiceError("Realtime Database no devolvió el ETag necesario para una escritura segura.");
  return { data: data && typeof data === "object" ? data : {}, etag };
}

async function writeMissionStore(data, etag) {
  const token = await getFirebaseAccessToken();
  const response = await fetch(`${firebaseDatabaseUrl}/community_missions.json`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": etag,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(12000),
  });
  if (response.status === 412) return false;
  if (!response.ok) throw new MissionServiceError(`Realtime Database respondió ${response.status} al guardar misiones.`);
  return true;
}

async function mutateMissionStore(mutator) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const snapshot = await readMissionStore();
    const store = {
      missions: snapshot.data.missions && typeof snapshot.data.missions === "object" ? snapshot.data.missions : {},
      submissions: snapshot.data.submissions && typeof snapshot.data.submissions === "object" ? snapshot.data.submissions : {},
      profiles: snapshot.data.profiles && typeof snapshot.data.profiles === "object" ? snapshot.data.profiles : {},
    };
    const result = mutator(store);
    if (!result.write) return result.value;
    if (await writeMissionStore(store, snapshot.etag)) return result.value;
  }
  throw new MissionServiceError("No se pudo completar la operación concurrente. Inténtalo de nuevo.", 503);
}

async function getMissionStore() {
  const { data } = await readMissionStore();
  return {
    missions: data.missions && typeof data.missions === "object" ? data.missions : {},
    submissions: data.submissions && typeof data.submissions === "object" ? data.submissions : {},
    profiles: data.profiles && typeof data.profiles === "object" ? data.profiles : {},
  };
}

async function readBasedGamesStore() {
  const token = await getFirebaseAccessToken();
  const response = await fetch(`${firebaseDatabaseUrl}/based_games.json`, {
    headers: { Authorization: `Bearer ${token}`, "X-Firebase-ETag": "true" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new MissionServiceError(`Realtime Database respondió ${response.status} al leer Juegos Basados.`);
  const data = await response.json();
  const etag = response.headers.get("ETag");
  if (!etag) throw new MissionServiceError("Realtime Database no devolvió el ETag necesario para guardar Juegos Basados.");
  return { data: data && typeof data === "object" ? data : {}, etag };
}

async function writeBasedGamesStore(data, etag) {
  const token = await getFirebaseAccessToken();
  const response = await fetch(`${firebaseDatabaseUrl}/based_games.json`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": etag,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(12000),
  });
  if (response.status === 412) return false;
  if (!response.ok) throw new MissionServiceError(`Realtime Database respondió ${response.status} al guardar Juegos Basados.`);
  return true;
}

async function mutateBasedGamesStore(mutator) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const snapshot = await readBasedGamesStore();
    const games = Object.fromEntries(missionObjectEntries(snapshot.data));
    const result = mutator(games);
    if (!result.write) return result.value;
    if (await writeBasedGamesStore(games, snapshot.etag)) return result.value;
  }
  throw new MissionServiceError("No se pudo completar la operación concurrente. Inténtalo de nuevo.", 503);
}

function missionPublicUrl(value) {
  if (typeof value !== "string" || value.length > 700) return false;
  let url;
  let site;
  try {
    url = new URL(value);
    site = new URL(publicSiteUrl);
  } catch {
    return false;
  }
  const pathPrefix = `${site.pathname.replace(/\/+$/, "")}/assets/uploads/missions/`;
  return url.origin === site.origin && url.pathname.startsWith(pathPrefix) &&
    /^\/?[0-9a-f-]{36}\.(?:jpg|png|webp|mp4|webm)$/i.test(url.pathname.slice(pathPrefix.length)) &&
    !url.search && !url.hash;
}

function basedGameMediaUrl(value, expectedKind) {
  if (typeof value !== "string" || value.length > 700) return false;
  let url;
  let site;
  try {
    url = new URL(value);
    site = new URL(publicSiteUrl);
  } catch {
    return false;
  }
  const pathPrefix = `${site.pathname.replace(/\/+$/, "")}/assets/uploads/based-games/`;
  const file = url.pathname.slice(pathPrefix.length);
  const extension = file.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  const isImage = ["jpg", "png", "webp"].includes(extension);
  const isVideo = ["mp4", "webm"].includes(extension);
  return url.origin === site.origin && url.pathname.startsWith(pathPrefix) &&
    /^\/?[0-9a-f-]{36}\.(?:jpg|png|webp|mp4|webm)$/i.test(file) &&
    !url.search && !url.hash && (expectedKind === "image" ? isImage : expectedKind === "video" ? isVideo : false);
}

function validateBasedGame(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const genre = typeof body.genre === "string" ? body.genre.trim() : "";
  const mode = body.mode;
  const thumbnailUrl = body.thumbnailUrl;
  const previewUrl = typeof body.previewUrl === "string" ? body.previewUrl.trim() : "";
  const gameUrl = typeof body.gameUrl === "string" ? body.gameUrl.trim() : "";
  const players = Number(body.players);
  const rating = Number(body.rating);
  let parsedGameUrl;
  try {
    parsedGameUrl = new URL(gameUrl);
  } catch {
    parsedGameUrl = null;
  }
  if (title.length < 2 || title.length > 80 || description.length < 10 || description.length > 1200 ||
      genre.length < 2 || genre.length > 40 || !["singleplayer", "multiplayer"].includes(mode) ||
      !Number.isInteger(players) || players < 1 || players > 1000 ||
      !Number.isFinite(rating) || rating < 0 || rating > 5 ||
      !basedGameMediaUrl(thumbnailUrl, "image") ||
      (previewUrl && !basedGameMediaUrl(previewUrl, "video")) ||
      !parsedGameUrl || parsedGameUrl.protocol !== "https:" || parsedGameUrl.username || parsedGameUrl.password ||
      gameUrl.length > 1500) {
    return { error: "Revisa los datos: título, descripción, género, jugadores, modo, calificación, portada, video y una URL HTTPS válida para el juego." };
  }
  return {
    game: {
      title,
      description,
      genre,
      mode,
      players,
      rating: Math.round(rating * 10) / 10,
      thumbnailUrl,
      previewUrl,
      gameUrl: parsedGameUrl.href,
    },
  };
}

async function handleBasedGamesApi(request, response, user, path) {
  if (request.method === "GET" && path === "/api/based-games") {
    const { data } = await readBasedGamesStore();
    const games = missionObjectEntries(data)
      .map(([id, game]) => ({ id, ...game }))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return send(response, 200, { games: games.slice(0, 100) });
  }
  if (!user) return send(response, 401, { error: "Inicia sesión con un correo verificado." });
  if (!moderators.has(user.email)) return send(response, 403, { error: "Solo un moderador puede gestionar Juegos Basados." });

  if (request.method === "POST" && path === "/api/based-games") {
    const result = validateBasedGame(await readJsonBody(request));
    if (result.error) return send(response, 400, { error: result.error });
    const id = randomUUID();
    const game = { ...result.game, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await mutateBasedGamesStore((games) => {
      games[id] = game;
      return { write: true };
    });
    return send(response, 201, { id, ...game });
  }

  const match = path.match(/^\/api\/based-games\/([0-9a-f-]{36})$/i);
  if (!match) return send(response, 404, { error: "Ruta no encontrada." });
  const id = match[1];
  if (request.method === "PUT") {
    const result = validateBasedGame(await readJsonBody(request));
    if (result.error) return send(response, 400, { error: result.error });
    const game = await mutateBasedGamesStore((games) => {
      if (!games[id]) return { write: false, value: null };
      games[id] = { ...games[id], ...result.game, updatedAt: new Date().toISOString() };
      return { write: true, value: games[id] };
    });
    if (!game) return send(response, 404, { error: "No se encontró el juego." });
    return send(response, 200, { id, ...game });
  }
  if (request.method === "DELETE") {
    const removed = await mutateBasedGamesStore((games) => {
      if (!games[id]) return { write: false, value: false };
      delete games[id];
      return { write: true, value: true };
    });
    if (!removed) return send(response, 404, { error: "No se encontró el juego." });
    return send(response, 200, { id, deleted: true });
  }
  return send(response, 405, { error: "Método no permitido." });
}

function missionUploadKind(url) {
  return /\.(?:mp4|webm)$/i.test(url) ? "video" : "image";
}

function missionObjectEntries(value) {
  return Object.entries(value).filter(([, item]) => item && typeof item === "object");
}

async function createMission(request, response) {
  const body = await readJsonBody(request);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const linkedGameId = typeof body.linkedGameId === "string" ? body.linkedGameId.trim() : "";
  const linkedGameTitle = typeof body.linkedGameTitle === "string" ? body.linkedGameTitle.trim() : "";
  const evidenceType = body.evidenceType;
  const coverUrl = body.coverUrl;
  const coverType = body.coverType;
  const rewardXp = Number(body.rewardXp);
  if (title.length < 3 || title.length > 80 || description.length < 10 || description.length > 1200 ||
      linkedGameId.length < 1 || linkedGameId.length > 100 || linkedGameTitle.length < 1 || linkedGameTitle.length > 100 ||
      !["image", "video"].includes(evidenceType) || !missionPublicUrl(coverUrl) ||
      !["image", "video"].includes(coverType) || missionUploadKind(coverUrl) !== coverType ||
      !Number.isInteger(rewardXp) || rewardXp < 10 || rewardXp > 5000) {
    return send(response, 400, { error: "Revisa el título, descripción, juego, visual de portada, tipo de evidencia y recompensa (10–5000 EXP)." });
  }
  const id = randomUUID();
  const mission = { title, description, linkedGameId, linkedGameTitle, coverUrl, coverType, evidenceType, rewardXp, active: true, createdAt: new Date().toISOString() };
  await mutateMissionStore((store) => {
    store.missions[id] = mission;
    return { write: true };
  });
  return send(response, 201, { id, ...mission });
}

async function submitMission(request, response, user) {
  const body = await readJsonBody(request);
  const missionId = typeof body.missionId === "string" ? body.missionId : "";
  const evidenceUrl = body.evidenceUrl;
  if (!/^[0-9a-f-]{36}$/i.test(missionId) || !missionPublicUrl(evidenceUrl)) {
    return send(response, 400, { error: "Selecciona una misión y adjunta una imagen o video cargado al servidor." });
  }
  const id = `${missionId}_${user.uid}`;
  const evidenceType = missionUploadKind(evidenceUrl);
  const result = await mutateMissionStore((store) => {
    const mission = store.missions[missionId];
    if (!mission) return { write: false, value: { status: 404, body: { error: "La misión ya no existe." } } };
    if (mission.active !== true) return { write: false, value: { status: 409, body: { error: "Esta misión no acepta nuevas evidencias." } } };
    if (mission.evidenceType !== evidenceType) {
      return { write: false, value: { status: 400, body: { error: `Esta misión requiere ${mission.evidenceType === "video" ? "un video" : "una imagen"}.` } } };
    }
    if (store.submissions[id]) return { write: false, value: { status: 409, body: { error: "Ya enviaste una evidencia para esta misión." } } };
    const submission = {
      missionId,
      missionTitle: mission.title,
      userId: user.uid,
      displayName: user.displayName || `Basado ${user.uid.slice(-5)}`,
      evidenceUrl,
      evidenceType,
      status: "pending",
      rewardXp: mission.rewardXp,
      submittedAt: new Date().toISOString(),
    };
    store.submissions[id] = submission;
    return { write: true, value: { status: 201, body: { id, ...submission } } };
  });
  return send(response, result.status, result.body);
}

async function reviewMissionSubmission(request, response, submissionId, moderator) {
  const body = await readJsonBody(request);
  const decision = body.decision;
  const reviewNote = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  if (!["approve", "reject"].includes(decision) || !/^[0-9a-z_-]{1,180}$/i.test(submissionId)) {
    return send(response, 400, { error: "La decisión o el identificador de evidencia no son válidos." });
  }
  const result = await mutateMissionStore((store) => {
    const submission = store.submissions[submissionId];
    if (!submission) return { write: false, value: { status: 404, body: { error: "No se encontró la evidencia." } } };
    if (submission.status !== "pending") {
      return { write: false, value: { status: 200, body: { id: submissionId, status: submission.status, alreadyReviewed: true } } };
    }
    const newStatus = decision === "approve" ? "approved" : "rejected";
    const updatedSubmission = { ...submission, status: newStatus, reviewNote, reviewedAt: new Date().toISOString(), reviewedBy: moderator.email };
    let rewardApplied = 0;
    if (decision === "approve") {
      const mission = store.missions[submission.missionId];
      if (!mission || mission.rewardXp !== submission.rewardXp ||
          !Number.isInteger(mission.rewardXp) || mission.rewardXp < 10 || mission.rewardXp > 5000) {
        return { write: false, value: { status: 409, body: { error: "No se pudo validar la recompensa; no se otorgó EXP." } } };
      }
      const profile = store.profiles[submission.userId] || {};
      const xp = Number.isSafeInteger(profile.xp) && profile.xp >= 0 ? profile.xp : 0;
      if (!Number.isSafeInteger(xp + mission.rewardXp)) {
        return { write: false, value: { status: 409, body: { error: "La recompensa excede el límite de EXP permitido." } } };
      }
      store.profiles[submission.userId] = {
        ...profile,
        xp: xp + mission.rewardXp,
        badges: Array.isArray(profile.badges) && profile.badges.includes("mission-complete")
          ? profile.badges
          : [...(Array.isArray(profile.badges) ? profile.badges : []), "mission-complete"],
        displayName: profile.displayName || submission.displayName || `Basado ${submission.userId.slice(-5)}`,
      };
      rewardApplied = mission.rewardXp;
    }
    store.submissions[submissionId] = updatedSubmission;
    return { write: true, value: { status: 200, body: { id: submissionId, status: newStatus, rewardXp: rewardApplied } } };
  });
  return send(response, result.status, result.body);
}

async function handleMissionsApi(request, response, user, path) {
  if (request.method === "GET" && path === "/api/missions") {
    const store = await getMissionStore();
    const missions = missionObjectEntries(store.missions)
      .map(([id, mission]) => ({ id, ...mission }))
      .filter((mission) => mission.active === true)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return send(response, 200, { missions: missions.slice(0, 100) });
  }
  if (request.method === "GET" && path === "/api/leaderboard") {
    const store = await getMissionStore();
    const leaderboard = missionObjectEntries(store.profiles)
      .filter(([, profile]) => Number.isSafeInteger(profile.xp) && profile.xp > 0)
      .sort(([, a], [, b]) => b.xp - a.xp)
      .slice(0, 50)
      .map(([uid, profile]) => ({
        uid,
        displayName: profile.displayName || `Basado ${uid.slice(-5)}`,
        xp: profile.xp,
        badges: Array.isArray(profile.badges) ? profile.badges : [],
      }));
    return send(response, 200, { leaderboard });
  }
  const missionGalleryMatch = path.match(/^\/api\/missions\/([0-9a-f-]{36})\/submissions$/i);
  if (request.method === "GET" && missionGalleryMatch) {
    const missionId = decodeURIComponent(missionGalleryMatch[1]);
    const store = await getMissionStore();
    if (!store.missions[missionId]) return send(response, 404, { error: "No se encontró la misión." });
    const submissions = missionObjectEntries(store.submissions)
      .filter(([, submission]) => submission.missionId === missionId && ["pending", "approved"].includes(submission.status))
      .sort(([, a], [, b]) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
      .slice(0, 100)
      .map(([id, submission]) => ({
        id,
        displayName: submission.displayName || "Jugador",
        evidenceUrl: submission.evidenceUrl,
        evidenceType: submission.evidenceType,
        status: submission.status,
        submittedAt: submission.submittedAt,
      }));
    return send(response, 200, { submissions });
  }
  if (!user) return send(response, 401, { error: "Inicia sesión con un correo verificado." });
  const isModerator = moderators.has(user.email);
  if (request.method === "POST" && path === "/api/missions") {
    if (!isModerator) return send(response, 403, { error: "Solo un moderador puede crear misiones." });
    return createMission(request, response);
  }
  if (request.method === "POST" && path === "/api/missions/submissions") return submitMission(request, response, user);
  if (request.method === "GET" && path === "/api/missions/submissions") {
    if (!isModerator) return send(response, 403, { error: "Solo un moderador puede revisar evidencias." });
    const store = await getMissionStore();
    const submissions = missionObjectEntries(store.submissions)
      .map(([id, submission]) => ({ id, ...submission }))
      .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    return send(response, 200, { submissions: submissions.slice(0, 200) });
  }
  const reviewMatch = path.match(/^\/api\/missions\/submissions\/([^/]+)\/review$/);
  if (request.method === "POST" && reviewMatch) {
    if (!isModerator) return send(response, 403, { error: "Solo un moderador puede revisar evidencias." });
    return reviewMissionSubmission(request, response, decodeURIComponent(reviewMatch[1]), user);
  }
  return send(response, 404, { error: "Ruta no encontrada." });
}

async function handleUpload(request, response, user) {
  const scope = request.headers["x-media-scope"];
  const mime = (request.headers["content-type"] || "").split(";")[0].toLowerCase();
  const extension = mimeExtensions.get(mime);
  const isMissionEvidence = scope === "mission-evidence" || scope === "mission-video";
  const isMissionCover = scope === "mission-cover";
  const isBasedGameCover = scope === "based-game-cover";
  const isBasedGamePreview = scope === "based-game-preview";
  const isMissionImage = (scope === "mission-evidence" || isMissionCover) && mime.startsWith("image/");
  const isMissionVideo = (scope === "mission-video" || isMissionCover) && mime.startsWith("video/");
  const isBasedGameImage = isBasedGameCover && mime.startsWith("image/");
  const isBasedGameVideo = isBasedGamePreview && mime.startsWith("video/");
  if (!allowedScopes.has(scope) || !extension ||
      (scope === "mission-evidence" && !isMissionImage) ||
      (scope === "mission-video" && !isMissionVideo) ||
      (isMissionCover && !isMissionImage && !isMissionVideo) ||
      (isBasedGameCover && !isBasedGameImage) ||
      (isBasedGamePreview && !isBasedGameVideo) ||
      (!isMissionEvidence && !isMissionCover && !isBasedGameCover && !isBasedGamePreview && !mime.startsWith("video/"))) {
    return send(response, 400, { error: "Formato de archivo no admitido para este tipo de subida." });
  }
  const uploadLimit = isMissionImage || isBasedGameImage ? 1024 * 1024 : maxFileBytes;
  if (["hero", "ads", "mission-cover", "based-game-cover", "based-game-preview"].includes(scope) && !moderators.has(user.email)) return send(response, 403, { error: "Solo un moderador verificado puede publicar este recurso." });
  if (concurrentUploads >= maxConcurrentUploads) return send(response, 503, { error: "Hay demasiadas subidas simultáneas. Inténtalo de nuevo." });

  const now = Date.now();
  const recentUploads = (uploadsByUser.get(user.uid) || []).filter((timestamp) => now - timestamp < uploadWindowMs);
  if (recentUploads.length >= uploadsPerWindow) return send(response, 429, { error: "Alcanzaste el límite temporal de subidas." });

  concurrentUploads += 1;
  try {
    const bytes = await readBody(request, uploadLimit);
    if (!bytes.length || !matchesSignature(bytes, mime)) return send(response, 415, { error: "El contenido no coincide con el formato de archivo declarado." });

    const uploadDirectory = isMissionEvidence || isMissionCover ? "missions" : isBasedGameCover || isBasedGamePreview ? "based-games" : scope;
    const path = `public/assets/uploads/${uploadDirectory}/${randomUUID()}.${extension}`;
    const githubResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(githubOwner)}/${encodeURIComponent(githubRepo)}/contents/${path}`, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "los-basados-media-api",
      },
      body: JSON.stringify({
        message: `Add ${uploadDirectory} media`,
        content: bytes.toString("base64"),
        branch: githubBranch,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!githubResponse.ok) {
      const details = await githubResponse.text();
      console.error(`GitHub Contents API returned ${githubResponse.status}: ${details.slice(0, 500)}`);
      return send(response, 502, { error: "GitHub no pudo guardar el archivo. Revisa la configuración del backend y del repositorio." });
    }

    recentUploads.push(now);
    uploadsByUser.set(user.uid, recentUploads);
    const publicUrl = `${publicSiteUrl}/assets/uploads/${uploadDirectory}/${path.split("/").pop()}`;
    return send(response, 201, {
      url: publicUrl,
      scope,
      mediaType: isMissionVideo || isBasedGameVideo ? "video" : isMissionImage || isBasedGameImage ? "image" : "video",
    });
  } catch (error) {
    console.error("Media upload failed:", error);
    return send(response, error.status || 502, { error: error.status ? error.message : "No se pudo guardar el archivo en GitHub." });
  } finally {
    concurrentUploads -= 1;
  }
}

const server = createServer(async (request, response) => {
  const path = new URL(request.url || "/", "http://localhost").pathname;
  if (request.method === "GET" && path === "/health") return send(response, 200, { status: "ok" });

  if (request.method === "OPTIONS") {
    if (!setCors(request, response)) return send(response, 403, { error: "Origen no permitido." });
    response.writeHead(204);
    return response.end();
  }
  if (!setCors(request, response)) return send(response, 403, { error: "Origen no permitido." });

  if (request.method === "GET" &&
      (["/api/missions", "/api/leaderboard", "/api/based-games"].includes(path) ||
       /^\/api\/missions\/[0-9a-f-]{36}\/submissions$/i.test(path))) {
    try {
      if (path.startsWith("/api/based-games")) return await handleBasedGamesApi(request, response, null, path);
      return await handleMissionsApi(request, response, null, path);
    } catch (error) {
      console.error("Mission API request failed:", error);
      return send(response, error.status || 503, { error: error.message || "El servicio de misiones no está disponible." });
    }
  }
  if (path !== "/api/media" && !path.startsWith("/api/missions/") && path !== "/api/missions" &&
      !path.startsWith("/api/based-games")) {
    return send(response, 404, { error: "Ruta no encontrada." });
  }

  try {
    const user = await verifyFirebaseUser(request);
    if (!user) return send(response, 401, { error: "Inicia sesión con un correo verificado para subir archivos." });
    if (path === "/api/media" && request.method === "POST") return await handleUpload(request, response, user);
    if (path.startsWith("/api/based-games")) return await handleBasedGamesApi(request, response, user, path);
    return await handleMissionsApi(request, response, user, path);
  } catch (error) {
    console.error("Media or mission API request failed:", error);
    return send(response, error.status || 502, { error: error.message || "No se pudo verificar la sesión o completar la solicitud." });
  }
});

const port = Number(process.env.PORT || 8787);
server.listen(port, process.env.HOST || "0.0.0.0", () => console.log(`Media API escuchando en el puerto ${port}.`));
