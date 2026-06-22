import { useState, useCallback, useMemo } from "react";
import { Calendar, dayjsLocalizer, type ToolbarProps } from 'react-big-calendar';
import dayjs from 'dayjs'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-overrides.css'

import CalendarToolbar from "./CalendarToolbar";
import CalendarEventCard from "./CalendarEvent";
import {events as allEvents, locations, type CalendarEvent} from '@/data/calendarEvents';

const localizer = dayjsLocalizer(dayjs)

export default function EventCalendar( ) {
    const [location, setLocation] = useState<string>(locations[0])
    const [showCancelled, setShowCancelled] = useState<boolean>(false)
    const [refreshInterval, setRefreshInterval] = useState<number>(30)
    const [calendarDate, setCalendarDate] = useState(() => new Date())


    //filtered events
    const filteredEvents = useMemo<CalendarEvent[]>(() => {
        return allEvents.filter(event => {
            if (event.location !== location) return false
            if(!showCancelled && event.cancelled) return false
            return true
        })
    }, [location, showCancelled])

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
        event: ({ event } : {event: CalendarEvent}) => (
            <CalendarEventCard event={event} />
        ),
    }), [location, showCancelled, refreshInterval])

    const eventPropGetter = useCallback(() => ({
        style: {
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
        },
    }), [])

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-border">
            <Calendar 
                localizer={localizer}
                events={filteredEvents}
                date={calendarDate}
                onNavigate={setCalendarDate}
                defaultView="month"
                views={['month', 'week']}
                className="min-h-0 flex-1"
                components={components}
                eventPropGetter={eventPropGetter}
            />  
        </div>
    )
}