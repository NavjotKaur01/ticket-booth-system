import { appConfig } from "@/config/app-config"
import type { ApiResponse } from "@/types/api/common"

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${appConfig.apiBaseUrl.replace(/\/$/, "")}${normalizedPath}`
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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

export { clubApiPath, reportApiPath, reservationApiPath } from "@/lib/api/paths"
