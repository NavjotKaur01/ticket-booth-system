import type { ApiDefaultShowSection } from "@/types/api/save-show"

export type PerformerOption = {
  id: string
  name: string
}

export type AgeRestrictionOption = {
  value: string
  label: string
  description: string
}

export type ShowTimeSection = {
  id: string
  section: string
  price: number
  seats: number
  restrictShowPromo: boolean
  web: boolean
  walkupFee: number | null
  phoneFee: number | null
  webFee: number | null
}

export type ShowTimeOption = {
  id: string
  dayLabel: string
  timeRange: string
  enabled: boolean
  sections: ShowTimeSection[]
}

import type { SectionLookupItem } from "@/types/api/system-lookup"

export type AddShowDialogData = {
  performers: PerformerOption[]
  ageRestrictions: AgeRestrictionOption[]
  showTimes: ShowTimeOption[]
  sectionRows: ApiDefaultShowSection[]
  sectionLookups: SectionLookupItem[]
}

export type AddShowFormValues = {
  headlinerId: string
  featureId: string
  openerId: string
  headliner2Id: string
  feature2Id: string
  specialNote: string
  dinner: boolean
  noPasses: boolean
  vipSeating: boolean
  hub: boolean
  assignTable: boolean
  showOnWeb: boolean
  ageRestriction: string
  minAge: string
  dayOfShowFee: string
  phoneFee: string
  walkupFee: string
  webFee: string
  useSectionFee: boolean
  preSalePrivateShow: boolean
  isShowSoldOut: boolean
  selectedShowTimeIds: string[]
  startDate: string
  showTime: string
  arrivalTime: string
}