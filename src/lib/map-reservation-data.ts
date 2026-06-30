import { formatApiDateTime } from "@/lib/format-datetime"
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type { Reservation } from "@/types/reservation"

function formatCurrency(value: number | null | undefined) {
  const amount = value ?? 0

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

function mapSource(value: string | null | undefined): Reservation["source"] {
  const normalized = value?.trim().toLowerCase() ?? ""

  if (normalized.includes("web")) {
    return "Web"
  }

  if (normalized.includes("phone")) {
    return "Phone"
  }

  return "Walkup"
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ""
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

export function mapReservationDataItem(item: ReservationDataItem): Reservation {
  const firstName =
    normalizeText(item.CustFirstName) || normalizeText(item.PaidForFirstName)
  const lastName =
    normalizeText(item.CustLastName) || normalizeText(item.PaidForLastName)

  return {
    id: item.ReservationID,
    lastName,
    firstName,
    businessName: normalizeText(item.busName),
    email: normalizeText(item.EmailAddress),
    phoneNo: formatPhoneNumber(item.AreaCode, item.Phone1, item.Phone2),
    source: mapSource(item.LookupSDescSource),
    tables: normalizeText(item.TableNums),
    seatNo: normalizeText(item.SeatNumbers),
    notes: normalizeText(item.Note),
    promo: normalizeText(item.Promo),
    din: normalizeText(item.Dinner) || "N",
    section: normalizeText(item.LookupSDescSection),
    qty: item.PartyNo ?? 0,
    seated: item.CheckedIn ?? 0,
    scanner: item.ScannerIn ?? 0,
    total: formatCurrency(item.Total),
    paid: formatCurrency(item.ResPayments),
    createdBy: normalizeText(item.CreatedBy),
    createdDt: formatApiDateTime(item.CreateDt),
    lastUpdateBy: normalizeText(item.LastUpdateID),
    lastUpdateDt: item.LastUpdateDt ? formatApiDateTime(item.LastUpdateDt) : "",
  }
}

export function mapReservationData(items: ReservationDataItem[]): Reservation[] {
  return items.map(mapReservationDataItem)
}
