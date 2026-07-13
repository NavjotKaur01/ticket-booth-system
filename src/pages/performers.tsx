import { Plus } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { RowSelectionState } from "@tanstack/react-table"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { AddPerformerDialog } from "@/features/performers/add-performer-dialog"
import { PerformerDataTable } from "@/features/performers/performer-data-table"
import { PerformerFiltersCard } from "@/features/performers/performer-filters-card"
import { UpdatePerformerDialog } from "@/features/performers/update-performer-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import { useComedianSearch } from "@/hooks/use-comedian-search"
import {
  DEFAULT_PERFORMER_FILTERS,
  type Performer,
  type PerformerFilters,
} from "@/types/performer"

export function Performers() {
  const { connectionName, locationId, isReady } = useAppSession()
  const {
    performers,
    loading,
    error,
    hasSearched,
    search,
    clear,
    setPerformerActive,
  } = useComedianSearch({
    connectionName,
    locationId,
    enabled: isReady,
  })

  const [draftFilters, setDraftFilters] = useState<PerformerFilters>(
    DEFAULT_PERFORMER_FILTERS
  )
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [addOpen, setAddOpen] = useState(false)
  const [editingPerformer, setEditingPerformer] = useState<Performer | null>(
    null
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const didInitialSearch = useRef(false)
  const previousShowInactive = useRef(draftFilters.showInactive)

  useEffect(() => {
    if (!isReady || didInitialSearch.current) return
    didInitialSearch.current = true
    void search(DEFAULT_PERFORMER_FILTERS)
  }, [isReady, search])

  useEffect(() => {
    if (!didInitialSearch.current) return
    if (previousShowInactive.current === draftFilters.showInactive) return
    previousShowInactive.current = draftFilters.showInactive
    // ClubMan IsActiveComedian setter re-runs Serach immediately.
    void search(draftFilters)
    setRowSelection({})
  }, [draftFilters, search])

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  )
  const selectedCount = selectedIds.length

  const visiblePerformers = useMemo(() => {
    if (draftFilters.showInactive) return performers
    return performers.filter((row) => row.active && !row.hidden)
  }, [performers, draftFilters.showInactive])

  function updateDraftField<K extends keyof PerformerFilters>(
    key: K,
    value: PerformerFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))
    setRowSelection({})
  }

  function handleSearch() {
    setActionError(null)
    setRowSelection({})
    void search(draftFilters)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_PERFORMER_FILTERS)
    setRowSelection({})
    setActionError(null)
    clear()
  }

  function clearSelection() {
    setRowSelection({})
    setActionError(null)
  }

  function handleMarkInactive() {
    if (selectedIds.length === 0) return
    setPerformerActive(selectedIds, false)
    setRowSelection({})
    setActionError(null)
  }

  function handleMarkActive() {
    if (selectedIds.length === 0) return
    setPerformerActive(selectedIds, true)
    setRowSelection({})
    setActionError(null)
  }

  function handleToggleHidden(performer: Performer, hidden: boolean) {
    setPerformerActive([performer.id], !hidden)
  }

  function handleEditPerformer(performer: Performer) {
    setActionError(null)
    setEditingPerformer(performer)
  }

  function handleDeletePerformer(_performer: Performer) {
    // Desktop soft-delete path is commented out; no live API for Administrator delete.
    setActionError("Delete comedian is not available from the API.")
  }

  async function handlePerformerSaved() {
    setActionError(null)
    await search(draftFilters)
  }

  const emptyMessage = loading
    ? "Searching comedians..."
    : hasSearched
      ? "No comedian found"
      : "Enter search criteria and click Search"

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Comedians
        </h1>

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

      <PerformerFiltersCard
        filters={draftFilters}
        selectedCount={selectedCount}
        onFilterChange={updateDraftField}
        onSearch={handleSearch}
        onClear={handleClear}
        onClearSelection={clearSelection}
        onMarkInactive={handleMarkInactive}
        onMarkActive={handleMarkActive}
      />

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {visiblePerformers.length}
            </span>
          </p>
        </div>

        {error || actionError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {error || actionError}
          </p>
        ) : null}

        <PerformerDataTable
          data={visiblePerformers}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onEdit={handleEditPerformer}
          onDelete={handleDeletePerformer}
          onToggleHidden={handleToggleHidden}
          emptyMessage={emptyMessage}
        />
      </PanelCard>

      <AddPerformerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        saveViaApi
        onSaved={handlePerformerSaved}
      />

      <UpdatePerformerDialog
        open={editingPerformer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPerformer(null)
          }
        }}
        performer={editingPerformer}
        onSaved={handlePerformerSaved}
      />
    </div>
  )
}
