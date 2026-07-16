/** Domain models for the shared Assign Seats UI. */

export type AssignSeatColorFlag = "dinner" | "web" | "promo" | "none"

export type AssignSeatCell = {
  tableNo: string
  seatNo: number
  /** Optional group label over seat columns (desktop A/A/B/B). */
  seatGroup?: string
  reservationId: string | null
  displayName: string
  color: AssignSeatColorFlag
  /** Desktop HoldAssignSeats — seat held without a guest. */
  isHold?: boolean
  /**
   * Desktop ColorSeatN=LightGray / ReadOnlySeatN — seat above MaxSeats.
   * Double-click can unlock (desktop cmdAssignSeatsToCustomer).
   */
  readOnly?: boolean
}

export type AssignSeatTableRow = {
  tableNo: string
  /** Desktop AssignTable.MaxSeats — active seat capacity. */
  maxSeats: number
  seats: AssignSeatCell[]
  /**
   * Desktop AssignTable.Status — "A" when modified this session (SaveAssignSeats).
   */
  status?: string
}

export type AssignSeatReservationRow = {
  id: string
  name: string
  createDt: string
  qty: number
  rem: number
  promo: string
  section: string
  source: string
  notes: string
  isDinner: boolean
}

/** Desktop ChartD cell: table label at (row, col) over the chart image. */
export type AssignSeatChartOverlayCell = {
  tableNo: string
  /** 0-based row index (desktop ChartD[TabX1 - 1]). */
  row: number
  /** 0-based column index (desktop P1…P21 → TabY1 - 1). */
  col: number
  /** Desktop CheckTableFilled → Brushes.Red when full. */
  isFull: boolean
}

/**
 * Desktop AssignSeatChart + ChartD overlay.
 * Image may be API bytes, static pack file, or null.
 */
export type AssignSeatChartState = {
  imageUrl: string | null
  opacity: number
  fillVisible: boolean
  overlay: AssignSeatChartOverlayCell[]
}

/** @deprecated Prefer AssignSeatChartState — kept for transitional floor markers. */
export type AssignSeatFloorSeat = {
  id: string
  tableNo: string
  seatNo: number
  x: number
  y: number
  w?: number
  h?: number
}

export type AssignSeatFloorLayout = {
  seats: AssignSeatFloorSeat[]
  walkupSeats: number[]
}

export type AssignSeatsWorkspace = {
  tables: AssignSeatTableRow[]
  reservations: AssignSeatReservationRow[]
  floor: AssignSeatFloorLayout
  chart: AssignSeatChartState
  seatCount: number
}
