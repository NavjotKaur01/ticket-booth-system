export type ReservationSearchOption =
  | "confirmation-number"
  | "customer"
  | "comedian"
  | "date"
  | "payment"

export type ReservationSearchFilters = {
  option: ReservationSearchOption
  confirmationNumber: string
  lastName: string
  firstName: string
  phoneArea: string
  phonePrefix: string
  phoneLine: string
  since: string
  comedian: string
  showDate: string
  paymentReference: string
}

export const DEFAULT_RESERVATION_SEARCH_FILTERS: ReservationSearchFilters = {
  option: "customer",
  confirmationNumber: "",
  lastName: "",
  firstName: "",
  phoneArea: "",
  phonePrefix: "",
  phoneLine: "",
  since: "",
  comedian: "",
  showDate: "",
  paymentReference: "",
}

export type ReservationSearchResult = {
  id: string
  status: string
  lastName: string
  firstName: string
  phone: string
  showDate: string
  comedian: string
  qty: number
  price: string
  total: string
}

export const RESERVATION_SEARCH_OPTIONS: {
  value: ReservationSearchOption
  label: string
}[] = [
  { value: "confirmation-number", label: "Confirmation Number" },
  { value: "customer", label: "Customer" },
  { value: "comedian", label: "Comedian" },
  { value: "date", label: "Date" },
  { value: "payment", label: "Payment" },
]
