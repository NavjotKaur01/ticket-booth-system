import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import {
  Calendar,
  dayjsLocalizer,
  type HeaderProps,
  type ShowMoreProps,
  type SlotInfo,
  type ToolbarProps,
  type View,
} from "react-big-calendar"
import dayjs from "dayjs"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "./calendar-overrides.css"

import AddShowDialog from "./AddShowDialog"
import CalendarToolbar from "./CalendarToolbar"
import CalendarEventCard, { CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION } from "./CalendarEvent"
import CalendarShowMore from "./CalendarShowMore"
import PastDateAlertDialog from "./PastDateAlertDialog"
import RecurrenceDialog, { type RecurrenceFormValue } from "./RecurrenceDialog"
import { useAuth } from "@/contexts/auth-context"
import { useAppSession } from "@/hooks/use-app-session"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useLocations } from "@/hooks/use-locations"
import { findLocationById } from "@/lib/api/locations"
import {
  mapRecurrenceFormToState,
  validateRecurrenceForm,
} from "@/lib/recurrence/map-recurrence-form"
import type { CalendarEvent } from "@/types/calendar-event"
import type { RecurrenceState } from "@/types/recurrence"

const localizer = dayjsLocalizer(dayjs)
const DEFAULT_REFRESH_SECONDS = 30

function WeekHeader({ date }: HeaderProps) {
  const isToday = dayjs(date).isSame(dayjs(), "day")

  return (
    <div className="calendar-week-header">
      <span className="calendar-week-header-day">
        {dayjs(date).format("ddd")}
      </span>
      <span className={isToday ? "calendar-week-header-date is-today" : "calendar-week-header-date"}>
        {dayjs(date).format("D")}
      </span>
    </div>
  )
}

function getStartOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function isTodayOrFuture(date: Date) {
  return getStartOfDay(date) >= getStartOfDay(new Date())
}

export default function EventCalendar() {
  const { switchLocation } = useAuth()
  const {
    connectionName,
    locationId,
    locationName,
    clubSlug,
    username,
    isReady,
  } = useAppSession()
  const { locations, loading: locationsLoading } = useLocations(clubSlug)

  const [showCancelled, setShowCancelled] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(DEFAULT_REFRESH_SECONDS)
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [calendarView, setCalendarView] = useState<View>("month")
  const [recurrenceDate, setRecurrenceDate] = useState<Date | null>(null)
  const [recurrenceState, setRecurrenceState] = useState<RecurrenceState | null>(null)
  const [recurrenceError, setRecurrenceError] = useState<string | null>(null)
  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false)
  const [isAddShowOpen, setIsAddShowOpen] = useState(false)
  const [isPastDateAlertOpen, setIsPastDateAlertOpen] = useState(false)
  const suppressNextSlotSelectionRef = useRef(false)

  const { events, loading, error, refetch } = useCalendarEvents(
    connectionName,
    locationId,
    locationName,
    calendarDate,
    showCancelled,
    refreshInterval,
    isReady
  )

  const suppressNextSlotSelection = useCallback(() => {
    suppressNextSlotSelectionRef.current = true
    window.setTimeout(() => {
      suppressNextSlotSelectionRef.current = false
    }, 100)
  }, [])

  useEffect(() => {
    window.addEventListener(CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION, suppressNextSlotSelection)

    return () => {
      window.removeEventListener(CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION, suppressNextSlotSelection)
    }
  }, [suppressNextSlotSelection])

  const handleLocationChange = useCallback(
    (nextLocationId: string) => {
      const location = findLocationById(nextLocationId, locations)
      if (location) {
        switchLocation(location)
      }
    },
    [locations, switchLocation]
  )

  const handleRecurrenceSave = useCallback((form: RecurrenceFormValue) => {
    const validationError = validateRecurrenceForm(form)
    if (validationError) {
      setRecurrenceError(validationError)
      return
    }

    setRecurrenceError(null)
    setRecurrenceState(mapRecurrenceFormToState(form))
    setIsRecurrenceOpen(false)
    setIsAddShowOpen(true)
  }, [])

  const handleAddShowSaved = useCallback(() => {
    setRecurrenceState(null)
    refetch()
  }, [refetch])

  const components = useMemo(() => ({
    toolbar: (props: ToolbarProps<CalendarEvent>) => (
      <CalendarToolbar
        {...props}
        locationId={locationId}
        onLocationChange={handleLocationChange}
        locations={locations}
        locationsLoading={locationsLoading}
        showCancelled={showCancelled}
        setShowCancelled={setShowCancelled}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onRefresh={refetch}
        isRefreshing={loading}
      />
    ),
    event: ({ event }: { event: CalendarEvent }) => (
      <CalendarEventCard event={event} />
    ),
    week: {
      header: WeekHeader,
    },
    showMore: (props: ShowMoreProps<CalendarEvent>) => (
      <CalendarShowMore
        {...props}
        onCalendarOutsideInteraction={suppressNextSlotSelection}
      />
    ),
  }), [
    locationId,
    handleLocationChange,
    locations,
    locationsLoading,
    showCancelled,
    refreshInterval,
    refetch,
    loading,
    suppressNextSlotSelection,
  ])

  const eventPropGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: event.rowColor ?? "transparent",
      border: "none",
      padding: 0,
    },
  }), [])

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const selectedDate = getStartOfDay(slotInfo.start)

    if (suppressNextSlotSelectionRef.current) {
      suppressNextSlotSelectionRef.current = false
      return
    }

    if (!isTodayOrFuture(selectedDate)) {
      setIsPastDateAlertOpen(true)
      return
    }

    setRecurrenceDate(selectedDate)
    setRecurrenceError(null)
    setRecurrenceState(null)
    setIsRecurrenceOpen(true)
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-border">
      {error ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <Calendar
        localizer={localizer}
        events={events}
        date={calendarDate}
        onNavigate={setCalendarDate}
        view={calendarView}
        onView={setCalendarView}
        views={["month", "week"]}
        showAllEvents={false}
        className="min-h-0 flex-1"
        components={components}
        eventPropGetter={eventPropGetter}
        selectable
        onSelectSlot={handleSelectSlot}
      />
      <PastDateAlertDialog
        open={isPastDateAlertOpen}
        onOpenChange={setIsPastDateAlertOpen}
      />
      <RecurrenceDialog
        open={isRecurrenceOpen}
        startDate={recurrenceDate}
        onOpenChange={setIsRecurrenceOpen}
        onSave={handleRecurrenceSave}
        errorMessage={recurrenceError}
      />
      <AddShowDialog
        open={isAddShowOpen}
        onOpenChange={setIsAddShowOpen}
        recurrence={recurrenceState}
        connectionString={connectionName}
        locationId={locationId}
        username={username}
        onSaved={handleAddShowSaved}
        onBack={() => {
          setIsAddShowOpen(false)
          setIsRecurrenceOpen(true)
        }}
      />
    </div>
  )
}
