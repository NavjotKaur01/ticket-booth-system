import type { VenueAdDraft, VenueAdRecord, VenueAdSection } from "@/types/venue-ad"

export const VENUE_AD_SECTION_OPTIONS: VenueAdSection[] = [
  "Hub",
  "Sponsors",
  "Website",
  "Lobby",
]

const MOCK_VENUE_ADS = new Map<string, VenueAdRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "ad-1",
        locationId: "standupmedia",
        navigateUrl:
          "http://www.albany.funnybone.com/ComedyClub/fe90f238-dd0b-4177-a490-91bacbb9d65d/Employment/Albany_Funny_Bone",
        displayText: "",
        active: false,
        section: "Hub",
        merchant: "",
        imageName: "employment-banner.jpg",
        imagePreviewLabel: "Employment banner",
      },
      {
        id: "ad-2",
        locationId: "standupmedia",
        navigateUrl:
          "http://hamptoninn3.hilton.com/en/hotels/new-york/hampton-inn-albany-western-ave-university-area-ALBUAHX/index.html",
        displayText: "",
        active: false,
        section: "Hub",
        merchant: "Hilton",
        imageName: "hampton-inn-ad.jpg",
        imagePreviewLabel: "Hotel partner artwork",
      },
      {
        id: "ad-3",
        locationId: "standupmedia",
        navigateUrl: "http://albany.funnybone.com",
        displayText: "",
        active: false,
        section: "Hub",
        merchant: "Funny Bone",
        imageName: "funny-bone-site.jpg",
        imagePreviewLabel: "Funny Bone web banner",
      },
      {
        id: "ad-4",
        locationId: "standupmedia",
        navigateUrl:
          "https://www.standupmedia.com/comedyreservation/venues/funnybone/Albany/GiftCertificate.htm?club=fe90f238-dd0b-4177-a490-91bacbb9d65d",
        displayText: "Gift Certificates",
        active: false,
        section: "Hub",
        merchant: "Standup Media",
        imageName: "gift-certificate.jpg",
        imagePreviewLabel: "Gift certificate promotion",
      },
      {
        id: "ad-5",
        locationId: "standupmedia",
        navigateUrl:
          "https://albanyfb.wufoo.com/forms/enter-for-a-chance-to-win-free-tickets/",
        displayText: "Win Free Tickets",
        active: false,
        section: "Hub",
        merchant: "Wufoo",
        imageName: "ticket-giveaway.jpg",
        imagePreviewLabel: "Free ticket giveaway",
      },
      {
        id: "ad-6",
        locationId: "standupmedia",
        navigateUrl: "https://standupmedia.com",
        displayText: "standupmedia.com",
        active: false,
        section: "Sponsors",
        merchant: "Standup Media",
        imageName: "standupmedia-sponsor.jpg",
        imagePreviewLabel: "Standupmedia sponsor logo",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-ad-1",
        locationId: "venue-b",
        navigateUrl: "https://venueb.example.com/weekend-deals",
        displayText: "Weekend Deals",
        active: true,
        section: "Website",
        merchant: "Venue B",
        imageName: "weekend-deals.jpg",
        imagePreviewLabel: "Weekend deals artwork",
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "vc-ad-1",
        locationId: "venue-c",
        navigateUrl: "https://venuec.example.com/lounge",
        displayText: "Lounge Specials",
        active: true,
        section: "Lobby",
        merchant: "Venue C",
        imageName: "lounge-specials.jpg",
        imagePreviewLabel: "Lounge specials display",
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

function cloneRows(rows: VenueAdRecord[]) {
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

function getMutableRows(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_VENUE_ADS.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_VENUE_ADS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function persistRows(locationId: string, rows: VenueAdRecord[]) {
  MOCK_VENUE_ADS.set(locationId, cloneRows(rows))
}

function buildAdId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `ad-${Math.random().toString(36).slice(2, 10)}`
}

export async function getVenueAdsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<VenueAdRecord[]> {
  await wait(180)
  return getMutableRows(locationId, locationLabel)
}

export async function createVenueAd({
  locationId,
  locationLabel,
  input,
}: {
  locationId: string
  locationLabel?: string
  input: VenueAdDraft
}): Promise<VenueAdRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const nextRow: VenueAdRecord = {
    id: buildAdId(),
    locationId,
    ...input,
  }

  rows.unshift(nextRow)
  persistRows(locationId, rows)
  return { ...nextRow }
}

export async function updateVenueAd({
  locationId,
  locationLabel,
  adId,
  input,
}: {
  locationId: string
  locationLabel?: string
  adId: string
  input: VenueAdDraft
}): Promise<VenueAdRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === adId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected ad.")
  }

  const updatedRow: VenueAdRecord = {
    ...rows[rowIndex],
    ...input,
  }

  rows[rowIndex] = updatedRow
  persistRows(locationId, rows)
  return { ...updatedRow }
}

export async function deleteVenueAd({
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
