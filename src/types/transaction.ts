export type Transaction = {
  id: string
  lastName: string
  firstName: string
  businessName: string
  source: string
  createdBy: string
  createdDt: string
  paymentStatus: string
  paymentType: string
  ccType: string
  amount: number
  showDate: string
  showTimeId: string
}

export type TransactionFilters = {
  showDate: string
  showTimeId: string
  refreshSeconds: string
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  showDate: "2026-06-18",
  showTimeId: "1",
  refreshSeconds: "20",
}
