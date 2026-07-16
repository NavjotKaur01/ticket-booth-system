import type { ApiShowProperties } from "@/types/api/get-show-data"

import type { CalendarSelectOption } from "../controls/CalendarSelectControl"

export type AdjustAgeMode = "flag" | "minAge"


export type AdjustAgeFormValues = {
  mode: AdjustAgeMode
  ageFlag: string
  minAge: string
}

export const AGE_FLAG_OPTIONS: CalendarSelectOption[] = [
  { value: "", label: "Blank" },
  { value: "A", label: "A (all ages)" },
  { value: "Y", label: "Y (21 and over)" },
  { value: "N", label: "N (18 and over)" },
  { value: "S", label: "S (custom)" },
]

export function formatShowDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
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


export function parseAgeRestrictionValue(over21: string | null | undefined): string {
  const val = (over21 || "").trim()
  if (val === "Y" || val.startsWith("Y")) return "Y"
  if (val === "N" || val.startsWith("N")) return "N"
  if (val === "A" || val.startsWith("A")) return "A"
  if (val === "S" || val.startsWith("S")) return "S"
  return ""
}

export function parseInitialAgeValues(showProperties: ApiShowProperties): AdjustAgeFormValues {
  const over21 = parseAgeRestrictionValue(showProperties.Over21)
  const minAge = showProperties.MinAge || ""

  if (over21 === "Y") return { mode: "flag", ageFlag: "Y", minAge: "21" }
  if (over21 === "N") return { mode: "flag", ageFlag: "N", minAge: "18" }
  if (over21 === "A") return { mode: "flag", ageFlag: "A", minAge: "" }
  if (over21 === "S") return { mode: "minAge", ageFlag: "S", minAge: minAge }
  
  return { mode: "flag", ageFlag: "", minAge: "" }
}

export function getSelectedAgeParam(ageFlag: string, mode: AdjustAgeMode): string {
  if (mode === "minAge") return "S (custom)"
  switch (ageFlag) {
    case "A": return "A (all ages)"
    case "Y": return "Y (21 and over)"
    case "N": return "N (18 and over)"
    case "S": return "S (custom)"
    case "": return ""
    default: return ""
  }
}

