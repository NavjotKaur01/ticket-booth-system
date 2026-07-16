/**
 * Assign Seats API DTOs (Check-in / Reservation controller).
 * Field names vary by club/API version — mappers read common aliases.
 */

/** Seat chart cell / assignment row from GetAssignSeatDetails. */
export type ApiAssignSeatDetail = {
  TableNo?: number | string | null
  TableNum?: number | string | null
  Table?: number | string | null
  SeatNo?: number | string | null
  Seat?: number | string | null
  SeatNum?: number | string | null
  ReservationId?: string | null
  ReservationID?: string | null
  Name?: string | null
  GuestName?: string | null
  LastName?: string | null
  FirstName?: string | null
  Dinner?: string | boolean | null
  IsDinner?: string | boolean | null
  Web?: string | boolean | null
  IsWeb?: string | boolean | null
  Promo?: string | boolean | null
  IsPromo?: string | boolean | null
  Source?: string | null
  ResSource?: string | null
}

/** Layout / table-number row from GetColumbusAssignSeatNumbers. */
export type ApiColumbusAssignSeatNumber = {
  TableNo?: number | string | null
  TableNum?: number | string | null
  Table?: number | string | null
  SeatNo?: number | string | null
  Seat?: number | string | null
  SeatCount?: number | string | null
  Seats?: number | string | null
  MaxSeats?: number | string | null
  TabX1?: number | string | null
  TabY1?: number | string | null
  Label?: string | null
  Group?: string | null
  SeatGroup?: string | null
}

/** One table on GetClubsAssignSeatDetail.ChartTableList. */
export type ApiClubsAssignSeatChartTable = {
  TableNo?: number | string | null
  TableNum?: number | string | null
  Table?: number | string | null
  MaxSeats?: number | string | null
  SeatCount?: number | string | null
  TabX1?: number | string | null
  TabY1?: number | string | null
  ColorSeat1?: string | null
  ColorSeat2?: string | null
  ColorSeat3?: string | null
  ColorSeat4?: string | null
  ColorSeat5?: string | null
  ColorSeat6?: string | null
  ColorSeat7?: string | null
  ColorSeat8?: string | null
  ColorSeat9?: string | null
  ColorSeat10?: string | null
  ReadOnlySeat1?: boolean | string | null
  ReadOnlySeat2?: boolean | string | null
  ReadOnlySeat3?: boolean | string | null
  ReadOnlySeat4?: boolean | string | null
  ReadOnlySeat5?: boolean | string | null
  ReadOnlySeat6?: boolean | string | null
  ReadOnlySeat7?: boolean | string | null
  ReadOnlySeat8?: boolean | string | null
  ReadOnlySeat9?: boolean | string | null
  ReadOnlySeat10?: boolean | string | null
}

/**
 * GET GetClubsAssignSeatDetail/{clubName}/{locationId}
 * Desktop AssignSeatHelper.GetAssignSeatPropertiesV2.
 */
export type ApiClubsAssignSeatDetail = {
  ChartImage?: string | number[] | null
  ByteImgSource?: string | number[] | null
  /** Desktop pack URI, e.g. /ClubMan;component/Resources/Tampa-Seating-Chart.png */
  ChartImageSource?: string | null
  ChartGridOpacity?: number | string | null
  ChartFillUpVisibility?: string | null
  ChartTableList?: ApiClubsAssignSeatChartTable[] | null
}

/** Reservation eligible for seat assignment. */
export type ApiReservationToAssignSeat = {
  ReservationId?: string | null
  ReservationID?: string | null
  Name?: string | null
  GuestName?: string | null
  LastName?: string | null
  FirstName?: string | null
  CreateDt?: string | null
  CreatedDt?: string | null
  Qty?: number | string | null
  Quantity?: number | string | null
  Party?: number | string | null
  Rem?: number | string | null
  Remaining?: number | string | null
  Promo?: string | null
  Promotion?: string | null
  Section?: string | null
  Source?: string | null
  ResSource?: string | null
  Notes?: string | null
  Note?: string | null
  Dinner?: string | boolean | null
  IsDinner?: string | boolean | null
  TableNums?: string | null
  SeatNumbers?: string | null
  ResStatus?: string | null
  RowColor?: string | null
}

/** One seat assignment to persist. */
export type AssignSeatSaveItem = {
  ReservationId: string
  TableNo: string
  SeatNo: number
  Name?: string
}

/** POST SaveAssignSeats body. */
export type SaveAssignSeatsRequest = {
  ConnectionString: string
  LocationId: string
  ShowId: string
  LastUpdateDt: string
  LastUpdateId: string
  AssignSeats: AssignSeatSaveItem[]
}

/** PUT DeleteAllAsignSeat body. */
export type DeleteAllAssignSeatRequest = {
  ConnectionString: string
  LocationId: string
  ShowId: string
  LastUpdateDt: string
  LastUpdateId: string
}
