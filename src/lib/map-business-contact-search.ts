import type { ApiBusinessContactItem } from "@/types/api/business-contact"
import type { BusinessContact } from "@/types/business-contact"

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return value.replace(/\s+/g, " ").trim()
}

function formatPhoneNumber(
  areaCode: string | null | undefined,
  phone1: string | null | undefined,
  phone2: string | null | undefined
) {
  const area = normalizeText(areaCode)
  const part1 = normalizeText(phone1)
  const part2 = normalizeText(phone2)

  if (!area && !part1 && !part2) {
    return normalizeText(
      [areaCode, phone1, phone2].filter(Boolean).join("-") || undefined
    )
  }

  if (area && part1 && part2) {
    return `${area}-${part1}-${part2}`
  }

  return [area, part1, part2].filter(Boolean).join("-")
}

function formatFax(item: ApiBusinessContactItem) {
  const fromParts = formatPhoneNumber(
    item.FaxAreaCode,
    item.FaxPhone1,
    item.FaxPhone2
  )

  return fromParts || normalizeText(item.Fax)
}

export function mapBusinessContactSearchResults(
  contacts: ApiBusinessContactItem[]
): BusinessContact[] {
  return (contacts ?? [])
    .map((item) => ({
      id: item.BusinessID,
      businessName: normalizeText(item.BusinessName),
      lastName: normalizeText(item.LastName),
      firstName: normalizeText(item.FirstName),
      email: normalizeText(item.Email1),
      webAddress: normalizeText(item.HTTP),
      address: normalizeText(item.Addr1),
      phoneNo: formatPhoneNumber(item.AreaCode, item.Phone1, item.Phone2),
      fax: formatFax(item),
      lastUpdateId: normalizeText(item.LastUpdateID),
    }))
    .sort((left, right) => {
      const lastNameCompare = left.lastName.localeCompare(right.lastName)
      if (lastNameCompare !== 0) {
        return lastNameCompare
      }

      const firstNameCompare = left.firstName.localeCompare(right.firstName)
      if (firstNameCompare !== 0) {
        return firstNameCompare
      }

      return left.businessName.localeCompare(right.businessName)
    })
}
