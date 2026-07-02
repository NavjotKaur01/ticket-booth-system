export type MarketingFilterComedian = {
  id: string
  comicName: string
  lastName: string
  firstName: string
  stageName: string
}

export type MarketingFilterRecord = {
  id: string
  lastName: string
  firstName: string
  email: string
  address: string
  address2: string
  phone: string
  phone1: string
  phone2: string
  zipCode: string
  createdOn: string
  city: string
  status: string
}

export type MarketingFilterForm = {
  lastName: string
  firstName: string
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
  selectedComedians: MarketingFilterComedian[]
}

export const MARKETING_FILTER_SELECT_MONTH = "Select a month"

export const MARKETING_FILTER_MONTH_OPTIONS = [
  MARKETING_FILTER_SELECT_MONTH,
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export const DEFAULT_MARKETING_FILTER_FORM: MarketingFilterForm = {
  lastName: "",
  firstName: "",
  birthMonth: MARKETING_FILTER_SELECT_MONTH,
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
  selectedComedians: [],
}

export const CLEARED_MARKETING_FILTER_FORM: MarketingFilterForm = {
  ...DEFAULT_MARKETING_FILTER_FORM,
  excludeBanned: false,
  excludeInactive: false,
  excludeNoCallList: false,
}
