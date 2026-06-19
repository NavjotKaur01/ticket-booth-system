export const dayOfWeekFilterOptions = [
  { id: "all", label: "All Days" },
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
] as const

export const dayOfWeekOptions = dayOfWeekFilterOptions.filter(
  (option) => option.id !== "all"
)

export const weekDayCheckboxOptions = [
  { id: "sun", label: "Sunday" },
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
] as const

export const showSectionOptions = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "shared-table", label: "2 Person Shared Table" },
  { id: "vip", label: "VIP" },
  { id: "regular", label: "Regular" },
] as const

export function getSectionLabel(sectionId: string) {
  return (
    showSectionOptions.find((option) => option.id === sectionId)?.label ??
    sectionId
  )
}
