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

function findRowsByLocationLabel(locationLabel?: string) {
  if (!locationLabel?.trim()) {
    return null
  }

  const normalizedLabel = normalizeLookupValue(locationLabel)
  if (normalizedLabel === "standupmedia") {
    return MOCK_VENUE_SHOW_TIMES.get("standupmedia") ?? null
  }

  if (normalizedLabel === "venue b") {
    return MOCK_VENUE_SHOW_TIMES.get("venue-b") ?? null
  }

  if (normalizedLabel === "venue c") {
    return MOCK_VENUE_SHOW_TIMES.get("venue-c") ?? null
  }

  return null
}

export async function getVenueShowTimesByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<VenueShowTimeRecord[]> {
  await wait(180)

  const rowsById = MOCK_VENUE_SHOW_TIMES.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const rowsByLabel = findRowsByLocationLabel(locationLabel)
  if (rowsByLabel) {
    return rowsByLabel.map((row) => ({
      ...row,
      id: `${locationId}-${row.id}`,
      locationId,
    }))
  }

  return []
}
