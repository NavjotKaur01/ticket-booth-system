export type Reservation = {
  id: string
  lastName: string
  firstName: string
  businessName: string
  email: string
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
  createdBy: string
  createdDt: string
  lastUpdateBy: string
  lastUpdateDt: string
}

export type ShowOption = {
  id: string
  label: string
}

export type SectionOption = {
  id: string
  label: string
  price: string
  name: string
  available: number
}

export type ReservationCounts = {
  seats: number
  reservation: number
  available: number
  seated: number
  scanned: number
}
