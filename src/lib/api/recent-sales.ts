import { reportApiPath, apiRequest } from "@/lib/api/client"
import type { RecentSalesReportData } from "@/types/api/recent-sales"

export function fetchRecentSalesReport(clubSlug: string, locationId: string) {
  return apiRequest<RecentSalesReportData>(
    reportApiPath(clubSlug, "GetRecentSales", locationId),
    { method: "PUT" }
  )
}
