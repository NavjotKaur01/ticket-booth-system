import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { buildUpcomingShowDetailsRequest } from "@/lib/map-upcoming-show-details"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type { CancelReservationRequest } from "@/types/api/cancel-reservation"
import type { ReservationNoteRequest } from "@/types/api/reservation-note"
import type { MoveReservationRequest } from "@/types/api/move-reservation"
import type { ReservationDetail } from "@/types/api/reservation-detail"
import type { ReservationHistoryItem } from "@/types/api/reservation-history"
import type { SaveReservationRequest } from "@/types/api/save-reservation"
import type { ShowDetailsByDateItem } from "@/types/api/show-details"
import type { ShowSectionItem } from "@/types/api/show-sections"

type FetchReservationDataParams = {
  connectionString: string
  showId: string
  includeCancelledReservations: boolean
  isCheckedIn: boolean
  isReservationForm: boolean
}

export function fetchReservationData({
  connectionString,
  showId,
  includeCancelledReservations,
  isCheckedIn,
  isReservationForm,
}: FetchReservationDataParams) {
  return dispatchEndpoint<ReservationDataItem[], FetchReservationDataParams>(
    clubmanApi.endpoints.getReservationData,
    {
      connectionString,
      showId,
      includeCancelledReservations,
      isCheckedIn,
      isReservationForm,
    }
  )
}

type FetchShowDetailsByDateParams = {
  connectionString: string
  locationId: string
  showDate: string
  isCancelledShow: boolean
}

export function fetchShowDetailsByDate({
  connectionString,
  locationId,
  showDate,
  isCancelledShow,
}: FetchShowDetailsByDateParams) {
  return dispatchEndpoint<ShowDetailsByDateItem[], FetchShowDetailsByDateParams>(
    clubmanApi.endpoints.getShowDetailsByDate,
    { connectionString, locationId, showDate, isCancelledShow }
  )
}

type FetchShowSectionsParams = {
  connectionString: string
  showId: string
}

export function fetchShowSections({
  connectionString,
  showId,
}: FetchShowSectionsParams) {
  return dispatchEndpoint<ShowSectionItem[], FetchShowSectionsParams>(
    clubmanApi.endpoints.getShowSections,
    { connectionString, showId }
  )
}

function normalizeReservationIds(response: unknown): string[] {
  if (Array.isArray(response)) {
    return response.map((id) => String(id)).filter(Boolean)
  }

  if (typeof response === "string" && response.trim()) {
    return [response.trim()]
  }

  if (response && typeof response === "object") {
    for (const key of ["ReservationId", "reservationId", "ReservationID", "id"]) {
      const value = (response as Record<string, unknown>)[key]
      if (typeof value === "string" && value.trim()) {
        return [value.trim()]
      }
    }
  }

  return []
}

export function saveReservation(request: SaveReservationRequest) {
  return dispatchEndpoint<unknown, SaveReservationRequest>(
    clubmanApi.endpoints.saveReservation,
    request
  ).then(normalizeReservationIds)
}

/** New reservation — always SaveReservation, never UpdateReservation. */
export function createNewReservation(request: SaveReservationRequest) {
  if (request.ReservationId) {
    throw new Error(
      'createNewReservation must not include ReservationId. Use updateReservation for edits.'
    )
  }

  return saveReservation(request)
}

export function updateReservation(request: SaveReservationRequest) {
  if (!request.ReservationId?.trim()) {
    throw new Error(
      'updateReservation requires ReservationId. New reservations must use createNewReservation.'
    )
  }

  return dispatchEndpoint<unknown, SaveReservationRequest>(
    clubmanApi.endpoints.updateReservation,
    request
  ).then(normalizeReservationIds)
}

type FetchReservationDetailByIdParams = {
  connectionString: string
  reservationId: string
}

export function fetchReservationDetailById({
  connectionString,
  reservationId,
}: FetchReservationDetailByIdParams) {
  return dispatchEndpoint<ReservationDetail, FetchReservationDetailByIdParams>(
    clubmanApi.endpoints.getReservationDetailById,
    { connectionString, reservationId }
  )
}

export function fetchReservationHistoryById({
  connectionString,
  reservationId,
}: FetchReservationDetailByIdParams) {
  return dispatchEndpoint<ReservationHistoryItem[], FetchReservationDetailByIdParams>(
    clubmanApi.endpoints.getReservationHistoryById,
    { connectionString, reservationId }
  )
}

export function cancelReservation(request: CancelReservationRequest) {
  return dispatchEndpoint<unknown, CancelReservationRequest>(
    clubmanApi.endpoints.cancelReservation,
    request
  )
}

export function revertCancelReservation(request: CancelReservationRequest) {
  return dispatchEndpoint<unknown, CancelReservationRequest>(
    clubmanApi.endpoints.revertCancelReservation,
    request
  )
}

export function saveReservationNote(request: ReservationNoteRequest) {
  return dispatchEndpoint<unknown, ReservationNoteRequest>(
    clubmanApi.endpoints.saveReservationNote,
    request
  )
}

export function fetchUpcomingShowDetails({
  connectionString,
  locationId,
  startDateIso,
}: {
  connectionString: string
  locationId: string
  startDateIso: string
}) {
  return dispatchEndpoint<ShowDetailsByDateItem[], ReturnType<typeof buildUpcomingShowDetailsRequest>>(
    clubmanApi.endpoints.getUpcomingShowDetails,
    buildUpcomingShowDetailsRequest({
      connectionString,
      locationId,
      startDateIso,
    })
  )
}

function normalizeMoveReservationIds(response: unknown): string[] {
  if (Array.isArray(response)) {
    return response.map((id) => String(id)).filter(Boolean)
  }

  return []
}

export function moveReservation(request: MoveReservationRequest) {
  return dispatchEndpoint<unknown, MoveReservationRequest>(
    clubmanApi.endpoints.saveMoveReservation,
    request
  ).then(normalizeMoveReservationIds)
}
