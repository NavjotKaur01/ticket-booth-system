function storageKey(locationId: string) {
  return `clubman-booth-seats:${locationId}`
}

export function readStoredBoothSeatCount(locationId: string) {
  if (!locationId) {
    return 0
  }

  try {
    const raw = sessionStorage.getItem(storageKey(locationId))
    if (!raw?.trim()) {
      return 0
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  } catch {
    return 0
  }
}

export function writeStoredBoothSeatCount(locationId: string, count: number) {
  if (!locationId || count <= 0) {
    return
  }

  sessionStorage.setItem(storageKey(locationId), String(count))
}
