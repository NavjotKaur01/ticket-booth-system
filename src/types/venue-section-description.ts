export type VenueSectionDescriptionRecord = {
  id: string
  locationId: string
  sectionName: string
  sectionDetail: string
  lookupOrder: number
}

export type VenueSectionDescriptionDraft = Omit<
  VenueSectionDescriptionRecord,
  "id" | "locationId" | "lookupOrder"
>
