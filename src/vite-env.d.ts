/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // temporary-for-tunnel
  readonly VITE_TUNNEL_URL: string
  readonly VITE_USE_VENUE_TUNNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
