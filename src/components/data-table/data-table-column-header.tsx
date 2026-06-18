import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"

type DataTableColumnHeaderProps = {
  label: string
  column: {
    toggleSorting: (desc?: boolean) => void
    getIsSorted: () => false | "asc" | "desc"
  }
}

/** Sortable column header for use in any DataTable column definition. */
export function DataTableColumnHeader({
  label,
  column,
}: DataTableColumnHeaderProps) {
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
