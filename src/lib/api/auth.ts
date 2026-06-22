import { appConfig } from "@/config/app-config"
import type {
  AccountLoginRequest,
  AccountLoginResponse,
} from "@/types/api/account-login"

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${appConfig.apiBaseUrl.replace(/\/$/, "")}${normalizedPath}`
}

export async function accountLogin(request: AccountLoginRequest) {
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

  return body
}
