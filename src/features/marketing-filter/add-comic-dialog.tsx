import { Search, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
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
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { selectComedianColumns } from "@/features/marketing-filter/select-comedian-columns"
import { useSearchMarketingComediansMutation } from "@/store/api/clubmanApi"
import type { MarketingFilterComedian } from "@/types/marketing-filter"

type ComedianSearchFilters = {
  firstName: string
  lastName: string
  stageName: string
}

const EMPTY_SEARCH: ComedianSearchFilters = {
  firstName: "",
  lastName: "",
  stageName: "",
}

type AddComicDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  selectedComedians: MarketingFilterComedian[]
  onConfirm: (comedians: MarketingFilterComedian[]) => void
}

function mapComedianResults(
  items: Array<{
    ComicID: string
    ComicName?: string | null
    LastName?: string | null
    FirstName?: string | null
    StageName?: string | null
  }>
): MarketingFilterComedian[] {
  return (items ?? []).map((item) => ({
    id: item.ComicID,
    comicName: item.ComicName?.trim() ?? "",
    lastName: item.LastName?.trim() ?? "",
    firstName: item.FirstName?.trim() ?? "",
    stageName: item.StageName?.trim() ?? "",
  }))
}

export function AddComicDialog({
  open,
  onOpenChange,
  connectionName,
  locationId,
  selectedComedians,
  onConfirm,
}: AddComicDialogProps) {
  const [draftFilters, setDraftFilters] =
    useState<ComedianSearchFilters>(EMPTY_SEARCH)
  const [comedians, setComedians] = useState<MarketingFilterComedian[]>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [error, setError] = useState<string | null>(null)
  const [searchMarketingComedians, { isLoading }] =
    useSearchMarketingComediansMutation()

  const runSearch = useCallback(
    async (filters: ComedianSearchFilters) => {
      if (!connectionName || !locationId) {
        setComedians([])
        reportErrorMessage(
          setError,
          "Location is required before searching comedians."
        )
        return
      }

      setError(null)

      try {
        const data = await searchMarketingComedians({
          ConnectionString: connectionName,
          LocationId: locationId,
          LastName: filters.lastName.trim(),
          FirstName: filters.firstName.trim(),
          StageName: filters.stageName.trim(),
          IsActiveComedian: false,
          IsMarketFilterSearch: true,
        }).unwrap()

        setComedians(mapComedianResults(data))
      } catch (requestError) {
        setComedians([])
        reportError(setError, requestError, "Failed to search comedians")
      }
    },
    [connectionName, locationId, searchMarketingComedians]
  )

  useEffect(() => {
    if (!open) {
      return
    }

    setDraftFilters(EMPTY_SEARCH)
    setComedians([])
    setError(null)
    setRowSelection(
      Object.fromEntries(
        selectedComedians.map((comedian) => [comedian.id, true] as const)
      )
    )

    void runSearch(EMPTY_SEARCH)
  }, [open, runSearch, selectedComedians])

  function updateDraftField(
    field: keyof ComedianSearchFilters,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    void runSearch(draftFilters)
  }

  function handleClearSearch() {
    setDraftFilters(EMPTY_SEARCH)
    void runSearch(EMPTY_SEARCH)
  }

  function handleCreate() {
    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
    const selected = comedians.filter((comedian) =>
      selectedIds.includes(comedian.id)
    )

    const preserved = selectedComedians.filter((comedian) =>
      selectedIds.includes(comedian.id)
    )

    const merged = [...preserved]
    for (const comedian of selected) {
      if (!merged.some((item) => item.id === comedian.id)) {
        merged.push(comedian)
      }
    }

    onConfirm(merged)
    toastSuccess("Comedians selected")
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
            <div className="flex items-center gap-1.5">
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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
            <div className="max-h-[min(24rem,50vh)] overflow-auto">
              <DataTable
                columns={selectComedianColumns}
                data={comedians}
                emptyMessage={
                  isLoading ? "Searching comedians..." : "No comedian found"
                }
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
