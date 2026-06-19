import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import type { RowSelectionState } from "@tanstack/react-table"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  performerLocations,
  performers as initialPerformers,
} from "@/data/performers"
import { AddPerformerDialog } from "@/features/performers/add-performer-dialog"
import { PerformerDataTable } from "@/features/performers/performer-data-table"
import { PerformerFiltersCard } from "@/features/performers/performer-filters-card"
import { filterPerformers } from "@/lib/filter-performers"
import type { Performer, PerformerFilters } from "@/types/performer"

const DEFAULT_FILTERS: PerformerFilters = {
  firstName: "",
  lastName: "",
  stageName: "",
  locationId: "standupmedia",
  showInactive: false,
}

export function Performers() {
  const [rows, setRows] = useState<Performer[]>(initialPerformers)
  const [filters, setFilters] = useState<PerformerFilters>(DEFAULT_FILTERS)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [addOpen, setAddOpen] = useState(false)

  const filteredPerformers = useMemo(
    () => filterPerformers(rows, filters),
    [rows, filters]
  )

  const selectedCount = Object.keys(rowSelection).length

  function updateFilter<K extends keyof PerformerFilters>(
    key: K,
    value: PerformerFilters[K]
  ) {
    setFilters((current) => ({ ...current, [key]: value }))
    setRowSelection({})
  }

  function clearSelection() {
    setRowSelection({})
  }

  function updateSelectedActive(active: boolean) {
    const selectedIds = new Set(Object.keys(rowSelection))

    setRows((current) =>
      current.map((row) =>
        selectedIds.has(row.id) ? { ...row, active } : row
      )
    )
    setRowSelection({})
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Performers
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.locationId}
            onValueChange={(value) => updateFilter("locationId", value)}
          >
            <SelectTrigger className="h-8 w-[11rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {performerLocations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Add New Performer
          </Button>
        </div>
      </div>

      <PerformerFiltersCard
        filters={filters}
        selectedCount={selectedCount}
        onFilterChange={updateFilter}
        onClearSelection={clearSelection}
        onMarkInactive={() => updateSelectedActive(false)}
        onMarkActive={() => updateSelectedActive(true)}
      />

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Drag a column header here to group by that column
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredPerformers.length}
            </span>
          </p>
        </div>

        <PerformerDataTable
          data={filteredPerformers}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </PanelCard>

      <AddPerformerDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
