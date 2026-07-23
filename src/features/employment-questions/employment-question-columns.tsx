import type { ColumnDef } from "@tanstack/react-table"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { EmploymentQuestionRecord } from "@/types/employment-question"

function ActivePill({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          : "inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {active ? "Yes" : "No"}
    </span>
  )
}

type GetEmploymentQuestionColumnsParams = {
  onEdit: (row: EmploymentQuestionRecord) => void
  onDelete: (row: EmploymentQuestionRecord) => void
}

export function getEmploymentQuestionColumns({
  onEdit,
  onDelete,
}: GetEmploymentQuestionColumnsParams): ColumnDef<EmploymentQuestionRecord>[] {
  return [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "question",
      header: ({ column }) => (
        <DataTableColumnHeader label="Question" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.question}</span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader label="Active" column={column} />
      ),
      cell: ({ row }) => <ActivePill active={row.original.active} />,
    },
    dataTableActionsColumn<EmploymentQuestionRecord>({
      header: "Action",
      ariaLabel: "Employment question actions",
      hiddenActions: ["Add"],
      onAction: (row, action) => {
        if (action === "Edit") {
          onEdit(row)
        }
        if (action === "Delete") {
          onDelete(row)
        }
      },
    }),
  ]
}
