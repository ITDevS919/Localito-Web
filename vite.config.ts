import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./public"),
    },
  },
  server: {
    allowedHosts: ["localito.com", "www.localito.com"],
    port: 5173,
    // When opening the app at https://localito.com, HMR WebSocket must use the same host.
    // If you use a reverse proxy, ensure it forwards WebSocket to port 5173.
    hmr: {
      host: "localito.com",
      port: 5173,
      clientPort: 443,
      protocol: "wss",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
});

