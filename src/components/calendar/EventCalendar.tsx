import * as React from "react"
import {
  Calendar,
  dayjsLocalizer,
  type ShowMoreProps,
  type SlotInfo,
  type ToolbarProps,
  type View,
} from "react-big-calendar"
import dayjs from "dayjs"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "./calendar-overrides.css"

import {
  CalendarEventEditorPopover,
  type EventEditorTarget,
} from "./EventEditorPopover"
import CalendarEventCard from "./CalendarEvent"
import {
  CalendarInteractionContext,
  type EditorPlacement,
} from "./CalendarInteractionContext"
import CalendarShowMore from "./CalendarShowMore"
import CalendarToolbar from "./CalendarToolbar"
import {
  events as initialEvents,
  locations,
  type CalendarEvent,
} from "@/data/calendarEvents"

const localizer = dayjsLocalizer(dayjs)

function stopCalendarInteraction(
  interactionEvent: React.SyntheticEvent<HTMLElement>
) {
  interactionEvent.stopPropagation()
}

export default function EventCalendar() {
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents)
  const [location, setLocation] = React.useState(locations[0])
  const [showCancelled, setShowCancelled] = React.useState(false)
  const [refreshInterval, setRefreshInterval] = React.useState(30)
  const [calendarDate, setCalendarDate] = React.useState(() => new Date())
  const [calendarView, setCalendarView] = React.useState<View>("month")
  const [editorTarget, setEditorTarget] =
    React.useState<EventEditorTarget | null>(null)
  const [slotSelectionSuppressed, setSlotSelectionSuppressed] =
    React.useState(false)

  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      if (event.location !== location) return false
      if (!showCancelled && event.cancelled) return false
      return true
    })
  }, [events, location, showCancelled])

  const suppressSlotSelection = React.useCallback(() => {
    setSlotSelectionSuppressed(true)
    window.setTimeout(() => setSlotSelectionSuppressed(false), 300)
  }, [])

  const getEditorPlacement = React.useCallback(
    (bounds: { left: number; right: number; top: number }): EditorPlacement => {
      const gridBounds = document
        .querySelector<HTMLElement>('[data-calendar-grid="true"]')
        ?.getBoundingClientRect()

      if (!gridBounds) {
        const elementCenter = bounds.left + (bounds.right - bounds.left) / 2
        const side = elementCenter < window.innerWidth / 2 ? "right" : "left"
        return {
          side,
          anchor: {
            x: side === "right" ? bounds.right : bounds.left,
            y: bounds.top,
          },
        }
      }

      const spaceOnLeft = gridBounds.left
      const spaceOnRight = window.innerWidth - gridBounds.right
      const side = spaceOnRight >= spaceOnLeft ? "right" : "left"

      return {
        side,
        anchor: {
          x: side === "right" ? gridBounds.right : gridBounds.left,
          y: bounds.top,
        },
      }
    },
    []
  )

  const getSlotPlacement = React.useCallback(
    (slotInfo: SlotInfo): EditorPlacement => {
      if (slotInfo.bounds) return getEditorPlacement(slotInfo.bounds)

      const clickX = slotInfo.box?.clientX ?? window.innerWidth / 2
      const clickY = slotInfo.box?.clientY ?? window.innerHeight / 2
      return getEditorPlacement({ left: clickX, right: clickX, top: clickY })
    },
    [getEditorPlacement]
  )

  const handleSaveEvent = React.useCallback((savedEvent: CalendarEvent) => {
    setEvents((currentEvents) => {
      const eventExists = currentEvents.some(
        (event) => event.id === savedEvent.id
      )

      if (!eventExists) return [...currentEvents, savedEvent]

      return currentEvents.map((event) =>
        event.id === savedEvent.id ? savedEvent : event
      )
    })
  }, [])

  const handleEditEvent = React.useCallback(
    (event: CalendarEvent, placement: EditorPlacement) => {
      const gridPlacement = getEditorPlacement({
        left: placement.anchor.x,
        right: placement.anchor.x,
        top: placement.anchor.y,
      })

      setEditorTarget({
        event,
        ...gridPlacement,
        start: event.start,
        end: event.end,
      })
    },
    [getEditorPlacement]
  )

  const handleNavigate = React.useCallback((date: Date) => {
    setCalendarDate(date)
    setEditorTarget(null)
  }, [])

  const handleViewChange = React.useCallback((view: View) => {
    setCalendarView(view)
    setEditorTarget(null)
  }, [])

  const handleSelectSlot = React.useCallback(
    (slotInfo: SlotInfo) => {
      if (slotSelectionSuppressed) {
        setSlotSelectionSuppressed(false)
        return
      }

      let start = dayjs(slotInfo.start)
      let end = dayjs(slotInfo.end)

      if (calendarView === "month") {
        start = start.hour(19).minute(0).second(0).millisecond(0)
        end = start.add(90, "minute")
      } else if (!end.isAfter(start)) {
        end = start.add(30, "minute")
      }

      setEditorTarget({
        ...getSlotPlacement(slotInfo),
        start: start.toDate(),
        end: end.toDate(),
      })
    },
    [calendarView, getSlotPlacement, slotSelectionSuppressed]
  )

  const components = React.useMemo(
    () => ({
      toolbar: (props: ToolbarProps<CalendarEvent>) => (
        <CalendarToolbar
          {...props}
          location={location}
          setLocation={setLocation}
          locations={locations}
          showCancelled={showCancelled}
          setShowCancelled={setShowCancelled}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
        />
      ),
      event: ({ event }: { event: CalendarEvent }) => (
        <button
          type="button"
          className="block w-full rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          onPointerDown={stopCalendarInteraction}
          onMouseDown={stopCalendarInteraction}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation()
            handleEditEvent(
              event,
              getEditorPlacement(
                clickEvent.currentTarget.getBoundingClientRect()
              )
            )
          }}
        >
          <CalendarEventCard event={event} />
        </button>
      ),
      showMore: (props: ShowMoreProps<CalendarEvent>) => (
        <CalendarShowMore
          {...props}
          onDismissOutside={suppressSlotSelection}
        />
      ),
    }),
    [
      getEditorPlacement,
      handleEditEvent,
      location,
      refreshInterval,
      showCancelled,
      suppressSlotSelection,
    ]
  )

  const interactionValue = React.useMemo(
    () => ({
      selectedEventId: editorTarget?.event?.id ?? null,
      editEvent: handleEditEvent,
    }),
    [editorTarget?.event?.id, handleEditEvent]
  )

  const eventPropGetter = React.useCallback(
    () => ({
      style: {
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
      },
    }),
    []
  )

  return (
    <CalendarInteractionContext.Provider value={interactionValue}>
      <div
        data-calendar-grid="true"
        className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-border"
      >
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          date={calendarDate}
          onNavigate={handleNavigate}
          view={calendarView}
          onView={handleViewChange}
          views={["month", "week"]}
          selectable="ignoreEvents"
          onSelectSlot={handleSelectSlot}
          showAllEvents={false}
          className="min-h-0 flex-1"
          components={components}
          eventPropGetter={eventPropGetter}
        />
      </div>

      <CalendarEventEditorPopover
        target={editorTarget}
        onOpenChange={(open) => {
          if (!open) setEditorTarget(null)
        }}
        onDismissOutside={suppressSlotSelection}
        locations={locations}
        defaultLocation={location}
        onSave={handleSaveEvent}
      />
    </CalendarInteractionContext.Provider>
  )
}