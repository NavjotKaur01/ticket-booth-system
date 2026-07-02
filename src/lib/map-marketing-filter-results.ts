import { formatApiDateTime } from "@/lib/format-datetime"
import type { ApiMarketingFilterCustomer } from "@/types/api/marketing-filter-search"
import type { MarketingFilterRecord } from "@/types/marketing-filter"

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return value.replace(/\s+/g, " ").trim()
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
      phone: normalizeText(item.Phone),
      phone1: normalizeText(item.Phone1),
      phone2: normalizeText(item.Phone2),
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
