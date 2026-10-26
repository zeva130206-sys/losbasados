# Los Basados

Página de comunidad y catálogo de juegos con React, Vite y componentes shadcn/ui.

La interfaz presenta dos vistas: Inicio, con el juego destacado y descubrimiento editorial; y Catálogo, con búsqueda, favoritos, filtros por categoría, plataforma y tamaño. Los flujos de Firebase, autenticación, chat y moderación se conservan en el motor legado que conecta estas pantallas con los datos actuales.

## Desarrollo local

1. Instala Node.js 20 o posterior.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev` y abre la dirección local que muestra Vite.

## GitHub Pages

El workflow de `.github/workflows/pages.yml` compila la aplicación y publica `dist` en GitHub Pages cuando se envía un cambio a `main`. GitHub Pages calcula automáticamente la ruta base según el nombre del repositorio; si es un sitio de usuario (`<usuario>.github.io`), publica desde `/`.

Para publicarlo, sube el proyecto fuente a un repositorio GitHub (incluye `src/`, `public/`, `index.html`, los archivos de configuración, `package.json`, `package-lock.json` y `.github/`). Después configura **Settings → Pages → Build and deployment → Source: GitHub Actions**. El workflow publica cada cambio enviado a `main`; también se puede ejecutar manualmente desde **Actions**.

No subas `node_modules/` ni `dist/`: son dependencias y archivos de compilación generados, excluidos por `.gitignore`. No elimines `public/legacy.html` ni `public/assets/js/main.js`: el runtime React todavía usa ese motor para los diálogos, moderación y datos de Firebase. El `index.html` de la raíz es la entrada de Vite; `public/legacy.html` es una plantilla interna cargada por la aplicación, no una segunda entrada de sitio.

Si el repositorio no se llama `<usuario>.github.io`, la dirección publicada normalmente tendrá la forma `https://<usuario>.github.io/<repositorio>/`. La URL exacta aparece en la ejecución del workflow y en **Settings → Pages**.

## Componentes shadcn/ui

El proyecto está preparado con `components.json`, Tailwind y el alias `@/`. El botón inicial está en `src/components/ui/button.tsx`. Para añadir más componentes, usa `npx shadcn@latest add <componente>`.
