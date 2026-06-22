import type { CalendarEvent } from "@/data/calendarEvents";

interface CalendarEventProps {
    event: CalendarEvent
}

export default function CalendarEventCard({event}: CalendarEventProps) {
    return (
        <div
            className="flex min-w-0 items-start justify-between px-0.5 py-0.5 text-[10px] leading-tight sm:px-1 sm:text-[11px]"
            title={`${event.performer} - ${event.time} - ${event.seats.sold}/${event.seats.comp}/${event.seats.capacity}`}
        >
            <div className="min-w-0">
                <span className="w-1 h-full rounded-lg bg-primary" />
                <div className={`truncate font-semibold ${event.cancelled ? 'text-muted-foreground line-through' : 'text-primary'}`}>
                    {event.performer}
                </div>
                <div className="truncate text-muted-foreground">
                    <span className="hidden sm:inline">
                        {event.seats.sold}/{event.seats.comp}/{event.seats.capacity}{' '}
                    </span>
                    {event.time}
                </div>
            </div>
            <span className="ml-1 hidden shrink-0 font-medium text-muted-foreground md:inline">
                {event.status}
            </span>
        </div>
    )
}