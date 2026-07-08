export type DomainLocation = {
  id: string
  locationName: string
  locationShortName: string
  locationId: string
  city: string
  state: string
}

export type DomainLocationGroup = {
  id: string
  domainName: string
  locations: DomainLocation[]
}
