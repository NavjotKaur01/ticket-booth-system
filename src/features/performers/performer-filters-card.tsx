import { Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import {
  createFilterSearchHandlers,
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { PerformerFilters } from "@/types/performer"

type PerformerFiltersCardProps = {
  filters: PerformerFilters
  selectedCount: number
  onFilterChange: <K extends keyof PerformerFilters>(
    key: K,
    value: PerformerFilters[K]
  ) => void
  onSearch: () => void
  onClear: () => void
  onClearSelection: () => void
  onMarkInactive: () => void
  onMarkActive: () => void
}

export function PerformerFiltersCard({
  filters,
  selectedCount,
  onFilterChange,
  onSearch,
  onClear,
  onClearSelection,
  onMarkInactive,
  onMarkActive,
}: PerformerFiltersCardProps) {
  const hasSelection = selectedCount > 0
  const { handleSubmit, handleInputKeyDown } =
    createFilterSearchHandlers(onSearch)

  return (
    <PanelCard>
      <form className="space-y-0" onSubmit={handleSubmit}>
        <div className={`${FILTER_ROW_INNER_CLASS} border-b p-3`}>
          <Input
            placeholder="Last Name"
            value={filters.lastName}
            onChange={(event) => onFilterChange("lastName", event.target.value)}
            onKeyDown={handleInputKeyDown}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="First Name"
            value={filters.firstName}
            onChange={(event) => onFilterChange("firstName", event.target.value)}
            onKeyDown={handleInputKeyDown}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Stage Name"
            value={filters.stageName}
            onChange={(event) => onFilterChange("stageName", event.target.value)}
            onKeyDown={handleInputKeyDown}
            className="h-9 w-full sm:w-48"
          />
          <div className="flex items-center gap-1.5">
            <IconActionButton
              label="Search"
              icon={Search}
              variant="default"
              type="submit"
            />
            <IconActionButton
              label="Clear"
              icon={X}
              variant="outline"
              onClick={onClear}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
              <Checkbox
                checked={filters.showInactive}
                onCheckedChange={(value) =>
                  onFilterChange("showInactive", value === true)
                }
              />
              Show Inactive
            </label>
            <p className="text-xs text-muted-foreground">
              Selected count:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {selectedCount}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={!hasSelection}
              title={
                hasSelection
                  ? "Clear selected comedians"
                  : "Select one or more comedians first"
              }
            >
              Clear selection
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onMarkInactive}
              disabled={!hasSelection}
              title={
                hasSelection
                  ? "Mark selected comedians inactive"
                  : "Select one or more comedians first"
              }
            >
              Mark Performer Inactive
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onMarkActive}
              disabled={!hasSelection}
              title={
                hasSelection
                  ? "Mark selected comedians active"
                  : "Select one or more comedians first"
              }
            >
              Mark Performer Active
            </Button>
          </div>
        </div>
      </form>
    </PanelCard>
  )
}
