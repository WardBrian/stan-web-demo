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
  server: {
    host: "127.0.0.1",
  },
});
