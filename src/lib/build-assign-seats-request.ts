import { formatUsDateTime } from "@/lib/format-us-datetime"
import type {
  DeleteAllAssignSeatRequest,
  SaveAssignSeatsRequest,
  AssignSeatSaveItem,
} from "@/types/api/assign-seats"

export function buildSaveAssignSeatsRequest({
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
}): SaveAssignSeatsRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ShowId: showId,
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateId: lastUpdateId,
    AssignSeats: assignSeats,
  }
}

export function buildDeleteAllAssignSeatRequest({
  connectionName,
  locationId,
  showId,
  lastUpdateId,
}: {
  connectionName: string
  locationId: string
  showId: string
  lastUpdateId: string
}): DeleteAllAssignSeatRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ShowId: showId,
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateId: lastUpdateId,
  }
}
