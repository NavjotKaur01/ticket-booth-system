import { useMemo } from "react"

import { mapCalendarModelsToEvents } from "@/lib/map-calendar-events"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetCalendarDataQuery } from "@/store/api/clubmanApi"
import type { CalendarEvent } from "@/types/calendar-event"

const DEFAULT_REFRESH_SECONDS = 30
const MIN_REFRESH_SECONDS = 10

type UseCalendarEventsResult = {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCalendarEvents(
  connectionString: string,
  locationId: string,
  locationLabel: string,
  calendarDate: Date,
  showCancelled: boolean,
  refreshIntervalSeconds = DEFAULT_REFRESH_SECONDS,
  enabled = true
): UseCalendarEventsResult {
  const calendarDateKey = calendarDate.toISOString()
  const shouldSkip = !enabled || !connectionString || !locationId
  const pollingInterval =
    Math.max(refreshIntervalSeconds, MIN_REFRESH_SECONDS) * 1000

  const { data, isLoading, isFetching, error, refetch } = useGetCalendarDataQuery(
    {
      connectionString,
      locationId,
      calendarDate: calendarDateKey,
      isCancelled: showCancelled,
    },
    {
      skip: shouldSkip,
      pollingInterval: shouldSkip ? 0 : pollingInterval,
    }
  )

  const events = useMemo(
    () =>
      shouldSkip
        ? []
        : mapCalendarModelsToEvents(data ?? [], locationLabel),
    [data, locationLabel, shouldSkip]
  )

  return {
    events,
    loading: shouldSkip ? false : isLoading || isFetching,
    error: error ? getClubmanErrorMessage(error) : null,
    refetch,
  }
}
