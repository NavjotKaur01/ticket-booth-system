export type VenueAdSection = "Hub" | "Sponsors" | "Website" | "Lobby"

export type VenueAdRecord = {
  id: string
  locationId: string
  navigateUrl: string
  displayText: string
  active: boolean
  section: VenueAdSection
  merchant: string
  imageName: string
  imagePreviewLabel: string
}

export type VenueAdDraft = Omit<VenueAdRecord, "id" | "locationId">
