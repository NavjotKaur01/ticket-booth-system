import type { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { EmploymentApplicantRecord } from "@/types/employment-applicant"

function ApplicantStatusPill({ reviewed }: { reviewed: boolean }) {
  return reviewed ? (
    <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
      Reviewed
    </span>
  ) : (
    <span className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
      Pending
    </span>
  )
}

function formatShortDate(value: string | null) {
  if (!value) {
    return "—"
  }

  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase()
}

type GetEmploymentApplicantColumnsParams = {
  onEdit: (row: EmploymentApplicantRecord) => void
  onPreviewPdf: (row: EmploymentApplicantRecord) => void
}

export function getEmploymentApplicantColumns({
  onEdit,
  onPreviewPdf,
}: GetEmploymentApplicantColumnsParams): ColumnDef<EmploymentApplicantRecord>[] {
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
      id: "applicant",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <DataTableColumnHeader label="Applicant" column={column} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(row.original.firstName, row.original.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "opportunity",
      accessorFn: (row) => row.opportunityTitle,
      header: ({ column }) => (
        <DataTableColumnHeader label="Opportunity" column={column} />
      ),
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">
            {row.original.opportunityTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {row.original.positionGroupLabel}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "submittedOn",
      header: ({ column }) => (
        <DataTableColumnHeader label="Submitted" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {formatShortDate(row.original.submittedOn)}
        </span>
      ),
    },
    {
      accessorKey: "reviewed",
      header: ({ column }) => (
        <DataTableColumnHeader label="Reviewed" column={column} />
      ),
      cell: ({ row }) => (
        <ApplicantStatusPill reviewed={row.original.reviewed} />
      ),
    },
    {
      accessorKey: "reviewedBy",
      header: ({ column }) => (
        <DataTableColumnHeader label="Reviewed By" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.reviewedBy || "—"}
        </span>
      ),
    },
    {
      accessorKey: "hireDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Hire Date" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {formatShortDate(row.original.hireDate)}
        </span>
      ),
    },
    {
      accessorKey: "dismissalDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Dismissal Date" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {formatShortDate(row.original.dismissalDate)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Actions for ${row.original.firstName} ${row.original.lastName}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[8rem]">
              <DropdownMenuItem onSelect={() => onEdit(row.original)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onPreviewPdf(row.original)}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}

export { ApplicantStatusPill, formatShortDate }
