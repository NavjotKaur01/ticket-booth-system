import type { VenueRotatingAdDraft, VenueRotatingAdRecord } from "@/types/venue-rotating-ad"

const MOCK_ROTATING_ADS = new Map<string, VenueRotatingAdRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "rotating-ad-1",
        locationId: "standupmedia",
        alternateText: "test 2",
        displayOrder: 2,
        active: false,
        startingDate: "2009-04-27",
        endingDate: "3000-05-26",
        adName: "Rotating Ad Two",
        navigateUrl: "https://standupmedia.com/promotions/test-2",
        adText:
          "<p><strong>test 2</strong> rotating ad copy for the venue homepage carousel.</p>",
      },
      {
        id: "rotating-ad-2",
        locationId: "standupmedia",
        alternateText: "test",
        displayOrder: 1,
        active: false,
        startingDate: "2009-04-27",
        endingDate: "3000-05-26",
        adName: "Rotating Ad One",
        navigateUrl: "https://standupmedia.com/promotions/test",
        adText:
          "<p><strong>test</strong> rotating ad copy with mock rich-text content.</p>",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-rotating-ad-1",
        locationId: "venue-b",
        alternateText: "Weekend Spotlight",
        displayOrder: 1,
        active: true,
        startingDate: "2026-01-01",
        endingDate: "2026-12-31",
        adName: "Weekend Spotlight",
        navigateUrl: "https://venueb.example.com/weekend",
        adText: "<p>Weekend spotlight rotating banner for Venue B.</p>",
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

function cloneRows(rows: VenueRotatingAdRecord[]) {
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

  return null
}

function getMutableRows(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_ROTATING_ADS.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById).sort(
      (left, right) => left.displayOrder - right.displayOrder
    )
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_ROTATING_ADS.get(templateKey) ?? []
  return templateRows
    .map((row) => ({
      ...row,
      id: `${locationId}-${row.id}`,
      locationId,
    }))
    .sort((left, right) => left.displayOrder - right.displayOrder)
}

function persistRows(locationId: string, rows: VenueRotatingAdRecord[]) {
  MOCK_ROTATING_ADS.set(locationId, cloneRows(rows))
}

function buildAdId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `rotating-ad-${Math.random().toString(36).slice(2, 10)}`
}

export async function getVenueRotatingAdsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<VenueRotatingAdRecord[]> {
  await wait(180)
  return getMutableRows(locationId, locationLabel)
}

export async function createVenueRotatingAd({
  locationId,
  locationLabel,
  input,
}: {
  locationId: string
  locationLabel?: string
  input: VenueRotatingAdDraft
}): Promise<VenueRotatingAdRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const nextRow: VenueRotatingAdRecord = {
    id: buildAdId(),
    locationId,
    ...input,
  }

  rows.push(nextRow)
  persistRows(
    locationId,
    rows.sort((left, right) => left.displayOrder - right.displayOrder)
  )
  return { ...nextRow }
}

export async function updateVenueRotatingAd({
  locationId,
  locationLabel,
  adId,
  input,
}: {
  locationId: string
  locationLabel?: string
  adId: string
  input: VenueRotatingAdDraft
}): Promise<VenueRotatingAdRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === adId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected rotating ad.")
  }

  const updatedRow: VenueRotatingAdRecord = {
    ...rows[rowIndex],
    ...input,
  }

  rows[rowIndex] = updatedRow
  persistRows(
    locationId,
    rows.sort((left, right) => left.displayOrder - right.displayOrder)
  )
  return { ...updatedRow }
}

export async function deleteVenueRotatingAd({
  locationId,
  locationLabel,
  adId,
}: {
  locationId: string
  locationLabel?: string
  adId: string
}): Promise<void> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel).filter((row) => row.id !== adId)
  persistRows(locationId, rows)
}
