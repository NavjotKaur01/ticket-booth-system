import type { EmploymentOpeningRecord } from "@/types/employment-opening"

const MOCK_EMPLOYMENT_OPENINGS = new Map<string, EmploymentOpeningRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "opening-1",
        locationId: "standupmedia",
        title: "Cook",
        active: true,
      },
      {
        id: "opening-2",
        locationId: "standupmedia",
        title: "Dishwasher",
        active: true,
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-opening-1",
        locationId: "venue-b",
        title: "Server",
        active: true,
      },
      {
        id: "vb-opening-2",
        locationId: "venue-b",
        title: "Bartender",
        active: false,
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "vc-opening-1",
        locationId: "venue-c",
        title: "Host",
        active: true,
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

function cloneRows(rows: EmploymentOpeningRecord[]) {
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
  const rowsById = MOCK_EMPLOYMENT_OPENINGS.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_EMPLOYMENT_OPENINGS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function persistRows(locationId: string, rows: EmploymentOpeningRecord[]) {
  MOCK_EMPLOYMENT_OPENINGS.set(locationId, cloneRows(rows))
}

function buildOpeningId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `opening-${Math.random().toString(36).slice(2, 10)}`
}

export async function getEmploymentOpeningsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<EmploymentOpeningRecord[]> {
  await wait(160)
  return getRowsForLocation(locationId, locationLabel)
}

export async function createEmploymentOpening({
  locationId,
  locationLabel,
  title,
  active,
}: {
  locationId: string
  locationLabel?: string
  title: string
  active: boolean
}): Promise<EmploymentOpeningRecord> {
  await wait(160)

  const rows = getRowsForLocation(locationId, locationLabel)
  const nextRow: EmploymentOpeningRecord = {
    id: buildOpeningId(),
    locationId,
    title,
    active,
  }

  rows.unshift(nextRow)
  persistRows(locationId, rows)
  return { ...nextRow }
}

export async function updateEmploymentOpening({
  locationId,
  locationLabel,
  openingId,
  title,
  active,
}: {
  locationId: string
  locationLabel?: string
  openingId: string
  title: string
  active: boolean
}): Promise<EmploymentOpeningRecord> {
  await wait(160)

  const rows = getRowsForLocation(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === openingId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected employment opening.")
  }

  const updatedRow: EmploymentOpeningRecord = {
    ...rows[rowIndex],
    title,
    active,
  }

  rows[rowIndex] = updatedRow
  persistRows(locationId, rows)
  return { ...updatedRow }
}
