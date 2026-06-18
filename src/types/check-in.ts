// Check-in domain types: guest status, table rows, and seat counts.

/** Visual status shown in the first column of the check-in table. */
export type CheckInStatus =
  | "paid-checked-in" // Green check — fully paid and checked in
  | "not-paid" // Red alert — reservation exists but unpaid
  | "partial-check-in" // Yellow triangle — some guests checked in, not all
  | "paid-not-seated" // Orange diamond — paid but not yet seated

/** A single guest/reservation row on the check-in table. */
export type CheckInRecord = {
  id: string
  status: CheckInStatus
  lastName: string
  firstName: string
  section: string
  email: string
  source: "Web" | "Phone" | "Walkup"
  tables: string
  notes: string
  promo: string
  din: string // Dinner package flag (Y/N)
  qty: number
  seatNo: string
  seated: number // How many guests are seated
  scanner: number // How many tickets scanned at the door
  total: string
  paid: string
  createdBy: string
  createdDt: string
  lastUpdateDt: string
  lastUpdateBy: string
}

/** Live seat summary displayed in the toolbar stats bar. */
export type CheckInCounts = {
  seats: number
  reservation: number
  available: number
  seated: number
  scanned: number
}
