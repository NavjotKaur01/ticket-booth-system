export type TouchShow = {
  id: string
  comedianName: string
  displayDate: string
  seats: number
  reservation: number
  available: number
  seated: number
}

export type TouchReservation = {
  id: string
  showId: string
  lastName: string
  firstName: string
  source: string
  tables: string
  seatNo: string
  notes: string
  promo: string
  dinner: string
  section: string
  qty: number
  seated: number
  total: string
  paid: string
  createdBy: string
  createdDt: string
  cancelled: boolean
  checkedIn: boolean
}

export type TouchFilters = {
  displayCancelled: boolean
  displayCheckedIn: boolean
  searchQuery: string
}

export const DEFAULT_TOUCH_FILTERS: TouchFilters = {
  displayCancelled: false,
  displayCheckedIn: true,
  searchQuery: "",
}
