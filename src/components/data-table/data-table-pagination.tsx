import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPaginationRange } from "@/lib/pagination-range"
import { cn } from "@/lib/utils"

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
  /** Noun shown in the record count, e.g. "records" or "reservations". */
  entityLabel?: string
}

/** Page controls rendered below the table when pagination is enabled. */
export function DataTablePagination<TData>({
  table,
  className,
  entityLabel = "records",
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)
  const pageCount = table.getPageCount()
  const visiblePages = getPaginationRange(pageIndex, pageCount)

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        {total === 0 ? (
          "No records"
        ) : (
          <>
            <span className="font-medium text-foreground">
              {from}–{to}
            </span>{" "}
            of {total} {entityLabel}
          </>
        )}
      </p>

      {pageCount > 1 ? (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          {visiblePages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex size-8 items-center justify-center text-xs text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                variant={pageIndex + 1 === page ? "default" : "outline"}
                size="icon-sm"
                className="size-8"
                onClick={() => table.setPageIndex(page - 1)}
                aria-current={pageIndex + 1 === page ? "page" : undefined}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
