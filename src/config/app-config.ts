/** Global API settings — base URL comes from Vite env. */
export const appConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? "https://testapi.standupmedia.mobi",
} as const
