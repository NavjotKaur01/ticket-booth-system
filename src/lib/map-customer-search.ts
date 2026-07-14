import type { ApiCustomerSearchItem } from "@/types/api/customer-search"
import type { Customer } from "@/types/customer"

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
    return ""
  }

  if (area && part1 && part2) {
    return `(${area}) ${part1} - ${part2}`
  }

  return [area, part1, part2].filter(Boolean).join(" ")
}

function mapPasswordDisplay(password: string | null | undefined) {
  const normalized = normalizeText(password)
  return normalized || "********"
}

function mapAddress(item: ApiCustomerSearchItem) {
  const address1 = normalizeText(item.Addr1)
  const address2 = normalizeText(item.Addr2)

  if (address1 && address2) {
    return `${address1}, ${address2}`
  }

  return address1 || address2
}

function isBannedFlag(value: unknown) {
  if (value === true || value === 1) return true
  if (value === false || value == null) return false

  const normalized = String(value).replace(/\s+/g, " ").trim().toUpperCase()
  // ClubMan stores "Y"/"N"; Search.xaml binds Banned directly as a brush ("Red"/"White").
  return normalized === "Y" || normalized === "RED" || normalized === "TRUE"
}

export function mapCustomerSearchResults(
  customers: ApiCustomerSearchItem[]
): Customer[] {
  return (customers ?? []).map((item) => ({
    id: item.CustomerID,
    lastName: normalizeText(item.LastName),
    firstName: normalizeText(item.FirstName),
    email: normalizeText(item.Email1),
    password: mapPasswordDisplay(item.Passwd),
    address: mapAddress(item),
    phoneNo: formatPhoneNumber(item.AreaCode, item.Phone1, item.Phone2),
    city: normalizeText(item.City),
    status: normalizeText(item.Active) || "N",
    banned: isBannedFlag(item.Banned),
  }))
}
