import { Search } from "lucide-react"

import { ShowDateField } from "@/components/common/show-date-field"
import {
  createFilterSearchHandlers,
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AdminEventFilters } from "@/types/admin-event"

type EventsFiltersBarProps = {
  draftFilters: AdminEventFilters
  onFilterChange: <K extends keyof AdminEventFilters>(
    key: K,
    value: AdminEventFilters[K]
  ) => void
  onSearch: () => void
}

export function EventsFiltersBar({
  draftFilters,
  onFilterChange,
  onSearch,
}: EventsFiltersBarProps) {
  const { handleSubmit, handleInputKeyDown } = createFilterSearchHandlers(onSearch)

  return (
    <form
      className={`${FILTER_ROW_INNER_CLASS} border-b px-3 py-3`}
      onSubmit={handleSubmit}
    >
      <label className="flex h-9 cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={draftFilters.allShows}
          onCheckedChange={(value) => onFilterChange("allShows", value === true)}
        />
        <span className="font-medium text-foreground">All Shows</span>
      </label>

      <ShowDateField
        showDate={draftFilters.date}
        onShowDateChange={(value) => onFilterChange("date", value)}
        disabled={draftFilters.allShows}
        className={cn(
          "h-9 w-full justify-between rounded-md border border-input bg-background px-3 py-2 hover:bg-background sm:w-44",
          draftFilters.allShows && "opacity-60"
        )}
      />

      <Input
        placeholder="Search for events..."
        value={draftFilters.search}
        onChange={(event) => onFilterChange("search", event.target.value)}
        onKeyDown={handleInputKeyDown}
        className={`${FILTER_INPUT_CLASS} sm:min-w-56`}
      />

      <IconActionButton
        label="Search"
        icon={Search}
        variant="default"
        type="submit"
      />
    </form>
  )
}
