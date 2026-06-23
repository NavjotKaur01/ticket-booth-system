import { useMemo, useState } from "react"
import dayjs from "dayjs"
import type { ShowMoreProps } from "react-big-calendar"

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover"
import type { CalendarEvent } from "@/data/calendarEvents"

import CalendarEventCard from "./CalendarEvent"

export default function CalendarShowMore({
  count,
  events,
  slotDate,
  onCalendarOutsideInteraction,
}: ShowMoreProps<CalendarEvent> & {
  onCalendarOutsideInteraction?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 })
  const virtualAnchor = useMemo(
    () => ({
      current: {
        getBoundingClientRect: () => new DOMRect(anchorPosition.x, anchorPosition.y, 0, 0),
      },
    }),
    [anchorPosition]
  )

  function openAtCursor(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setAnchorPosition({ x: event.clientX, y: event.clientY })
    setIsOpen((current) => !current)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor virtualRef={virtualAnchor} />
      <button
        type="button"
        className="rbc-button-link rbc-show-more"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={openAtCursor}
        aria-label={`Show ${count} more events for ${dayjs(slotDate).format("MMMM D, YYYY")}`}
      >
        {count} more
      </button>

      <PopoverContent
        align="start"
        side="bottom"
        alignOffset={0}
        sideOffset={4}
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
        onClick={(event) => event.stopPropagation()}
        onInteractOutside={(event) => {
          const target = event.detail.originalEvent.target

          if (target instanceof Element && target.closest("[data-calendar-event-actions]")) {
            event.preventDefault()
            return
          }

          onCalendarOutsideInteraction?.()
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

        <div className="calendar-thin-scrollbar max-h-80 space-y-1 overflow-y-auto p-2">
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
