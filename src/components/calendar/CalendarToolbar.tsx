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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-blue-700 text-white px-4 py-2">

      {/* Location */}
      <div className="flex items-center gap-2">
        <Label className="text-white text-sm font-medium">Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[160px] bg-white text-black text-sm h-8 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map(l => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('PREV')}
          className="text-white hover:bg-blue-600 hover:text-white h-8 w-8"
        >
          <ChevronLeft size={18} />
        </Button>

        <span className="font-semibold text-base min-w-[140px] text-center">
          {label}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('NEXT')}
          className="text-white hover:bg-blue-600 hover:text-white h-8 w-8"
        >
          <ChevronRight size={18} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
          className="ml-2 h-8 text-black border-white hover:bg-blue-600 hover:text-white"
        >
          Today
        </Button>
      </div>

      {/* Refresh */}
      <div className="flex items-center gap-2">
        <Label className="text-white text-sm">Refresh</Label>
        <Input
          type="number"
          value={refreshInterval}
          onChange={e => setRefreshInterval(Number(e.target.value))}
          className="w-14 h-8 text-black bg-white text-center text-sm focus-visible:ring-0"
        />
        <RefreshCw size={16} className="cursor-pointer hover:opacity-70 text-white" />
      </div>

      {/* Cancelled */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="cancelled"
          checked={showCancelled}
          onCheckedChange={val => setShowCancelled(val as boolean)}
          className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-700"
        />
        <Label htmlFor="cancelled" className="text-white text-sm cursor-pointer">
          Cancelled
        </Label>
      </div>

    </div>
  )
}