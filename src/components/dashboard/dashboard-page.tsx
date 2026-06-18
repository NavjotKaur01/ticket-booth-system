import { StatsSummary } from "@/components/dashboard/stats-summary"
import { NewsGrid } from "@/components/dashboard/news-grid"
import { newsItems, statSummaries, userSession } from "@/data/dashboard-data"

export function DashboardPage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ticket sales overview for {userSession.organization}
        </p>
      </div>

      <StatsSummary stats={statSummaries} />
      <NewsGrid items={newsItems} />
    </div>
  )
}
