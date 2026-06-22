import { useState, useCallback, useMemo } from "react";
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
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


    //filtered events
    const filteredEvents = useMemo<CalendarEvent[]>(() => {
        return allEvents.filter(event => {
            if (event.location !== location) return false
            if(!showCancelled && event.cancelled) return false
            return true
        })
    }, [location, showCancelled])

    const components = useMemo(() => ({
        toolbar: (props: any) => (
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
        <div className="h-full w-full overflow-hidden bg-white">
            <Calendar 
                localizer={localizer}
                events={filteredEvents}
                defaultView="month"
                views={['month']}
                style={{height: 700}}
                components={components}
                eventPropGetter={eventPropGetter}
            />  
        </div>
    )
}