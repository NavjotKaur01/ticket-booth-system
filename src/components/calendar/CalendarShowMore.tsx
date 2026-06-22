import * as React from "react"
import dayjs from "dayjs"
import type { ShowMoreProps } from "react-big-calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { CalendarEvent } from "@/data/calendarEvents"
import { cn } from "@/lib/utils"

import CalendarEventCard from "./CalendarEvent"
import { useCalendarInteraction } from "./CalendarInteractionContext"

function stopCalendarInteraction(
  interactionEvent: React.SyntheticEvent<HTMLElement>
) {
  interactionEvent.stopPropagation()
}

type CalendarShowMoreProps = ShowMoreProps<CalendarEvent> & {
  onDismissOutside: () => void
}

export default function CalendarShowMore({
  count,
  events,
  slotDate,
  onDismissOutside,
}: CalendarShowMoreProps) {
  const [open, setOpen] = React.useState(false)
  const { selectedEventId, editEvent } = useCalendarInteraction()

  const handleEventClick = (
    clickEvent: React.MouseEvent<HTMLButtonElement>,
    event: CalendarEvent
  ) => {
    clickEvent.stopPropagation()
    const bounds = clickEvent.currentTarget.getBoundingClientRect()
    const side =
      bounds.left + bounds.width / 2 < window.innerWidth / 2
        ? "right"
        : "left"

    editEvent(event, {
      side,
      anchor: {
        x: side === "right" ? bounds.right : bounds.left,
        y: bounds.top,
      },
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rbc-button-link rbc-show-more"
          onPointerDown={stopCalendarInteraction}
          onMouseDown={stopCalendarInteraction}
          onClick={stopCalendarInteraction}
          aria-label={`Show ${count} more events for ${dayjs(slotDate).format("MMMM D, YYYY")}`}
        >
          {count} more
        </button>
      </PopoverTrigger>

      <PopoverContent
        data-calendar-overflow="true"
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
        onPointerDown={stopCalendarInteraction}
        onMouseDown={stopCalendarInteraction}
        onClick={stopCalendarInteraction}
        onPointerDownOutside={(outsideEvent) => {
          const target = outsideEvent.target as Element
          if (target.closest('[data-calendar-event-editor="true"]')) {
            outsideEvent.preventDefault()
            return
          }
          onDismissOutside()
        }}
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
          {events.map((event) => {
            const selected = event.id === selectedEventId

            return (
              <button
                key={event.id}
                type="button"
                aria-pressed={selected}
                className={cn(
                  "block w-full rounded-md border bg-background px-1 py-0.5 text-left transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  selected && "border-primary bg-accent ring-1 ring-primary/30"
                )}
                onPointerDown={stopCalendarInteraction}
                onMouseDown={stopCalendarInteraction}
                onClick={(clickEvent) => handleEventClick(clickEvent, event)}
              >
                <CalendarEventCard event={event} />
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}