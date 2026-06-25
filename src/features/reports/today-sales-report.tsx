import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
import {
  ReportCountBadge,
  ReportHeroMetric,
} from "@/features/reports/report-highlight"
import { useRecentSalesReport } from "@/features/reports/use-recent-sales-report"
import { recentSalesActivityColumns } from "@/features/reports/recent-sales-activity-columns"
import { todayShowsColumns } from "@/features/reports/today-shows-columns"

type TodaySalesReportProps = {
  clubSlug: string
  location: string
  locationsReady?: boolean
  toolbar?: ReactNode
}

export function TodaySalesReport({
  clubSlug,
  location,
  locationsReady = true,
  toolbar,
}: TodaySalesReportProps) {
  const { data, loading, error } = useRecentSalesReport(
    clubSlug,
    location,
    null,
    locationsReady && Boolean(location)
  )

  const ticketsSoldToday = loading ? "…" : data.ticketsSoldToday

  const heroMetric = (
    <ReportHeroMetric label="Tickets Sold Today" value={ticketsSoldToday} />
  )

  const toolbarWithMetric =
    toolbar && isValidElement(toolbar)
      ? cloneElement(toolbar as ReactElement<{ leading?: ReactNode }>, {
          leading: heroMetric,
        })
      : null

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {toolbarWithMetric ? (
        <PanelCard>{toolbarWithMetric}</PanelCard>
      ) : (
        <PanelCard>
          <div className="p-4">{heroMetric}</div>
        </PanelCard>
      )}

      <PanelCard>
        <div className="flex flex-col gap-2 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Today&apos;s Shows
          </h3>
          <ReportCountBadge>
            {data.todaysShows.length} Show
            {data.todaysShows.length === 1 ? "" : "s"}
          </ReportCountBadge>
        </div>
        <DataTable
          columns={todayShowsColumns}
          data={data.todaysShows}
          emptyMessage={loading ? "Loading shows..." : "No shows found"}
          entityLabel="shows"
        />
      </PanelCard>

      <PanelCard>
        <div className="flex flex-col gap-2 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Sales Activity
          </h3>
          <ReportCountBadge>
            Today&apos;s Reservation Count: {data.recentSales.length}
          </ReportCountBadge>
        </div>
        <DataTable
          columns={recentSalesActivityColumns}
          data={data.recentSales}
          emptyMessage={loading ? "Loading sales..." : "No sales found"}
          entityLabel="sales"
        />
      </PanelCard>
    </div>
  )
}
