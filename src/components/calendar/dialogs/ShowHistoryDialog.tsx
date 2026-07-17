import { useMemo } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  connectionString,
  locationId,
}: ShowHistoryDialogProps) {
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

  const records = useMemo(
    () => (shouldSkip ? [] : mapShowHistory(data)),
    [data, shouldSkip]
  )

  const errorMessage = error ? getClubmanErrorMessage(error) : null
  const showLoading = !shouldSkip && (isLoading || isFetching)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-full h-[min(90vh,48rem)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden sm:max-w-6xl">
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
              <ShowHistoryTable records={records} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
