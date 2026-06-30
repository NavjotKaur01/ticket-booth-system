import type {
  WebpageTextPageDefinition,
  WebpageTextRecord,
} from "@/types/webpage-text"

const DEFAULT_PAGE_DEFINITIONS: WebpageTextPageDefinition[] = [
  { id: "dining-info", label: "Dining Info" },
  { id: "parking-info", label: "Parking Info" },
  { id: "faq", label: "FAQ" },
]

const DINING_INFO_HTML = `<div style="text-align: center;">&nbsp;</div><h1 style="text-align: center;">Planning on having dinner with us?</h1><div style="text-align: center;">Seating is done a first come, first sat basis. We seat according to arrival the night of the show. Seating begins in the front of the showroom and goes to the back of the showroom, so arrive early for closer seats! To be sat together your party must enter the showroom together. We do not hold or reserve seats unless you book a Group Package in advance with our Event Coordinator. &nbsp;Our showroom consists of tables that accommodate 4 or 8 guests (limited amount of 8 person tables) so if you plan to be less than 4 people, you will likely be sat with other guests at your table. Purchased admission tickets guarantee one seat in the showroom, it does not guarantee your entire party will be sat together if seating is not available to sit all guests together at time of entry.&nbsp;</div><div style="text-align: center;">18% Gratuity will be added to all checks</div>`

const MOCK_WEBPAGE_TEXT_BY_LOCATION = new Map<string, WebpageTextRecord[]>([
  [
    "standupmedia",
    [
      {
        locationId: "standupmedia",
        locationLabel: "Standupmedia",
        pageId: "dining-info",
        pageLabel: "Dining Info",
        htmlContent: DINING_INFO_HTML,
      },
      {
        locationId: "standupmedia",
        locationLabel: "Standupmedia",
        pageId: "parking-info",
        pageLabel: "Parking Info",
        htmlContent:
          "<h2 style=\"text-align: center;\">Parking Information</h2><p style=\"text-align: center;\">Street parking is available near the venue and the public garage is one block away. Please allow a few extra minutes on sold-out nights.</p>",
      },
      {
        locationId: "standupmedia",
        locationLabel: "Standupmedia",
        pageId: "faq",
        pageLabel: "FAQ",
        htmlContent:
          "<h2 style=\"text-align: center;\">Frequently Asked Questions</h2><p style=\"text-align: center;\">Doors open one hour before show time. Bring a valid ID, and contact the venue team if you need accessibility support before arrival.</p>",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        locationId: "venue-b",
        locationLabel: "Venue B",
        pageId: "dining-info",
        pageLabel: "Dining Info",
        htmlContent:
          "<h1 style=\"text-align: center;\">Dining before the show</h1><p style=\"text-align: center;\">Venue B offers table service before the performance begins. Arrive early if you want extra time for dinner and drinks.</p>",
      },
      {
        locationId: "venue-b",
        locationLabel: "Venue B",
        pageId: "parking-info",
        pageLabel: "Parking Info",
        htmlContent:
          "<h2 style=\"text-align: center;\">Parking</h2><p style=\"text-align: center;\">Use the adjacent lot after 5 PM and validate at the host stand for discounted evening parking.</p>",
      },
      {
        locationId: "venue-b",
        locationLabel: "Venue B",
        pageId: "faq",
        pageLabel: "FAQ",
        htmlContent:
          "<h2 style=\"text-align: center;\">Venue FAQ</h2><p style=\"text-align: center;\">Tickets are released digitally after purchase. Please review age restrictions before booking.</p>",
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        locationId: "venue-c",
        locationLabel: "Venue C",
        pageId: "dining-info",
        pageLabel: "Dining Info",
        htmlContent:
          "<h1 style=\"text-align: center;\">Food and beverage</h1><p style=\"text-align: center;\">A limited menu is available during the show. For full-service dining, arrive before seating begins.</p>",
      },
      {
        locationId: "venue-c",
        locationLabel: "Venue C",
        pageId: "parking-info",
        pageLabel: "Parking Info",
        htmlContent:
          "<h2 style=\"text-align: center;\">Parking and arrival</h2><p style=\"text-align: center;\">Parking is available behind the venue with overflow spots across the street on busy weekends.</p>",
      },
      {
        locationId: "venue-c",
        locationLabel: "Venue C",
        pageId: "faq",
        pageLabel: "FAQ",
        htmlContent:
          "<h2 style=\"text-align: center;\">Need help?</h2><p style=\"text-align: center;\">Contact the box office before show day if you need to change guest names or have questions about group reservations.</p>",
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

function cloneRows(rows: WebpageTextRecord[]) {
  return rows.map((row) => ({ ...row }))
}

function buildDefaultRows(locationId: string, locationLabel: string) {
  return DEFAULT_PAGE_DEFINITIONS.map((page) => ({
    locationId,
    locationLabel,
    pageId: page.id,
    pageLabel: page.label,
    htmlContent: `<h2 style="text-align: center;">${page.label}</h2><p style="text-align: center;">Add webpage copy for ${locationLabel} here.</p>`,
  }))
}

function getRowsForLocation(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_WEBPAGE_TEXT_BY_LOCATION.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (templateKey) {
    const templateRows = MOCK_WEBPAGE_TEXT_BY_LOCATION.get(templateKey) ?? []
    return templateRows.map((row) => ({
      ...row,
      locationId,
      locationLabel: locationLabel?.trim() || row.locationLabel,
    }))
  }

  return buildDefaultRows(locationId, locationLabel?.trim() || locationId)
}

function persistRows(locationId: string, rows: WebpageTextRecord[]) {
  MOCK_WEBPAGE_TEXT_BY_LOCATION.set(locationId, cloneRows(rows))
}

export async function getWebpageTextPagesByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<WebpageTextPageDefinition[]> {
  await wait(140)

  const rows = getRowsForLocation(locationId, locationLabel)
  return rows.map((row) => ({
    id: row.pageId,
    label: row.pageLabel,
  }))
}

export async function getWebpageTextByLocation({
  locationId,
  pageId,
  locationLabel,
}: {
  locationId: string
  pageId: string
  locationLabel?: string
}): Promise<WebpageTextRecord> {
  await wait(180)

  const rows = getRowsForLocation(locationId, locationLabel)
  const row = rows.find((currentRow) => currentRow.pageId === pageId)

  if (!row) {
    throw new Error("Unable to find webpage text for the selected page.")
  }

  return { ...row }
}

export async function updateWebpageText(
  record: WebpageTextRecord
): Promise<WebpageTextRecord> {
  await wait(180)

  const rows = getRowsForLocation(record.locationId, record.locationLabel)
  const rowIndex = rows.findIndex((row) => row.pageId === record.pageId)
  if (rowIndex < 0) {
    throw new Error("Unable to update webpage text for the selected page.")
  }

  const updatedRecord: WebpageTextRecord = {
    ...record,
    htmlContent: record.htmlContent.trim() || "<p></p>",
  }

  rows[rowIndex] = updatedRecord
  persistRows(record.locationId, rows)
  return { ...updatedRecord }
}
