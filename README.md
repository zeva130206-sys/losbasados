# Los Basados

Página de comunidad y catálogo de juegos con React, Vite y componentes shadcn/ui.

La interfaz presenta Inicio, Catálogo, Juegos Basados, Comunidad y Mi Lista. El catálogo existente conserva búsqueda, favoritos y filtros; Juegos Basados aloja creaciones HTML con fichas, previews y ejecución aislada en el navegador. Los flujos de Firebase, autenticación, chat y moderación se conservan en el motor legado que conecta estas pantallas con los datos actuales.

## Desarrollo local

1. Instala Node.js 20 o posterior.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev` y abre la dirección local que muestra Vite.

## GitHub Pages

El workflow de `.github/workflows/pages.yml` compila la aplicación y publica `dist` en GitHub Pages cuando se envía un cambio a `main`. GitHub Pages calcula automáticamente la ruta base según el nombre del repositorio; si es un sitio de usuario (`<usuario>.github.io`), publica desde `/`.

Para publicarlo, sube el proyecto fuente a un repositorio GitHub (incluye `src/`, `public/`, `index.html`, los archivos de configuración, `package.json`, `package-lock.json` y `.github/`). Después configura **Settings → Pages → Build and deployment → Source: GitHub Actions**. El workflow publica cada cambio enviado a `main`; también se puede ejecutar manualmente desde **Actions**.

No subas `node_modules/` ni `dist/`: son dependencias y archivos de compilación generados, excluidos por `.gitignore`. No elimines `public/legacy.html` ni `public/assets/js/main.js`: el runtime React todavía usa ese motor para los diálogos, moderación y datos de Firebase. El `index.html` de la raíz es la entrada de Vite; `public/legacy.html` es una plantilla interna cargada por la aplicación, no una segunda entrada de sitio.

Si el repositorio no se llama `<usuario>.github.io`, la dirección publicada normalmente tendrá la forma `https://<usuario>.github.io/<repositorio>/`. La URL exacta aparece en la ejecución del workflow y en **Settings → Pages**.

## Subida de imágenes y videos

Las imágenes de perfil y otros flujos existentes se guardan comprimidas en Firebase Realtime Database. Los medios de portada y preview de misiones/Juegos Basados usan la API Node de `server/media-api.js`, que los almacena en el repositorio porque GitHub Pages no puede ejecutar ese servicio. Las imágenes admiten hasta 1 MB; los videos MP4/WebM, hasta 24 MB y 30 segundos. El cliente comprueba proporción y duración antes de subir y la API valida permisos, tamaño y firma del archivo.

1. En Render, crea un **Blueprint** desde el repositorio `zeva130206-sys/losbasados` y confirma el despliegue de `render.yaml`.
2. Cuando Render solicite los valores privados, introduce `FIREBASE_API_KEY` (la clave web de la app en Firebase Console → Project settings → General), `GITHUB_TOKEN` y las credenciales de una cuenta de servicio Firebase (`FIREBASE_SERVICE_ACCOUNT_EMAIL` y `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`) para misiones y Juegos Basados. Crea el token fine-grained con acceso únicamente a este repositorio y permiso **Contents: Read and write**. No pongas tokens ni claves privadas en archivos del proyecto ni los compartas por chat.
3. Espera a que el servicio `losbasados-media-api` termine el despliegue. Copia su URL pública, por ejemplo `https://losbasados-media-api.onrender.com`.
4. En GitHub, abre **Settings → Secrets and variables → Actions → New repository secret**. Crea `VITE_MEDIA_API_URL` con la URL de Render, sin `/` al final.
5. En GitHub, abre **Actions → Deploy to GitHub Pages → Run workflow** para reconstruir la web con esa URL.

En el formulario de juegos, la imagen de catálogo usa proporción 16:10; la portada del detalle es vertical (recomendado 3:4); y el visual del carrusel es obligatorio y debe ser 16:9, ya sea imagen o video. El panel valida las proporciones del catálogo y del carrusel antes de guardar.

El Blueprint ya define el repositorio, la rama, el origen de GitHub Pages y los correos moderadores actuales. Render Free puede tardar en despertar tras un periodo sin uso. La API de Render recibe solo videos y requiere una sesión con correo verificado; los archivos publicados son accesibles públicamente.

## Misiones de comunidad

La sección de Comunidad permite a moderadores publicar misiones con portada y recompensa. Cualquier usuario puede abrir el detalle y participar con una cuenta verificada; las evidencias pendientes y aprobadas aparecen en la galería pública de cada misión. La aprobación actualiza estado, EXP e insignia de forma condicional para impedir recompensas duplicadas. El componente sigue los temas claro y oscuro de la web. Las misiones y la clasificación se guardan en Firebase Realtime Database bajo `community_missions`; configura las credenciales de servicio solo en el entorno privado de Render. Límites y rutas: [server/COMMUNITY_MISSIONS.md](./server/COMMUNITY_MISSIONS.md).

## Juegos Basados

Los moderadores administran el catálogo desde la pestaña correspondiente del panel existente. Las fichas guardan metadatos en `based_games`; portadas 16:10 y previews se suben mediante scopes de medios con permisos de moderador. Publica el juego en una URL HTTPS y registra el enlace, o sube un ZIP del proyecto con `index.html` en la raíz desde el panel de moderación. El ZIP se publica en una carpeta propia para conservar CSS, JavaScript y otros recursos relativos. El iframe se ejecuta aislado del origen principal. Configuración de datos, rutas y límites: [server/BASED_GAMES.md](./server/BASED_GAMES.md).

## Componentes shadcn/ui

El proyecto está preparado con `components.json`, Tailwind y el alias `@/`. El botón inicial está en `src/components/ui/button.tsx`. Para añadir más componentes, usa `npx shadcn@latest add <componente>`.
