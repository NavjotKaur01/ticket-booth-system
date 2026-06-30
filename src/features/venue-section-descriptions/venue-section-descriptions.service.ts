import type {
  VenueSectionDescriptionDraft,
  VenueSectionDescriptionRecord,
} from "@/types/venue-section-description"

const STANDUPMEDIA_SECTIONS: VenueSectionDescriptionRecord[] = [
  {
    id: "section-1",
    locationId: "standupmedia",
    sectionName: "Front",
    sectionDetail:
      "is located in the front of the venue, several rows closest to the stage and offers a clear view of the comedians on the stage",
  },
  {
    id: "section-2",
    locationId: "standupmedia",
    sectionName: "Back",
    sectionDetail: "Last 4 Rows test",
  },
  {
    id: "section-3",
    locationId: "standupmedia",
    sectionName: "Side",
    sectionDetail: "Side",
  },
  {
    id: "section-4",
    locationId: "standupmedia",
    sectionName: "Obstructed",
    sectionDetail: "Partially obstructed seating with limited stage visibility.",
  },
  {
    id: "section-5",
    locationId: "standupmedia",
    sectionName: "2 Person Shared VIP Table",
    sectionDetail: "Shared VIP table seating for two guests.",
  },
  {
    id: "section-6",
    locationId: "standupmedia",
    sectionName: "Showroom",
    sectionDetail: "General showroom seating throughout the main floor.",
  },
  {
    id: "section-7",
    locationId: "standupmedia",
    sectionName: "6 Person Table",
    sectionDetail: "Reserved table seating for up to six guests.",
  },
  {
    id: "section-8",
    locationId: "standupmedia",
    sectionName: "4 Person Table",
    sectionDetail: "Reserved table seating for up to four guests.",
  },
  {
    id: "section-9",
    locationId: "standupmedia",
    sectionName: "8 Person Table",
    sectionDetail: "Reserved table seating for up to eight guests.",
  },
  {
    id: "section-10",
    locationId: "standupmedia",
    sectionName: "VIP Table",
    sectionDetail: "Premium VIP table with dedicated server service.",
  },
  {
    id: "section-11",
    locationId: "standupmedia",
    sectionName: "Balcony",
    sectionDetail: "Elevated balcony seating overlooking the showroom.",
  },
  {
    id: "section-12",
    locationId: "standupmedia",
    sectionName: "Bar Seating",
    sectionDetail: "High-top bar seating near the service area.",
  },
]

const MOCK_VENUE_SECTION_DESCRIPTIONS = new Map<string, VenueSectionDescriptionRecord[]>([
  ["standupmedia", STANDUPMEDIA_SECTIONS],
  [
    "venue-b",
    [
      {
        id: "vb-section-1",
        locationId: "venue-b",
        sectionName: "Main Floor",
        sectionDetail: "Standard main floor seating for Venue B.",
      },
      {
        id: "vb-section-2",
        locationId: "venue-b",
        sectionName: "Premium",
        sectionDetail: "Premium reserved seating closer to the stage.",
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

function cloneRows(rows: VenueSectionDescriptionRecord[]) {
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
  const rowsById = MOCK_VENUE_SECTION_DESCRIPTIONS.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_VENUE_SECTION_DESCRIPTIONS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function persistRows(locationId: string, rows: VenueSectionDescriptionRecord[]) {
  MOCK_VENUE_SECTION_DESCRIPTIONS.set(locationId, cloneRows(rows))
}

function buildSectionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `section-${Math.random().toString(36).slice(2, 10)}`
}

export async function getVenueSectionDescriptionsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<VenueSectionDescriptionRecord[]> {
  await wait(180)
  return getMutableRows(locationId, locationLabel)
}

export async function createVenueSectionDescription({
  locationId,
  locationLabel,
  input,
}: {
  locationId: string
  locationLabel?: string
  input: VenueSectionDescriptionDraft
}): Promise<VenueSectionDescriptionRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const nextRow: VenueSectionDescriptionRecord = {
    id: buildSectionId(),
    locationId,
    ...input,
  }

  rows.push(nextRow)
  persistRows(locationId, rows)
  return { ...nextRow }
}

export async function updateVenueSectionDescription({
  locationId,
  locationLabel,
  sectionId,
  input,
}: {
  locationId: string
  locationLabel?: string
  sectionId: string
  input: VenueSectionDescriptionDraft
}): Promise<VenueSectionDescriptionRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === sectionId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected section description.")
  }

  const updatedRow: VenueSectionDescriptionRecord = {
    ...rows[rowIndex],
    ...input,
  }

  rows[rowIndex] = updatedRow
  persistRows(locationId, rows)
  return { ...updatedRow }
}

export async function deleteVenueSectionDescription({
  locationId,
  locationLabel,
  sectionId,
}: {
  locationId: string
  locationLabel?: string
  sectionId: string
}): Promise<void> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel).filter(
    (row) => row.id !== sectionId
  )
  persistRows(locationId, rows)
}
