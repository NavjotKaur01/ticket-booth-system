import { ChevronRight, Minus, Plus } from "lucide-react"
import { Fragment, useMemo, useState } from "react"

import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { DomainLocationGroup } from "@/types/domain-location"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

type DomainLocationListProps = {
  groups: DomainLocationGroup[]
}

export function DomainLocationList({ groups }: DomainLocationListProps) {
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set())

  const totalLocations = useMemo(
    () => groups.reduce((count, group) => count + group.locations.length, 0),
    [groups]
  )

  const columns = useMemo<ColumnDef<DomainLocationGroup>[]>(
    () => [
      {
        id: "expand",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const isExpanded = expandedGroupIds.has(row.original.id)

          return (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-6"
              onClick={() => {
                setExpandedGroupIds((current) => {
                  const next = new Set(current)
                  if (next.has(row.original.id)) {
                    next.delete(row.original.id)
                  } else {
                    next.add(row.original.id)
                  }
                  return next
                })
              }}
              aria-label={isExpanded ? "Collapse locations" : "Expand locations"}
            >
              {isExpanded ? (
                <Minus className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
            </Button>
          )
        },
      },
      {
        accessorKey: "domainName",
        header: "Domain Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.domainName}</span>
        ),
      },
    ],
    [expandedGroupIds]
  )

  const table = useReactTable({
    data: groups,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <div className="overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-9 whitespace-nowrap px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase",
                      header.column.id === "expand" && "w-12"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isExpanded = expandedGroupIds.has(row.original.id)

                return (
                  <Fragment key={row.id}>
                    <TableRow className="group border-b hover:bg-muted/40">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="whitespace-nowrap px-3 py-2 text-sm"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {isExpanded ? (
                      <TableRow
                        key={`${row.id}-details`}
                        className="border-b bg-muted/20 hover:bg-muted/20"
                      >
                        <TableCell colSpan={columns.length} className="px-3 py-2">
                          <div className="ml-8 border-l border-sidebar-border pl-4">
                            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <ChevronRight className="size-3.5" />
                              Locations
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="h-8 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                    Location Name
                                  </TableHead>
                                  <TableHead className="h-8 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                    Short Name
                                  </TableHead>
                                  <TableHead className="h-8 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                    Location ID
                                  </TableHead>
                                  <TableHead className="h-8 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                    City
                                  </TableHead>
                                  <TableHead className="h-8 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                    State
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {row.original.locations.map((location) => (
                                  <TableRow
                                    key={location.id}
                                    className="border-b last:border-0 hover:bg-muted/40"
                                  >
                                    <TableCell className="px-3 py-2 text-sm font-medium text-foreground">
                                      {location.locationName}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm">
                                      {location.locationShortName}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 font-mono text-xs text-muted-foreground">
                                      {location.locationId}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm">
                                      {location.city}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm">
                                      {location.state}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No record found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {groups.length > 0 ? (
        <DataTablePagination table={table} entityLabel="domains" />
      ) : null}

      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Total locations:{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {totalLocations}
        </span>
      </div>
    </div>
  )
}
