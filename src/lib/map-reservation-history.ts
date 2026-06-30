import type { ReservationHistoryItem } from '@/types/api/reservation-history'
import type { ReservationHistoryRow } from '@/types/reservation-history'

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) {
    return ''
  }

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

function formatNumber(value: number | null | undefined) {
  if (value == null) {
    return ''
  }

  return String(value)
}

export function mapReservationHistoryItem(
  item: ReservationHistoryItem
): ReservationHistoryRow {
  return {
    historyId: normalizeText(item.HistoryID),
    historyDate: formatShortDate(item.HistoryDt),
    historyAction: normalizeText(item.HistoryAction),
    reservationId: normalizeText(item.ReservationID),
    customerId:
      normalizeText(item.CustomerID) || normalizeText(item.BusinessID),
    showId: normalizeText(item.ShowID),
    showDetId: normalizeText(item.ShowDetID),
    dinner: normalizeText(item.Dinner),
    origPartyNo: formatNumber(item.OrigPartyNo),
    partyNo: formatNumber(item.PartyNo),
    resSec: normalizeText(item.ResSec),
    tableNums: normalizeText(item.TableNums),
    tixPaid: formatNumber(item.TixPaid),
    tixComp: formatNumber(item.TixComp),
    tixDisc: formatNumber(item.TixDisc),
    checkedIn: formatNumber(item.CheckedIn),
    checkInPaid: formatNumber(item.CheckInPaid),
    checkInComp: formatNumber(item.CheckInComp),
    checkInDisc: formatNumber(item.CheckInDisc),
    printed: normalizeText(item.Printed),
    vip: normalizeText(item.VIP),
    price: formatCurrency(item.Price),
    dayOfShowCharge: formatCurrency(item.DayOfShowCharge),
    phoneCharge: formatCurrency(item.PhoneCharge),
    walkupCharge: formatCurrency(item.WalkupCharge),
    webCharge: formatCurrency(item.WebCharge),
    promo: normalizeText(item.Promo),
    numPasses: formatNumber(item.NumPasses),
    pendingStatus: normalizeText(item.PendingStatus),
    subTot: formatCurrency(item.SubTot),
    svc: formatCurrency(item.SVC),
    discount: formatCurrency(item.Discount),
    salesTax: formatCurrency(item.SalesTax),
    total: formatCurrency(item.Total),
    resSource: normalizeText(item.ResSource),
    resStatus: normalizeText(item.ResStatus),
    resTemp: normalizeText(item.ResTemp),
    actionForm: normalizeText(item.ActionForm),
    action: normalizeText(item.Action),
    createdBy: normalizeText(item.CreatedBy),
    createDt: formatDateTime(item.CreateDt),
    cancelBy: normalizeText(item.CancelBy),
    cancelDt: formatDateTime(item.CancelDt),
    updateCount: formatNumber(item.UpdateCount),
    lastUpdateId: normalizeText(item.LastUpdateID),
    lastUpdateDt: formatShortDate(item.LastUpdateDt)
  }
}

export function mapReservationHistory(
  items: ReservationHistoryItem[] | undefined
): ReservationHistoryRow[] {
  return (items ?? []).map(mapReservationHistoryItem)
}
