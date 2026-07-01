import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { cn } from "@/lib/utils"

import { calendarDialogMaxWidth } from "./calendar-dialog-width"
import type { ApiDefaultShowSection } from "@/types/api/save-show"

type SaveVerifyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: ApiDefaultShowSection[]
  onRowsChange: (rows: ApiDefaultShowSection[]) => void
  onConfirm: () => void
  isSaving?: boolean
}

function formatVerifyTime(value: string | null) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatVerifyTimeRange(row: ApiDefaultShowSection) {
  const arrival = formatVerifyTime(row.ShowArrival)
  const showTime = formatVerifyTime(row.ShowTim)

  if (arrival && showTime) {
    return `${arrival} - ${showTime}`
  }

  return arrival || showTime
}

export default function SaveVerifyDialog({
  open,
  onOpenChange,
  rows,
  onRowsChange,
  onConfirm,
  isSaving = false,
}: SaveVerifyDialogProps) {
  const sortedRows = useMemo(
    () =>
      [...rows].sort((left, right) => {
        if (left.ShowDay !== right.ShowDay) {
          return (left.ShowDay ?? "").localeCompare(right.ShowDay ?? "")
        }

        const leftTime = new Date(left.ShowTim ?? 0).getTime()
        const rightTime = new Date(right.ShowTim ?? 0).getTime()
        return leftTime - rightTime
      }),
    [rows]
  )

  function updatePrice(showDetId: string, nextValue: string) {
    const parsed = Number.parseFloat(nextValue)
    const showPrice = Number.isFinite(parsed) ? parsed : 0

    onRowsChange(
      rows.map((row) =>
        row.ShowDetID === showDetId ? { ...row, ShowPrice: showPrice } : row
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className={cn(calendarDialogMaxWidth("3xl"), "max-h-[calc(100vh-2rem)] overflow-hidden")}>
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg">Verify Prices</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-4">
          <div className="overflow-auto border">
            <Table className="min-w-[36rem] border-collapse">
              <TableHeader className="sticky top-0 z-10 bg-muted text-muted-foreground">
                <TableRow>
                  <TableHead className="border px-3 py-2 font-semibold">Time</TableHead>
                  <TableHead className="border px-3 py-2 font-semibold">Section</TableHead>
                  <TableHead className="border px-3 py-2 font-semibold">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row) => (
                  <TableRow key={row.ShowDetID} className="odd:bg-background even:bg-muted/20">
                    <TableCell className="border px-3 py-2 align-top">
                      <div className="text-xs leading-5">
                        <p className="font-medium text-foreground">{row.ShowDay}</p>
                        <p>{formatVerifyTimeRange(row)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="border px-3 py-2 align-middle">
                      {row.Section ?? "Section"}
                    </TableCell>
                    <TableCell className="border px-3 py-2 align-middle">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.ShowPrice ?? 0}
                        onChange={(event) =>
                          updatePrice(row.ShowDetID, event.target.value)
                        }
                        className="h-9 w-28"
                        aria-label={`Price for ${row.Section ?? "section"}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-4 sm:justify-start">
          <Button type="button" onClick={onConfirm} disabled={isSaving || rows.length === 0}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <span className="px-2 text-sm text-muted-foreground">OR</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
