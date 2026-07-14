import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createCustomerColumns } from "@/features/customers/customer-columns"
import type { Customer } from "@/types/customer"

type CustomerDataTableProps = {
  data: Customer[]
  loading?: boolean
  emptyMessage?: string
  onDetails?: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

export function CustomerDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onDetails,
  onEdit,
  onDelete,
}: CustomerDataTableProps) {
  const columns = useMemo(
    () => createCustomerColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Searching customers..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
      getRowClassName={(row) =>
        // ClubMan Search.xaml: banned rows use Brushes.Red.
        // TableRow uses has-aria-expanded:bg-muted/50 when the Action menu opens —
        // override that so the full row stays red and text stays readable.
        row.banned
          ? [
              "!bg-red-600 !text-white",
              "hover:!bg-red-700",
              "has-aria-expanded:!bg-red-600",
              "data-[state=selected]:!bg-red-700",
              "[&_td]:!bg-red-600 hover:[&_td]:!bg-red-700 has-aria-expanded:[&_td]:!bg-red-600",
              "[&_td.sticky]:!bg-red-600 has-aria-expanded:[&_td.sticky]:!bg-red-600",
              "[&_td.sticky]:!border-red-700/40",
              "[&_td]:!text-white [&_a]:!text-white",
              "[&_a]:underline-offset-2 hover:[&_a]:underline",
              "[&_button]:!bg-transparent [&_button]:!text-white hover:[&_button]:!bg-white/20 hover:[&_button]:!text-white",
            ].join(" ")
          : undefined
      }
      onRowDoubleClick={(row) => onDetails?.(row.original)}
    />
  )
}
