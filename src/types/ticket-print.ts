import type { Reservation } from "@/types/reservation"

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
  showDate: string
  showLabel?: string
  locationName?: string
  qrValue?: string
}

export type GetMockTicketPrintDataParams = {
  reservation: Reservation
  showDate: string
  showLabel?: string
  locationName?: string
}

export type PrintReservationTicketRequest = {
  ticket: TicketPrintData
  ticketCount: number
  isReprint?: boolean
}
