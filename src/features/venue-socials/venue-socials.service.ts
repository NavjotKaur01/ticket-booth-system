import type { VenueSocialDraft, VenueSocialPlatform, VenueSocialRecord } from "@/types/venue-social"

export const VENUE_SOCIAL_PLATFORM_OPTIONS: VenueSocialPlatform[] = [
  "facebook",
  "instagram",
  "twitter",
  "youtube",
  "tiktok",
  "linkedin",
]

const MOCK_VENUE_SOCIALS = new Map<string, VenueSocialRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "social-1",
        locationId: "standupmedia",
        social: "facebook",
        displayOrder: 1,
        url: "https://www.facebook.com",
      },
      {
        id: "social-2",
        locationId: "standupmedia",
        social: "instagram",
        displayOrder: 2,
        url: "https://www.instagram.com",
      },
      {
        id: "social-3",
        locationId: "standupmedia",
        social: "twitter",
        displayOrder: 3,
        url: "https://twitter.com",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-social-1",
        locationId: "venue-b",
        social: "facebook",
        displayOrder: 1,
        url: "https://www.facebook.com/venueb",
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

function cloneRows(rows: VenueSocialRecord[]) {
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
  const rowsById = MOCK_VENUE_SOCIALS.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById).sort(
      (left, right) => left.displayOrder - right.displayOrder
    )
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_VENUE_SOCIALS.get(templateKey) ?? []
  return templateRows
    .map((row) => ({
      ...row,
      id: `${locationId}-${row.id}`,
      locationId,
    }))
    .sort((left, right) => left.displayOrder - right.displayOrder)
}

function persistRows(locationId: string, rows: VenueSocialRecord[]) {
  MOCK_VENUE_SOCIALS.set(
    locationId,
    cloneRows(rows).sort((left, right) => left.displayOrder - right.displayOrder)
  )
}

function buildSocialId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `social-${Math.random().toString(36).slice(2, 10)}`
}

export async function getVenueSocialsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<VenueSocialRecord[]> {
  await wait(180)
  return getMutableRows(locationId, locationLabel)
}

export async function createVenueSocial({
  locationId,
  locationLabel,
  input,
}: {
  locationId: string
  locationLabel?: string
  input: VenueSocialDraft
}): Promise<VenueSocialRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const nextRow: VenueSocialRecord = {
    id: buildSocialId(),
    locationId,
    ...input,
  }

  rows.push(nextRow)
  persistRows(locationId, rows)
  return { ...nextRow }
}

export async function updateVenueSocial({
  locationId,
  locationLabel,
  socialId,
  input,
}: {
  locationId: string
  locationLabel?: string
  socialId: string
  input: VenueSocialDraft
}): Promise<VenueSocialRecord> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === socialId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected social link.")
  }

  const updatedRow: VenueSocialRecord = {
    ...rows[rowIndex],
    ...input,
  }

  rows[rowIndex] = updatedRow
  persistRows(locationId, rows)
  return { ...updatedRow }
}

export async function deleteVenueSocial({
  locationId,
  locationLabel,
  socialId,
}: {
  locationId: string
  locationLabel?: string
  socialId: string
}): Promise<void> {
  await wait(180)

  const rows = getMutableRows(locationId, locationLabel).filter((row) => row.id !== socialId)
  persistRows(locationId, rows)
}
