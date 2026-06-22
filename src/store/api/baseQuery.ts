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
  prepareHeaders: (headers) => {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
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

  if ("error" in error && typeof error.error === "string") {
    return error.error
  }

  if ("status" in error && typeof error.status === "number") {
    return `Request failed with status ${error.status}`
  }

  return "Request failed"
}
