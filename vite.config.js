import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "RJ Arts Academy",
        short_name: "RJ Arts Academy",
        description:
          "Professional drawing, painting, sketching, colouring, acrylic and watercolour art classes for children and adults in Slim River, Perak.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#064e3b",
        background_color: "#ffffff",

        icons: [
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  base: "/",
});