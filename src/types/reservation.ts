export type Reservation = {
  id: string
  resStatus: string
  isCancelled: boolean
  lastName: string
  firstName: string
  businessName: string
  email: string
  phoneNo: string
  source: "Web" | "Phone" | "Walkup"
  tables: string
  seatNo: string
  notes: string
  promo: string
  din: string
  section: string
  qty: number
  seated: number
  scanner: number
  total: string
  paid: string
  /** Raw Total for status / pay math. */
  totalAmount?: number
  /** Raw ResPayments for status / pay math. */
  paidAmount?: number
  /** Raw PromoPymts for partial-pay status. */
  promoPayments?: number
  lastFourCardDigit?: string
  oldReservationId?: string
  createdBy: string
  createdDt: string
  lastUpdateBy: string
  lastUpdateDt: string
}

export type ShowOption = {
  id: string
  label: string
  /** Short time label for chip buttons (e.g. "7:30 PM"). */
  time?: string
  /** Raw ShowTim/ShowDate for Express cmdExpress2 visibility window. */
  showDateTime?: string
  /** Secondary line under the time (e.g. venue or show type). */
  subtitle?: string
  /** Formatted headliner name for the selected show. */
  headliner?: string
  /** Headliner comedian GUID from GetShowDetailsByDate (Comic Info). */
  comicId?: string
}

export type SectionTone = 'regular' | 'vip'

export type SectionOption = {
  id: string
  label: string
  price: string
  priceMultiplier: number
  name: string
  seats: number
  available: number
  tone: SectionTone
}

export type ReservationSectionOption = SectionOption & {
  showId: string
  showDetId: string
  showSec: string
  showPrice: number
  showDinner: string
  dayOfShowFee: number
  phoneInFee: number
  walkUpFee: number
  webFee: number
  /** Desktop RestrictPromoForSection — hides multi-promo when Y. */
  restrictPromoForSection?: boolean
}

export type ReservationCounts = {
  seats: number
  reservation: number
  available: number
  seated: number
  scanned: number
}
