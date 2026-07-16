import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import {
  buildDeleteAllAssignSeatRequest,
  buildSaveAssignSeatsRequest,
  collectAssignTableNumList,
} from "@/lib/build-assign-seats-request"
import { clubmanApi } from "@/store/api/clubmanApi"
import type {
  ApiAssignSeatDetail,
  ApiAssignTableModel,
  ApiClubsAssignSeatDetail,
  ApiColumbusAssignSeatNumber,
  ApiReservationToAssignSeat,
} from "@/types/api/assign-seats"
import type { AssignSeatTableRow } from "@/features/assign-seats/assign-seats.types"

export async function fetchColumbusAssignSeatNumbers(
  connectionName: string
): Promise<ApiColumbusAssignSeatNumber[] | number[] | string[]> {
  return dispatchEndpoint(clubmanApi.endpoints.getColumbusAssignSeatNumbers, connectionName)
}

/** Desktop AssignSeatHelper.GetAssignSeatPropertiesV2 */
export async function fetchClubsAssignSeatDetail({
  connectionName,
  locationId,
}: {
  connectionName: string
  locationId: string
}): Promise<ApiClubsAssignSeatDetail> {
  return dispatchEndpoint(clubmanApi.endpoints.getClubsAssignSeatDetail, {
    connectionName,
    locationId,
  })
}

export async function fetchAssignSeatDetails({
  connectionName,
  showId,
  isCheckedIn = false,
}: {
  connectionName: string
  showId: string
  isCheckedIn?: boolean
}): Promise<ApiAssignSeatDetail[]> {
  return dispatchEndpoint(clubmanApi.endpoints.getAssignSeatDetails, {
    connectionName,
    showId,
    isCheckedIn,
  })
}

export async function fetchReservationsToAssignSeats({
  connectionName,
  showId,
}: {
  connectionName: string
  showId: string
}): Promise<ApiReservationToAssignSeat[]> {
  return dispatchEndpoint(clubmanApi.endpoints.getReservationsToAssignSeats, {
    connectionName,
    showId,
  })
}

/** Desktop CheckInVM.SaveSeats → POST SaveAssignSeats */
export async function saveAssignSeats({
  connectionName,
  locationId,
  showId,
  tables,
  removeAssignSeatList = [],
}: {
  connectionName: string
  locationId: string
  showId: string
  lastUpdateId?: string
  tables: AssignSeatTableRow[]
  removeAssignSeatList?: ApiAssignTableModel[]
}) {
  const request = buildSaveAssignSeatsRequest({
    connectionName,
    locationId,
    assignTableNumList: collectAssignTableNumList(tables, showId),
    removeAssignSeatList,
  })
  return dispatchEndpoint(clubmanApi.endpoints.saveAssignSeats, request)
}

/** Desktop DeleteAssignSeat → PUT DeleteAllAsignSeat */
export async function deleteAllAssignSeats({
  connectionName,
  locationId,
  showId,
}: {
  connectionName: string
  locationId: string
  showId: string
  lastUpdateId?: string
}) {
  const request = buildDeleteAllAssignSeatRequest({
    connectionName,
    locationId,
    showId,
  })
  return dispatchEndpoint(clubmanApi.endpoints.deleteAllAssignSeats, request)
}
