import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";
import NodeGlobalsPolyfillPlugin from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [
    react(),
    reactRefresh(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true,
    }),
  ],
  esbuild: {},
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      util: "util",
      process: "process/browser",
      "@": resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: false,
        }),
      ],
    },
  },
});
