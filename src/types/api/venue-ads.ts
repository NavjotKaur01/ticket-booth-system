export interface VenueAdItem {
  AdID: string
  NavigateUrl: string
  AlternateText: string
  Active: string
  Section: string
  Merchant: string
}

export interface VenueAdSectionItem {
  ItemName: string
}

export interface AddUpdateVenueAdRequest {
  ConnectionString: string
  AdID: string
  LocationID: string
  NavigateUrl: string
  AlternateText: string
  Active: string
  Section: string
  Merchant: string
  AdImage: string
}

export interface DeleteVenueAdRequest {
  ConnectionString: string
  AdID: string
}

export const EMPTY_VENUE_AD_ID = "00000000-0000-0000-0000-000000000000"
