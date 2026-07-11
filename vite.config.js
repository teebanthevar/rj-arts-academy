import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import VitePluginSitemap from "vite-plugin-sitemap";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), VitePluginSitemap({
    hostname: "https://rj-arts-academy.netlify.app",
  }), cloudflare()],
});