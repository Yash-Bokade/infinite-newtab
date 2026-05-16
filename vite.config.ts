import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        // Sandboxed page — eval/new Function allowed here (MV3 sandbox page)
        sandbox: resolve(__dirname, "sandbox.html"),
      },
    },
  },
  publicDir: "public",
});
