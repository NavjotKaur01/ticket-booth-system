import type { CalendarEvent } from "@/data/calendarEvents";

interface CalendarEventProps {
    event: CalendarEvent
}

export default function CalendarEventCard({event}: CalendarEventProps) {
    return (
        <div className="flex items-start justify-between px-1 py-0.5 text-[11px] leading-tight">
            <div className="min-w-0">
                <div className={`font-semibold truncate ${event.cancelled ? 'text-gray-400 line-through' : 'text-blue-700'}`}>
                    {event.performer}
                </div>
                <div className="text-gray-500">
                    {event.seats.sold}/{event.seats.comp}/{event.seats.capacity}
                    &nbsp;&nbsp;
                    {event.time}

                </div>
            </div>
            <span className="text-gray-400 ml-1 shrink-0 font-medium">{event.status}</span>
        </div>
    )
}