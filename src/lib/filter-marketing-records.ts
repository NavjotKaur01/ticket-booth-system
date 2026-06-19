import type {
  MarketingFilterForm,
  MarketingFilterRecord,
} from "@/types/marketing-filter"

function matches(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

function phoneMatches(row: MarketingFilterRecord, areaCode: string) {
  if (!areaCode.trim()) return true
  return row.phoneNumbers.some((phone) => matches(phone, areaCode))
}

function zipMatches(row: MarketingFilterRecord, zipCodes: string[]) {
  const activeZips = zipCodes.map((zip) => zip.trim()).filter(Boolean)
  if (activeZips.length === 0) return true
  return activeZips.some((zip) => matches(row.zipCode, zip))
}

function createdOnInRange(
  row: MarketingFilterRecord,
  from: string,
  to: string
) {
  if (!from && !to) return true
  if (!row.createdOn) return true

  const created = row.createdOn
  if (from && created < from) return false
  if (to && created > to) return false
  return true
}

export function filterMarketingRecords(
  rows: MarketingFilterRecord[],
  filters: MarketingFilterForm
): MarketingFilterRecord[] {
  return rows.filter((row) => {
    if (filters.lastName && !matches(row.lastName, filters.lastName)) {
      return false
    }
    if (filters.firstName && !matches(row.firstName, filters.firstName)) {
      return false
    }
    if (filters.email && !matches(row.email, filters.email)) return false
    if (filters.birthMonth && row.birthMonth !== filters.birthMonth) {
      return false
    }
    if (!phoneMatches(row, filters.areaCode)) return false
    if (!zipMatches(row, filters.zipCodes)) return false
    if (!createdOnInRange(row, filters.newCustomerFrom, filters.newCustomerTo)) {
      return false
    }

    if (filters.excludeBanned && row.banned) return false
    if (filters.onlyWithPhone && row.phoneNumbers.length === 0) return false
    if (filters.onlyWithEmail && !row.email.trim()) return false
    if (filters.excludeInactive && row.inactive) return false
    if (filters.onlyWithStreetAddress && !row.address.trim()) return false
    if (filters.excludeFutureReservations && row.hasFutureReservation) {
      return false
    }
    if (filters.excludeNoCallList && row.onNoCallList) return false

    return true
  })
}

export function formatMarketingFilterName(row: MarketingFilterRecord) {
  return `${row.lastName} ${row.firstName}`.trim()
}
