import { RefreshCw } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { StatsBar } from "@/components/common/stats-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { reservationCounts, showOptions } from "@/data/reservation"
import type { ShowOption } from "@/types/reservation"

const statItems = [
  { label: "Seats", value: reservationCounts.seats },
  { label: "Reserved", value: reservationCounts.reservation },
  { label: "Available", value: reservationCounts.available },
  { label: "Seated", value: reservationCounts.seated },
  { label: "Scanned", value: reservationCounts.scanned },
] as const

type ReservationFiltersCardProps = {
  showDate: string
  onShowDateChange: (value: string) => void
  showTime: string
  onShowTimeChange: (value: string) => void
  refreshValue: string
  onRefreshValueChange: (value: string) => void
  shows?: ShowOption[]
}

/** Top panel: show selectors, auto-refresh, and live seat counts. */
export function ReservationFiltersCard({
  showDate,
  onShowDateChange,
  showTime,
  onShowTimeChange,
  refreshValue,
  onRefreshValueChange,
  shows = showOptions,
}: ReservationFiltersCardProps) {
  return (
    <PanelCard>
      <div className="flex flex-col gap-3 p-3 min-[1200px]:flex-row min-[1200px]:items-end min-[1200px]:justify-between">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-[11rem_minmax(0,1fr)_9.5rem] sm:items-end">
          <div className="min-w-0 space-y-1">
            <Label htmlFor="show-date" className="text-xs font-medium">
              Show Date
            </Label>
            <Input
              id="show-date"
              type="date"
              value={showDate}
              onChange={(e) => onShowDateChange(e.target.value)}
              className="w-full min-w-0"
            />
          </div>

          <div className="min-w-0 space-y-1">
            <Label htmlFor="show-time" className="text-xs font-medium">
              Show Time
            </Label>
            <Select value={showTime} onValueChange={onShowTimeChange}>
              <SelectTrigger id="show-time" className="w-full min-w-0">
                <SelectValue placeholder="Select show" />
              </SelectTrigger>
              <SelectContent>
                {shows.map((show) => (
                  <SelectItem key={show.id} value={show.id}>
                    {show.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 space-y-1">
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
                onChange={(e) => onRefreshValueChange(e.target.value)}
                className="min-w-0 rounded-r-none border-r-0"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                className="shrink-0 rounded-l-none border-l-0 shadow-xs"
                aria-label="Refresh now"
              >
                <RefreshCw className="size-4" />
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
