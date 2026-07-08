import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { RowSelectionState } from "@tanstack/react-table"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { performers as initialPerformers } from "@/data/performers"
import { AddPerformerDialog } from "@/features/performers/add-performer-dialog"
import { PerformerDataTable } from "@/features/performers/performer-data-table"
import { PerformerFiltersCard } from "@/features/performers/performer-filters-card"
import { UpdatePerformerDialog } from "@/features/performers/update-performer-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import { filterPerformers } from "@/lib/filter-performers"
import { mapUpdateFormToPerformer } from "@/lib/map-performer-form"
import type { Performer, PerformerFilters } from "@/types/performer"
import type { UpdatePerformerFormValues } from "@/types/performer-form"

export function Performers() {
  const { locationId } = useAppSession()
  const [rows, setRows] = useState<Performer[]>(initialPerformers)
  const [filters, setFilters] = useState<PerformerFilters>({
    firstName: "",
    lastName: "",
    stageName: "",
    locationId: "",
    showInactive: false,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [addOpen, setAddOpen] = useState(false)
  const [editingPerformer, setEditingPerformer] = useState<Performer | null>(
    null
  )

  useEffect(() => {
    if (!locationId) {
      return
    }

    setFilters((current) =>
      current.locationId === locationId
        ? current
        : { ...current, locationId }
    )

    // Static seed data uses a placeholder location id; align it with the
    // signed-in location so the default filter does not hide every row.
    setRows((current) => {
      const usesPlaceholderLocation = current.every(
        (row) => row.locationId === "standupmedia"
      )

      if (!usesPlaceholderLocation) {
        return current
      }

      return current.map((row) => ({ ...row, locationId }))
    })
  }, [locationId])

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

  function handleEditPerformer(performer: Performer) {
    setEditingPerformer(performer)
  }

  function handleDeletePerformer(performer: Performer) {
    setRows((current) => current.filter((row) => row.id !== performer.id))
    setRowSelection((current) => {
      if (!current[performer.id]) {
        return current
      }

      const next = { ...current }
      delete next[performer.id]
      return next
    })
  }

  function handlePerformerUpdated(
    performer: Performer,
    form: UpdatePerformerFormValues
  ) {
    const updatedPerformer = mapUpdateFormToPerformer(performer, form)

    setRows((current) =>
      current.map((row) =>
        row.id === performer.id ? updatedPerformer : row
      )
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Performers
        </h1>

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
          onEdit={handleEditPerformer}
          onDelete={handleDeletePerformer}
        />
      </PanelCard>

      <AddPerformerDialog open={addOpen} onOpenChange={setAddOpen} />

      <UpdatePerformerDialog
        open={editingPerformer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPerformer(null)
          }
        }}
        performer={editingPerformer}
        onUpdate={handlePerformerUpdated}
      />
    </div>
  )
}
