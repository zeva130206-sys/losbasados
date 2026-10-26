import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const [repositoryOwner, repositoryName] = (process.env.GITHUB_REPOSITORY || "").split("/");
const isUserOrOrganizationSite = repositoryName === `${repositoryOwner}.github.io`;
const base = process.env.GITHUB_PAGES === "true" && repositoryName && !isUserOrOrganizationSite
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
