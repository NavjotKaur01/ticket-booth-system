import { Minus, Plus } from "lucide-react"
import { Fragment, useMemo, useState } from "react"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { StandardRowActionsMenu } from "@/components/common/standard-row-actions-menu"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { Button } from "@/components/ui/button"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type {
  NavigationDropDownItem,
  NavigationDropdownParent,
} from "@/types/navigation-admin"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

type NavigationDropdownListProps = {
  parents: NavigationDropdownParent[]
  onAddDropDown: (parentId: string) => void
  onEditDropDown: (parentId: string, item: NavigationDropDownItem) => void
  onDeleteDropDown: (parentId: string, itemId: string) => void
}

type DropDownPanelProps = {
  parent: NavigationDropdownParent
  onAddDropDown: (parentId: string) => void
  onEditDropDown: (parentId: string, item: NavigationDropDownItem) => void
  onDeleteDropDown: (parentId: string, itemId: string) => void
}

const PARENT_HEAD_CLASS =
  "h-9 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
const CHILD_HEAD_CLASS =
  "h-8 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"

function ActiveBadge({ value }: { value: "Y" | "N" }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-6 items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium tabular-nums",
        value === "Y"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
          : "bg-muted text-muted-foreground"
      )}
    >
      {value}
    </span>
  )
}

function DropDownPanel({
  parent,
  onAddDropDown,
  onEditDropDown,
  onDeleteDropDown,
}: DropDownPanelProps) {
  return (
    <div className="w-full rounded-lg border border-border bg-background">
      <div className="flex flex-col gap-3 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="min-w-0 text-sm font-semibold text-foreground">
          Drop Downs
          <span className="ml-1.5 font-normal text-muted-foreground">
            ({parent.dropDowns.length})
          </span>
        </p>
        <Button
          type="button"
          size="sm"
          className="w-full gap-1.5 sm:w-auto"
          onClick={() => onAddDropDown(parent.id)}
        >
          <Plus className="size-3.5" />
          New
        </Button>
      </div>

      {parent.dropDowns.length === 0 ? (
        <div className="px-4 py-6">
          <p className="text-sm text-muted-foreground">
            No drop downs yet. Click{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => onAddDropDown(parent.id)}
            >
              New
            </button>{" "}
            to add one for {parent.displayText}.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <colgroup>
              <col className="w-[56px]" />
              <col />
              <col className="w-[140px]" />
              <col className="w-[80px]" />
            </colgroup>
            <thead className="border-b">
              <tr className="hover:bg-transparent">
                <th className={CHILD_HEAD_CLASS}>#</th>
                <th className={cn(CHILD_HEAD_CLASS, "text-left")}>Drop Down Name</th>
                <th className={cn(CHILD_HEAD_CLASS, "text-left")}>Active Indicator</th>
                <th className={cn(CHILD_HEAD_CLASS, "text-left")}>Action</th>
              </tr>
            </thead>
            <tbody>
              {parent.dropDowns.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2.5 text-sm tabular-nums text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="px-3 py-2.5">
                    <ActiveBadge value={item.active} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StandardRowActionsMenu
                      ariaLabel={`Drop down actions for ${item.name}`}
                      hiddenActions={["Add"] satisfies readonly StandardRowAction[]}
                      onAction={(action) => {
                        if (action === "Edit") {
                          onEditDropDown(parent.id, item)
                        }
                        if (action === "Delete") {
                          onDeleteDropDown(parent.id, item.id)
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function NavigationDropdownList({
  parents,
  onAddDropDown,
  onEditDropDown,
  onDeleteDropDown,
}: NavigationDropdownListProps) {
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<NavigationDropdownParent>[]>(
    () => [
      {
        id: "expand",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const isExpanded = expandedParentId === row.original.id

          return (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-6"
              onClick={() => {
                setExpandedParentId((current) =>
                  current === row.original.id ? null : row.original.id
                )
              }}
              aria-label={isExpanded ? "Collapse drop downs" : "Expand drop downs"}
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
        accessorKey: "displayText",
        header: "Display Text",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.displayText}</span>
        ),
      },
      {
        accessorKey: "active",
        header: "Active Indicator",
        cell: ({ row }) => <ActiveBadge value={row.original.active} />,
      },
      {
        accessorKey: "navigationUrl",
        header: "Navigation URL",
        cell: ({ row }) => (
          <span
            className="block max-w-48 truncate text-sm text-muted-foreground sm:max-w-xs md:max-w-md lg:max-w-lg"
            title={row.original.navigationUrl || undefined}
          >
            {row.original.navigationUrl || "—"}
          </span>
        ),
      },
    ],
    [expandedParentId]
  )

  const table = useReactTable({
    data: parents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] caption-bottom text-sm sm:min-w-[720px]">
          <colgroup>
            <col className="w-14" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col />
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn(PARENT_HEAD_CLASS, "text-left")}>
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
                const isExpanded = expandedParentId === row.original.id

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
                          <div className="border-l-4 border-primary/20 px-4 py-4 sm:px-6">
                            <DropDownPanel
                              parent={row.original}
                              onAddDropDown={onAddDropDown}
                              onEditDropDown={onEditDropDown}
                              onDeleteDropDown={onDeleteDropDown}
                            />
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

      {parents.length > 0 ? (
        <DataTablePagination table={table} entityLabel="records" />
      ) : null}
    </div>
  )
}
