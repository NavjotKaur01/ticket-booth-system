type CalendarDialogSize = "md" | "lg" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"

const SIZE: Record<CalendarDialogSize, string> = {
  md: "28rem",
  lg: "32rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
}

/** Viewport-aware max-width for calendar dialogs on tablet and mobile. */
export function calendarDialogMaxWidth(size: CalendarDialogSize) {
  const max = SIZE[size]
  return `max-w-[calc(100%-1.5rem)] sm:max-w-[min(${max},calc(100%-2rem))] md:max-w-[min(${max},calc(100%-2.5rem))]`
}
