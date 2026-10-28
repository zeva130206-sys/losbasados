# Misiones de comunidad

La API de Render (`npm run media-api`) persiste misiones, envíos y perfiles de
EXP en Firebase Realtime Database, en la ruta `community_missions`. Las
operaciones que aprueban evidencias usan ETags (`If-Match`) para evitar que dos
revisiones concurrentes otorguen la recompensa más de una vez.

## Configuración privada en Render

Conserva las variables existentes de `.env.media-api.example` y añade:

- `FIREBASE_SERVICE_ACCOUNT_EMAIL`: `client_email` de una cuenta de servicio
  Firebase.
- `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`: `private_key`; Render acepta la clave
  con secuencias `\n`, que la API convierte al formato PEM.

La API usa OAuth con los permisos de Realtime Database. Mantén ambas variables
solo en el entorno privado de Render; nunca las añadas al frontend, al build de
Vite ni al repositorio. La API verifica el correo de Firebase Authentication y
aplica la lista `MODERATOR_EMAILS` del servidor para crear misiones y revisar
evidencias. Si la cuenta de servicio no puede acceder a Realtime Database, la
API devuelve un error y no otorga EXP.

## Rutas

Las rutas usan el origen del servicio de Render. Las operaciones autenticadas
reciben el ID token de Firebase en `Authorization: Bearer <token>` y requieren
un correo verificado, salvo las lecturas públicas de misiones y clasificación.

- `GET /api/missions` → `{ missions: Mission[] }` (misiones activas).
- `GET /api/leaderboard` → `{ leaderboard: { uid, displayName, xp, badges }[] }`.
  El UID permite asociar las insignias a reseñas futuras; no es una credencial.
- `POST /api/missions` (moderador) recibe `title`, `description`,
  `linkedGameId`, `linkedGameTitle`, `evidenceType` (`image` o `video`) y
  `rewardXp`.
- `POST /api/missions/submissions` recibe `missionId` y `evidenceUrl`. El
  servidor obtiene la identidad del token verificado, comprueba el tipo de
  evidencia requerido y permite un envío por usuario y misión.
- `GET /api/missions/submissions` (moderador) → `{ submissions: Submission[] }`.
- `POST /api/missions/submissions/:id/review` (moderador) recibe
  `{ decision: "approve" | "reject", note? }`.
- `POST /api/media` recibe bytes con el MIME en `Content-Type` y el scope
  `mission-evidence` para JPEG/PNG/WebP (máximo 1 MB) o `mission-video` para
  MP4/WebM (máximo 24 MB). La duración de video se limita a 30 segundos en el
  cliente; el servidor también verifica tamaño y firma del archivo.

Las URL de evidencia deben apuntar al sitio público bajo
`/assets/uploads/missions/`. Al aprobar, la API cambia el estado de la evidencia
y suma EXP/insignia dentro de la misma escritura condicional. Reintentar una
revisión ya terminada no vuelve a entregar la recompensa.

La interfaz está integrada en `src/CommunityMissions.tsx`, dentro de Comunidad.
Usa `window.__LOS_BASADOS_MEDIA_API__` y
`window.getLosBasadosAuthToken(): Promise<string | null>` del runtime actual.
