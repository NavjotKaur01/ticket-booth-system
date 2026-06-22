import type { ToolbarProps } from 'react-big-calendar'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { CalendarEvent } from '@/data/calendarEvents'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CalendarToolbarProps extends ToolbarProps<CalendarEvent> {
  location: string
  setLocation: (val: string) => void
  locations: string[]
  showCancelled: boolean
  setShowCancelled: (val: boolean) => void
  refreshInterval: number
  setRefreshInterval: (val: number) => void
}

export default function CalendarToolbar({
  label,
  onNavigate,
  location,
  setLocation,
  locations,
  showCancelled,
  setShowCancelled,
  refreshInterval,
  setRefreshInterval,
}: CalendarToolbarProps) {
  return (
    <div className="grid shrink-0 grid-cols-2 items-center gap-2 bg-primary px-2 py-2 text-primary-foreground sm:px-3 lg:grid-cols-[auto_1fr_auto_auto] lg:gap-x-4">

      {/* Location */}
      <div className="order-2 col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1 lg:order-1">
        <Label className="shrink-0 text-sm font-medium text-primary-foreground">Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="h-8 min-w-0 flex-1 bg-background text-sm text-foreground focus:ring-0 sm:w-[160px] sm:flex-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground">
            {locations.map(l => (
              <SelectItem  className="focus:bg-accent focus:text-accent-foreground" key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <div className="order-1 col-span-2 flex min-w-0 items-center justify-center gap-1 lg:order-2 lg:col-span-1 lg:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('PREV')}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </Button>

        <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold sm:min-w-[140px] sm:flex-none sm:text-base">
          {label}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('NEXT')}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
          className="ml-1 h-8 border-primary-foreground/60 bg-background text-foreground hover:bg-primary-foreground/90 sm:ml-2"
        >
          Today
        </Button>
      </div>

      {/* Refresh */}
      <div className="order-3 flex items-center gap-2 lg:order-3">
        <Label className="text-sm text-primary-foreground">Refresh</Label>
        <Input
          type="number"
          value={refreshInterval}
          onChange={e => setRefreshInterval(Number(e.target.value))}
          min={1}
          aria-label="Refresh interval in seconds"
          className="h-8 w-14 bg-background text-center text-sm text-foreground focus-visible:ring-0"
        />
        <RefreshCw size={16} aria-hidden="true" className="hidden text-primary-foreground sm:block" />
      </div>

      {/* Cancelled */}
      <div className="order-4 flex items-center justify-end gap-2 lg:order-4">
        <Checkbox
          id="cancelled"
          checked={showCancelled}
          onCheckedChange={val => setShowCancelled(val as boolean)}
          className="border-primary-foreground data-checked:border-primary-foreground data-checked:bg-primary-foreground dark:data-checked:bg-primary-foreground data-checked:[&_[data-slot=checkbox-indicator]]:text-primary dark:data-checked:[&_[data-slot=checkbox-indicator]]:text-primary"
        />
        <Label htmlFor="cancelled" className="cursor-pointer text-sm text-primary-foreground">
          Cancelled
        </Label>
      </div>

    </div>
  )
}