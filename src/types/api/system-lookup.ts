export type ApiSystemLookupItem = {
  LookupCode: string | null
  LookupSDesc: string | null
  LookupLDesc?: string | null
  LookupType: string | null
  LookupOrder?: number | null
}

export type SectionLookupItem = {
  code: string
  description: string
  lookupType: string
  lookupOrder: number
}
