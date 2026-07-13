import { Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { AddShowTimeDialog } from "@/features/show-times/add-show-time-dialog"
import { ShowTimeDataTable } from "@/features/show-times/show-time-data-table"
import { ShowTimeFiltersCard } from "@/features/show-times/show-time-filters-card"
import { useAppSession } from "@/hooks/use-app-session"
import { useShowTimeSearch } from "@/hooks/use-show-time-search"
import { buildDeleteShowDefRequest } from "@/lib/build-show-def-request"
import { deleteShowDefs } from "@/lib/api/show-times"
import {
  DEFAULT_SHOW_TIME_FILTERS,
  type ShowTimeFilters,
  type ShowTimeRow,
} from "@/types/show-time"

export function ShowTimes() {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const { rows, loading, error, hasSearched, search, clear } = useShowTimeSearch(
    {
      connectionName,
      locationId,
      enabled: isReady,
    }
  )

  const [draftFilters, setDraftFilters] = useState<ShowTimeFilters>(
    DEFAULT_SHOW_TIME_FILTERS
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<ShowTimeRow | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const previousDay = useRef(draftFilters.dayOfWeek)
  const didInitialSearch = useRef(false)

  useEffect(() => {
    if (!isReady || didInitialSearch.current) return
    didInitialSearch.current = true
    void search(draftFilters)
  }, [isReady, draftFilters, search])

  // Desktop ShowDefDay setter re-runs Search immediately when the day changes.
  useEffect(() => {
    if (!didInitialSearch.current) return
    if (previousDay.current === draftFilters.dayOfWeek) return
    previousDay.current = draftFilters.dayOfWeek
    if (!isReady) return
    setActionError(null)
    void search(draftFilters)
  }, [draftFilters, isReady, search])

  function updateDraftField<K extends keyof ShowTimeFilters>(
    key: K,
    value: ShowTimeFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))
  }

  function handleSearch() {
    setActionError(null)
    void search(draftFilters)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_SHOW_TIME_FILTERS)
    setActionError(null)
    clear()
  }

  async function handleSaved() {
    setActionError(null)
    await search(draftFilters)
  }

  async function handleDelete(row: ShowTimeRow) {
    if (!isReady || !connectionName || !locationId) {
      setActionError("Location is required before deleting a show time.")
      return
    }

    const confirmed = window.confirm("Are you sure you want to delete?")
    if (!confirmed) return

    setActionError(null)
    try {
      await deleteShowDefs(
        buildDeleteShowDefRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          showDefId: row.groupId,
        })
      )
      await search(draftFilters)
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete show time."
      )
    }
  }

  const emptyMessage = loading
    ? "Searching show times..."
    : hasSearched
      ? "No record found"
      : "Select a day of week and click Search"

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
              {rows.length}
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingRow(null)
              setAddOpen(true)
            }}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {error || actionError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {error || actionError}
          </p>
        ) : null}

        <ShowTimeDataTable
          data={rows}
          emptyMessage={emptyMessage}
          onEdit={(row) => {
            setEditingRow(row)
            setAddOpen(true)
          }}
          onDelete={(row) => void handleDelete(row)}
        />
      </PanelCard>

      <AddShowTimeDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setEditingRow(null)
        }}
        editingShowDefId={editingRow?.groupId ?? null}
        defaultDayOfWeek={draftFilters.dayOfWeek}
        onSaved={handleSaved}
      />
    </div>
  )
}
