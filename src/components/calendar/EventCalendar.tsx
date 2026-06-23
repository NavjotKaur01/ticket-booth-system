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
import RecurrenceDialog from "./RecurrenceDialog"
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
    const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false)
    const [isAddShowOpen, setIsAddShowOpen] = useState(false)
    const [isPastDateAlertOpen, setIsPastDateAlertOpen] = useState(false)
    const suppressNextSlotSelectionRef = useRef(false)

    //filtered events
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
    }), [location, showCancelled, refreshInterval, suppressNextSlotSelection])

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
            <PastDateAlertDialog
                open={isPastDateAlertOpen}
                onOpenChange={setIsPastDateAlertOpen}
            />
            <RecurrenceDialog
                open={isRecurrenceOpen}
                startDate={recurrenceDate}
                onOpenChange={setIsRecurrenceOpen}
                onSave={() => setIsAddShowOpen(true)}
            />
            <AddShowDialog
                open={isAddShowOpen}
                onOpenChange={setIsAddShowOpen}
                onBack={() => {
                    setIsAddShowOpen(false)
                    setIsRecurrenceOpen(true)
                }}
            />
        </div>
    )
}

