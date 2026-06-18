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
      <div className="flex flex-col gap-3 p-3 min-[1500px]:flex-row min-[1500px]:items-end min-[1500px]:justify-between min-[1500px]:gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-x-3 gap-y-3 min-[1500px]:flex-nowrap">
          <div className="shrink-0 space-y-1">
            <Label htmlFor="show-date" className="text-xs font-medium">
              Show Date
            </Label>
            <Input
              id="show-date"
              type="date"
              value={showDate}
              onChange={(e) => onShowDateChange(e.target.value)}
              className="w-[12rem]"
            />
          </div>

          <div className="w-full shrink-0 space-y-1 sm:w-60">
            <Label htmlFor="show-time" className="text-xs font-medium">
              Show Time
            </Label>
            <Select value={showTime} onValueChange={onShowTimeChange}>
              <SelectTrigger id="show-time" className="w-full">
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

          <div className="shrink-0 space-y-1">
            <Label htmlFor="refresh-interval" className="text-xs font-medium">
              Auto Refresh
              <span className="ml-1 font-normal text-muted-foreground">
                (seconds)
              </span>
            </Label>
            <div className="flex w-[9.5rem]">
              <Input
                id="refresh-interval"
                value={refreshValue}
                onChange={(e) => onRefreshValueChange(e.target.value)}
                className="rounded-r-none border-r-0"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                className="rounded-l-none border-l-0 shadow-xs"
                aria-label="Refresh now"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-fit shrink-0 min-[1500px]:ml-auto">
          <StatsBar items={statItems} />
        </div>
      </div>
    </PanelCard>
  )
}
