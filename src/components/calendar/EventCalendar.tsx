import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

import CalendarDialogs from "./dialogs/CalendarDialogs"
import CalendarEventCard, {
  CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION,
} from "./CalendarEvent"
import CalendarShowMore from "./CalendarShowMore"
import CalendarToolbar from "./CalendarToolbar"
import { createTodayFirstMonthView } from "./views/TodayFirstMonthView"
import {
  getCalendarAction,
  shouldBlockPastDateAction,
  type CalendarActionId,
} from "./calendar-actions"
import { useAppSession } from "@/hooks/use-app-session"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import {
  mapRecurrenceFormToState,
  validateRecurrenceForm,
} from "@/lib/recurrence/map-recurrence-form"
import { mapCalendarEventToRecurrenceState } from "@/lib/recurrence/map-calendar-event-to-recurrence"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import type { CalendarEvent } from "@/types/calendar-event"
import type { RecurrenceFormValue, RecurrenceState } from "@/types/recurrence"
import {
  useMarkShowSoldOutMutation,
  useMarkShowUnavailableOnWebMutation,
  useUnCancelShowMutation,
} from "@/store/api/clubmanApi"
import { buildMarkShowUnavailableOnWebRequest } from "./service/showStatus.service"

const localizer = dayjsLocalizer(dayjs)
const DEFAULT_REFRESH_SECONDS = 30

function WeekHeader({ date }: HeaderProps) {
  const isToday = dayjs(date).isSame(dayjs(), "day")

  return (
    <div className="calendar-week-header">
      <span className="calendar-week-header-day">
        {dayjs(date).format("ddd")}
      </span>
      <span
        className={
          isToday
            ? "calendar-week-header-date is-today"
            : "calendar-week-header-date"
        }
      >
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

function buildTime(hour: number, minute = 0) {
  const value = new Date()
  value.setHours(hour, minute, 0, 0)
  return value
}

export default function EventCalendar() {
  const {
    connectionName,
    locationId,
    locationName,
    username,
    isReady,
  } = useAppSession()
  const [showCancelled, setShowCancelled] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(DEFAULT_REFRESH_SECONDS)
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [calendarView, setCalendarView] = useState<View>("month")
  const [hasNavigated, setHasNavigated] = useState(false)
  const [recurrenceDate, setRecurrenceDate] = useState<Date | null>(null)
  const [recurrenceState, setRecurrenceState] = useState<RecurrenceState | null>(null)
  const [recurrenceError, setRecurrenceError] = useState<string | null>(null)
  const [packageEvent, setPackageEvent] = useState<CalendarEvent | null>(null)
  const [reservationEvent, setReservationEvent] = useState<CalendarEvent | null>(null)
  const [adjustAgeEvent, setAdjustAgeEvent] = useState<CalendarEvent | null>(null)
  const [adjustHubEvent, setAdjustHubEvent] = useState<CalendarEvent | null>(null)
  const [adjustPromoEvent, setAdjustPromoEvent] = useState<CalendarEvent | null>(null)
  const [adjustSeatsEvent, setAdjustSeatsEvent] = useState<CalendarEvent | null>(null)
  const [cancelShowEvent, setCancelShowEvent] = useState<CalendarEvent | null>(null)
  const [editComicEvent, setEditComicEvent] = useState<CalendarEvent | null>(null)
  const [editShowEvent, setEditShowEvent] = useState<CalendarEvent | null>(null)
  const [editShowRecurrence, setEditShowRecurrence] = useState<RecurrenceState | null>(null)
  const [moveShowEvent, setMoveShowEvent] = useState<CalendarEvent | null>(null)
  const [privatePreSaleEvent, setPrivatePreSaleEvent] = useState<CalendarEvent | null>(null)
  const [showHistoryEvent, setShowHistoryEvent] = useState<CalendarEvent | null>(null)
  const [showDetailHistoryEvent, setShowDetailHistoryEvent] = useState<CalendarEvent | null>(null)
  const [isAddEditPackageOpen, setIsAddEditPackageOpen] = useState(false)
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false)
  const [isAdjustAgeOpen, setIsAdjustAgeOpen] = useState(false)
  const [isAdjustHubOpen, setIsAdjustHubOpen] = useState(false)
  const [isAdjustPromoOpen, setIsAdjustPromoOpen] = useState(false)
  const [isAdjustSeatsOpen, setIsAdjustSeatsOpen] = useState(false)
  const [isCancelShowOpen, setIsCancelShowOpen] = useState(false)
  const [isEditComicOpen, setIsEditComicOpen] = useState(false)
  const [isEditShowOpen, setIsEditShowOpen] = useState(false)
  const [isMoveShowOpen, setIsMoveShowOpen] = useState(false)
  const [isPrivatePreSaleOpen, setIsPrivatePreSaleOpen] = useState(false)
  const [isShowHistoryOpen, setIsShowHistoryOpen] = useState(false)
  const [isShowDetailHistoryOpen, setIsShowDetailHistoryOpen] = useState(false)
  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false)
  const [isAddShowOpen, setIsAddShowOpen] = useState(false)
  const [isPastDateAlertOpen, setIsPastDateAlertOpen] = useState(false)
  const [calendarActionError, setCalendarActionError] = useState<string | null>(
    null
  )
  const suppressNextSlotSelectionRef = useRef(false)
  const [unCancelShow] = useUnCancelShowMutation()
  const [markShowSoldOut, { isLoading: isMarkingSoldOut }] =
    useMarkShowSoldOutMutation()
  const [markShowUnavailableOnWeb, { isLoading: isMarkingUnavailable }] =
    useMarkShowUnavailableOnWebMutation()

  const { events, loading, refetch } = useCalendarEvents(
    connectionName,
    locationId,
    locationName,
    calendarDate,
    showCancelled,
    refreshInterval,
    isReady
  )

  const defaultMinTime = useMemo(() => buildTime(0), [])
  const defaultMaxTime = useMemo(() => buildTime(23, 59), [])
  const defaultScrollTime = useMemo(() => buildTime(8), [])
  const calendarViews = useMemo(
    () => ({
      month: createTodayFirstMonthView(!hasNavigated),
      week: true,
    }),
    [hasNavigated]
  )

  const suppressNextSlotSelection = useCallback(() => {
    suppressNextSlotSelectionRef.current = true
    window.setTimeout(() => {
      suppressNextSlotSelectionRef.current = false
    }, 100)
  }, [])

  useEffect(() => {
    window.addEventListener(
      CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION,
      suppressNextSlotSelection
    )

    return () => {
      window.removeEventListener(
        CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION,
        suppressNextSlotSelection
      )
    }
  }, [suppressNextSlotSelection])


  const handleCalendarActionSelect = useCallback(
    async (actionId: CalendarActionId, event: CalendarEvent) => {
      const action = getCalendarAction(actionId)

      if (!action) {
        return
      }

      const actionDate = getStartOfDay(event.start)

      if (!isTodayOrFuture(actionDate) && shouldBlockPastDateAction(action)) {
        setCalendarActionError(null)
        setIsPastDateAlertOpen(true)
        return
      }

      if (
        action.id === "mark-sold-out" ||
        action.id === "mark-unavailable-web"
      ) {
        if (isMarkingSoldOut || isMarkingUnavailable) {
          return
        }

        const calendarShowId = event.showId || event.id

        try {
          setCalendarActionError(null)

          const didUpdate =
            action.id === "mark-sold-out"
              ? await markShowSoldOut({
                  ConnectionString: connectionName,
                  CalendarShowId: calendarShowId,
                  IsShowSoldOut: true,
                }).unwrap()
              : await markShowUnavailableOnWeb(
                  buildMarkShowUnavailableOnWebRequest({
                    connectionString: connectionName,
                    calendarShowId,
                    username,
                  })
                ).unwrap()

          if (!didUpdate) {
            setCalendarActionError("Unable to update show status.")
            setIsPastDateAlertOpen(true)
            return
          }

          refetch()
        } catch (error: unknown) {
          setCalendarActionError(getClubmanErrorMessage(error))
          setIsPastDateAlertOpen(true)
        }
        return
      }

      if (action.id === "uncancel-show") {
        unCancelShow({
          ConnectionString: connectionName,
          CalendarShowId: event.id,
          LocationId: locationId,
        })
        return
      }

      if (action.dialog === "addEditPackage") {
        setPackageEvent(event)
        setIsAddEditPackageOpen(true)
        return
      }

      if (action.dialog === "addReservation") {
        setReservationEvent(event)
        setIsAddReservationOpen(true)
        return
      }

      if (action.dialog === "adjustAge") {
        setAdjustAgeEvent(event)
        setIsAdjustAgeOpen(true)
        return
      }

      if (action.dialog === "adjustHub") {
        setAdjustHubEvent(event)
        setIsAdjustHubOpen(true)
        return
      }

      if (action.dialog === "adjustPromo") {
        setAdjustPromoEvent(event)
        setIsAdjustPromoOpen(true)
        return
      }

      if (action.dialog === "adjustSeats") {
        setAdjustSeatsEvent(event)
        setIsAdjustSeatsOpen(true)
        return
      }

      if (action.dialog === "cancelShow") {
        setCancelShowEvent(event)
        setIsCancelShowOpen(true)
        return
      }

      if (action.dialog === "editComic") {
        setEditComicEvent(event)
        setIsEditComicOpen(true)
        return
      }

      if (action.dialog === "editShow") {
        setEditShowEvent(event)
        setEditShowRecurrence(mapCalendarEventToRecurrenceState(event))
        setIsEditShowOpen(true)
        return
      }

      if (action.dialog === "moveShow") {
        setMoveShowEvent(event)
        setIsMoveShowOpen(true)
        return
      }

      if (action.dialog === "preSalePrivateShow") {
        setPrivatePreSaleEvent(event)
        setIsPrivatePreSaleOpen(true)
        return
      }

      if (action.dialog === "showHistory") {
        setShowHistoryEvent(event)
        setIsShowHistoryOpen(true)
        return
      }

      if (action.dialog === "showDetailHistory") {
        setShowDetailHistoryEvent(event)
        setIsShowDetailHistoryOpen(true)
        return
      }

      if (action.dialog === "recurrence") {
        setRecurrenceDate(actionDate)
        setRecurrenceError(null)
        setRecurrenceState(null)
        setIsRecurrenceOpen(true)
      }
    },
    [
      connectionName,
      isMarkingSoldOut,
      isMarkingUnavailable,
      locationId,
      markShowSoldOut,
      markShowUnavailableOnWeb,
      refetch,
      unCancelShow,
      username,
    ]
  )

  const handleDoubleClickEvent = useCallback(
    (event: CalendarEvent) => {
      // Double-click on a show opens the Add Reservation dialog, matching CM behaviour
      setReservationEvent(event)
      setIsAddReservationOpen(true)
    },
    []
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
    refetch()
  }, [refetch])

  const handleEditShowSaved = useCallback(() => {
    refetch()
  }, [refetch])

  const handleEditShowOpenChange = useCallback((open: boolean) => {
    setIsEditShowOpen(open)
  }, [])

  const handleEditShowAfterClose = useCallback(() => {
    setEditShowEvent(null)
    setEditShowRecurrence(null)
  }, [])

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: event.rowColor ?? "transparent",
        border: "none",
        padding: 0,
      },
    }),
    []
  )

  const dayPropGetter = useCallback(
    (date: Date) => {
      const today = getStartOfDay(new Date())
      const day = getStartOfDay(date)
      const isShiftedCurrentMonth =
        !hasNavigated &&
        calendarView === "month" &&
        dayjs(calendarDate).isSame(today, "month")

      if (isShiftedCurrentMonth && day < today) {
        return { className: "calendar-past-day" }
      }

      return {}
    },
    [calendarDate, calendarView, hasNavigated]
  )

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

  const components = useMemo(
    () => ({
      toolbar: (props: ToolbarProps<CalendarEvent>) => (
        <CalendarToolbar
          {...props}
          showCancelled={showCancelled}
          setShowCancelled={setShowCancelled}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          onRefresh={refetch}
          isRefreshing={loading}
        />
      ),
      event: ({ event }: { event: CalendarEvent }) => (
        <CalendarEventCard
          event={event}
          onActionSelect={handleCalendarActionSelect}
        />
      ),
      week: {
        header: WeekHeader,
      },
      showMore: (props: ShowMoreProps<CalendarEvent>) => (
        <CalendarShowMore
          {...props}
          onCalendarOutsideInteraction={suppressNextSlotSelection}
          onActionSelect={handleCalendarActionSelect}
        />
      ),
    }),
    [
      showCancelled,
      refreshInterval,
      refetch,
      loading,
      handleCalendarActionSelect,
      suppressNextSlotSelection,
    ]
  )

  return (
    <div
      data-fill-page
      className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-border"
    >
      
      <Calendar
        localizer={localizer}
        events={events}
        date={calendarDate}
        onNavigate={(newDate, _view, action) => {
          setCalendarDate(newDate)
          setHasNavigated(action !== "TODAY")
        }}
        view={calendarView}
        onView={setCalendarView}
        views={calendarViews}
        min={defaultMinTime}
        max={defaultMaxTime}
        scrollToTime={defaultScrollTime}
        showAllEvents={false}
        className="min-h-0 flex-1"
        components={components}
        eventPropGetter={eventPropGetter}
        dayPropGetter={dayPropGetter}
        selectable
        onSelectSlot={handleSelectSlot}
        onDoubleClickEvent={handleDoubleClickEvent}
      />
      <CalendarDialogs
        isAddEditPackageOpen={isAddEditPackageOpen}
        setIsAddEditPackageOpen={setIsAddEditPackageOpen}
        packageEvent={packageEvent}
        onAddEditPackageAfterClose={() => setPackageEvent(null)}
        isAddReservationOpen={isAddReservationOpen}
        setIsAddReservationOpen={setIsAddReservationOpen}
        reservationEvent={reservationEvent}
        onAddReservationSaved={refetch}
        onAddReservationAfterClose={() => setReservationEvent(null)}
        isAdjustAgeOpen={isAdjustAgeOpen}
        setIsAdjustAgeOpen={setIsAdjustAgeOpen}
        adjustAgeEvent={adjustAgeEvent}
        onAdjustAgeSaved={refetch}
        onAdjustAgeAfterClose={() => setAdjustAgeEvent(null)}
        isAdjustHubOpen={isAdjustHubOpen}
        setIsAdjustHubOpen={setIsAdjustHubOpen}
        adjustHubEvent={adjustHubEvent}
        onAdjustHubAfterClose={() => setAdjustHubEvent(null)}
        isAdjustPromoOpen={isAdjustPromoOpen}
        setIsAdjustPromoOpen={setIsAdjustPromoOpen}
        adjustPromoEvent={adjustPromoEvent}
        onAdjustPromoSaved={refetch}
        onAdjustPromoAfterClose={() => setAdjustPromoEvent(null)}
        isAdjustSeatsOpen={isAdjustSeatsOpen}
        setIsAdjustSeatsOpen={setIsAdjustSeatsOpen}
        adjustSeatsEvent={adjustSeatsEvent}
        onAdjustSeatsAfterClose={() => setAdjustSeatsEvent(null)}
        isCancelShowOpen={isCancelShowOpen}
        setIsCancelShowOpen={setIsCancelShowOpen}
        cancelShowEvent={cancelShowEvent}
        onCancelShowAfterClose={() => setCancelShowEvent(null)}
        isEditComicOpen={isEditComicOpen}
        setIsEditComicOpen={setIsEditComicOpen}
        editComicEvent={editComicEvent}
        onEditComicAfterClose={() => setEditComicEvent(null)}
        isEditShowOpen={isEditShowOpen}
        onEditShowOpenChange={handleEditShowOpenChange}
        editShowRecurrence={editShowRecurrence}
        editShowEvent={editShowEvent}
        onEditShowSaved={handleEditShowSaved}
        onEditShowAfterClose={handleEditShowAfterClose}
        isMoveShowOpen={isMoveShowOpen}
        setIsMoveShowOpen={setIsMoveShowOpen}
        moveShowEvent={moveShowEvent}
        onMoveShowSaved={refetch}
        onMoveShowAfterClose={() => setMoveShowEvent(null)}
        isPrivatePreSaleOpen={isPrivatePreSaleOpen}
        setIsPrivatePreSaleOpen={setIsPrivatePreSaleOpen}
        privatePreSaleEvent={privatePreSaleEvent}
        onPrivatePreSaleSaved={refetch}
        onPrivatePreSaleAfterClose={() => setPrivatePreSaleEvent(null)}
        isShowHistoryOpen={isShowHistoryOpen}
        setIsShowHistoryOpen={setIsShowHistoryOpen}
        showHistoryEvent={showHistoryEvent}
        onShowHistoryAfterClose={() => setShowHistoryEvent(null)}
        isShowDetailHistoryOpen={isShowDetailHistoryOpen}
        setIsShowDetailHistoryOpen={setIsShowDetailHistoryOpen}
        showDetailHistoryEvent={showDetailHistoryEvent}
        onShowDetailHistoryAfterClose={() => setShowDetailHistoryEvent(null)}
        isPastDateAlertOpen={isPastDateAlertOpen}
        setIsPastDateAlertOpen={setIsPastDateAlertOpen}
        calendarActionError={calendarActionError}
        onPastDateAlertAfterClose={() => setCalendarActionError(null)}
        isRecurrenceOpen={isRecurrenceOpen}
        setIsRecurrenceOpen={setIsRecurrenceOpen}
        recurrenceDate={recurrenceDate}
        recurrenceError={recurrenceError}
        recurrenceState={recurrenceState}
        onRecurrenceSave={handleRecurrenceSave}
        onRecurrenceAfterClose={() => setRecurrenceError(null)}
        isAddShowOpen={isAddShowOpen}
        setIsAddShowOpen={setIsAddShowOpen}
        connectionString={connectionName}
        locationId={locationId}
        username={username}
        onAddShowSaved={handleAddShowSaved}
        onAddShowAfterClose={() => setRecurrenceState(null)}
      />
    </div>
  )
}






