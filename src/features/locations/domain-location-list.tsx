import { ClipboardCopy, Minus, Plus } from "lucide-react"
import { Fragment, useCallback, useMemo, useState } from "react"

import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { Button } from "@/components/ui/button"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { copyTextToClipboard } from "@/lib/export-table-data"
import { cn } from "@/lib/utils"
import type { DomainLocation, DomainLocationGroup } from "@/types/domain-location"
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

const PARENT_HEAD_CLASS =
  "h-9 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
const CHILD_HEAD_CLASS =
  "h-8 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"

function LocationCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
      {count}
    </span>
  )
}

function LocationIdCell({ locationId }: { locationId: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        className="max-w-36 truncate font-mono text-xs text-muted-foreground sm:max-w-xs md:max-w-sm"
        title={locationId}
      >
        {locationId}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        aria-label="Copy location ID"
        onClick={() => void copyTextToClipboard(locationId)}
      >
        <ClipboardCopy className="size-3.5" />
      </Button>
    </div>
  )
}

function LocationsPanel({ locations }: { locations: DomainLocation[] }) {
  if (locations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background px-4 py-6">
        <p className="text-sm text-muted-foreground">No locations for this domain.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] caption-bottom text-sm">
          <colgroup>
            <col className="min-w-40" />
            <col className="w-32" />
            <col className="min-w-48" />
            <col className="w-32" />
            <col className="w-18" />
          </colgroup>
          <thead className="border-b">
            <tr className="hover:bg-transparent">
              <th className={cn(CHILD_HEAD_CLASS, "text-left")}>Location Name</th>
              <th className={cn(CHILD_HEAD_CLASS, "text-left")}>Short Name</th>
              <th className={cn(CHILD_HEAD_CLASS, "text-left")}>Location ID</th>
              <th className={cn(CHILD_HEAD_CLASS, "text-left")}>City</th>
              <th className={cn(CHILD_HEAD_CLASS, "text-left")}>State</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr
                key={location.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-3 py-2.5 text-sm font-medium text-foreground">
                  {location.locationName}
                </td>
                <td className="px-3 py-2.5 text-sm text-foreground">
                  {location.locationShortName}
                </td>
                <td className="px-3 py-2.5">
                  <LocationIdCell locationId={location.locationId} />
                </td>
                <td className="px-3 py-2.5 text-sm text-foreground">{location.city}</td>
                <td className="px-3 py-2.5 text-sm tabular-nums text-foreground">
                  {location.state}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DomainLocationList({ groups }: DomainLocationListProps) {
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set())

  const totalLocations = useMemo(
    () => groups.reduce((count, group) => count + group.locations.length, 0),
    [groups]
  )

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroupIds((current) => {
      const next = new Set(current)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

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
              onClick={() => toggleGroup(row.original.id)}
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
        cell: ({ row }) => {
          const isExpanded = expandedGroupIds.has(row.original.id)

          return (
            <button
              type="button"
              onClick={() => toggleGroup(row.original.id)}
              className={cn(
                "max-w-full truncate text-left text-sm font-medium transition-colors hover:text-primary",
                isExpanded ? "text-primary" : "text-foreground"
              )}
            >
              {row.original.domainName}
            </button>
          )
        },
      },
      {
        id: "locationCount",
        header: "Locations",
        enableSorting: false,
        cell: ({ row }) => (
          <LocationCountBadge count={row.original.locations.length} />
        ),
      },
    ],
    [expandedGroupIds, toggleGroup]
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
        <table className="w-full min-w-[480px] caption-bottom text-sm">
          <colgroup>
            <col className="w-14" />
            <col />
            <col className="w-28" />
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(PARENT_HEAD_CLASS, "text-left")}
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
                    <TableRow
                      className={cn(
                        "border-b hover:bg-muted/40",
                        isExpanded && "bg-muted/30"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-2.5 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {isExpanded ? (
                      <TableRow className="border-b bg-muted/10 hover:bg-muted/10">
                        <TableCell colSpan={columns.length} className="p-0">
                          <div className="border-l-4 border-primary/20 px-3 py-4 sm:px-6">
                            <LocationsPanel locations={row.original.locations} />
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
        </table>
      </div>

      {groups.length > 0 ? (
        <DataTablePagination table={table} entityLabel="domains" />
      ) : null}

      <div className="border-t px-3 py-2 text-xs text-muted-foreground sm:text-right">
        Total locations:{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {totalLocations}
        </span>
      </div>
    </div>
  )
}
