# Juegos Basados

Los metadatos de los juegos se guardan en el nodo `based_games` de Firebase
Realtime Database. El nodo aparece al publicar el primer juego mediante la API;
no se permite escritura directa desde el navegador. El servicio de Render usa
la cuenta de servicio privada ya configurada y compara ETags al crear, editar o
eliminar registros.

## Metadatos

Cada juego contiene:

- `id`, `title`, `description` y `genre`.
- `thumbnailUrl`: imagen JPEG, PNG o WebP publicada en
  `/assets/uploads/based-games/`, con proporción 16:10 y máximo 1 MB.
- `previewUrl`: video MP4/WebM opcional, máximo 24 MB y 30 segundos.
- `players`: cantidad de jugadores admitidos (1–1000).
- `rating`: calificación de 0 a 5.
- `mode`: `singleplayer` o `multiplayer`.
- `gameUrl`: URL HTTPS del HTML publicado.
- `createdAt` y `updatedAt`.

Los archivos del juego HTML no se cargan mediante la API de medios. Publica el
juego en HTTPS y registra su enlace. El iframe permite scripts y pointer lock,
pero no concede `allow-same-origin`, navegación superior, formularios ni
ventanas emergentes. El juego queda aislado del origen de la web; los juegos
que necesiten cookies, almacenamiento del mismo origen o comunicación entre
orígenes deben adaptarse a esa política. El servidor de alojamiento del juego
también debe permitir que la página se muestre en un iframe.

## API

- `GET /api/based-games` es público y devuelve `{ games: BasedGame[] }`.
- `POST /api/based-games` crea un juego; solo un moderador con email verificado.
- `PUT /api/based-games/:id` actualiza un juego; solo moderadores verificados.
- `DELETE /api/based-games/:id` elimina un juego; solo moderadores verificados.
- `POST /api/media` acepta los scopes `based-game-cover` (imagen, 1 MB) y
  `based-game-preview` (video, 24 MB); ambos están limitados a moderadores.

El cliente comprueba proporción de portada, firma, peso y duración de preview.
La API valida nuevamente identidad, permisos, URL HTTPS, formato del recurso y
límites de metadatos antes de escribir.

La interfaz React vive en `src/BasedGames.tsx`. Su catálogo, detalle y widget de
recomendación se muestran solo en `#/based-games`; la recomendación requiere al
menos dos juegos publicados. La pestaña de moderación existente enlaza con el
gestor React. Build y producción requieren `VITE_MEDIA_API_URL` apuntando al
servicio Render; conserva las credenciales de Firebase y GitHub únicamente como
variables privadas del servicio, nunca en el frontend ni en el repositorio.
