export type VenueAdRecord = {
  id: string
  locationId: string
  navigateUrl: string
  displayText: string
  active: boolean
  section: string
  merchant: string
  imageName: string
  imagePreviewLabel: string
}

export type VenueAdDraft = Omit<VenueAdRecord, "id" | "locationId">
