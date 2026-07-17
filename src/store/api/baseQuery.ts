import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query"

import { appConfig } from "@/config/app-config"
import type { ApiResponse } from "@/types/api/common"

export type ClubmanQueryError =
  | FetchBaseQueryError
  | { status: "CUSTOM_ERROR"; error: string }

const rawBaseQuery = fetchBaseQuery({
  baseUrl: appConfig.apiBaseUrl.replace(/\/$/, ""),
  prepareHeaders: (headers, { getState }) => {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
    const state = getState() as { auth?: { credentials?: { UserID: string; LocationID: string | null; LocationName: string; UserName: string } | null } }
    const credentials = state.auth?.credentials
    if (credentials) {
      if (credentials.LocationID) {
        headers.set("LocationId", credentials.LocationID)
      }
      if (credentials.LocationName) {
        headers.set("LocationName", credentials.LocationName)
      }
      if (credentials.UserID) {
        headers.set("UserId", credentials.UserID)
      }
      if (credentials.UserName) {
        headers.set("UserName", credentials.UserName)
      }
    }
    // temporary-for-tunnel
    if (import.meta.env.DEV && import.meta.env.VITE_TUNNEL_URL) {
      headers.set("ngrok-skip-browser-warning", "true")
    }
    return headers
  },
})

function isApiEnvelope(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "Status" in value &&
    typeof (value as ApiResponse<unknown>).Status === "boolean"
  )
}

export const clubmanBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ClubmanQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error) {
    return { error: result.error }
  }

  if (isApiEnvelope(result.data)) {
    if (!result.data.Status) {
      return {
        error: {
          status: "CUSTOM_ERROR",
          error: result.data.Message || "Request failed",
        },
      }
    }

    return { data: result.data.Data }
  }

  return result
}

export function getClubmanErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Request failed"
  }

  if ("data" in error && typeof error.data === "string" && error.data.trim()) {
    const firstLine = error.data.trim().split("\n")[0]?.trim()
    if (firstLine && !firstLine.startsWith("{")) {
      return firstLine
    }
  }

  if ("error" in error && typeof error.error === "string") {
    if (
      "status" in error &&
      error.status === "PARSING_ERROR" &&
      "data" in error &&
      typeof error.data === "string" &&
      error.data.trim()
    ) {
      const firstLine = error.data.trim().split("\n")[0]?.trim()
      if (firstLine) {
        return firstLine
      }
    }

    return error.error
  }

  if ("status" in error && typeof error.status === "number") {
    return `Request failed with status ${error.status}`
  }

  return "Request failed"
}
