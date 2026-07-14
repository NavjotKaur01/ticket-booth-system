/** Desktop CountryStateHelper lists used by SystemDefaultsVM edit popup. */

export type SystemDefaultOption = {
  id: string
  label: string
}

export const SYSTEM_DEFAULT_COUNTRY_OPTIONS: SystemDefaultOption[] = [
  { id: "Select country", label: "Select country" },
  { id: "US", label: "US" },
  { id: "Canada", label: "Canada" },
]

/** CountryStateHelper.GetStateList("US") */
export const SYSTEM_DEFAULT_STATE_OPTIONS: SystemDefaultOption[] = [
  "AL",
  "AK",
  "AS",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FM",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MH",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "MP",
  "OH",
  "OK",
  "OR",
  "PW",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VI",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
].map((code) => ({ id: code, label: code }))

/** CountryStateHelper.GetStateList("Canada") */
export const SYSTEM_DEFAULT_PROVINCE_OPTIONS: SystemDefaultOption[] = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NT",
  "NS",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
].map((code) => ({ id: code, label: code }))

/** CountryStateHelper.GetPaymentList() */
export const SYSTEM_DEFAULT_PAYMENT_OPTIONS: SystemDefaultOption[] = [
  "Cash",
  "Credit Card Payment",
  "Gift Card",
  "Gift Certificate",
  "Hold with Credit Card",
  "POS",
  "Web Gift Cert",
].map((label) => ({ id: label, label }))

/** CountryStateHelper.GetOriginList() */
export const SYSTEM_DEFAULT_ORIGIN_OPTIONS: SystemDefaultOption[] = [
  "Phone-In",
  "Walkup",
  "Web",
].map((label) => ({ id: label, label }))

export function getSystemDefaultDropdownOptions(
  description: string
): SystemDefaultOption[] | null {
  switch (description.trim()) {
    case "Country":
      return SYSTEM_DEFAULT_COUNTRY_OPTIONS
    case "State":
      return SYSTEM_DEFAULT_STATE_OPTIONS
    case "Province":
      return SYSTEM_DEFAULT_PROVINCE_OPTIONS
    case "Payment Type":
      return SYSTEM_DEFAULT_PAYMENT_OPTIONS
    case "Origin":
      return SYSTEM_DEFAULT_ORIGIN_OPTIONS
    default:
      return null
  }
}
