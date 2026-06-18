import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { reservationCounts, showOptions } from "@/data/reservation-data"
import type { ShowOption } from "@/types/reservation"

/** Shared card styling: shadow only, no extra padding from Card defaults. */
export const RESERVATION_PANEL_CLASS = "gap-0 py-0"

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
  cancelledShow: boolean
  onCancelledShowChange: (value: boolean) => void
  showTime: string
  onShowTimeChange: (value: string) => void
  refreshValue: string
  onRefreshValueChange: (value: string) => void
  shows?: ShowOption[]
}

/** ISO date string (yyyy-mm-dd) for the local calendar day. */
function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Top panel: show selectors, live seat counts, and view toggles. */
export function ReservationFiltersCard({
  showDate,
  onShowDateChange,
  cancelledShow,
  onCancelledShowChange,
  showTime,
  onShowTimeChange,
  refreshValue,
  onRefreshValueChange,
  shows = showOptions,
}: ReservationFiltersCardProps) {
  return (
    <Card className={RESERVATION_PANEL_CLASS}>
      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-3">
          <Button
            variant="outline"
            type="button"
            size="sm"
            className="h-9 shrink-0 px-3 shadow-xs"
            onClick={() => onShowDateChange(todayDateValue())}
          >
            Today
          </Button>

          <div className="space-y-1">
            <Label htmlFor="show-date" className="text-xs font-medium">
              Show Date
            </Label>
            <Input
              id="show-date"
              type="date"
              value={showDate}
              onChange={(e) => onShowDateChange(e.target.value)}
              className="w-[10.5rem]"
            />
          </div>

          <label
            htmlFor="cancelled-show"
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 text-xs text-foreground"
          >
            <Checkbox
              id="cancelled-show"
              checked={cancelledShow}
              onCheckedChange={(v) => onCancelledShowChange(v === true)}
            />
            Cancelled Show
          </label>

          <div className="min-w-[12rem] flex-1 space-y-1 sm:max-w-xs lg:max-w-sm">
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

          <div className="space-y-1">
            <Label htmlFor="refresh-interval" className="text-xs font-medium">
              Auto Refresh
              <span className="ml-1 font-normal text-muted-foreground">
                (seconds)
              </span>
            </Label>
            <div className="flex max-w-xs">
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

        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:w-auto lg:gap-0 lg:overflow-hidden lg:rounded-sm lg:bg-muted/30 lg:shadow-xs lg:divide-x lg:divide-border/50">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="rounded-sm bg-muted/40 px-3 py-1.5 text-center lg:min-w-[4.5rem] lg:rounded-none lg:bg-transparent"
            >
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
