import * as React from "react"

import type { CalendarEvent } from "@/data/calendarEvents"

export type EditorPlacement = {
  anchor: { x: number; y: number }
  side: "left" | "right"
}

type CalendarInteractionContextValue = {
  selectedEventId: number | null
  editEvent: (event: CalendarEvent, placement: EditorPlacement) => void
}

export const CalendarInteractionContext =
  React.createContext<CalendarInteractionContextValue | null>(null)

export function useCalendarInteraction() {
  const context = React.useContext(CalendarInteractionContext)

  if (!context) {
    throw new Error(
      "useCalendarInteraction must be used within CalendarInteractionContext"
    )
  }

  return context
}