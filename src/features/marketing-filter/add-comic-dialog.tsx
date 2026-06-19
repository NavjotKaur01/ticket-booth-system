import { Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { RowSelectionState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { IconActionButton } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { performers } from "@/data/performers"
import { selectComedianColumns } from "@/features/marketing-filter/select-comedian-columns"
import { filterPerformers } from "@/lib/filter-performers"
import type { PerformerFilters } from "@/types/performer"

type ComedianSearchFilters = Pick<
  PerformerFilters,
  "firstName" | "lastName" | "stageName"
>

const EMPTY_SEARCH: ComedianSearchFilters = {
  firstName: "",
  lastName: "",
  stageName: "",
}

type AddComicDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  onConfirm: (ids: string[]) => void
}

export function AddComicDialog({
  open,
  onOpenChange,
  selectedIds,
  onConfirm,
}: AddComicDialogProps) {
  const [draftFilters, setDraftFilters] =
    useState<ComedianSearchFilters>(EMPTY_SEARCH)
  const [appliedFilters, setAppliedFilters] =
    useState<ComedianSearchFilters>(EMPTY_SEARCH)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    if (!open) return

    setDraftFilters(EMPTY_SEARCH)
    setAppliedFilters(EMPTY_SEARCH)
    setRowSelection(
      Object.fromEntries(selectedIds.map((id) => [id, true] as const))
    )
  }, [open, selectedIds])

  const filteredPerformers = useMemo(
    () =>
      filterPerformers(performers, {
        ...appliedFilters,
        locationId: "",
        showInactive: true,
      }),
    [appliedFilters]
  )

  function updateDraftField(
    field: keyof ComedianSearchFilters,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleClearSearch() {
    setDraftFilters(EMPTY_SEARCH)
    setAppliedFilters(EMPTY_SEARCH)
  }

  function handleCreate() {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id])
    onConfirm(ids)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-4xl flex-col overflow-hidden sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              Select Comedian
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3">
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
            <Input
              placeholder="Last Name"
              value={draftFilters.lastName}
              onChange={(event) =>
                updateDraftField("lastName", event.target.value)
              }
              className="sm:max-w-40"
            />
            <Input
              placeholder="First Name"
              value={draftFilters.firstName}
              onChange={(event) =>
                updateDraftField("firstName", event.target.value)
              }
              className="sm:max-w-40"
            />
            <Input
              placeholder="Stage Name"
              value={draftFilters.stageName}
              onChange={(event) =>
                updateDraftField("stageName", event.target.value)
              }
              className="min-w-0 flex-1"
            />
            <div className="flex items-center gap-1.5 sm:ml-auto">
              <IconActionButton
                label="Search"
                icon={Search}
                variant="default"
                onClick={handleSearch}
              />
              <IconActionButton
                label="Clear"
                icon={X}
                variant="outline"
                onClick={handleClearSearch}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
            <div className="max-h-[min(24rem,50vh)] overflow-auto">
              <DataTable
                columns={selectComedianColumns}
                data={filteredPerformers}
                emptyMessage="No comedian found"
                entityLabel="comedians"
                enablePagination={false}
                enableRowSelection
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                getRowId={(row) => row.id}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
