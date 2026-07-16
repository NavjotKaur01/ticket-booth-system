import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import {
  buildDeleteAllAssignSeatRequest,
  buildSaveAssignSeatsRequest,
} from "@/lib/build-assign-seats-request"
import { clubmanApi } from "@/store/api/clubmanApi"
import type {
  ApiAssignSeatDetail,
  ApiClubsAssignSeatDetail,
  ApiColumbusAssignSeatNumber,
  ApiReservationToAssignSeat,
  AssignSeatSaveItem,
} from "@/types/api/assign-seats"

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

export async function saveAssignSeats({
  connectionName,
  locationId,
  showId,
  lastUpdateId,
  assignSeats,
}: {
  connectionName: string
  locationId: string
  showId: string
  lastUpdateId: string
  assignSeats: AssignSeatSaveItem[]
}) {
  const request = buildSaveAssignSeatsRequest({
    connectionName,
    locationId,
    showId,
    lastUpdateId,
    assignSeats,
  })
  return dispatchEndpoint(clubmanApi.endpoints.saveAssignSeats, request)
}

export async function deleteAllAssignSeats({
  connectionName,
  locationId,
  showId,
  lastUpdateId,
}: {
  connectionName: string
  locationId: string
  showId: string
  lastUpdateId: string
}) {
  const request = buildDeleteAllAssignSeatRequest({
    connectionName,
    locationId,
    showId,
    lastUpdateId,
  })
  return dispatchEndpoint(clubmanApi.endpoints.deleteAllAssignSeats, request)
}
