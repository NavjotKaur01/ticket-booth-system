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
  resStatus: string
  reservationId: string
  customerId: string
  resSource: string
  notes: string
  promo: string
  pendingStatus: string
  dinner: string
  section: string
  partyNo: number
  checkedIn: number
  price: number
  total: number
}

export type TransactionFilters = {
  showDate: string
  showTimeId: string
  refreshSeconds: string
}

export const DEFAULT_TRANSACTION_REFRESH_SECONDS = "20"
