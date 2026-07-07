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

export function getActiveUpcomingShows(shows: ShowDetailsByDateItem[]) {
  return shows.filter(show => show.IsShowActive)
}
