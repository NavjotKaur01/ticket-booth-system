import type { CalendarEvent } from "@/data/calendarEvents"

import type { CalendarSelectOption } from "../controls/CalendarSelectControl"

export type AdjustAgeMode = "flag" | "minAge"

export type AdjustAgeDialogData = {
  eventId: string
  performer: string
  showDateLabel: string
  mode: AdjustAgeMode
  ageFlag: string
  minAge: string
  ageFlagOptions: CalendarSelectOption[]
}

export type AdjustAgeFormValues = {
  mode: AdjustAgeMode
  ageFlag: string
  minAge: string
}

const AGE_FLAG_OPTIONS: CalendarSelectOption[] = [
  { value: "A", label: "A (all ages)" },
  { value: "Y", label: "Y (21 and over)" },
  { value: "N", label: "N (18 and over)" },
  { value: "S", label: "S (custom)" },
]

function formatShowDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function getDefaultAgeFlag(event: CalendarEvent) {
  if (event.performer.toLowerCase().includes("late night")) {
    return "Y"
  }

  if (event.seats.capacity >= 200) {
    return "N"
  }

  return "A"
}

export const CUSTOM_AGE_FLAG = "S"

function getMinAgeForAgeFlag(ageFlag: string, currentMinAge = "") {
  switch (ageFlag) {
    case "Y":
      return "21"
    case "N":
      return "18"
    case "S":
      return currentMinAge.trim() || "16"
    default:
      return ""
  }
}

export function applyAgeFlagChange(
  current: AdjustAgeFormValues,
  ageFlag: string
): AdjustAgeFormValues {
  if (ageFlag === CUSTOM_AGE_FLAG) {
    return {
      mode: "minAge",
      ageFlag: CUSTOM_AGE_FLAG,
      minAge: getMinAgeForAgeFlag(CUSTOM_AGE_FLAG, current.minAge),
    }
  }

  return {
    mode: "flag",
    ageFlag,
    minAge: getMinAgeForAgeFlag(ageFlag, current.minAge),
  }
}

export function applyMinAgeChange(
  current: AdjustAgeFormValues,
  minAge: string
): AdjustAgeFormValues {
  const trimmedMinAge = minAge.trim()

  if (!trimmedMinAge) {
    return {
      ...current,
      minAge: "",
    }
  }

  return {
    mode: "minAge",
    ageFlag: CUSTOM_AGE_FLAG,
    minAge,
  }
}

export function applyAdjustAgeModeChange(
  current: AdjustAgeFormValues,
  mode: AdjustAgeMode
): AdjustAgeFormValues {
  if (mode === "minAge") {
    return {
      mode: "minAge",
      ageFlag: CUSTOM_AGE_FLAG,
      minAge: getMinAgeForAgeFlag(CUSTOM_AGE_FLAG, current.minAge),
    }
  }

  return {
    ...current,
    mode: "flag",
  }
}

export function createAdjustAgeFormValues(data: AdjustAgeDialogData): AdjustAgeFormValues {
  return {
    mode: data.mode,
    ageFlag: data.ageFlag,
    minAge: data.minAge,
  }
}

export async function getAdjustAgeDialogData(
  event: CalendarEvent
): Promise<AdjustAgeDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  const ageFlag = getDefaultAgeFlag(event)

  return {
    eventId: event.id,
    performer: event.performer,
    showDateLabel: formatShowDate(event.start),
    mode: "flag",
    ageFlag,
    minAge: getMinAgeForAgeFlag(ageFlag),
    ageFlagOptions: AGE_FLAG_OPTIONS,
  }
}

