import { appConfig } from "@/config/app-config"
import { parseLoginCredentials } from "@/lib/api-schema/login-and-reservation"
import type {
  AccountLoginRequest,
  AccountLoginResponse,
  ApiUserCredentials,
} from "@/types/api/account-login"

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${appConfig.apiBaseUrl.replace(/\/$/, "")}${normalizedPath}`
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

  const slim = parseLoginCredentials(body.Data)
  if (
    !slim ||
    !(slim.UserID?.trim() || slim.UserName?.trim())
  ) {
    throw new Error(
      body.Message?.trim() ||
        "Login failed. The server did not return user credentials."
    )
  }

  return slim
}
