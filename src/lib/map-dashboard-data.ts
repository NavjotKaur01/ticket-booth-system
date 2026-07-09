import { statSummaryDefinitions } from "@/data/dashboard"
import type { ApiDashboardData } from "@/types/api/dashboard-data"
import type { StatSummary } from "@/types/dashboard"

function toCount(value: number | null | undefined) {
  return value ?? 0
}

export function mapDashboardStats(
  data: ApiDashboardData | undefined
): StatSummary[] {
  return statSummaryDefinitions.map((definition) => {
    let value = 0

    switch (definition.id) {
      case "yesterday":
        value = toCount(data?.TicketsYesterday)
        break
      case "today":
        value = toCount(data?.TicketsToday)
        break
      case "week":
        value = toCount(data?.TicketsWeek)
        break
      case "month":
        value = toCount(data?.TicketsMonthly)
        break
    }

    return {
      ...definition,
      value,
    }
  })
}
