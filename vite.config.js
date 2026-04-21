import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  base: '/spinesync/',
  server: {
    port: 5173,
    open: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
