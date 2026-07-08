export type DomainActiveIndicator = "Y" | "N"

export type Domain = {
  id: string
  domainName: string
  locationId: string
  activeIndicator: DomainActiveIndicator
  processingOrder: number
}

export type DomainFormValues = {
  domainName: string
  locationId: string
  activeIndicator: DomainActiveIndicator
  processingOrder: string
}

export const EMPTY_DOMAIN_FORM: DomainFormValues = {
  domainName: "",
  locationId: "",
  activeIndicator: "Y",
  processingOrder: "",
}
