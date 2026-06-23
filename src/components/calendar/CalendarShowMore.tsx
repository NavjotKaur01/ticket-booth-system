import dayjs from "dayjs"
import type { ShowMoreProps } from "react-big-calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { CalendarEvent } from "@/data/calendarEvents"

import CalendarEventCard from "./CalendarEvent"

export default function CalendarShowMore({
  count,
  events,
  slotDate,
}: ShowMoreProps<CalendarEvent>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rbc-button-link rbc-show-more"
          onClick={(event) => event.stopPropagation()}
          aria-label={`Show ${count} more events for ${dayjs(slotDate).format("MMMM D, YYYY")}`}
        >
          {count} more 
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b px-3 py-2.5">
          <p className="font-semibold">
            {dayjs(slotDate).format("dddd, MMMM D")}
          </p>
          <p className="text-xs text-muted-foreground">
            {events.length} {events.length === 1 ? "event" : "events"}
          </p>
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto p-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-md border bg-background px-1 py-0.5 transition-colors hover:bg-muted/60"
            >
              <CalendarEventCard event={event} />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}