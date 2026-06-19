import { Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { IconActionButton } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { dayOfWeekFilterOptions } from "@/data/show-time-form-options"
import type { ShowTimeFilters } from "@/types/show-time"

type ShowTimeFiltersCardProps = {
  filters: ShowTimeFilters
  onFilterChange: <K extends keyof ShowTimeFilters>(
    key: K,
    value: ShowTimeFilters[K]
  ) => void
  onSearch: () => void
  onClear: () => void
}

export function ShowTimeFiltersCard({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: ShowTimeFiltersCardProps) {
  return (
    <PanelCard>
      <div className="space-y-2 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <Select
            value={filters.dayOfWeek}
            onValueChange={(value) => onFilterChange("dayOfWeek", value)}
          >
            <SelectTrigger className="w-full sm:w-40 sm:shrink-0">
              <SelectValue placeholder="Day Of Week" />
            </SelectTrigger>
            <SelectContent>
              {dayOfWeekFilterOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="time"
            value={filters.showTime}
            onChange={(event) =>
              onFilterChange("showTime", event.target.value)
            }
            aria-label="Show Time"
            className="w-[8.5rem] shrink-0"
          />
          <Input
            type="time"
            value={filters.arrivalTime}
            onChange={(event) =>
              onFilterChange("arrivalTime", event.target.value)
            }
            aria-label="Arrival Time"
            className="w-[8.5rem] shrink-0"
          />
          <div className="flex items-center gap-1.5">
            <IconActionButton
              label="Search"
              icon={Search}
              variant="default"
              onClick={onSearch}
            />
            <IconActionButton
              label="Clear"
              icon={X}
              variant="outline"
              onClick={onClear}
            />
          </div>
        </div>
      </div>
    </PanelCard>
  )
}
