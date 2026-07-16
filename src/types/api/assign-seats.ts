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
  /** Desktop AssignSeatsModel.Party / seed PartyNo */
  Party?: number | string | null
  Rem?: number | string | null
  Remaining?: number | string | null
  Promo?: string | null
  Promotion?: string | null
  Section?: string | null
  Source?: string | null
  ResSource?: string | null
  SourceDesc?: string | null
  Notes?: string | null
  Note?: string | null
  Dinner?: string | boolean | null
  IsDinner?: string | boolean | null
  TableNums?: string | null
  SeatNumbers?: string | null
  ResStatus?: string | null
  RowColor?: string | null
}

/**
 * Desktop API.AssignTableModel — one chart table row for SaveAssignSeats.
 * SeatN = display text ("LastName- N" or "<Hold>"); ReservationIdSeatN = guest GUID.
 */
export type ApiAssignTableModel = {
  ShowId: string
  TableNum: string
  Limit: number
  MaxSeats: number
  Seat1: string
  IsRemovedSeat1: boolean
  Seat2: string
  IsRemovedSeat2: boolean
  Seat3: string
  IsRemovedSeat3: boolean
  Seat4: string
  IsRemovedSeat4: boolean
  Seat5: string
  IsRemovedSeat5: boolean
  Seat6: string
  IsRemovedSeat6: boolean
  Seat7: string
  IsRemovedSeat7: boolean
  Seat8: string
  IsRemovedSeat8: boolean
  Seat9: string
  IsRemovedSeat9: boolean
  Seat10: string
  IsRemovedSeat10: boolean
  ReadOnlySeat1: boolean
  ReadOnlySeat2: boolean
  ReadOnlySeat3: boolean
  ReadOnlySeat4: boolean
  ReadOnlySeat5: boolean
  ReadOnlySeat6: boolean
  ReadOnlySeat7: boolean
  ReadOnlySeat8: boolean
  ReadOnlySeat9: boolean
  ReadOnlySeat10: boolean
  Party: number
  Dinner: string
  Name: string
  Promo: string
  Source: string
  LastName: string
  FirstName: string
  TableNumbr: string
  SeatNum: string
  CellChanged: number
  RequestFromWhichMenu: string
  ReservationIdSeat1: string
  ReservationIdSeat2: string
  ReservationIdSeat3: string
  ReservationIdSeat4: string
  ReservationIdSeat5: string
  ReservationIdSeat6: string
  ReservationIdSeat7: string
  ReservationIdSeat8: string
  ReservationIdSeat9: string
  ReservationIdSeat10: string
  Status: string
}

/** Flat seat item used by UI save result / callers (not the API body). */
export type AssignSeatSaveItem = {
  ReservationId: string
  TableNo: string
  SeatNo: number
  Name?: string
}

/**
 * Desktop CheckInVM.SaveSeats → POST SaveAssignSeats.
 * NOT a flat AssignSeats[] — server expects table-row models.
 */
export type SaveAssignSeatsRequest = {
  ConnectionString: string
  LocationId: string
  RemoveAssignSeatList: ApiAssignTableModel[]
  AssignTableNumList: ApiAssignTableModel[]
}

/**
 * Desktop DeleteAssignSeat → PUT DeleteAllAsignSeat.
 * Only ConnectionString / LocationId / ShowId.
 */
export type DeleteAllAssignSeatRequest = {
  ConnectionString: string
  LocationId: string
  ShowId: string
}

/** Desktop APIRequest.ReservationTableNum */
export type ApiReservationTableNum = {
  ReservationId: string
  Table: string
}

/**
 * Desktop SaveTableNumberInReservation → PUT UpdateTableNumberReservation.
 */
export type UpdateTableNumberReservationRequest = {
  ConnectionString: string
  LocationId: string
  ShowId: string
  IsChkPackage: boolean
  RemoveReservationIds: string[]
  AddReservationIds: ApiReservationTableNum[]
}
