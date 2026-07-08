export type VenueGateway = {
  id: string
  venue: string
  gateway: string
  partner: string
  vendor: string
  user: string
  password: string
}

export type VenueGatewayFormValues = {
  venue: string
  gateway: string
  partner: string
  vendor: string
  user: string
  password: string
}

export const EMPTY_VENUE_GATEWAY_FORM: VenueGatewayFormValues = {
  venue: "",
  gateway: "",
  partner: "",
  vendor: "",
  user: "",
  password: "",
}
