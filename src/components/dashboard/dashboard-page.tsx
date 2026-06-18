import { StatsSummary } from "@/components/dashboard/stats-summary"
import { NewsGrid } from "@/components/dashboard/news-grid"
import { newsItems, statSummaries } from "@/data/dashboard-data"

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <StatsSummary stats={statSummaries} />
      <NewsGrid items={newsItems} />
    </div>
  )
}
