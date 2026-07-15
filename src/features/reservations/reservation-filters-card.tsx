import { RefreshCw } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
import { ShowDateField } from "@/components/common/show-date-field"
import { StatsBar } from "@/components/common/stats-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { reservationCounts } from "@/data/reservation"
import type { StatItem } from "@/components/common/stats-bar"
import { sanitizeRefreshSecondsInput } from "@/lib/parse-refresh-interval"
import type { ShowOption } from "@/types/reservation"

const defaultStatItems: StatItem[] = [
  { label: "Seats", value: reservationCounts.seats },
  { label: "Reserved", value: reservationCounts.reservation },
  { label: "Available", value: reservationCounts.available },
  { label: "Seated", value: reservationCounts.seated },
  { label: "Scanned", value: reservationCounts.scanned },
]

type ReservationFiltersCardProps = {
  showDate: string
  onShowDateChange: (value: string) => void
  showTime: string
  onShowTimeChange: (value: string) => void
  refreshValue: string
  onRefreshValueChange: (value: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  shows?: ShowOption[]
  showsLoading?: boolean
  showsError?: string | null
  statItems?: StatItem[]
}

/** Top panel: show selectors, auto-refresh, and live seat counts. */
export function ReservationFiltersCard({
  showDate,
  onShowDateChange,
  showTime,
  onShowTimeChange,
  refreshValue,
  onRefreshValueChange,
  onRefresh,
  isRefreshing = false,
  shows = [],
  showsLoading = false,
  showsError = null,
  statItems = defaultStatItems,
}: ReservationFiltersCardProps) {
  return (
    <PanelCard>
      <div className="flex flex-col gap-3 p-3 min-[1200px]:flex-row min-[1200px]:items-end min-[1200px]:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
          <div className="w-full min-w-0 space-y-1 sm:w-44">
            <Label htmlFor="show-date" className="text-xs font-medium">
              Show Date
            </Label>
            <ShowDateField
              showDate={showDate}
              onShowDateChange={onShowDateChange}
              className="w-full"
            />
          </div>

          <div className="w-full min-w-0 space-y-1 sm:w-44">
            <Label htmlFor="show-time" className="text-xs font-medium">
              Show Time
            </Label>
            <ScrollSelectControl
              id="show-time"
              value={showTime}
              onChange={onShowTimeChange}
              disabled={showsLoading || shows.length === 0}
              placeholder={
                showsLoading
                  ? "Loading shows..."
                  : shows.length === 0
                    ? "No shows found"
                    : "Select show"
              }
              className="min-w-0 max-w-full bg-background"
              options={shows.map((show) => ({
                value: show.id,
                label: show.label,
              }))}
            />
            {showsError ? (
              <p className="text-xs text-destructive">{showsError}</p>
            ) : null}
          </div>

          <div className="w-full min-w-0 space-y-1 sm:w-[9.5rem]">
            <Label htmlFor="refresh-interval" className="text-xs font-medium">
              Auto Refresh
              <span className="ml-1 font-normal text-muted-foreground">
                (seconds)
              </span>
            </Label>
            <div className="flex w-full min-w-0">
              <Input
                id="refresh-interval"
                value={refreshValue}
                onChange={(e) =>
                  onRefreshValueChange(
                    sanitizeRefreshSecondsInput(e.target.value)
                  )
                }
                inputMode="numeric"
                className="min-w-0 rounded-r-none border-r-0"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                className="shrink-0 rounded-l-none border-l-0 shadow-xs"
                aria-label="Refresh now"
                onClick={onRefresh}
                disabled={!onRefresh || isRefreshing}
              >
                <RefreshCw
                  className={isRefreshing ? "size-4 animate-spin" : "size-4"}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 min-[1200px]:ml-auto min-[1200px]:w-auto">
          <StatsBar items={statItems} />
        </div>
      </div>
    </PanelCard>
  )
}
