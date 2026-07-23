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
  social: VenueSocialPlatform
  displayOrder: number
  url: string
}

export type VenueSocialDraft = Omit<VenueSocialRecord, "id" | "locationId">
