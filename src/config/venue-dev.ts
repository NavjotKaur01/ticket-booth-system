// temporary-for-tunnel
import { appConfig } from "@/config/app-config"

/** Dev-only: route venue module API calls through ngrok when enabled in .env.local */
export const useVenueTunnel =
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_VENUE_TUNNEL === "true" &&
  Boolean(import.meta.env.VITE_TUNNEL_URL?.trim())

export function getVenueApiBaseUrl() {
  if (useVenueTunnel) {
    return import.meta.env.VITE_TUNNEL_URL.replace(/\/$/, "")
  }

  return appConfig.apiBaseUrl.replace(/\/$/, "")
}
