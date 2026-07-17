import { authConfig } from "@/config/auth-config"

export function setCookie(name: string, value: string) {
  const maxAgeSeconds = authConfig.credentialsCookieMaxAgeDays * 24 * 60 * 60
  const encoded = encodeURIComponent(value)
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : ""

  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

export function getCookie(name: string): string | null {
  const prefix = `${name}=`
  const cookies = document.cookie.split(";")

  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length))
    }
  }

  return null
}

export function deleteCookie(name: string) {
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : ""
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`
}

export function clearLegacyAuthCookies() {
  deleteCookie(authConfig.legacyUserDataCookieName)
  localStorage.removeItem(authConfig.legacyCredentialsStorageKey)
}
