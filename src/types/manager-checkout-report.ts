export type PaymentColumnKey =
  | "cash"
  | "amex"
  | "discover"
  | "masterCard"
  | "visa"
  | "giftCard"
  | "giftCert"
  | "webGiftCert"
  | "other"

export type PaymentAmounts = Record<PaymentColumnKey, number> & {
  subTotal: number
  total: number
}

export type FinancialRow = {
  id: string
  label: string
  amounts: PaymentAmounts
  isRefund?: boolean
  summaryOnly?: boolean
}

export type CheckedInRow = {
  id: string
  promotion: string
  party: number
  seated: number
  paid: number
  comp: number
  disc: number
  scanned: number
  scanPaid: number
  scanComp: number
  scanDisc: number
}

export type OriginRow = {
  id: string
  origin: string
  party: number
  preSeated: number
  paid: number
}

export type ShowSectionRow = {
  id: string
  section: string
  party: number
  totalAmount: number
}

export type ManagerCheckoutShow = {
  id: string
  showDate: string
  showTime: string
  comicName: string
  booked: number
  preSeat: number
  ticketPrices: string
  totalReceipts: string
  financialRows: FinancialRow[]
  checkedInRows: CheckedInRow[]
  phoneIn: number
  walkup: number
  web: number
  originRows: OriginRow[]
  showSectionRows: ShowSectionRow[]
}

export type ReportFilters = {
  reportType: string
  dateFrom: string
  dateTo: string
}

export const EMPTY_REPORT_FILTERS: ReportFilters = {
  reportType: "manager-checkout",
  dateFrom: "2026-06-18",
  dateTo: "2026-06-18",
}

export const PAYMENT_COLUMNS: { key: PaymentColumnKey; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "amex", label: "AmEx" },
  { key: "discover", label: "Discover" },
  { key: "masterCard", label: "MasterCard" },
  { key: "visa", label: "Visa" },
  { key: "giftCard", label: "Gift Card" },
  { key: "giftCert", label: "Gift Cert" },
  { key: "webGiftCert", label: "WebGiftCert" },
  { key: "other", label: "Other" },
]

export const ZERO_PAYMENTS: PaymentAmounts = {
  cash: 0,
  amex: 0,
  discover: 0,
  masterCard: 0,
  visa: 0,
  giftCard: 0,
  giftCert: 0,
  webGiftCert: 0,
  other: 0,
  subTotal: 0,
  total: 0,
}
