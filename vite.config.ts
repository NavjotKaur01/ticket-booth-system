import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import openLogFolderDevPlugin from "./vite.open-log-folder-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), openLogFolderDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});