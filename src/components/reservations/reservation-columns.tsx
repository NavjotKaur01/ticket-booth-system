import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Reservation } from "@/types/reservation"
import { cn } from "@/lib/utils"

/** Column header with sort toggle — used for guest-facing reservation fields. */
function SortableHeader({
  label,
  column,
}: {
  label: string
  column: {
    toggleSorting: (desc?: boolean) => void
    getIsSorted: () => false | "asc" | "desc"
  }
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-7 gap-1 px-2 text-[10px] font-semibold tracking-wider uppercase hover:bg-transparent"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="size-3.5 opacity-50" />
    </Button>
  )
}

/** Guest initials for the avatar fallback when no photo is available. */
function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/** Column definitions for the reservations table — extend here when adding fields. */
export const reservationColumns: ColumnDef<Reservation>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    id: "guest",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => <SortableHeader label="Guest" column={column} />,
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
              {getInitials(firstName, lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {firstName} {lastName}
            </p>
            {row.original.businessName && (
              <p className="text-xs text-muted-foreground">
                {row.original.businessName}
              </p>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader label="Email" column={column} />,
    cell: ({ row }) => (
      <a
        href={`mailto:${row.original.email}`}
        className="font-medium text-primary hover:underline cursor-pointer"
      >
        {row.original.email}
      </a>
    ),
  },
  {
    accessorKey: "source",
    header: ({ column }) => <SortableHeader label="Source" column={column} />,
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
          row.original.source === "Web" &&
            "bg-red-50 text-red-600 dark:bg-red-950/30",
          row.original.source === "Phone" &&
            "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
          row.original.source === "Walkup" &&
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
        )}
      >
        {row.original.source}
      </span>
    ),
  },
  {
    accessorKey: "section",
    header: ({ column }) => <SortableHeader label="Section" column={column} />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.section}</span>
    ),
  },
  {
    accessorKey: "qty",
    header: ({ column }) => <SortableHeader label="Qty" column={column} />,
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{row.original.qty}</span>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => <SortableHeader label="Total" column={column} />,
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">{row.original.total}</span>
    ),
  },
  {
    accessorKey: "paid",
    header: ({ column }) => <SortableHeader label="Paid" column={column} />,
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-emerald-600">
        {row.original.paid}
      </span>
    ),
  },
  {
    accessorKey: "createdDt",
    header: ({ column }) => <SortableHeader label="Created" column={column} />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.createdDt}</span>
    ),
  },
  {
    accessorKey: "seated",
    header: "Seated",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.seated}
      </span>
    ),
  },
]
