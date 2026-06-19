import { RefreshCw, Ticket } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CLUB_NAME,
  reportLocationOptions,
} from "@/data/manager-checkout-reports"
import { todaySalesSummary } from "@/data/today-sales-reports"
import { recentSalesActivityColumns } from "@/features/reports/recent-sales-activity-columns"
import { todayShowsColumns } from "@/features/reports/today-shows-columns"

type TodaySalesReportProps = {
  location: string
  onLocationChange?: (location: string) => void
}

export function TodaySalesReport({
  location,
  onLocationChange,
}: TodaySalesReportProps) {
  const [refreshSeconds, setRefreshSeconds] = useState("60")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { ticketsSoldToday, todaysShows, recentSales } = todaySalesSummary

  return (
    <div className="space-y-3">
      <PanelCard>
        <div className="flex flex-col gap-3 border-b bg-primary px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-primary-foreground">
            Recent Sales Dashboard
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="today-sales-location"
                className="text-xs text-primary-foreground/90"
              >
                Location:
              </Label>
              <Select
                value={location}
                onValueChange={(value) => onLocationChange?.(value)}
              >
                <SelectTrigger
                  id="today-sales-location"
                  className="h-8 w-40 bg-background text-foreground"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportLocationOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Label
                htmlFor="today-sales-refresh"
                className="text-xs text-primary-foreground/90"
              >
                Refresh:
              </Label>
              <Input
                id="today-sales-refresh"
                value={refreshSeconds}
                onChange={(event) => setRefreshSeconds(event.target.value)}
                className="h-8 w-14 bg-background px-2 text-center tabular-nums"
                inputMode="numeric"
              />
              <span className="text-xs text-primary-foreground/90">sec</span>
              <label className="flex items-center gap-1.5 text-xs text-primary-foreground">
                <Checkbox
                  checked={autoRefresh}
                  onCheckedChange={(checked) =>
                    setAutoRefresh(checked === true)
                  }
                  className="border-primary-foreground/40 data-checked:border-primary-foreground data-checked:bg-primary-foreground data-checked:text-primary"
                />
                Auto
              </label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="p-3">
          <Card className="max-w-xs py-0">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <Ticket className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Tickets Sold Today
                </p>
                <p className="text-2xl font-bold tabular-nums leading-none">
                  {ticketsSoldToday}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PanelCard>

      <PanelCard>
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <h3 className="text-sm font-semibold text-foreground">
            Today&apos;s Shows
          </h3>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {todaysShows.length} Show{todaysShows.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="border-b px-3 py-1.5 text-xs text-muted-foreground">
          Drag a column header here to group by that column
        </p>
        <DataTable
          columns={todayShowsColumns}
          data={todaysShows}
          entityLabel="shows"
        />
      </PanelCard>

      <PanelCard>
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Sales Activity
          </h3>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Today&apos;s Reservation Count: {recentSales.length}
          </span>
        </div>
        <p className="border-b px-3 py-1.5 text-xs text-muted-foreground">
          Drag a column header here to group by that column
        </p>
        <DataTable
          columns={recentSalesActivityColumns}
          data={recentSales}
          entityLabel="sales"
        />
      </PanelCard>

      <p className="px-1 text-xs text-muted-foreground">
        Location: {CLUB_NAME}
      </p>
    </div>
  )
}
