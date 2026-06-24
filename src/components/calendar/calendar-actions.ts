import type { CalendarEvent } from "@/data/calendarEvents"

export type CalendarActionId =
  | "add-edit-package"
  | "add-show"
  | "add-reservation"
  | "adjust-age"
  | "adjust-hub"
  | "adjust-promo"
  | "adjust-seats-section-price"
  | "cancel-show"
  | "edit-comic"
  | "edit-show"
  | "mark-sold-out"
  | "mark-unavailable-web"
  | "show-history"
  | "show-detail-history"
  | "move-show"
  | "pre-sale-private-show"

export type CalendarActionDialog = "addEditPackage" | "recurrence"
export type PastDateBehavior = "block" | "allow"

export interface CalendarActionDefinition {
  id: CalendarActionId
  label: string
  dialog?: CalendarActionDialog
  pastDateBehavior: PastDateBehavior
}

export type CalendarEventActionSelectHandler = (
  actionId: CalendarActionId,
  event: CalendarEvent
) => void

export const calendarEventActions: CalendarActionDefinition[] = [
  { id: "add-edit-package", label: "Add/edit Package", dialog: "addEditPackage", pastDateBehavior: "block" },
  { id: "add-show", label: "Add Show", dialog: "recurrence", pastDateBehavior: "block" },
  { id: "add-reservation", label: "Add Reservation", pastDateBehavior: "block" },
  { id: "adjust-age", label: "Adjust Age", pastDateBehavior: "block" },
  { id: "adjust-hub", label: "Adjust Hub", pastDateBehavior: "block" },
  { id: "adjust-promo", label: "Adjust Promo for show", pastDateBehavior: "block" },
  { id: "adjust-seats-section-price", label: "Adjust Seats/Section/Price", pastDateBehavior: "block" },
  { id: "cancel-show", label: "Cancel Show", pastDateBehavior: "block" },
  { id: "edit-comic", label: "Edit Comic", pastDateBehavior: "block" },
  { id: "edit-show", label: "Edit Show", pastDateBehavior: "block" },
  { id: "mark-sold-out", label: "Mark Show as Sold Out", pastDateBehavior: "block" },
  { id: "mark-unavailable-web", label: "Mark Show Unavailable on Web", pastDateBehavior: "block" },
  { id: "show-history", label: "Show History", pastDateBehavior: "block" },
  { id: "show-detail-history", label: "Show Detail History", pastDateBehavior: "block" },
  { id: "move-show", label: "Move Show", pastDateBehavior: "block" },
  { id: "pre-sale-private-show", label: "Pre-sale Private Show", pastDateBehavior: "block" },
]

export function getCalendarAction(actionId: CalendarActionId) {
  return calendarEventActions.find((action) => action.id === actionId)
}

export function shouldBlockPastDateAction(action: CalendarActionDefinition) {
  return action.pastDateBehavior === "block"
}

