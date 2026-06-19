import type { ReactNode } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
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

  const summaryStrip = (
    <div className="w-fit rounded-sm bg-muted/30 px-2.5 py-1.5 shadow-xs">
      <p className="text-[10px] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase">
        Tickets Sold Today
      </p>
      <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
        {ticketsSoldToday}
      </p>
    </div>
  )

  return (
    <>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {toolbar ? (
        <PanelCard>
          <div className="border-b p-3">
            {summaryStrip}
          </div>
          {toolbar}
        </PanelCard>
      ) : (
        <PanelCard>
          <div className="p-3">
            {summaryStrip}
          </div>
        </PanelCard>
      )}

      <PanelCard>
        <div className="flex flex-col gap-1 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Today&apos;s Shows
          </h3>
          <span className="w-fit rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {data.todaysShows.length} Show
            {data.todaysShows.length === 1 ? "" : "s"}
          </span>
        </div>
        <DataTable
          columns={todayShowsColumns}
          data={data.todaysShows}
          emptyMessage={loading ? "Loading shows..." : "No shows found"}
          entityLabel="shows"
        />
      </PanelCard>

      <PanelCard>
        <div className="flex flex-col gap-1 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Sales Activity
          </h3>
          <span className="w-fit rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Today&apos;s Reservation Count: {data.recentSales.length}
          </span>
        </div>
        <DataTable
          columns={recentSalesActivityColumns}
          data={data.recentSales}
          emptyMessage={loading ? "Loading sales..." : "No sales found"}
          entityLabel="sales"
        />
      </PanelCard>
    </>
  )
}
