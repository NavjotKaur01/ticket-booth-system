import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      VITE_API_BASE_URL: "https://testapi.example.invalid",
      VITE_RESEND_TICKET_API_BASE_URL: "https://resend.example.invalid",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
