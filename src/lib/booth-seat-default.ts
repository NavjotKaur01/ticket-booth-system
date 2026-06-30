import type { ApiSystemDefaultItem } from "@/types/api/system-defaults"

const LOGIN_BOOTH_SEAT_SCREENS = new Set([
  "payment",
  "reservation",
  "check-in tab",
])

function normalizeDefaultText(value: string | null | undefined) {
  return value?.trim() ?? ""
}

function parseSeatCount(value: string | null | undefined) {
  if (!value?.trim()) {
    return 0
  }

  const parsed = Number.parseInt(value.trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function readSeatDefaultForScreen(
  defaults: ApiSystemDefaultItem[],
  screen: string
) {
  const match = defaults.find(
    (item) =>
      normalizeDefaultText(item.Screen).toLowerCase() === screen &&
      normalizeDefaultText(item.Field).toLowerCase() === "txtseats"
  )

  return parseSeatCount(match?.DefValue)
}

function readLoginBoothSeatDefault(defaults: ApiSystemDefaultItem[]) {
  for (const item of defaults) {
    const screen = normalizeDefaultText(item.Screen).toLowerCase()
    const field = normalizeDefaultText(item.Field).toLowerCase()

    if (field === "txtseats" && LOGIN_BOOTH_SEAT_SCREENS.has(screen)) {
      const parsed = parseSeatCount(item.DefValue)
      if (parsed > 0) {
        return parsed
      }
    }
  }

  return 0
}

/** Desktop ReservationVM + LoginVM booth seat defaults. */
export function readBoothSeatDefault(defaults: ApiSystemDefaultItem[]) {
  const pymtMethSeats = readSeatDefaultForScreen(defaults, "pymtmeth")
  if (pymtMethSeats > 0) {
    return pymtMethSeats
  }

  return readLoginBoothSeatDefault(defaults)
}
