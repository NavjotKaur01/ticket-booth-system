import type { PartialCheckInRequest } from "@/types/api/partial-check-in"

type BuildPartialCheckInRequestParams = {
  connectionName: string
  reservationId: string
  partyNo: number
}

export function buildPartialCheckInRequest({
  connectionName,
  reservationId,
  partyNo,
}: BuildPartialCheckInRequestParams): PartialCheckInRequest {
  return {
    ConnectionName: connectionName,
    ReservationId: reservationId,
    PartyNo: partyNo,
  }
}
