import type { FreeFormRecord } from "@/types/free-form"

const DEFAULT_FREE_FORM_HTML = `<div style="text-align: center;"><h2>Exclusive Stay Offer</h2><p>Use this free form content area to manage landing-page copy, sponsor details, and promotional callouts for your venue.</p></div>`

const MOCK_FREE_FORMS = new Map<string, FreeFormRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "free-form-1",
        locationId: "standupmedia",
        buttonText: "Laugh & Stay with Candlewood Suites",
        displayOrder: 10,
        active: false,
        htmlContent:
          "<div style=\"text-align: center;\"><h2>Laugh &amp; Stay with Candlewood Suites</h2><p>Bundle your night out with a nearby hotel stay and keep the evening easy for guests traveling in for the show.</p></div>",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "venue-b-free-form-1",
        locationId: "venue-b",
        buttonText: "Weekend Dinner Package",
        displayOrder: 1,
        active: true,
        htmlContent:
          "<div style=\"text-align: center;\"><h2>Weekend Dinner Package</h2><p>Promote dinner-and-show pairings or custom landing-page copy for Venue B here.</p></div>",
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "venue-c-free-form-1",
        locationId: "venue-c",
        buttonText: "VIP Birthday Add-On",
        displayOrder: 3,
        active: true,
        htmlContent:
          "<div style=\"text-align: center;\"><h2>VIP Birthday Add-On</h2><p>Create custom promotional messaging with buttons that match the venue flow.</p></div>",
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

function cloneRows(rows: FreeFormRecord[]) {
  return rows.map((row) => ({ ...row }))
}

function getRowsForLocation(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_FREE_FORMS.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_FREE_FORMS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function persistRows(locationId: string, rows: FreeFormRecord[]) {
  MOCK_FREE_FORMS.set(locationId, cloneRows(rows))
}

function buildFreeFormId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `free-form-${Math.random().toString(36).slice(2, 10)}`
}

export async function getFreeFormsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<FreeFormRecord[]> {
  await wait(160)

  return getRowsForLocation(locationId, locationLabel).sort(
    (left, right) => left.displayOrder - right.displayOrder
  )
}

export async function createFreeForm({
  locationId,
  locationLabel,
  buttonText,
  displayOrder,
  active,
  htmlContent,
}: {
  locationId: string
  locationLabel?: string
  buttonText: string
  displayOrder: number
  active: boolean
  htmlContent: string
}): Promise<FreeFormRecord> {
  await wait(180)

  const rows = getRowsForLocation(locationId, locationLabel)
  const nextRow: FreeFormRecord = {
    id: buildFreeFormId(),
    locationId,
    buttonText,
    displayOrder,
    active,
    htmlContent: htmlContent.trim() || DEFAULT_FREE_FORM_HTML,
  }

  rows.unshift(nextRow)
  persistRows(locationId, rows)
  return { ...nextRow }
}

export async function updateFreeForm({
  locationId,
  locationLabel,
  freeFormId,
  buttonText,
  displayOrder,
  active,
  htmlContent,
}: {
  locationId: string
  locationLabel?: string
  freeFormId: string
  buttonText: string
  displayOrder: number
  active: boolean
  htmlContent: string
}): Promise<FreeFormRecord> {
  await wait(180)

  const rows = getRowsForLocation(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === freeFormId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected free form.")
  }

  const updatedRow: FreeFormRecord = {
    ...rows[rowIndex],
    buttonText,
    displayOrder,
    active,
    htmlContent: htmlContent.trim() || DEFAULT_FREE_FORM_HTML,
  }

  rows[rowIndex] = updatedRow
  persistRows(locationId, rows)
  return { ...updatedRow }
}

export async function deleteFreeForm({
  locationId,
  locationLabel,
  freeFormId,
}: {
  locationId: string
  locationLabel?: string
  freeFormId: string
}): Promise<void> {
  await wait(160)

  const rows = getRowsForLocation(locationId, locationLabel)
  const nextRows = rows.filter((row) => row.id !== freeFormId)

  if (nextRows.length === rows.length) {
    throw new Error("Unable to find the selected free form.")
  }

  persistRows(locationId, nextRows)
}
