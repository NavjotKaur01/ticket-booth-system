import { StatsSummary } from "@/components/dashboard/stats-summary"
import { NewsGrid } from "@/components/dashboard/news-grid"
import { useAuth } from "@/contexts/auth-context"
import { newsItems, statSummaries } from "@/data/dashboard"

export function Dashboard() {
  const { session } = useAuth()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">
          Ticket sales overview for {session?.locationName || session?.organization}
        </p>
      </div>

      <StatsSummary stats={statSummaries} />
      <NewsGrid items={newsItems} />
    </div>
  )
}
