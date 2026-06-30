export type VenueSectionDescriptionRecord = {
  id: string
  locationId: string
  sectionName: string
  sectionDetail: string
}

export type VenueSectionDescriptionDraft = Omit<
  VenueSectionDescriptionRecord,
  "id" | "locationId"
>
