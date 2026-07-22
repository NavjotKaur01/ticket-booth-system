import { buildReservationDayRange } from '@/lib/reservation-date-range'
import type { ShowDetailsByDateItem } from '@/types/api/show-details'

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') {
      return value
    }
  }

  return false
}

export function mapUpcomingShowDetailsItem(raw: unknown): ShowDetailsByDateItem | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const record = raw as Record<string, unknown>
  const showId = readString(record, ['ShowId', 'ShowID', 'showId'])
  if (!showId) {
    return null
  }

  return {
    ShowId: showId,
    ShowDate: readString(record, ['ShowDate', 'showDate']),
    ShowTim: readString(record, ['ShowTim', 'showTim']),
    HeadlinerName: readString(record, ['HeadlinerName', 'Headliner', 'headlinerName']) || null,
    ComicId: readString(record, ['ComicId', 'ComicID', 'comicId']),
    IsShowActive: readBoolean(record, ['IsShowActive', 'IsActive', 'isShowActive']),
    IsShowSoldOut: readBoolean(record, ['IsShowSoldOut', 'isShowSoldOut']),
    IsPrivate: readBoolean(record, ['IsPrivate', 'isPrivate']),
  }
}

export function mapUpcomingShowDetails(response: unknown): ShowDetailsByDateItem[] {
  if (!Array.isArray(response)) {
    return []
  }

  return response
    .map(mapUpcomingShowDetailsItem)
    .filter((item): item is ShowDetailsByDateItem => item != null)
}

export function buildUpcomingShowDetailsRequest({
  connectionString,
  locationId,
  startDateIso,
}: {
  connectionString: string
  locationId: string
  startDateIso: string
}) {
  const { startDate } = buildReservationDayRange(startDateIso)

  return {
    ConnectionString: connectionString,
    LocationId: locationId,
    StartDate: startDate,
  }
}

/** Extract yyyy-mm-dd from ClubMan show date strings. */
export function toIsoShowDate(value: string) {
  if (!value.trim()) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10)
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${parsed.getFullYear()}-${month}-${day}`
}

export function filterUpcomingShowsByDate(
  shows: ShowDetailsByDateItem[],
  isoDate: string
) {
  return shows.filter(show => toIsoShowDate(show.ShowDate) === isoDate)
}

/** Minutes from midnight for ClubMan ShowTim (ISO or "7:00 PM"). */
export function showTimeSortMinutes(showTim: string) {
  const trimmed = showTim?.trim() ?? ''
  if (!trimmed) {
    return Number.MAX_SAFE_INTEGER
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getHours() * 60 + parsed.getMinutes()
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) {
    return Number.MAX_SAFE_INTEGER
  }

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]?.toUpperCase()

  if (meridiem === 'PM' && hours < 12) {
    hours += 12
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0
  }

  return hours * 60 + minutes
}

/**
 * Desktop GetUpComingShowDetails intends date-then-time order for the Move list.
 * Sort by ShowDate ascending, then ShowTim ascending (same-day 4:00 PM before 9:00 PM).
 */
export function sortUpcomingShowsByDateTime(shows: ShowDetailsByDateItem[]) {
  return [...shows].sort((left, right) => {
    const dateCompare = toIsoShowDate(left.ShowDate).localeCompare(
      toIsoShowDate(right.ShowDate)
    )
    if (dateCompare !== 0) {
      return dateCompare
    }

    return showTimeSortMinutes(left.ShowTim) - showTimeSortMinutes(right.ShowTim)
  })
}

export function getActiveUpcomingShows(shows: ShowDetailsByDateItem[]) {
  return sortUpcomingShowsByDateTime(shows.filter(show => show.IsShowActive))
}
