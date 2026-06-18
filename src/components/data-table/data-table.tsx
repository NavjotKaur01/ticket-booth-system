import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { useState } from "react"

import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    sticky?: "left" | "right"
  }
}

function stickyColumnClass(sticky: "left" | "right" | undefined, isHeader: boolean) {
  if (sticky === "right") {
    return cn(
      "sticky right-0 isolate border-l border-border bg-card shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.14)]",
      isHeader ? "z-30" : "z-20 group-hover:bg-muted group-data-[state=selected]:bg-muted"
    )
  }
  if (sticky === "left") {
    return cn(
      "sticky left-0 isolate border-r border-border bg-card shadow-[8px_0_12px_-10px_rgba(15,23,42,0.14)]",
      isHeader ? "z-30" : "z-20 group-hover:bg-muted group-data-[state=selected]:bg-muted"
    )
  }
  return undefined
}

/**
 * Reusable data table built on TanStack Table.
 * Supports sorting, pagination, optional row selection, and sticky columns via column meta.
 */
type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  emptyMessage?: string
  className?: string
  pageSize?: number
  enablePagination?: boolean
  enableRowSelection?: boolean
  /** Noun shown in pagination, e.g. "records" or "reservations". */
  entityLabel?: string
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results.",
  className,
  pageSize = 10,
  enablePagination = true,
  enableRowSelection = false,
  entityLabel = "records",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const total = table.getFilteredRowModel().rows.length

  return (
    <div className={cn("overflow-hidden bg-card", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-9 whitespace-nowrap px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase",
                      stickyColumnClass(header.column.columnDef.meta?.sticky, true)
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group border-b last:border-0 hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "whitespace-nowrap px-3 py-2 text-sm",
                        stickyColumnClass(cell.column.columnDef.meta?.sticky, false)
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && total > 0 && (
        <DataTablePagination table={table} entityLabel={entityLabel} />
      )}
    </div>
  )
}
