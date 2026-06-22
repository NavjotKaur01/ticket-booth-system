import { appConfig } from "@/config/app-config"
import type {
  AccountLoginRequest,
  AccountLoginResponse,
  ApiUserCredentials,
} from "@/types/api/account-login"

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${appConfig.apiBaseUrl.replace(/\/$/, "")}${normalizedPath}`
}

function isLoginDataObject(value: unknown): value is ApiUserCredentials {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }

  const record = value as ApiUserCredentials
  const userId = record.UserID?.trim() ?? ""
  const userName = record.UserName?.trim() ?? ""

  return Boolean(userId || userName)
}

export async function executeAccountLogin(
  request: AccountLoginRequest
): Promise<ApiUserCredentials> {
  const response = await fetch(buildApiUrl("/clubman/api/AccountLogin"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Login failed with status ${response.status}`)
  }

  const body = (await response.json()) as AccountLoginResponse

  if (!body.Status) {
    throw new Error(body.Message || "Login failed")
  }

  if (!isLoginDataObject(body.Data)) {
    throw new Error(
      body.Message?.trim() ||
        "Login failed. The server did not return user credentials."
    )
  }

  return body.Data
}
