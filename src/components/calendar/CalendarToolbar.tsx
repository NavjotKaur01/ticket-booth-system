import type { ToolbarProps } from "react-big-calendar"
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

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
import type { CalendarEvent } from "@/data/calendarEvents"

interface CalendarToolbarProps extends ToolbarProps<CalendarEvent> {
  location: string
  setLocation: (value: string) => void
  locations: string[]
  showCancelled: boolean
  setShowCancelled: (value: boolean) => void
  refreshInterval: number
  setRefreshInterval: (value: number) => void
}

export default function CalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
  location,
  setLocation,
  locations,
  showCancelled,
  setShowCancelled,
  refreshInterval,
  setRefreshInterval,
}: CalendarToolbarProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 bg-primary px-2 py-2 text-primary-foreground sm:px-3">
      <div className="order-2 flex min-w-0 basis-full items-center gap-2 sm:basis-auto lg:order-1">
        <Label className="shrink-0 text-sm font-medium text-primary-foreground">
          Location
        </Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="h-8 min-w-0 flex-1 bg-background text-sm text-foreground focus:ring-0 sm:w-[160px] sm:flex-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground">
            {locations.map((item) => (
              <SelectItem
                className="focus:bg-accent focus:text-accent-foreground"
                key={item}
                value={item}
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="order-1 flex min-w-0 basis-full items-center justify-center gap-1 lg:order-2 lg:min-w-[18rem] lg:flex-1 lg:basis-auto lg:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("PREV")}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          aria-label="Previous period"
        >
          <ChevronLeft size={18} />
        </Button>

        <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold sm:min-w-[140px] sm:flex-none sm:text-base">
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
          className="ml-1 h-8 border-primary-foreground/60 bg-background text-foreground hover:bg-primary-foreground/90"
        >
          Today
        </Button>
      </div>

      <div className="order-3 inline-flex rounded-md bg-primary-foreground/10 p-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onView("month")}
          aria-pressed={view === "month"}
          className={
            view === "month"
              ? "h-7 bg-background text-foreground hover:bg-background hover:text-foreground"
              : "h-7 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          }
        >
          <CalendarDays />
          Month
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onView("week")}
          aria-pressed={view === "week"}
          className={
            view === "week"
              ? "h-7 bg-background text-foreground hover:bg-background hover:text-foreground"
              : "h-7 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          }
        >
          <CalendarRange />
          Week
        </Button>
      </div>

      <div className="order-4 flex items-center gap-2">
        <Label className="text-sm text-primary-foreground">Refresh</Label>
        <Input
          type="number"
          value={refreshInterval}
          onChange={(inputEvent) =>
            setRefreshInterval(Number(inputEvent.target.value))
          }
          min={1}
          aria-label="Refresh interval in seconds"
          className="h-8 w-14 bg-background text-center text-sm text-foreground focus-visible:ring-0"
        />
        <RefreshCw
          size={16}
          aria-hidden="true"
          className="hidden text-primary-foreground sm:block"
        />
      </div>

      <div className="order-5 ml-auto flex items-center justify-end gap-2">
        <Checkbox
          id="cancelled"
          checked={showCancelled}
          onCheckedChange={(checked) => setShowCancelled(checked === true)}
          className="border-primary-foreground data-checked:border-primary-foreground data-checked:bg-primary-foreground data-checked:[&_[data-slot=checkbox-indicator]]:text-primary dark:data-checked:bg-primary-foreground dark:data-checked:[&_[data-slot=checkbox-indicator]]:text-primary"
        />
        <Label
          htmlFor="cancelled"
          className="cursor-pointer text-sm text-primary-foreground"
        >
          Cancelled
        </Label>
      </div>
    </div>
  )
}
