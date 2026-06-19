import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { showTimeRows } from "@/data/show-times"
import { AddShowTimeDialog } from "@/features/show-times/add-show-time-dialog"
import { ShowTimeDataTable } from "@/features/show-times/show-time-data-table"
import { ShowTimeFiltersCard } from "@/features/show-times/show-time-filters-card"
import { filterShowTimes } from "@/lib/filter-show-times"
import {
  DEFAULT_SHOW_TIME_FILTERS,
  type ShowTimeFilters,
} from "@/types/show-time"

export function ShowTimes() {
  const [draftFilters, setDraftFilters] = useState<ShowTimeFilters>(
    DEFAULT_SHOW_TIME_FILTERS
  )
  const [appliedFilters, setAppliedFilters] = useState<ShowTimeFilters>(
    DEFAULT_SHOW_TIME_FILTERS
  )
  const [addOpen, setAddOpen] = useState(false)

  const filteredRows = useMemo(
    () => filterShowTimes(showTimeRows, appliedFilters),
    [appliedFilters]
  )

  function updateDraftField<K extends keyof ShowTimeFilters>(
    key: K,
    value: ShowTimeFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_SHOW_TIME_FILTERS)
    setAppliedFilters(DEFAULT_SHOW_TIME_FILTERS)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Show Times
      </h1>

      <ShowTimeFiltersCard
        filters={draftFilters}
        onFilterChange={updateDraftField}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredRows.length}
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        <ShowTimeDataTable data={filteredRows} />
      </PanelCard>

      <AddShowTimeDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
