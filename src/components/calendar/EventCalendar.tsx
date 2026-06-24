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

import CalendarDialogs from "./dialogs/CalendarDialogs"
import CalendarToolbar from "./CalendarToolbar"
import CalendarEventCard, { CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION } from "./CalendarEvent"
import CalendarShowMore from "./CalendarShowMore"
import {
    getCalendarAction,
    shouldBlockPastDateAction,
    type CalendarActionId,
} from "./calendar-actions"
import { events as allEvents, locations, type CalendarEvent } from "@/data/calendarEvents"

const localizer = dayjsLocalizer(dayjs)

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
    const [location, setLocation] = useState<string>(locations[0])
    const [showCancelled, setShowCancelled] = useState<boolean>(false)
    const [refreshInterval, setRefreshInterval] = useState<number>(30)
    const [calendarDate, setCalendarDate] = useState(() => new Date())
    const [calendarView, setCalendarView] = useState<View>("month")
    const [recurrenceDate, setRecurrenceDate] = useState<Date | null>(null)
    const [packageEvent, setPackageEvent] = useState<CalendarEvent | null>(null)
    const [isAddEditPackageOpen, setIsAddEditPackageOpen] = useState(false)
    const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false)
    const [isAddShowOpen, setIsAddShowOpen] = useState(false)
    const [isPastDateAlertOpen, setIsPastDateAlertOpen] = useState(false)
    const suppressNextSlotSelectionRef = useRef(false)

    const filteredEvents = useMemo<CalendarEvent[]>(() => {
        return allEvents.filter(event => {
            if (event.location !== location) return false
            if (!showCancelled && event.cancelled) return false
            return true
        })
    }, [location, showCancelled])

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

    const handleCalendarActionSelect = useCallback((actionId: CalendarActionId, event: CalendarEvent) => {
        const action = getCalendarAction(actionId)

        if (!action) {
            return
        }

        const actionDate = getStartOfDay(event.start)

        if (!isTodayOrFuture(actionDate) && shouldBlockPastDateAction(action)) {
            setIsPastDateAlertOpen(true)
            return
        }

        if (action.dialog === "addEditPackage") {
            setPackageEvent(event)
            setIsAddEditPackageOpen(true)
            return
        }

        if (action.dialog === "recurrence") {
            setRecurrenceDate(actionDate)
            setIsRecurrenceOpen(true)
        }
    }, [])

    const components = useMemo(() => ({
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
            <CalendarEventCard event={event} onActionSelect={handleCalendarActionSelect} />
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
    }), [location, showCancelled, refreshInterval, suppressNextSlotSelection, handleCalendarActionSelect])

    const eventPropGetter = useCallback(() => ({
        style: {
            backgroundColor: "transparent",
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
        setIsRecurrenceOpen(true)
    }, [])

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-border">
            <Calendar
                localizer={localizer}
                events={filteredEvents}
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
            <CalendarDialogs
                isAddEditPackageOpen={isAddEditPackageOpen}
                setIsAddEditPackageOpen={setIsAddEditPackageOpen}
                packageEvent={packageEvent}
                isPastDateAlertOpen={isPastDateAlertOpen}
                setIsPastDateAlertOpen={setIsPastDateAlertOpen}
                isRecurrenceOpen={isRecurrenceOpen}
                setIsRecurrenceOpen={setIsRecurrenceOpen}
                recurrenceDate={recurrenceDate}
                isAddShowOpen={isAddShowOpen}
                setIsAddShowOpen={setIsAddShowOpen}
            />
        </div>
    )
}


