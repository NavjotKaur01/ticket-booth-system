import { formatApiDateTime } from "@/lib/format-datetime"
import type { DailyTransactionItem } from "@/types/api/daily-transaction"
import type { Transaction } from "@/types/transaction"

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ""
}

export function mapDailyTransactionItem(item: DailyTransactionItem): Transaction {
  return {
    id: item.ReservationId,
    lastName: normalizeText(item.LastName),
    firstName: normalizeText(item.FirstName),
    businessName: normalizeText(item.BusinessName),
    source: normalizeText(item.Source),
    createdBy: normalizeText(item.CreatedBy),
    createdDt: item.CreateDt ? formatApiDateTime(item.CreateDt) : "",
    paymentStatus: normalizeText(item.PymtStatus),
    paymentType: normalizeText(item.PymtType),
    ccType: normalizeText(item.CCType),
    amount: item.Amount ?? 0,
    resStatus: normalizeText(item.ResStatus),
    reservationId: item.ReservationId,
    customerId: normalizeText(item.CustomerId ?? undefined),
    resSource: normalizeText(item.ResSource),
    notes: normalizeText(item.Notes),
    promo: normalizeText(item.Promo),
    pendingStatus: normalizeText(item.PendingStatus),
    dinner: normalizeText(item.Dinner),
    section: normalizeText(item.Section),
    partyNo: item.PartyNo ?? 0,
    checkedIn: item.CheckedIn ?? 0,
    price: item.Price ?? 0,
    total: item.Total ?? 0,
  }
}

export function mapDailyTransactionData(
  items: DailyTransactionItem[]
): Transaction[] {
  return items.map(mapDailyTransactionItem)
}
