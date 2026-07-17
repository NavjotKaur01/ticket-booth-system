import { maskCardNumber } from "@/lib/mask-card-number"
import type { ReservationPrintProperties } from "@/types/api/reservation-print"

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
    return null
  }

  return String(value).trim() || null
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

/**
 * Phase 1: picklist for signature / txn fallback only.
 * Masks CardNum to last4 so RTK cache does not keep a full PAN.
 */
export function mapReservationPrintProperties(
  response: unknown
): ReservationPrintProperties {
  const unwrapped =
    response &&
    typeof response === "object" &&
    "Data" in response &&
    (response as { Data: unknown }).Data != null
      ? (response as { Data: unknown }).Data
      : response

  if (!unwrapped || typeof unwrapped !== "object") {
    return {
      Auth: null,
      CardType: null,
      CardNum: null,
      PaiedAmount: null,
      CustomerName: null,
      PartyNo: null,
      PaymentType: null,
      Orgin: null,
      Promo: null,
      reservationid: "",
      showtm: null,
      TableNums: null,
      LocAddr1: null,
      LocCity: null,
      LocState: null,
      LocZip: null,
      LocSName: null,
      LocURL: null,
      ShowDate: null,
      Headliner: null,
      CheckedIn: null,
      RefundAmount: null,
      ReservationTableNumInfo: [],
      DueAmount: null,
      PNREF: null,
      TicketText: null,
      Address: null,
      TicketSection: null,
      TicketDefaultText: null,
      BottomTicketText: null,
    }
  }

  const record = unwrapped as Record<string, unknown>
  const rawCard = readString(record, ["CardNum", "cardNum", "CardNumber"])

  return {
    Auth: readString(record, ["Auth", "auth"]),
    CardType: readString(record, ["CardType", "cardType", "CCType"]),
    CardNum: rawCard ? maskCardNumber(rawCard) : null,
    PaiedAmount: readNumber(record, ["PaiedAmount", "PaidAmount", "paidAmount"]),
    CustomerName: readString(record, ["CustomerName", "customerName"]),
    PartyNo: readNumber(record, ["PartyNo", "partyNo"]),
    PaymentType: readString(record, ["PaymentType", "paymentType", "PymtType"]),
    Orgin: null,
    Promo: null,
    reservationid:
      readString(record, ["reservationid", "ReservationID", "reservationId"]) ??
      "",
    showtm: readString(record, ["showtm", "ShowTm", "ShowTime", "showTime"]),
    TableNums: null,
    LocAddr1: readString(record, ["LocAddr1", "locAddr1"]),
    LocCity: readString(record, ["LocCity", "locCity"]),
    LocState: readString(record, ["LocState", "locState"]),
    LocZip: readString(record, ["LocZip", "locZip"]),
    LocSName: readString(record, ["LocSName", "locSName"]),
    LocURL: readString(record, ["LocURL", "locURL", "LocUrl"]),
    ShowDate: readString(record, ["ShowDate", "showDate"]),
    Headliner: readString(record, ["Headliner", "headliner"]),
    CheckedIn: null,
    RefundAmount: null,
    ReservationTableNumInfo: [],
    DueAmount: readNumber(record, ["DueAmount", "dueAmount", "dueAmt"]),
    PNREF: readString(record, ["PNREF", "Pnref", "pnref"]),
    TicketText: null,
    Address: null,
    TicketSection: null,
    TicketDefaultText: null,
    BottomTicketText: null,
  }
}
