import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import prism from "vite-plugin-prismjs";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/stan-web-demo/",
  plugins: [
    react(),
    prism({
      languages: ["stan"],
      plugins: [],
      css: false,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("plotly")) {
            return "plotly";
          }
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
