export type PaymentHistorySearchBy =
  | "transaction-id"
  | "last-name"
  | "first-name"
  | "pnref"

export type PaymentHistoryFilters = {
  searchBy: PaymentHistorySearchBy
  searchValue: string
}

export const DEFAULT_PAYMENT_HISTORY_FILTERS: PaymentHistoryFilters = {
  searchBy: "transaction-id",
  searchValue: "",
}

export type PaymentHistoryRecord = {
  id: string
  lastName: string
  firstName: string
  pnref: string
  lastUpdateDate: string
  transactionType: string
  amount: number
  responseMessage: string
}

export const PAYMENT_HISTORY_SEARCH_BY_OPTIONS: {
  value: PaymentHistorySearchBy
  label: string
}[] = [
  { value: "transaction-id", label: "Transaction ID" },
  { value: "last-name", label: "Last Name" },
  { value: "first-name", label: "First Name" },
  { value: "pnref", label: "PNREF" },
]
