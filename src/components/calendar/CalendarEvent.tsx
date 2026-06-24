import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CalendarEvent } from "@/data/calendarEvents"

import {
  calendarEventActions,
  type CalendarEventActionSelectHandler,
} from "./calendar-actions"

export const CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION = "calendar-action-menu-outside-interaction"

interface CalendarEventProps {
  event: CalendarEvent
  onActionSelect?: CalendarEventActionSelectHandler
}

export default function CalendarEventCard({ event, onActionSelect }: CalendarEventProps) {
  return (
    <div
      className="flex h-full min-w-0 items-center justify-between gap-1 px-0.5 py-0.5 text-[10px] leading-tight sm:px-1 sm:text-[11px]"
      title={`${event.performer} - ${event.time} - ${event.seats.sold}/${event.seats.comp}/${event.seats.capacity}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="block h-3 w-0.5 rounded-lg bg-primary" />
          <div className={`truncate font-semibold ${event.cancelled ? "text-muted-foreground line-through" : "text-primary"}`}>
            {event.performer}
          </div>
        </div>
        <div className="truncate text-muted-foreground">
          <span className="hidden sm:inline">
            {event.seats.sold}/{event.seats.comp}/{event.seats.capacity}{" "}
          </span>
          {event.time}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <span className="hidden font-medium text-muted-foreground md:inline">
          {event.status}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-sm text-muted-foreground hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
              aria-label={`Open actions for ${event.performer}`}
              onClick={(menuEvent) => menuEvent.stopPropagation()}
              onPointerDown={(menuEvent) => menuEvent.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            collisionPadding={16}
            className="calendar-event-actions-menu max-h-[min(20rem,calc(var(--radix-dropdown-menu-content-available-height)-1rem))] w-64 rounded-md border border-primary/20 bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-primary/10"
            data-calendar-event-actions="true"
            onClick={(menuEvent) => menuEvent.stopPropagation()}
            onInteractOutside={() => {
              window.dispatchEvent(new CustomEvent(CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION))
            }}
          >
            {calendarEventActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                className="items-center rounded-sm px-2 py-1.5 text-sm focus:bg-primary/10 focus:text-primary"
                onSelect={(menuEvent) => {
                  menuEvent.stopPropagation()
                  onActionSelect?.(action.id, event)
                }}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
