import type { ToolbarProps, View } from "react-big-calendar"
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"

import CalendarSelectControl from "./controls/CalendarSelectControl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { AppLocation } from "@/types/api/locations"
import type { CalendarEvent } from "@/types/calendar-event"

interface CalendarToolbarProps extends ToolbarProps<CalendarEvent> {
  locationId: string
  onLocationChange: (locationId: string) => void
  locations: AppLocation[]
  locationsLoading?: boolean
  showCancelled: boolean
  setShowCancelled: (val: boolean) => void
  refreshInterval: number
  setRefreshInterval: (val: number) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

const viewOptions: { value: View; label: string; icon: typeof CalendarDays }[] = [
  { value: "month", label: "Month", icon: CalendarDays },
  { value: "week", label: "Week", icon: CalendarRange },
]

function getLocationLabel(location: AppLocation) {
  return location.shortName || location.label || location.name || location.id
}

export default function CalendarToolbar({
  label,
  view,
  onView,
  onNavigate,
  locationId,
  onLocationChange,
  locations,
  locationsLoading = false,
  showCancelled,
  setShowCancelled,
  refreshInterval,
  setRefreshInterval,
  onRefresh,
  isRefreshing = false,
}: CalendarToolbarProps) {
  return (
    <div className="grid shrink-0 gap-2 bg-primary px-2 py-2 text-primary-foreground sm:px-3 xl:grid-cols-[minmax(13rem,17rem)_minmax(18rem,1fr)_auto] xl:items-center xl:gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Label className="shrink-0 text-sm font-medium text-primary-foreground">
          Location
        </Label>
        <CalendarSelectControl
          id="calendar-location"
          value={locationId}
          onChange={onLocationChange}
          disabled={locationsLoading || locations.length === 0}
          placeholder={locationsLoading ? "Loading..." : "Select location"}
          className="h-8 min-w-0 flex-1 bg-background text-sm text-foreground xl:w-full"
          options={locations.map((item) => ({
            value: item.id,
            label: getLocationLabel(item),
          }))}
        />
      </div>

      <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_2rem_auto] items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("PREV")}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          aria-label="Previous period"
        >
          <ChevronLeft size={18} />
        </Button>

        <span className="min-w-0 truncate text-center text-sm font-semibold sm:text-base">
          {label}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("NEXT")}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          aria-label="Next period"
        >
          <ChevronRight size={18} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("TODAY")}
          className="h-8 border-primary-foreground/60 bg-background px-2 text-xs text-foreground hover:bg-primary-foreground/90 sm:px-3 sm:text-sm"
        >
          Today
        </Button>
      </div>

      <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[auto_auto_auto] sm:justify-between md:justify-start xl:justify-end">
        <div className="col-span-2 flex w-full rounded-md border border-primary-foreground/40 bg-primary-foreground/10 p-0.5 sm:col-span-1 sm:w-auto">
          {viewOptions.map(({ value, label: optionLabel, icon: Icon }) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onView(value)}
              className={cn(
                "h-7 flex-1 gap-1 rounded-sm px-2 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:flex-none",
                view === value &&
                  "bg-background text-foreground hover:bg-background hover:text-foreground"
              )}
              aria-pressed={view === value}
            >
              <Icon className="size-3.5" />
              <span>{optionLabel}</span>
            </Button>
          ))}
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <Label className="shrink-0 text-sm text-primary-foreground">
            Refresh
          </Label>
          <Input
            type="number"
            value={refreshInterval}
            onChange={(event) => setRefreshInterval(Number(event.target.value))}
            min={10}
            aria-label="Refresh interval in seconds"
            className="h-8 w-14 bg-background text-center text-sm text-foreground focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={!onRefresh || isRefreshing}
            aria-label="Refresh calendar"
            className="hidden h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground md:inline-flex"
          >
            <RefreshCw
              size={16}
              aria-hidden="true"
              className={isRefreshing ? "animate-spin" : undefined}
            />
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 sm:justify-start">
          <Checkbox
            id="cancelled"
            checked={showCancelled}
            onCheckedChange={(val) => setShowCancelled(val as boolean)}
            className="border-primary-foreground data-checked:border-primary-foreground data-checked:bg-primary-foreground dark:data-checked:bg-primary-foreground data-checked:[&_[data-slot=checkbox-indicator]]:text-primary dark:data-checked:[&_[data-slot=checkbox-indicator]]:text-primary"
          />
          <Label
            htmlFor="cancelled"
            className="cursor-pointer text-sm text-primary-foreground"
          >
            Cancelled
          </Label>
        </div>
      </div>
    </div>
  )
}
