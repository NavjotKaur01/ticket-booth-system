/** Global API settings — base URL comes from Vite env. */
export const appConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? "" : "https://testapi.standupmedia.mobi"),
  newApiBaseUrl:
    import.meta.env.VITE_NEW_API_BASE_URL ?? "",
} as const
