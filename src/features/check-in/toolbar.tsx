import { Plus, RefreshCw, Zap } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { StatsBar } from "@/components/common/stats-bar"
import { Button } from "@/components/ui/button"
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
import { checkInCounts } from "@/data/check-in"
import { showOptions } from "@/data/reservation"
import type { ShowOption } from "@/types/reservation"

/** Seat summary values shown in the toolbar — synced with checkInCounts data. */
const statItems = [
  { label: "Seats", value: checkInCounts.seats },
  { label: "Reservation", value: checkInCounts.reservation },
  { label: "Available", value: checkInCounts.available },
  { label: "Seated", value: checkInCounts.seated },
  { label: "Scanned", value: checkInCounts.scanned },
] as const

type CheckInToolbarProps = {
  showDate: string
  onShowDateChange: (value: string) => void
  showTime: string
  onShowTimeChange: (value: string) => void
  refreshValue: string
  onRefreshValueChange: (value: string) => void
  cancelled: boolean
  onCancelledChange: (value: boolean) => void
  displayCheckedIn: boolean
  onDisplayCheckedInChange: (value: boolean) => void
  cancelledShow: boolean
  onCancelledShowChange: (value: boolean) => void
  onAddReservation?: () => void
  shows?: ShowOption[]
}

/** Returns today's date as yyyy-mm-dd for the date picker. */
function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Human-readable weekday shown beside the show date field. */
function formatDayName(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString("en-US", { weekday: "long" })
}

/**
 * Top toolbar for the Check-In page.
 *
 * Row 1 — Show context: date, time, auto-refresh, display toggles
 * Row 2 — Booth actions: add reservation, express walkup, live stats
 */
export function CheckInToolbar({
  showDate,
  onShowDateChange,
  showTime,
  onShowTimeChange,
  refreshValue,
  onRefreshValueChange,
  cancelled,
  onCancelledChange,
  displayCheckedIn,
  onDisplayCheckedInChange,
  cancelledShow,
  onCancelledShowChange,
  onAddReservation,
  shows = showOptions,
}: CheckInToolbarProps) {
  return (
    <PanelCard>
      {/* Row 1: select which show to check in */}
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2 border-b p-2.5 lg:gap-x-4 lg:p-3">
        <Button
          variant="outline"
          type="button"
          size="sm"
          className="h-8 shrink-0 px-3 shadow-xs"
          onClick={() => onShowDateChange(todayDateValue())}
        >
          Today
        </Button>

        <div className="space-y-0.5">
          <Label htmlFor="check-in-show-date" className="text-xs font-medium">
            Show Date
          </Label>
          <div className="flex h-8 items-center gap-2">
            <Input
              id="check-in-show-date"
              type="date"
              value={showDate}
              onChange={(e) => onShowDateChange(e.target.value)}
              className="h-8 w-[9.5rem] text-xs"
            />
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {formatDayName(showDate)}
            </span>
          </div>
        </div>

        <div className="min-w-[11rem] flex-1 space-y-0.5 sm:max-w-xs lg:max-w-sm">
          <Label htmlFor="check-in-show-time" className="text-xs font-medium">
            Show Time
          </Label>
          <Select value={showTime} onValueChange={onShowTimeChange}>
            <SelectTrigger id="check-in-show-time" className="h-8 w-full text-xs">
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

        <div className="space-y-0.5">
          <Label htmlFor="check-in-refresh" className="text-xs font-medium">
            Refresh
          </Label>
          <div className="flex">
            <Input
              id="check-in-refresh"
              value={refreshValue}
              onChange={(e) => onRefreshValueChange(e.target.value)}
              className="h-8 w-16 rounded-r-none border-r-0 text-xs"
            />
            <Button
              variant="outline"
              size="icon-sm"
              type="button"
              className="rounded-l-none border-l-0 shadow-xs"
              aria-label="Refresh now"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Toggle: include cancelled reservations in the table */}
        <label className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 text-xs">
          <Checkbox
            id="check-in-cancelled"
            checked={cancelled}
            onCheckedChange={(v) => onCancelledChange(v === true)}
          />
          Cancelled
        </label>

        {/* Toggle: show guests already checked in */}
        <label className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 text-xs">
          <Checkbox
            id="check-in-display-checked-in"
            checked={displayCheckedIn}
            onCheckedChange={(v) => onDisplayCheckedInChange(v === true)}
          />
          <span className="hidden sm:inline">Display Checked-In Reservation</span>
          <span className="sm:hidden">Checked-In</span>
        </label>
      </div>

      {/* Row 2: quick actions and live seat counts */}
      <div className="flex flex-col gap-2 p-2.5 lg:flex-row lg:items-center lg:justify-between lg:p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={onAddReservation}
          >
            <Plus className="size-3.5" />
            Add Reservation
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Zap className="size-3.5" />
            Express Walkup
          </Button>
        </div>

        <StatsBar items={statItems} />

        {/* Toggle: show was cancelled at the venue level */}
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs">
          <Checkbox
            checked={cancelledShow}
            onCheckedChange={(v) => onCancelledShowChange(v === true)}
          />
          Cancelled Show
        </label>
      </div>
    </PanelCard>
  )
}
