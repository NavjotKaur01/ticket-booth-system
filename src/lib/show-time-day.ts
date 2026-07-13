import { dayOfWeekOptions } from "@/data/show-time-form-options"

const DAY_ID_TO_NAME = Object.fromEntries(
  dayOfWeekOptions.map((option) => [option.id, option.label])
) as Record<string, string>

const DAY_NAME_TO_ID = Object.fromEntries(
  dayOfWeekOptions.map((option) => [option.label.toLowerCase(), option.id])
) as Record<string, string>

/** Maps UI day id (`mon`) → ClubMan DayOfWeek (`Monday`). */
export function toShowDefDayName(dayId: string): string | null {
  if (!dayId || dayId === "all" || dayId === "Select") return null
  return DAY_ID_TO_NAME[dayId] ?? null
}

/** Maps ClubMan ShowDefDay (`Monday`) → UI day id (`mon`). */
export function toShowDefDayId(dayName: string | null | undefined): string {
  const key = (dayName ?? "").trim().toLowerCase()
  return DAY_NAME_TO_ID[key] ?? "mon"
}

export function listAlsoAppliesDayNames(
  dayOfWeekId: string,
  alsoAppliesTo: Record<string, boolean>
): string[] {
  const names: string[] = []
  for (const option of dayOfWeekOptions) {
    const checked =
      alsoAppliesTo[option.id] === true || option.id === dayOfWeekId
    if (!checked) continue
    names.push(option.label)
  }
  return names
}
