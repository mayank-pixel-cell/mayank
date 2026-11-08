import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"]
    }
  },
  envPrefix: ["VITE_", "TAURI_ENV_*", "TAURI_PLATFORM", "TAURI_ARCH"],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === "windows" || process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari15",
    minify: !process.env.TAURI_ENV_DEBUG && !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG || !!process.env.TAURI_DEBUG,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        landing: resolve(__dirname, "landing.html")
      },
      output: {
        manualChunks: {
          "vendor-tauri": ["@tauri-apps/api", "@tauri-apps/plugin-store"],
          "arc-views": [
            "./src/views/trackerView.js",
            "./src/views/rulesView.js",
            "./src/views/resultsView.js",
            "./src/views/progressionView.js",
            "./src/views/settingsView.js",
            "./src/views/screentimeView.js",
            "./src/views/notificationsView.js"
          ]
        }
      }
    }
  }
});
