import { formatShowTime } from "@/lib/format-show-time"
import type { ApiShowHistoryItem } from "@/types/api/show-history"
import type { ShowHistoryRow } from "@/components/calendar/service/showHistory.service"
import type { ShowDetailHistoryRow } from "@/components/calendar/service/showDetailHistory.service"

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ""
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return ""
  }

  return Number(value).toFixed(2)
}

function formatSeats(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return ""
  }

  return String(value)
}

export function mapShowHistoryItem(
  item: ApiShowHistoryItem,
  index: number
): ShowHistoryRow {
  const historyId = normalizeText(item.HistoryID) || `show-history-${index}`

  return {
    id: historyId,
    historyAction: normalizeText(item.HistoryAction),
    showDate: formatShortDate(item.ShowDt),
    showTime:
      formatShowTime(item.ShowTm, { seconds: false }) ||
      formatShowTime(item.ShowArrival, { seconds: false }) ||
      "",
    historyDate: formatShortDate(item.HistoryDt),
    headliner: normalizeText(item.Headliner),
    headliner2: normalizeText(item.Headliner2),
    feature: normalizeText(item.Feature),
    feature2: normalizeText(item.Feature2),
    opener: normalizeText(item.Opener),
    promoCode: normalizeText(item.PromoCode),
    showDinner: normalizeText(item.ShowDinner),
    noPasses: normalizeText(item.NoPasses),
    vip: normalizeText(item.VIP),
    updatedOn: formatDateTime(item.LastUpdateDt),
  }
}

export function mapShowHistory(
  items: ApiShowHistoryItem[] | undefined
): ShowHistoryRow[] {
  return (items ?? []).map(mapShowHistoryItem)
}

export function mapShowDetailHistoryItem(
  item: ApiShowHistoryItem,
  index: number
): ShowDetailHistoryRow {
  const historyId = normalizeText(item.HistoryID)
  const showDetId = normalizeText(item.ShowDetID)
  const id =
    historyId && showDetId
      ? `${historyId}:${showDetId}`
      : historyId || showDetId || `show-detail-history-${index}`

  return {
    id,
    historyAction: normalizeText(item.HistoryAction),
    historyDate: formatShortDate(item.HistoryDt),
    showSection:
      normalizeText(item.ShowSecName) || normalizeText(item.ShowSec),
    showPrice: formatPrice(item.ShowPrice),
    seats: formatSeats(item.ShowNon),
    showPromo: normalizeText(item.ShowPromo),
    active: normalizeText(item.Active),
    showAppearing: normalizeText(item.ShowAppearing),
    assignSeats: normalizeText(item.AssignSeats),
    web: normalizeText(item.Web),
    lastUpdateId: normalizeText(item.LastUpdateID),
    updatedOn: formatShortDate(item.LastUpdateDt),
  }
}

export function mapShowDetailHistory(
  items: ApiShowHistoryItem[] | undefined
): ShowDetailHistoryRow[] {
  return (items ?? []).map(mapShowDetailHistoryItem)
}
