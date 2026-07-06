import { formatApiDateTime } from "@/lib/format-datetime"
import type { ApiMarketingFilterCustomer } from "@/types/api/marketing-filter-search"
import type { MarketingFilterRecord } from "@/types/marketing-filter"

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return value.replace(/\s+/g, " ").trim()
}

function combinePhoneParts(
  area: string | null | undefined,
  prefix: string | null | undefined,
  line: string | null | undefined
) {
  const parts = [area, prefix, line].map((p) => p?.trim()).filter(Boolean)
  return parts.join("")
}

function formatCreatedOn(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) {
    return ""
  }

  return formatApiDateTime(normalized)
}

export function mapMarketingFilterResults(
  customers: ApiMarketingFilterCustomer[]
): MarketingFilterRecord[] {
  return (customers ?? [])
    .map((item) => ({
      id: item.CustomerID,
      lastName: normalizeText(item.LastName),
      firstName: normalizeText(item.FirstName),
      email: normalizeText(item.Email1),
      address: normalizeText(item.Addr1),
      address2: normalizeText(item.Addr2),
      phone: combinePhoneParts(item.AreaCode, item.Phone1, item.Phone2) || normalizeText(item.Phone),
      phone1: combinePhoneParts(item.AltAreaCode, item.AltPhone1, item.AltPhone2),
      phone2: combinePhoneParts(item.AltAreaCode_2, item.AltPhone1_2, item.AltPhone2_2),
      zipCode: normalizeText(item.Zip),
      createdOn: formatCreatedOn(item.DateCreated),
      city: normalizeText(item.City),
      status: normalizeText(item.Active),
    }))
    .sort((left, right) => {
      const lastNameCompare = left.lastName.localeCompare(right.lastName)
      if (lastNameCompare !== 0) {
        return lastNameCompare
      }

      return left.firstName.localeCompare(right.firstName)
    })
}
