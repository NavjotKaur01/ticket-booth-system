import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type Row,
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
    /** Return 0 to skip the cell, or a number for rowSpan. */
    getRowSpan?: (row: { id: string; original: TData }) => number
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

// Shared TanStack table with sorting, pagination, row selection, and sticky columns.
type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  emptyMessage?: string
  className?: string
  pageSize?: number
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  getRowId?: (originalRow: TData, index: number) => string
  onRowClick?: (row: Row<TData>) => void
  onRowDoubleClick?: (row: Row<TData>) => void
  /** Noun shown in pagination, e.g. "records" or "reservations". */
  entityLabel?: string
  getRowClassName?: (row: TData) => string | undefined
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results.",
  className,
  pageSize = 10,
  enablePagination = true,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  getRowId,
  onRowClick,
  onRowDoubleClick,
  entityLabel = "records",
  getRowClassName,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({})
  const rowSelection = rowSelectionProp ?? internalRowSelection

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection,
    enableMultiRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    getRowId,
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
                  className={cn(
                    "group border-b last:border-0 hover:bg-muted/40",
                    (onRowClick || onRowDoubleClick) && "cursor-pointer",
                    getRowClassName?.(row.original)
                  )}
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const rowSpan = cell.column.columnDef.meta?.getRowSpan?.(row)
                    if (rowSpan === 0) return null

                    return (
                      <TableCell
                        key={cell.id}
                        rowSpan={rowSpan && rowSpan > 1 ? rowSpan : undefined}
                        className={cn(
                          "whitespace-nowrap px-3 py-2 text-sm",
                          rowSpan && rowSpan > 1 && "align-middle",
                          stickyColumnClass(
                            cell.column.columnDef.meta?.sticky,
                            false
                          )
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
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
