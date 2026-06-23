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

export type AddShowDialogData = {
  performers: PerformerOption[]
  ageRestrictions: AgeRestrictionOption[]
  showTimes: ShowTimeOption[]
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
  dayOfShowFee: string
  phoneFee: string
  walkupFee: string
  webFee: string
  useSectionFee: boolean
  preSalePrivateShow: boolean
  selectedShowTimeIds: string[]
}