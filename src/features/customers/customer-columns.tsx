import type { ColumnDef } from "@tanstack/react-table"
import { CircleHelp } from "lucide-react"

import { CustomerRowActionsMenu } from "@/features/customers/customer-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { Customer } from "@/types/customer"

type CustomerColumnsOptions = {
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

export function createCustomerColumns({
  onEdit,
  onDelete,
}: CustomerColumnsOptions = {}): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.lastName}</span>
      ),
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader label="Email" column={column} />
      ),
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "password",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <DataTableColumnHeader label="Password" column={column} />
          <CircleHelp className="size-3.5 text-muted-foreground" aria-hidden />
        </div>
      ),
      cell: ({ row }) => row.original.password || "********",
    },    {
      accessorKey: "address",
      header: ({ column }) => (
        <DataTableColumnHeader label="Address" column={column} />
      ),
    },
    {
      accessorKey: "phoneNo",
      header: ({ column }) => (
        <DataTableColumnHeader label="Phone No." column={column} />
      ),
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader label="City" column={column} />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader label="Status" column={column} />
      ),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <CustomerRowActionsMenu
          customer={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ]
}

/** @deprecated Use createCustomerColumns for row action handlers. */
export const customerColumns = createCustomerColumns()
