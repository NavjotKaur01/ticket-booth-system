import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { calendarDialogMaxWidth } from "./calendar-dialog-width"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CalendarEvent } from "@/types/calendar-event"

import {
  getShowDetailHistoryDialogData,
  type ShowDetailHistoryDialogData,
  type ShowDetailHistoryRow,
} from "../service/showDetailHistory.service"

type ShowDetailHistoryDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
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

function ShowDetailHistorySkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-5" aria-label="Loading show detail history">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border">
        <Skeleton className="h-10 w-full shrink-0" />
        <Skeleton className="min-h-0 flex-1 w-full" />
      </div>
    </div>
  )
}

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
}: ShowDetailHistoryDialogProps) {
  const [dialogData, setDialogData] = useState<ShowDetailHistoryDialogData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setDialogData(null)
      return
    }

    if (!event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getShowDetailHistoryDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [event, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(calendarDialogMaxWidth("6xl"), "flex h-[min(90vh,48rem)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden")}>
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Show Details History</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {isLoading || !dialogData ? (
            <ShowDetailHistorySkeleton />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
              <ShowDetailHistoryTable records={dialogData.records} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
