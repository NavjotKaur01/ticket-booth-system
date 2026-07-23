import { Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  createFilterSearchHandlers,
  IconActionButton,
} from "@/components/forms/form-fields"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mapShowHistory } from "@/lib/map-show-history"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetShowHistoryQuery } from "@/store/api/clubmanApi"
import type { CalendarEvent } from "@/types/calendar-event"

import ShowHistoryTableSkeleton from "./ShowHistoryTableSkeleton"
import type { ShowHistoryRow } from "../service/showHistory.service"

type ShowHistoryDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
  connectionString: string
  locationId: string
}

const COLUMNS: { key: keyof ShowHistoryRow; label: string }[] = [
  { key: "historyAction", label: "History Action" },
  { key: "showDate", label: "Show Date" },
  { key: "showTime", label: "Show Time" },
  { key: "historyDate", label: "History Date" },
  { key: "headliner", label: "Headliner" },
  { key: "headliner2", label: "Headliner2" },
  { key: "feature", label: "Feature" },
  { key: "feature2", label: "Feature2" },
  { key: "opener", label: "Opener" },
  { key: "promoCode", label: "Promo Code" },
  { key: "showDinner", label: "ShowDinner" },
  { key: "noPasses", label: "NoPasses" },
  { key: "vip", label: "VIP" },
  { key: "updatedOn", label: "Updated On" },
]

function filterShowHistoryRows(
  rows: ShowHistoryRow[],
  query: string
): ShowHistoryRow[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter((row) =>
    COLUMNS.some((column) =>
      String(row[column.key] ?? "")
        .toLowerCase()
        .includes(normalized)
    )
  )
}

function ShowHistoryTable({ records }: { records: ShowHistoryRow[] }) {
  const isEmpty = records.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border">
      <div
        className={
          isEmpty
            ? "flex min-h-0 flex-1 flex-col overflow-auto"
            : "min-h-0 flex-1 overflow-auto"
        }
      >
        <Table className={`min-w-[80rem] border-collapse${isEmpty ? " shrink-0" : ""}`}>
          <TableHeader className="sticky top-0 z-10 bg-muted text-muted-foreground">
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  className="border px-3 py-2 font-semibold whitespace-nowrap"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {!isEmpty && (
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="odd:bg-background even:bg-muted/20">
                  {COLUMNS.map((column) => (
                    <TableCell key={column.key} className="border px-3 py-2 whitespace-nowrap">
                      {record[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
        {isEmpty && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No record found
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShowHistoryDialog({
  open,
  event,
  onOpenChange,
  onAfterClose,
  connectionString,
  locationId,
}: ShowHistoryDialogProps) {
  const [draftSearch, setDraftSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const showId = event?.showId || event?.id || ""
  const shouldSkip =
    !open || !event || !connectionString || !locationId || !showId

  const { data, isLoading, isFetching, error } = useGetShowHistoryQuery(
    {
      connectionName: connectionString,
      locationId,
      showId,
    },
    { skip: shouldSkip }
  )

  const records = useMemo(() => mapShowHistory(data), [data])
  const filteredRecords = useMemo(
    () => filterShowHistoryRows(records, appliedSearch),
    [records, appliedSearch]
  )

  const { handleSubmit, handleInputKeyDown } = createFilterSearchHandlers(() => {
    setAppliedSearch(draftSearch)
  })

  useEffect(() => {
    if (!open) {
      setDraftSearch("")
      setAppliedSearch("")
    }
  }, [open])

  function handleClear() {
    setDraftSearch("")
    setAppliedSearch("")
  }

  const errorMessage = error ? getClubmanErrorMessage(error) : null
  const showLoading = !shouldSkip && (isLoading || isFetching)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex w-full h-[min(90vh,48rem)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden sm:max-w-6xl"
        onAfterClose={onAfterClose}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Show History</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {showLoading ? (
            <ShowHistoryTableSkeleton
              columnCount={COLUMNS.length}
              minWidthClassName="min-w-[80rem]"
              aria-label="Loading show history"
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-5">
              {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <form
                className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:max-w-md"
                onSubmit={handleSubmit}
              >
                <Input
                  placeholder="Search show history..."
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="min-w-0 flex-1"
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
                    onClick={handleClear}
                  />
                </div>
              </form>
              <ShowHistoryTable records={filteredRecords} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
