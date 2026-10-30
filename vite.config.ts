import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const [repositoryOwner, repositoryName] = (process.env.GITHUB_REPOSITORY || "").split("/");
const isUserOrOrganizationSite = repositoryName === `${repositoryOwner}.github.io`;
const hasCustomDomain = process.env.GITHUB_PAGES === "true" && process.env.GITHUB_CUSTOM_DOMAIN === "true";
const base = process.env.GITHUB_PAGES === "true" && !hasCustomDomain && repositoryName && !isUserOrOrganizationSite
  ? `/${repositoryName}/`
  : "/";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base,
});
