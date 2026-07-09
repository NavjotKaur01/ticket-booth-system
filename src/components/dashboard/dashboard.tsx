import { StatsSummary } from "@/components/dashboard/stats-summary"
import { NewsGrid } from "@/components/dashboard/news-grid"
import { useAppSession } from "@/hooks/use-app-session"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { newsItems } from "@/data/dashboard"

export function Dashboard() {
  const { locSName, connectionName, locationId, isReady } = useAppSession()
  const { stats, loading, error } = useDashboardData(
    connectionName,
    locationId,
    isReady
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">
          Ticket sales overview for {locSName || "your location"}
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <StatsSummary stats={stats} loading={loading} />
      <NewsGrid items={newsItems} />
    </div>
  )
}
