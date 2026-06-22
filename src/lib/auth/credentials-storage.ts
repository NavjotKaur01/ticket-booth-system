import { authConfig } from "@/config/auth-config"
import type { UserCredentials } from "@/types/auth"

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"

function isUserCredentials(value: unknown): value is UserCredentials {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.UserName === "string" &&
    typeof record.ConnectionName === "string"
  )
}

export function getStoredCredentials(): UserCredentials | null {
  const raw = localStorage.getItem(authConfig.credentialsStorageKey)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isUserCredentials(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveCredentials(credentials: UserCredentials) {
  localStorage.setItem(
    authConfig.credentialsStorageKey,
    JSON.stringify(credentials)
  )
}

export function clearStoredCredentials() {
  localStorage.removeItem(authConfig.credentialsStorageKey)
}

export function createEmptyGuid() {
  return EMPTY_GUID
}
