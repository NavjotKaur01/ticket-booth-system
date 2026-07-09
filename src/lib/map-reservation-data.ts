import { coerceApiArray } from "@/lib/coerce-api-array"
import { formatApiDateTime } from "@/lib/format-datetime"
import { isCancelledReservationStatus } from "@/lib/reservation-lookup-codes"
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type { Reservation } from "@/types/reservation"

function readRecordValue(
  record: Record<string, unknown>,
  keys: string[]
): unknown {
  for (const key of keys) {
    const value = record[key]
    if (value != null && value !== "") {
      return value
    }
  }

  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase()))
  for (const [key, value] of Object.entries(record)) {
    if (normalizedKeys.has(key.toLowerCase()) && value != null && value !== "") {
      return value
    }
  }

  return undefined
}

function readString(record: Record<string, unknown>, keys: string[]) {
  const value = readRecordValue(record, keys)
  if (typeof value === "string") {
    return value.trim()
  }

  if (value == null) {
    return ""
  }

  return String(value).trim()
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  const value = readRecordValue(record, keys)
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function normalizeReservationDataItem(raw: unknown): ReservationDataItem {
  if (!raw || typeof raw !== "object") {
    return { ReservationID: "", ShowId: "" } as ReservationDataItem
  }

  const record = raw as Record<string, unknown>

  return {
    ReservationID: readString(record, ["ReservationID", "reservationID", "reservationId"]),
    ShowId: readString(record, ["ShowId", "showId", "ShowID", "showID"]),
    ScannerIn: readNumber(record, ["ScannerIn", "scannerIn"]) ?? 0,
    ResPayments: readNumber(record, ["ResPayments", "resPayments"]),
    CreatedBy: readString(record, ["CreatedBy", "createdBy"]),
    CreateDt: readString(record, ["CreateDt", "createDt"]),
    Dinner: readString(record, ["Dinner", "dinner"]) || null,
    PartyNo: readNumber(record, ["PartyNo", "partyNo"]) ?? 0,
    CheckedIn: readNumber(record, ["CheckedIn", "checkedIn"]) ?? 0,
    Total: readNumber(record, ["Total", "total"]) ?? 0,
    TableNums: readString(record, ["TableNums", "tableNums"]) || null,
    LastUpdateID: readString(record, ["LastUpdateID", "lastUpdateID"]) || null,
    LastUpdateDt: readString(record, ["LastUpdateDt", "lastUpdateDt"]) || null,
    Promo: readString(record, ["Promo", "promo"]) || null,
    LookupSDescSection:
      readString(record, ["LookupSDescSection", "lookupSDescSection"]) || null,
    LookupSDescSource:
      readString(record, ["LookupSDescSource", "lookupSDescSource"]) || null,
    CustFirstName: readString(record, ["CustFirstName", "custFirstName"]) || null,
    CustLastName: readString(record, ["CustLastName", "custLastName"]) || null,
    Note: readString(record, ["Note", "note"]) || null,
    busName: readString(record, ["busName", "BusName"]) || null,
    PaidForLastName: readString(record, ["PaidForLastName", "paidForLastName"]) || null,
    PaidForFirstName: readString(record, ["PaidForFirstName", "paidForFirstName"]) || null,
    EmailAddress: readString(record, ["EmailAddress", "emailAddress"]) || null,
    SeatNumbers: readString(record, ["SeatNumbers", "seatNumbers"]) || null,
    Phone: readString(record, ["Phone", "phone"]) || null,
    AreaCode: readString(record, ["AreaCode", "areaCode"]) || null,
    Phone1: readString(record, ["Phone1", "phone1"]) || null,
    Phone2: readString(record, ["Phone2", "phone2"]) || null,
    ResStatus: readString(record, ["ResStatus", "resStatus"]) || null,
    ReservationStatus:
      readString(record, ["ReservationStatus", "reservationStatus"]) || null,
    OldReservationID:
      readString(record, ["OldReservationID", "oldReservationID"]) || null,
  }
}

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

// to format the phone number properly 
function toUSPhoneNumberFormat(
  phone: string
): string {
  const phoneNumber = phone.replace(/\D/g, "");
  const area = phoneNumber.slice(0, 3);
  const phone1 = phoneNumber.slice(3, 7);
  const phone2 = phoneNumber.slice(7, 11);

  return `(${area}) ${phone1} - ${phone2}`
}

function formatPhoneNumber(
  areaCode: string | null | undefined,
  phone1: string | null | undefined,
  phone2: string | null | undefined,
  phone?: string | null | undefined
) {
  const area = normalizeText(areaCode)
  const part1 = normalizeText(phone1)
  const part2 = normalizeText(phone2)

  // when area code, phone 1 and phone 2 is not in the api response correctly, pass the phone into the reservation mapper

  if (!area && !part1 && !part2) {
    const fallback = normalizeText(phone)
    if (!fallback || fallback === "()-" || fallback === "() -") {
      return ""
    }
    return toUSPhoneNumberFormat(fallback)
  }

  if (area && part1 && part2) {
    return `(${area}) ${part1} - ${part2}`
  }

  return [area, part1, part2].filter(Boolean).join(" ")
}

function isCancelledReservationItem(item: ReservationDataItem) {
  if (isCancelledReservationStatus(item.ResStatus)) {
    return true
  }

  return normalizeText(item.ReservationStatus)
    .toLowerCase()
    .includes("uncancel")
}

export function mapReservationDataItem(item: ReservationDataItem): Reservation {
  const firstName =
    normalizeText(item.CustFirstName) || normalizeText(item.PaidForFirstName)
  const lastName =
    normalizeText(item.CustLastName) || normalizeText(item.PaidForLastName)

  return {
    id: item.ReservationID,
    resStatus: normalizeText(item.ResStatus),
    isCancelled: isCancelledReservationItem(item),
    lastName,
    firstName,
    businessName: normalizeText(item.busName),
    email: normalizeText(item.EmailAddress),
    phoneNo: formatPhoneNumber(item.AreaCode, item.Phone1, item.Phone2, item.Phone),
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

export function mapReservationData(response: unknown): Reservation[] {
  return coerceApiArray<unknown>(response)
    .map(normalizeReservationDataItem)
    .filter((item) => item.ReservationID.trim().length > 0)
    .map(mapReservationDataItem)
}
