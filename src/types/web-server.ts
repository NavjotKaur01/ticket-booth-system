export type WebServerActiveIndicator = "Y" | "N"

export type WebServer = {
  id: string
  serverIp: string
  serverName: string
  activeIndicator: WebServerActiveIndicator
}

export type WebServerFormValues = {
  serverIp: string
  serverName: string
  activeIndicator: WebServerActiveIndicator
}

export const EMPTY_WEB_SERVER_FORM: WebServerFormValues = {
  serverIp: "",
  serverName: "",
  activeIndicator: "Y",
}
