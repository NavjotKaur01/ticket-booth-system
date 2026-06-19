import { PanelCard } from "@/components/common/panel-card"
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
  onClearSelection: () => void
  onMarkInactive: () => void
  onMarkActive: () => void
}

export function PerformerFiltersCard({
  filters,
  selectedCount,
  onFilterChange,
  onClearSelection,
  onMarkInactive,
  onMarkActive,
}: PerformerFiltersCardProps) {
  return (
    <PanelCard>
      <div className="flex flex-col gap-3 border-b p-3 xl:flex-row xl:items-end xl:gap-2">
        <Input
          placeholder="First Name"
          value={filters.firstName}
          onChange={(event) => onFilterChange("firstName", event.target.value)}
          className="xl:max-w-36"
        />
        <Input
          placeholder="Last Name"
          value={filters.lastName}
          onChange={(event) => onFilterChange("lastName", event.target.value)}
          className="xl:max-w-36"
        />
        <Input
          placeholder="Stage Name"
          value={filters.stageName}
          onChange={(event) => onFilterChange("stageName", event.target.value)}
          className="min-w-0 flex-1"
        />
      </div>

      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
            <Checkbox
              checked={filters.showInactive}
              onCheckedChange={(value) =>
                onFilterChange("showInactive", value === true)
              }
            />
            Show Inactive Performers
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
            disabled={selectedCount === 0}
          >
            Clear selection
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onMarkInactive}
            disabled={selectedCount === 0}
          >
            Mark Performer Inactive
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onMarkActive}
            disabled={selectedCount === 0}
          >
            Mark Performer Active
          </Button>
        </div>
      </div>
    </PanelCard>
  )
}
