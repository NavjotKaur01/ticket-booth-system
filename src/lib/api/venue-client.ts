// temporary-for-tunnel
import { getVenueApiBaseUrl, useVenueTunnel } from "@/config/venue-dev"
import type { ApiResponse } from "@/types/api/common"

function buildVenueApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getVenueApiBaseUrl()}${normalizedPath}`
}

function buildVenueHeaders(options: RequestInit = {}) {
  return {
    "Content-Type": "application/json",
    ...(useVenueTunnel ? { "ngrok-skip-browser-warning": "true" } : {}),
    ...options.headers,
  }
}

/** Venue module API client. Uses tunnel base URL in dev when VITE_USE_VENUE_TUNNEL=true. */
export async function venueApiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(buildVenueApiUrl(path), {
    ...options,
    headers: buildVenueHeaders(options),
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const body = (await response.json()) as ApiResponse<T>

  if (!body.Status) {
    throw new Error(body.Message || "Request failed")
  }

  return body.Data
}

export { systemApiPath } from "@/lib/api/paths"
