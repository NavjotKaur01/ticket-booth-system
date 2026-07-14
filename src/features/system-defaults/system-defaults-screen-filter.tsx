import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SystemDefaultFilters } from "@/types/system-default"

type SystemDefaultsScreenFilterProps = {
  filters: SystemDefaultFilters
  screenOptions: string[]
  onScreenChange: (value: string) => void
}

export function SystemDefaultsScreenFilter({
  filters,
  screenOptions,
  onScreenChange,
}: SystemDefaultsScreenFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Label htmlFor="system-defaults-screen" className="shrink-0 text-xs font-medium">
        Screen
      </Label>
      <Select
        value={filters.screen || "all"}
        onValueChange={(value) => onScreenChange(value === "all" ? "" : value)}
      >
        <SelectTrigger id="system-defaults-screen" className="w-full sm:w-52">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">Select</SelectItem>
          {screenOptions.map((screen) => (
            <SelectItem key={screen} value={screen}>
              {screen}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
