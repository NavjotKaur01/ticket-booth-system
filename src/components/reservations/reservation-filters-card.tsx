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
  showTime: string
  onShowTimeChange: (value: string) => void
  refreshValue: string
  onRefreshValueChange: (value: string) => void
  cancelledReservation: boolean
  onCancelledReservationChange: (value: boolean) => void
  cancelledShow: boolean
  onCancelledShowChange: (value: boolean) => void
  displayPhone: boolean
  onDisplayPhoneChange: (value: boolean) => void
  shows?: ShowOption[]
}

/** Top panel: show selectors, live seat counts, and view toggles. */
export function ReservationFiltersCard({
  showDate,
  onShowDateChange,
  showTime,
  onShowTimeChange,
  refreshValue,
  onRefreshValueChange,
  cancelledReservation,
  onCancelledReservationChange,
  cancelledShow,
  onCancelledShowChange,
  displayPhone,
  onDisplayPhoneChange,
  shows = showOptions,
}: ReservationFiltersCardProps) {
  return (
    <Card className={RESERVATION_PANEL_CLASS}>
      <div className="flex flex-col gap-5 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="show-date" className="text-xs font-medium">
              Show Date
            </Label>
            <Input
              id="show-date"
              type="date"
              value={showDate}
              onChange={(e) => onShowDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
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

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
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

        {/* Stacks on mobile; inline stat strip on large screens. */}
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:w-auto lg:gap-0 lg:overflow-hidden lg:rounded-sm lg:bg-muted/30 lg:shadow-xs lg:divide-x lg:divide-border/50">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="rounded-sm bg-muted/40 px-4 py-2.5 text-center lg:min-w-20 lg:rounded-none lg:bg-transparent"
            >
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t bg-muted/20 px-4 py-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          View
        </span>
        <Button variant="outline" size="sm">
          Today
        </Button>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={cancelledReservation}
            onCheckedChange={(v) => onCancelledReservationChange(v === true)}
          />
          Cancelled
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={cancelledShow}
            onCheckedChange={(v) => onCancelledShowChange(v === true)}
          />
          Cancelled Show
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={displayPhone}
            onCheckedChange={(v) => onDisplayPhoneChange(v === true)}
          />
          Display Phone
        </label>
      </div>
    </Card>
  )
}
