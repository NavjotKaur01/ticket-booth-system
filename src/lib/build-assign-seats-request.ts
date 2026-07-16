import type {
  ApiAssignTableModel,
  ApiReservationTableNum,
  DeleteAllAssignSeatRequest,
  SaveAssignSeatsRequest,
  UpdateTableNumberReservationRequest,
} from "@/types/api/assign-seats"
import type { AssignSeatTableRow } from "@/features/assign-seats/assign-seats.types"

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"

function seatAt(table: AssignSeatTableRow, seatNo: number) {
  return table.seats.find((seat) => seat.seatNo === seatNo)
}

function seatText(table: AssignSeatTableRow, seatNo: number) {
  const seat = seatAt(table, seatNo)
  if (!seat) {
    return ""
  }
  if (seat.isHold) {
    return "<Hold>"
  }
  return seat.displayName?.trim() ?? ""
}

function seatReservationId(table: AssignSeatTableRow, seatNo: number) {
  const seat = seatAt(table, seatNo)
  const id = seat?.reservationId?.trim()
  if (!id) {
    return EMPTY_GUID
  }
  return id
}

function seatReadOnly(table: AssignSeatTableRow, seatNo: number) {
  return Boolean(seatAt(table, seatNo)?.readOnly)
}

/**
 * Map UI table row → desktop API.AssignTableModel for SaveAssignSeats.
 */
export function tableRowToAssignTableModel(
  table: AssignSeatTableRow,
  showId: string,
  status = "A"
): ApiAssignTableModel {
  return {
    ShowId: showId,
    TableNum: table.tableNo,
    Limit: table.seats.filter(
      (seat) => seat.reservationId || seat.isHold || seat.displayName
    ).length,
    MaxSeats: table.maxSeats,
    Seat1: seatText(table, 1),
    IsRemovedSeat1: false,
    Seat2: seatText(table, 2),
    IsRemovedSeat2: false,
    Seat3: seatText(table, 3),
    IsRemovedSeat3: false,
    Seat4: seatText(table, 4),
    IsRemovedSeat4: false,
    Seat5: seatText(table, 5),
    IsRemovedSeat5: false,
    Seat6: seatText(table, 6),
    IsRemovedSeat6: false,
    Seat7: seatText(table, 7),
    IsRemovedSeat7: false,
    Seat8: seatText(table, 8),
    IsRemovedSeat8: false,
    Seat9: seatText(table, 9),
    IsRemovedSeat9: false,
    Seat10: seatText(table, 10),
    IsRemovedSeat10: false,
    ReadOnlySeat1: seatReadOnly(table, 1),
    ReadOnlySeat2: seatReadOnly(table, 2),
    ReadOnlySeat3: seatReadOnly(table, 3),
    ReadOnlySeat4: seatReadOnly(table, 4),
    ReadOnlySeat5: seatReadOnly(table, 5),
    ReadOnlySeat6: seatReadOnly(table, 6),
    ReadOnlySeat7: seatReadOnly(table, 7),
    ReadOnlySeat8: seatReadOnly(table, 8),
    ReadOnlySeat9: seatReadOnly(table, 9),
    ReadOnlySeat10: seatReadOnly(table, 10),
    Party: 0,
    Dinner: "",
    Name: "",
    Promo: "",
    Source: "",
    LastName: "",
    FirstName: "",
    TableNumbr: table.tableNo,
    SeatNum: "",
    CellChanged: 0,
    RequestFromWhichMenu: "",
    ReservationIdSeat1: seatReservationId(table, 1),
    ReservationIdSeat2: seatReservationId(table, 2),
    ReservationIdSeat3: seatReservationId(table, 3),
    ReservationIdSeat4: seatReservationId(table, 4),
    ReservationIdSeat5: seatReservationId(table, 5),
    ReservationIdSeat6: seatReservationId(table, 6),
    ReservationIdSeat7: seatReservationId(table, 7),
    ReservationIdSeat8: seatReservationId(table, 8),
    ReservationIdSeat9: seatReservationId(table, 9),
    ReservationIdSeat10: seatReservationId(table, 10),
    Status: status,
  }
}

/** Desktop: AssignTableNumList = tables with Status == "A" only (modified this session). */
export function collectAssignTableNumList(
  tables: AssignSeatTableRow[],
  showId: string
): ApiAssignTableModel[] {
  return tables
    .filter((table) => table.status === "A")
    .map((table) => tableRowToAssignTableModel(table, showId, "A"))
}

/** True when desktop would show "No Records" / close confirm on Save. */
export function hasAssignSeatChangesToSave(
  tables: AssignSeatTableRow[],
  removeAssignSeatList: ApiAssignTableModel[] = []
) {
  return (
    tables.some((table) => table.status === "A") ||
    removeAssignSeatList.length > 0
  )
}

/** Desktop CheckInVM.SaveSeats body. */
export function buildSaveAssignSeatsRequest({
  connectionName,
  locationId,
  assignTableNumList,
  removeAssignSeatList = [],
}: {
  connectionName: string
  locationId: string
  assignTableNumList: ApiAssignTableModel[]
  removeAssignSeatList?: ApiAssignTableModel[]
}): SaveAssignSeatsRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    // Never null — desktop always materializes lists; null → server "Value cannot be null".
    RemoveAssignSeatList: removeAssignSeatList ?? [],
    AssignTableNumList: assignTableNumList ?? [],
  }
}

/** Desktop DeleteAssignSeat body. */
export function buildDeleteAllAssignSeatRequest({
  connectionName,
  locationId,
  showId,
}: {
  connectionName: string
  locationId: string
  showId: string
  lastUpdateId?: string
}): DeleteAllAssignSeatRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ShowId: showId,
  }
}

/** Desktop SaveTableNumberInReservation body. */
export function buildUpdateTableNumberReservationRequest({
  connectionName,
  locationId,
  showId,
  addReservationIds,
  removeReservationIds = [],
  isChkPackage = false,
}: {
  connectionName: string
  locationId: string
  showId: string
  addReservationIds: ApiReservationTableNum[]
  removeReservationIds?: string[]
  isChkPackage?: boolean
}): UpdateTableNumberReservationRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ShowId: showId,
    IsChkPackage: isChkPackage,
    RemoveReservationIds: removeReservationIds ?? [],
    AddReservationIds: addReservationIds ?? [],
  }
}
