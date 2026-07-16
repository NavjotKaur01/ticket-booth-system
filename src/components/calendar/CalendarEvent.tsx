import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import type { CalendarEvent } from "@/types/calendar-event"

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
  const isMobile = useIsMobile()

  return (
    <div
      className="calendar-event-card flex h-full min-w-0 items-center justify-between gap-0.5 px-0.5 py-0 text-[10px] leading-tight sm:gap-1 sm:px-1 sm:py-0.5 sm:text-[11px]"
      title={`${event.performer} - ${event.time} - ${event.seats.sold}/${event.seats.comp}/${event.seats.capacity}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <span className={`calendar-event-accent block h-2.5 w-0.5 rounded-lg sm:h-3 ${event.cancelled ? "bg-destructive" : "bg-primary"}`} />
          <div
            className={`truncate font-semibold ${event.cancelled ? "text-destructive line-through" : !event.buttonColor ? "text-primary" : ""}`}
            style={!event.cancelled && event.buttonColor ? { color: event.buttonColor } : undefined}
          >
            {event.performer}
          </div>
        </div>
        <div className={`truncate ${event.cancelled ? "text-destructive" : "text-muted-foreground"}`}>
          <span className="hidden sm:inline">
            {event.seats.comp}/{event.seats.sold}/{event.seats.capacity}{" "}
          </span>
          {event.time}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <span className={`hidden font-medium md:inline ${event.cancelled ? "text-destructive line-through" : "text-green-500"}`}>
          {event.status}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 rounded-sm text-muted-foreground hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary sm:h-5 sm:w-5"
              aria-label={`Open actions for ${event.performer}`}
              onClick={(menuEvent) => menuEvent.stopPropagation()}
              onPointerDown={(menuEvent) => menuEvent.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
            sideOffset={isMobile ? 4 : 8}
            collisionPadding={12}
            className="calendar-event-actions-menu max-h-[min(14rem,calc(var(--radix-dropdown-menu-content-available-height)-0.75rem))] w-[min(11.5rem,calc(100vw-1.25rem))] rounded-md border border-primary/20 bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-primary/10 sm:max-h-[min(18rem,calc(var(--radix-dropdown-menu-content-available-height)-1rem))] sm:w-52 sm:p-1.5 md:w-56"
            data-calendar-event-actions="true"
            onClick={(menuEvent) => menuEvent.stopPropagation()}
            onInteractOutside={() => {
              window.dispatchEvent(new CustomEvent(CALENDAR_ACTION_MENU_OUTSIDE_INTERACTION))
            }}
          >
            {calendarEventActions
              .filter((action) => {
                if (action.id === "cancel-show" && event.cancelled) return false
                if (action.id === "uncancel-show" && !event.cancelled) return false
                return true
              })
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  className="items-center rounded-sm px-2 py-1 text-xs focus:bg-primary/10 focus:text-primary sm:py-1.5 sm:text-sm"
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
