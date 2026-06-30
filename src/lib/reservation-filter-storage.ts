type StoredReservationFilters = {
  showCancelled?: boolean
  cancelledShow?: boolean
  refreshValue?: string
}

function storageKey(locationId: string) {
  return `clubman-reservation-filters:${locationId}`
}

export function readReservationFilters(locationId: string): StoredReservationFilters {
  if (!locationId) {
    return {}
  }

  try {
    const raw = sessionStorage.getItem(storageKey(locationId))
    if (!raw) {
      return {}
    }

    return JSON.parse(raw) as StoredReservationFilters
  } catch {
    return {}
  }
}

export function writeReservationFilters(
  locationId: string,
  filters: StoredReservationFilters
) {
  if (!locationId) {
    return
  }

  sessionStorage.setItem(storageKey(locationId), JSON.stringify(filters))
}
