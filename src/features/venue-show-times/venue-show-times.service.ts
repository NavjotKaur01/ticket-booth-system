import type { VenueShowTimeRecord } from "@/types/venue-show-time"

const MOCK_VENUE_SHOW_TIMES = new Map<string, VenueShowTimeRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "st-1",
        locationId: "standupmedia",
        dayOfWeek: "Friday",
        showTime: "10:00 PM",
        arrivalTime: "9:45 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
      {
        id: "st-2",
        locationId: "standupmedia",
        dayOfWeek: "Friday",
        showTime: "7:30 PM",
        arrivalTime: "7:00 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: false,
        showSeatingChart: true,
      },
      {
        id: "st-3",
        locationId: "standupmedia",
        dayOfWeek: "Monday",
        showTime: "7:00 PM",
        arrivalTime: "6:45 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
      {
        id: "st-4",
        locationId: "standupmedia",
        dayOfWeek: "Monday",
        showTime: "10:00 PM",
        arrivalTime: "9:45 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
      {
        id: "st-5",
        locationId: "standupmedia",
        dayOfWeek: "Saturday",
        showTime: "10:00 PM",
        arrivalTime: "9:45 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
      {
        id: "st-6",
        locationId: "standupmedia",
        dayOfWeek: "Saturday",
        showTime: "7:00 PM",
        arrivalTime: "6:30 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
      {
        id: "st-7",
        locationId: "standupmedia",
        dayOfWeek: "Sunday",
        showTime: "10:30 PM",
        arrivalTime: "10:00 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: false,
        showSeatingChart: false,
      },
      {
        id: "st-8",
        locationId: "standupmedia",
        dayOfWeek: "Sunday",
        showTime: "10:00 PM",
        arrivalTime: "9:45 PM",
        dinner: true,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
      {
        id: "st-9",
        locationId: "standupmedia",
        dayOfWeek: "Sunday",
        showTime: "7:30 PM",
        arrivalTime: "6:30 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
      {
        id: "st-10",
        locationId: "standupmedia",
        dayOfWeek: "Sunday",
        showTime: "7:00 PM",
        arrivalTime: "6:45 PM",
        dinner: true,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-1",
        locationId: "venue-b",
        dayOfWeek: "Thursday",
        showTime: "8:00 PM",
        arrivalTime: "7:30 PM",
        dinner: false,
        noPasses: true,
        vip: true,
        over21: true,
        showSeatingChart: true,
      },
      {
        id: "vb-2",
        locationId: "venue-b",
        dayOfWeek: "Friday",
        showTime: "9:30 PM",
        arrivalTime: "9:00 PM",
        dinner: true,
        noPasses: false,
        vip: true,
        over21: true,
        showSeatingChart: true,
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "vc-1",
        locationId: "venue-c",
        dayOfWeek: "Wednesday",
        showTime: "7:00 PM",
        arrivalTime: "6:30 PM",
        dinner: false,
        noPasses: false,
        vip: false,
        over21: false,
        showSeatingChart: true,
      },
      {
        id: "vc-2",
        locationId: "venue-c",
        dayOfWeek: "Saturday",
        showTime: "8:30 PM",
        arrivalTime: "8:00 PM",
        dinner: true,
        noPasses: false,
        vip: false,
        over21: true,
        showSeatingChart: false,
      },
    ],
  ],
])

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function normalizeLookupValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function cloneRows(rows: VenueShowTimeRecord[]) {
  return rows.map((row) => ({ ...row }))
}

function resolveTemplateKey(locationLabel?: string) {
  const normalized = normalizeLookupValue(locationLabel || "")

  if (normalized === "standupmedia") {
    return "standupmedia"
  }

  if (normalized === "venue b") {
    return "venue-b"
  }

  if (normalized === "venue c") {
    return "venue-c"
  }

  return null
}

function getRowsForLocation(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_VENUE_SHOW_TIMES.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_VENUE_SHOW_TIMES.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function persistRows(locationId: string, rows: VenueShowTimeRecord[]) {
  MOCK_VENUE_SHOW_TIMES.set(locationId, cloneRows(rows))
}

function buildShowTimeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `show-time-${Math.random().toString(36).slice(2, 10)}`
}

function sortRows(rows: VenueShowTimeRecord[]) {
  return rows.sort((left, right) => {
    if (left.dayOfWeek === right.dayOfWeek) {
      return left.showTime.localeCompare(right.showTime)
    }

    return left.dayOfWeek.localeCompare(right.dayOfWeek)
  })
}

export async function getVenueShowTimesByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<VenueShowTimeRecord[]> {
  await wait(180)
  return sortRows(getRowsForLocation(locationId, locationLabel))
}

export async function createVenueShowTime({
  locationId,
  locationLabel,
  dayOfWeek,
  showTime,
  arrivalTime,
  dinner,
  noPasses,
  vip,
  over21,
  showSeatingChart,
}: Omit<VenueShowTimeRecord, "id"> & { locationLabel?: string }): Promise<VenueShowTimeRecord> {
  await wait(180)

  const rows = getRowsForLocation(locationId, locationLabel)
  const nextRow: VenueShowTimeRecord = {
    id: buildShowTimeId(),
    locationId,
    dayOfWeek,
    showTime,
    arrivalTime,
    dinner,
    noPasses,
    vip,
    over21,
    showSeatingChart,
  }

  rows.unshift(nextRow)
  persistRows(locationId, rows)
  return { ...nextRow }
}

export async function updateVenueShowTime({
  locationId,
  locationLabel,
  showTimeId,
  dayOfWeek,
  showTime,
  arrivalTime,
  dinner,
  noPasses,
  vip,
  over21,
  showSeatingChart,
}: {
  locationId: string
  locationLabel?: string
  showTimeId: string
  dayOfWeek: string
  showTime: string
  arrivalTime: string
  dinner: boolean
  noPasses: boolean
  vip: boolean
  over21: boolean
  showSeatingChart: boolean
}): Promise<VenueShowTimeRecord> {
  await wait(180)

  const rows = getRowsForLocation(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === showTimeId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected venue show time.")
  }

  const updatedRow: VenueShowTimeRecord = {
    ...rows[rowIndex],
    dayOfWeek,
    showTime,
    arrivalTime,
    dinner,
    noPasses,
    vip,
    over21,
    showSeatingChart,
  }

  rows[rowIndex] = updatedRow
  persistRows(locationId, rows)
  return { ...updatedRow }
}

export async function deleteVenueShowTime({
  locationId,
  locationLabel,
  showTimeId,
}: {
  locationId: string
  locationLabel?: string
  showTimeId: string
}): Promise<void> {
  await wait(160)

  const rows = getRowsForLocation(locationId, locationLabel)
  const nextRows = rows.filter((row) => row.id !== showTimeId)

  if (nextRows.length === rows.length) {
    throw new Error("Unable to find the selected venue show time.")
  }

  persistRows(locationId, nextRows)
}
