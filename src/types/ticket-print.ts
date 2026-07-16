export type TicketPrintVenue = {
  venueName: string
  addressLines: string[]
  website: string
}

export type TicketPrintCustomer = {
  firstName: string
  lastName: string
  fullName: string
}

export type TicketPrintShow = {
  title: string
  dateLabel: string
  timeLabel: string
  dateTimeLabel: string
}

export type TicketPrintReservation = {
  reservationId: string
  partySize: number
  checkedInCount: number
  remainingCount: number
  totalAmount: number
  paidAmount: number
  paymentType: string
  source: string
  section: string
  /** Desktop ticket line: "Promotions : {code}" when present. */
  promotion: string | null
  tables: string | null
  seatNumbers: string | null
}

export type TicketPrintText = {
  middleText: string
  bottomText: string
  printFooter: string
  reprintFooter: string
}

export type TicketPrintData = {
  venue: TicketPrintVenue
  customer: TicketPrintCustomer
  show: TicketPrintShow
  reservation: TicketPrintReservation
  text: TicketPrintText
  qrValue: string
}

export type TicketPrintLayout = "combined" | "individual"

export type CreateTicketPrintDataParams = {
  reservationId: string
  firstName: string
  lastName: string
  partySize: number
  checkedInCount?: number
  totalAmount: number
  paidAmount: number
  paymentType: string
  source: string
  section: string
  /** Promo code/name from reservation.Promo — printed when non-empty. */
  promotion?: string | null
  tables?: string | null
  seatNumbers?: string | null
  showDate: string
  showLabel?: string
  locationName?: string
  qrValue?: string
}

export type GetMockTicketPrintDataParams = {
  reservation: import("@/types/reservation").Reservation
  showDate: string
  showLabel?: string
  locationName?: string
}

export type PrintReservationTicketRequest = {
  ticket: TicketPrintData
  ticketCount: number
  isReprint?: boolean
  includeQr?: boolean
  layout?: TicketPrintLayout
}
