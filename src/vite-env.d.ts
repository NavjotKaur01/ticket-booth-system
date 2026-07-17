/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Required in production builds (see `app-config.ts`). */
  readonly VITE_API_BASE_URL: string
  /** Required — ticket email / resend API host (no code default). */
  readonly VITE_RESEND_TICKET_API_BASE_URL: string
  // temporary-for-tunnel
  readonly VITE_TUNNEL_URL: string
  readonly VITE_USE_VENUE_TUNNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
