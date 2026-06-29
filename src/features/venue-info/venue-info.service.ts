import type { AppLocation } from "@/types/api/locations"
import type {
  VenueInfoLocationOption,
  VenueInfoRecord,
} from "@/types/venue-info"

const DEFAULT_LOCATION_OPTIONS: VenueInfoLocationOption[] = [
  { id: "standupmedia", label: "Standupmedia" },
  { id: "venue-b", label: "Venue B" },
  { id: "venue-c", label: "Venue C" },
]

export const VENUE_STATE_OPTIONS = [
  "OH, USA",
  "MI, USA",
  "IN, USA",
  "IL, USA",
  "PA, USA",
  "NY, USA",
] as const

const MOCK_VENUE_INFO_BY_LOCATION = new Map<string, VenueInfoRecord>([
  [
    "standupmedia",
    {
      locationId: "standupmedia",
      locationLabel: "Standupmedia",
      venueName: "Standupmedia",
      shortName: "Standupmedia",
      address1: "178 E Park Street",
      address2: "",
      city: "Westerville",
      stateProvince: "OH, USA",
      postalCode: "43081",
      phone: "(614) 392-8865",
      extension: "",
      phoneTextAlternative: "",
      fax: "",
    },
  ],
  [
    "venue-b",
    {
      locationId: "venue-b",
      locationLabel: "Venue B",
      venueName: "Venue B",
      shortName: "Venue B",
      address1: "400 Market Street",
      address2: "Suite 120",
      city: "Columbus",
      stateProvince: "OH, USA",
      postalCode: "43215",
      phone: "(614) 555-0182",
      extension: "204",
      phoneTextAlternative: "(614) 555-0199",
      fax: "(614) 555-0101",
    },
  ],
  [
    "venue-c",
    {
      locationId: "venue-c",
      locationLabel: "Venue C",
      venueName: "Venue C",
      shortName: "Venue C",
      address1: "22 High Street",
      address2: "",
      city: "Dublin",
      stateProvince: "OH, USA",
      postalCode: "43017",
      phone: "(614) 555-0114",
      extension: "",
      phoneTextAlternative: "",
      fax: "",
    },
  ],
])

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function cloneVenueInfo(record: VenueInfoRecord): VenueInfoRecord {
  return { ...record }
}

function normalizeLookupValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function titleCaseWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function buildDefaultVenueInfo(
  locationId: string,
  locationLabel: string
): VenueInfoRecord {
  const normalizedLabel = titleCaseWords(locationLabel) || "Venue"

  return {
    locationId,
    locationLabel: normalizedLabel,
    venueName: normalizedLabel,
    shortName: normalizedLabel,
    address1: "",
    address2: "",
    city: "",
    stateProvince: VENUE_STATE_OPTIONS[0],
    postalCode: "",
    phone: "",
    extension: "",
    phoneTextAlternative: "",
    fax: "",
  }
}

function normalizeLabel(location: AppLocation) {
  return location.shortName || location.label || location.name || location.id
}

function normalizeLocationOptions(options: VenueInfoLocationOption[]) {
  const uniqueOptions = new Map<string, VenueInfoLocationOption>()
  const seenIds = new Set<string>()
  const seenLabels = new Set<string>()

  for (const option of options) {
    const nextId = option.id.trim()
    const nextLabel = (option.label || option.id).trim()

    if (!nextId) {
      continue
    }

    const normalizedId = normalizeLookupValue(nextId)
    const normalizedLabel = normalizeLookupValue(nextLabel)

    if (seenIds.has(normalizedId) || seenLabels.has(normalizedLabel)) {
      continue
    }

    seenIds.add(normalizedId)
    seenLabels.add(normalizedLabel)
    uniqueOptions.set(nextId, {
      id: nextId,
      label: nextLabel,
    })
  }

  return Array.from(uniqueOptions.values())
}

function findVenueInfoTemplateByLabel(locationLabel?: string) {
  if (!locationLabel?.trim()) {
    return null
  }

  const normalizedLabel = normalizeLookupValue(locationLabel)

  for (const record of MOCK_VENUE_INFO_BY_LOCATION.values()) {
    if (normalizeLookupValue(record.locationLabel) === normalizedLabel) {
      return record
    }
  }

  return null
}

export function getVenueInfoLocationOptions(
  locations: AppLocation[] = []
): VenueInfoLocationOption[] {
  const appOptions = locations.map((location) => ({
    id: location.id,
    label: normalizeLabel(location),
  }))

  return normalizeLocationOptions([...appOptions, ...DEFAULT_LOCATION_OPTIONS])
}

export async function getVenueInfoByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<VenueInfoRecord> {
  await wait(180)

  const existingRecord = MOCK_VENUE_INFO_BY_LOCATION.get(locationId)
  if (existingRecord) {
    return cloneVenueInfo(existingRecord)
  }

  const matchedTemplate = findVenueInfoTemplateByLabel(locationLabel)
  if (matchedTemplate) {
    return {
      ...cloneVenueInfo(matchedTemplate),
      locationId,
      locationLabel: locationLabel?.trim() || matchedTemplate.locationLabel,
    }
  }

  return buildDefaultVenueInfo(locationId, locationLabel || locationId)
}

export async function updateVenueInfo(
  record: VenueInfoRecord
): Promise<VenueInfoRecord> {
  await wait(220)

  const nextRecord: VenueInfoRecord = {
    ...record,
    locationLabel: record.locationLabel.trim(),
    venueName: record.venueName.trim(),
    shortName: record.shortName.trim(),
    address1: record.address1.trim(),
    address2: record.address2.trim(),
    city: record.city.trim(),
    stateProvince: record.stateProvince.trim(),
    postalCode: record.postalCode.trim(),
    phone: record.phone.trim(),
    extension: record.extension.trim(),
    phoneTextAlternative: record.phoneTextAlternative.trim(),
    fax: record.fax.trim(),
  }

  MOCK_VENUE_INFO_BY_LOCATION.set(record.locationId, nextRecord)
  return cloneVenueInfo(nextRecord)
}
