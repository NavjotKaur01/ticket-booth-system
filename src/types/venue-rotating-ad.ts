export type VenueRotatingAdRecord = {
  id: string
  locationId: string
  alternateText: string
  displayOrder: number
  active: boolean
  startingDate: string
  endingDate: string
  adName: string
  navigateUrl: string
  adText: string
}

export type VenueRotatingAdDraft = Omit<VenueRotatingAdRecord, "id" | "locationId">
