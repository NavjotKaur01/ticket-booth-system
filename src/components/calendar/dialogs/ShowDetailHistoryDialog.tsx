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
import { mapShowDetailHistory } from "@/lib/map-show-history"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetShowHistoryDetailQuery } from "@/store/api/clubmanApi"
import type { CalendarEvent } from "@/types/calendar-event"

import ShowHistoryTableSkeleton from "./ShowHistoryTableSkeleton"
import type { ShowDetailHistoryRow } from "../service/showDetailHistory.service"

type ShowDetailHistoryDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
  connectionString: string
}

const COLUMNS: { key: keyof ShowDetailHistoryRow; label: string }[] = [
  { key: "historyAction", label: "History Action" },
  { key: "historyDate", label: "History Date" },
  { key: "showSection", label: "Show Section" },
  { key: "showPrice", label: "Show Price" },
  { key: "seats", label: "Seats" },
  { key: "showPromo", label: "Show Promo" },
  { key: "active", label: "Active" },
  { key: "showAppearing", label: "Show Appearing" },
  { key: "assignSeats", label: "Assign Seats" },
  { key: "web", label: "Web" },
  { key: "lastUpdateId", label: "Last UpdateId" },
  { key: "updatedOn", label: "Updated On" },
]

function ShowDetailHistoryTable({ records }: { records: ShowDetailHistoryRow[] }) {
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
        <Table className={`min-w-[72rem] border-collapse${isEmpty ? " shrink-0" : ""}`}>
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

export default function ShowDetailHistoryDialog({
  open,
  event,
  onOpenChange,
  onAfterClose,
  connectionString,
}: ShowDetailHistoryDialogProps) {
  const showId = event?.showId || event?.id || ""
  const shouldSkip = !open || !event || !connectionString || !showId

  const { data, isLoading, isFetching, error } = useGetShowHistoryDetailQuery(
    {
      connectionName: connectionString,
      showId,
    },
    { skip: shouldSkip }
  )

  const records = useMemo(() => mapShowDetailHistory(data), [data])

  const errorMessage = error ? getClubmanErrorMessage(error) : null
  const showLoading = !shouldSkip && (isLoading || isFetching)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex w-full h-[min(90vh,48rem)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden sm:max-w-6xl"
        onAfterClose={onAfterClose}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Show Details History</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {showLoading ? (
            <ShowHistoryTableSkeleton
              columnCount={COLUMNS.length}
              minWidthClassName="min-w-[72rem]"
              aria-label="Loading show detail history"
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-5">
              {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <ShowDetailHistoryTable records={records} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
