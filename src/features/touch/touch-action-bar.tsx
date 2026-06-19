import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { TouchFilters } from "@/types/touch"

const TOUCH_ACTIONS = [
  "Check-In",
  "Partial Check-In",
  "Cancel",
  "Quick Pay",
  "Cash Drawer",
] as const

type TouchActionBarProps = {
  filters: TouchFilters
  onFilterChange: <K extends keyof TouchFilters>(
    key: K,
    value: TouchFilters[K]
  ) => void
}

export function TouchActionBar({ filters, onFilterChange }: TouchActionBarProps) {
  return (
    <div className="space-y-3 border-t px-3 py-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Checkbox
            id="touch-display-cancelled"
            checked={filters.displayCancelled}
            onCheckedChange={(value) =>
              onFilterChange("displayCancelled", value === true)
            }
          />
          <Label htmlFor="touch-display-cancelled" className="font-normal">
            Display Cancelled Reservation
          </Label>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Checkbox
            id="touch-display-checked-in"
            checked={filters.displayCheckedIn}
            onCheckedChange={(value) =>
              onFilterChange("displayCheckedIn", value === true)
            }
          />
          <Label htmlFor="touch-display-checked-in" className="font-normal">
            Display Checked-In Reservation
          </Label>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOUCH_ACTIONS.map((action, index) => (
          <Button
            key={action}
            type="button"
            size="sm"
            variant={index === 0 || index === 3 ? "default" : "outline"}
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  )
}
