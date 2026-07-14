import type { ApiPrivateShowLink } from "@/types/api/private-show-link"
import type { PreSaleRecord } from "@/types/pre-sale"
import { formatUsDateTimeFromValue } from "@/lib/format-us-datetime"

function text(value: string | null | undefined) {
  return (value ?? "").trim()
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return ""
  return formatUsDateTimeFromValue(value, text(value))
}

/** Maps Adminstrator/GetPrivateShowLinks → PreSaleRecord rows. */
export function mapPrivateShowLinks(
  items: ApiPrivateShowLink[]
): PreSaleRecord[] {
  return (items ?? []).map((item, index) => ({
    id: text(item.PrivateKeyID) || `private-link-${index}`,
    accessCode: text(item.PromoCode),
    startDate: formatDateTime(item.StartDt),
    endDate: formatDateTime(item.EndDt),
    createdBy: text(item.Createdby ?? item.CreatedBy),
    createDate: formatDateTime(item.CreateDt),
    privateLink: text(item.PrivateLink),
  }))
}
