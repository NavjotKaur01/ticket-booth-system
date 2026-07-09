export type TransactionLog = {
  id: string
  locationId: string
  locationLabel: string
  firstName: string
  lastName: string
  email: string
  transactionDate: string
}

export type TransactionLogSearchFilters = {
  email: string
  firstName: string
  lastName: string
}

export type TransactionLogTableFilters = {
  firstName: string
  lastName: string
  email: string
  transactionDate: string
}

export const EMPTY_TRANSACTION_LOG_SEARCH: TransactionLogSearchFilters = {
  email: "",
  firstName: "",
  lastName: "",
}

export const EMPTY_TRANSACTION_LOG_TABLE_FILTERS: TransactionLogTableFilters = {
  firstName: "",
  lastName: "",
  email: "",
  transactionDate: "",
}
