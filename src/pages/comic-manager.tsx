import { Plus, Save } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
} from "@/components/forms/form-fields"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  comicManagerTransferOptions,
  type ComicManagerTransferOption,
} from "@/data/comic-manager"
import { performers as initialPerformers } from "@/data/performers"
import { AddPerformerDialog } from "@/features/performers/add-performer-dialog"
import { ComicManagerDataTable } from "@/features/comic-manager/comic-manager-data-table"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import { filterPerformers } from "@/lib/filter-performers"
import type { Performer, PerformerFilters } from "@/types/performer"

function checklistLabelClass(checked: boolean) {
  return cn(
    "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
    checked ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
  )
}

export function ComicManager() {
  const [rows, setRows] = useState<Performer[]>(() =>
    initialPerformers.map((row, index) =>
      index === 0 ? { ...row, stageName: "Kinane, Kyle" } : row
    )
  )
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [transferOptions, setTransferOptions] = useState<
    Record<ComicManagerTransferOption, boolean>
  >({
    comicTransfer: true,
    picTransfer: false,
    bioTransfer: false,
    makeInactive: false,
  })
  const [filters, setFilters] = useState<PerformerFilters>({
    firstName: "",
    lastName: "",
    stageName: "",
    showInactive: false,
  })
  const [filterByGenre, setFilterByGenre] = useState(false)
  const [filterByRating, setFilterByRating] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  const filteredRows = useMemo(() => filterPerformers(rows, filters), [rows, filters])

  function updateFilter<K extends keyof PerformerFilters>(
    key: K,
    value: PerformerFilters[K]
  ) {
    setFilters((current) => ({ ...current, [key]: value }))
    setMessage(null)
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id)
    )
    setMessage(null)
  }

  function selectAll() {
    setSelectedIds(filteredRows.map((row) => row.id))
    setMessage(null)
  }

  function selectNone() {
    setSelectedIds([])
    setMessage(null)
  }

  function toggleTransferOption(option: ComicManagerTransferOption, checked: boolean) {
    setTransferOptions((current) => ({ ...current, [option]: checked }))
    setMessage(null)
  }

  function handleUpdate() {
    if (selectedIds.length === 0) {
      setMessageVariant("error")
      setMessage("Select at least one comic to update.")
      return
    }

    const activeOptions = comicManagerTransferOptions
      .filter((option) => transferOptions[option.id])
      .map((option) => option.label)

    if (transferOptions.makeInactive) {
      setRows((current) =>
        current.map((row) =>
          selectedIds.includes(row.id) ? { ...row, active: false } : row
        )
      )
    }

    setMessageVariant("success")
    setMessage(
      `Updated ${selectedIds.length} comic(s)${
        activeOptions.length ? `: ${activeOptions.join(", ")}` : "."
      }`
    )
    setSelectedIds([])
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>Comic Manager</AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar className="py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={selectNone}>
              Select None
            </Button>

            {comicManagerTransferOptions.map((option) => {
              const checked = transferOptions[option.id]

              return (
                <label key={option.id} className={checklistLabelClass(checked)}>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggleTransferOption(option.id, value === true)
                    }
                  />
                  {option.label}
                </label>
              )
            })}
          </div>

          <AdminPanelActions>
            <Button type="button" size="sm" className="gap-1.5" onClick={handleUpdate}>
              <Save className="size-3.5" />
              Update
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <AdminPanelToolbar className="border-t-0 bg-muted/20 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <p className="text-xs font-medium text-foreground">Filter</p>
            <label className={checklistLabelClass(filterByGenre)}>
              <Checkbox
                checked={filterByGenre}
                onCheckedChange={(value) => setFilterByGenre(value === true)}
              />
              Genre
            </label>
            <label className={checklistLabelClass(filterByRating)}>
              <Checkbox
                checked={filterByRating}
                onCheckedChange={(value) => setFilterByRating(value === true)}
              />
              Rating
            </label>
          </div>

          <AdminPanelActions>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-3.5" />
              Add New
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <div className={`${FILTER_ROW_INNER_CLASS} border-b px-3 py-3`}>
          <Input
            placeholder="First Name"
            value={filters.firstName}
            onChange={(event) => updateFilter("firstName", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Last Name"
            value={filters.lastName}
            onChange={(event) => updateFilter("lastName", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Stage Name"
            value={filters.stageName}
            onChange={(event) => updateFilter("stageName", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
        </div>

        <AdminPanelToolbar className="border-t-0 py-2">
          <AdminPanelStats>
            Selected:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {selectedIds.length}
            </span>
          </AdminPanelStats>
          <AdminPanelStats className="sm:text-right">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredRows.length}
            </span>
          </AdminPanelStats>
        </AdminPanelToolbar>

        <ComicManagerDataTable
          data={filteredRows}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
        />

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>

      <AddPerformerDialog open={addOpen} onOpenChange={setAddOpen} />
    </AdminPageShell>
  )
}
