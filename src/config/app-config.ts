/** Global API settings — base URLs come from Vite env. */

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/$/, "")
  }

  // Dev uses Vite proxy (`/clubman` → test/staging API).
  if (import.meta.env.DEV) {
    return ""
  }

  // Phase 0: never silently fall back to testapi in production builds.
  throw new Error(
    "Missing VITE_API_BASE_URL. Production builds must set this environment variable; refusing to default to the test API host."
  )
}

function resolveResendTicketApiBaseUrl(): string {
  const configured = import.meta.env.VITE_RESEND_TICKET_API_BASE_URL
  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/$/, "")
  }

  throw new Error(
    "Missing VITE_RESEND_TICKET_API_BASE_URL. Set this environment variable; no default resend host is hardcoded."
  )
}

export const appConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
  /** Ticket email / resend host — required via `VITE_RESEND_TICKET_API_BASE_URL`. */
  resendTicketApiBaseUrl: resolveResendTicketApiBaseUrl(),
} as const
