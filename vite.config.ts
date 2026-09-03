import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // O build --ssr (entry-server.tsx, ver scripts/prerender.ts) não serve
    // HTML final ao navegador — o plugin de PWA só faz sentido no build
    // client, que é quem realmente injeta o <link rel="manifest"> e o
    // registro do service worker.
    ...(isSsrBuild
      ? []
      : [
          VitePWA({
            registerType: "autoUpdate",
            devOptions: { enabled: true },
            manifest: {
              name: "Patamar",
              short_name: "Patamar",
              description: "Calculadoras financeiras para planejar decisões de longo prazo.",
              lang: "pt-BR",
              theme_color: "#2a78d6",
              background_color: "#ffffff",
              display: "standalone",
              start_url: "/",
              icons: [
                { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
                { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
                {
                  src: "/icons/icon-maskable-512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
                },
              ],
            },
          }),
        ]),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}))
