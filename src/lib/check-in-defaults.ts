import type { ApiSystemDefaultItem } from "@/types/api/system-defaults"

function normalize(value: string | null | undefined) {
  return value?.trim() ?? ""
}

function findDefault(
  defaults: ApiSystemDefaultItem[],
  screens: string[],
  field: string
) {
  const normalizedField = field.toLowerCase()
  const screenSet = new Set(screens.map((screen) => screen.toLowerCase()))

  return defaults.find((item) => {
    const screen = normalize(item.Screen).toLowerCase()
    const itemField = normalize(item.Field).toLowerCase()
    return screenSet.has(screen) && itemField === normalizedField
  })
}

const EXPRESS_SCREENS = ["check-in tab", "pymtmeth", "payment", "reservation"]

/**
 * Desktop GetCheckedInDefaults express visibility:
 * - cmdExpress ≠ Y → hidden
 * - cmdExpress2 = 999 → always visible
 * - else minutes → visible when show start is within that window (caller passes showDateTime)
 */
export function readExpressPanelVisible(
  defaults: ApiSystemDefaultItem[],
  showDateTime?: Date | null
) {
  const express = findDefault(defaults, EXPRESS_SCREENS, "cmdexpress")
  if (!express) {
    return true
  }

  const enabled = normalize(express.DefValue).toUpperCase() === "Y"
  if (!enabled) {
    return false
  }

  const minutesDefault = findDefault(defaults, EXPRESS_SCREENS, "cmdexpress2")
  const minutesRaw = normalize(minutesDefault?.DefValue)
  if (!minutesRaw || minutesRaw === "999") {
    return true
  }

  const minutes = Number.parseInt(minutesRaw, 10)
  if (!Number.isFinite(minutes) || !showDateTime) {
    return true
  }

  const now = new Date()
  const windowStart = new Date(showDateTime.getTime() - minutes * 60_000)
  return now >= windowStart
}

/** Screen=CheckIn Field=Scanner Checkin */
export function readScannerCheckInVisible(defaults: ApiSystemDefaultItem[]) {
  const match = findDefault(defaults, ["checkin", "check-in", "check-in tab"], "scanner checkin")
  if (!match) {
    return true
  }

  return normalize(match.DefValue).toUpperCase() === "Y"
}

/** Toolbar Assign Seats — Field cmdassign = y */
export function readAssignSeatsVisible(defaults: ApiSystemDefaultItem[]) {
  const match = findDefault(
    defaults,
    ["check-in tab", "checkin", "payment", "reservation", "pymtmeth"],
    "cmdassign"
  )
  if (!match) {
    return true
  }

  return normalize(match.DefValue).toLowerCase() === "y"
}

export type PaymentPrintDefaults = {
  printAfterCheckIn: boolean
  printCashReceipt: boolean
  individualTickets: boolean
}

/** Screen=Payment — cmdPrint6 / cmdPrint3 / cmdPrint7 */
export function readPaymentPrintDefaults(
  defaults: ApiSystemDefaultItem[]
): PaymentPrintDefaults {
  const screens = ["payment", "pymtmeth", "check-in tab"]

  function isYes(field: string) {
    const match = findDefault(defaults, screens, field)
    if (!match) {
      return false
    }

    return normalize(match.DefValue).toUpperCase() === "Y"
  }

  return {
    printAfterCheckIn: isYes("cmdprint6"),
    printCashReceipt: isYes("cmdprint3"),
    individualTickets: isYes("cmdprint7"),
  }
}
