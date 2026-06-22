import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { RecentSalesReportData } from "@/types/api/recent-sales"

export function fetchRecentSalesReport(clubSlug: string, locationId: string) {
  return dispatchEndpoint<
    RecentSalesReportData,
    { clubSlug: string; locationId: string }
  >(clubmanApi.endpoints.getRecentSalesReport, { clubSlug, locationId })
}
