export type MarketingFilterRecord = {
  id: string
  lastName: string
  firstName: string
  email: string
  address: string
  address2: string
  phoneNumbers: string[]
  zipCode: string
  createdOn: string
  city: string
  status: string
  birthMonth: string
  banned: boolean
  inactive: boolean
  onNoCallList: boolean
  hasFutureReservation: boolean
}

export type MarketingFilterForm = {
  lastName: string
  firstName: string
  email: string
  birthMonth: string
  areaCode: string
  zipCodes: [string, string, string, string, string]
  newCustomerFrom: string
  newCustomerTo: string
  excludeBanned: boolean
  onlyWithPhone: boolean
  onlyWithEmail: boolean
  excludeInactive: boolean
  onlyWithStreetAddress: boolean
  excludeFutureReservations: boolean
  excludeNoCallList: boolean
  comedianIds: string[]
}

export const DEFAULT_MARKETING_FILTER_FORM: MarketingFilterForm = {
  lastName: "",
  firstName: "",
  email: "",
  birthMonth: "",
  areaCode: "",
  zipCodes: ["", "", "", "", ""],
  newCustomerFrom: "",
  newCustomerTo: "",
  excludeBanned: true,
  onlyWithPhone: false,
  onlyWithEmail: false,
  excludeInactive: true,
  onlyWithStreetAddress: false,
  excludeFutureReservations: false,
  excludeNoCallList: true,
  comedianIds: [],
}
