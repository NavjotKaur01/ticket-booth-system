export type DomainConfigurationActiveIndicator = "Y" | "N"

export type DomainConfiguration = {
  id: string
  serverIp: string
  serverName: string
  activeIndicator: DomainConfigurationActiveIndicator
}

export type DomainConfigurationFormValues = {
  serverIp: string
  serverName: string
  activeIndicator: DomainConfigurationActiveIndicator
}

export const EMPTY_DOMAIN_CONFIGURATION_FORM: DomainConfigurationFormValues = {
  serverIp: "",
  serverName: "",
  activeIndicator: "Y",
}
