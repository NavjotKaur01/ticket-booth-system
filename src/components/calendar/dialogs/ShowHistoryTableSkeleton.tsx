import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ShowHistoryTableSkeletonProps = {
  columnCount?: number
  rowCount?: number
  minWidthClassName?: string
  "aria-label"?: string
}

export default function ShowHistoryTableSkeleton({
  columnCount = 12,
  rowCount = 18,
  minWidthClassName = "min-w-[72rem]",
  "aria-label": ariaLabel = "Loading history",
}: ShowHistoryTableSkeletonProps) {
  const columns = Array.from({ length: columnCount }, (_, index) => index)
  const rows = Array.from({ length: rowCount }, (_, index) => index)

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-5" aria-label={ariaLabel}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border">
        <div className="min-h-0 flex-1 overflow-auto">
          <Table className={`${minWidthClassName} border-collapse`}>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={`head-${column}`} className="border px-3 py-2">
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`row-${row}`} className="odd:bg-background even:bg-muted/20">
                  {columns.map((column) => (
                    <TableCell
                      key={`cell-${row}-${column}`}
                      className="border px-3 py-2"
                    >
                      <Skeleton className="h-4 w-full max-w-[7rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
