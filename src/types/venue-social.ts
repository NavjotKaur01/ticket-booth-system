export type VenueSocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "linkedin"

export type VenueSocialRecord = {
  id: string
  locationId: string
  /** Display name from API (often a platform key like facebook). */
  social: string
  displayOrder: number
  url: string
}

export type VenueSocialDraft = Omit<VenueSocialRecord, "id" | "locationId">

export type VenueSocialFilters = {
  social: string
  displayOrder: string
  url: string
}

export const EMPTY_VENUE_SOCIAL_FILTERS: VenueSocialFilters = {
  social: "",
  displayOrder: "",
  url: "",
}
