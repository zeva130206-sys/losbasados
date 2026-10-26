import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const requiredEnv = ["FIREBASE_API_KEY", "GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "PUBLIC_SITE_URL", "MODERATOR_EMAILS", "ALLOWED_ORIGINS"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length) {
  console.error(`Faltan variables de entorno requeridas: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const firebaseApiKey = process.env.FIREBASE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const githubOwner = process.env.GITHUB_OWNER;
const githubRepo = process.env.GITHUB_REPO;
const githubBranch = process.env.GITHUB_BRANCH || "main";
const publicSiteUrl = process.env.PUBLIC_SITE_URL.replace(/\/+$/, "");
const moderators = new Set(process.env.MODERATOR_EMAILS.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
const allowedOrigins = new Set(process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean));
const maxFileBytes = 8 * 1024 * 1024;
const maxConcurrentUploads = 2;
const uploadWindowMs = 60 * 60 * 1000;
const uploadsPerWindow = 12;
const uploadsByUser = new Map();
let concurrentUploads = 0;

const mimeExtensions = new Map([
  ["image/webp", "webp"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);
const allowedScopes = new Set(["chat", "private", "comments", "hero", "ads", "avatars"]);

function send(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function setCors(request, response) {
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return false;
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Media-Scope");
  return true;
}

async function readBody(request, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("El archivo supera el límite de 8 MB."), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, size);
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
  return { uid: user.localId, email: user.email.toLowerCase() };
}

function matchesSignature(buffer, mime) {
  if (mime === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/gif") return buffer.subarray(0, 6).toString("ascii").startsWith("GIF8");
  if (mime === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (mime === "video/mp4") return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  if (mime === "video/webm") return buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return false;
}

async function handleUpload(request, response, user) {
  const scope = request.headers["x-media-scope"];
  const mime = (request.headers["content-type"] || "").split(";")[0].toLowerCase();
  const extension = mimeExtensions.get(mime);
  if (!allowedScopes.has(scope) || !extension) return send(response, 400, { error: "Tipo de archivo o categoría no permitidos." });
  if (["hero", "ads"].includes(scope) && !moderators.has(user.email)) return send(response, 403, { error: "Solo un moderador verificado puede publicar este recurso." });
  if (concurrentUploads >= maxConcurrentUploads) return send(response, 503, { error: "Hay demasiadas subidas simultáneas. Inténtalo de nuevo." });

  const now = Date.now();
  const recentUploads = (uploadsByUser.get(user.uid) || []).filter((timestamp) => now - timestamp < uploadWindowMs);
  if (recentUploads.length >= uploadsPerWindow) return send(response, 429, { error: "Alcanzaste el límite temporal de subidas." });

  concurrentUploads += 1;
  try {
    const bytes = await readBody(request, maxFileBytes);
    if (!bytes.length || !matchesSignature(bytes, mime)) return send(response, 415, { error: "El contenido no coincide con el formato de archivo declarado." });

    const path = `public/assets/uploads/${scope}/${randomUUID()}.${extension}`;
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
        message: `Add ${scope} media`,
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
    const publicUrl = `${publicSiteUrl}/assets/uploads/${scope}/${path.split("/").pop()}`;
    return send(response, 201, { url: publicUrl, scope });
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

  if (request.method !== "POST" || path !== "/api/media") return send(response, 404, { error: "Ruta no encontrada." });

  try {
    const user = await verifyFirebaseUser(request);
    if (!user) return send(response, 401, { error: "Inicia sesión con un correo verificado para subir archivos." });
    return await handleUpload(request, response, user);
  } catch (error) {
    console.error("Media API request failed:", error);
    return send(response, 502, { error: "No se pudo verificar la sesión o guardar el archivo." });
  }
});

const port = Number(process.env.PORT || 8787);
server.listen(port, process.env.HOST || "0.0.0.0", () => console.log(`Media API escuchando en el puerto ${port}.`));
