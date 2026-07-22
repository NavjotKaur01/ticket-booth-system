import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DataTableColumnHeaderProps = {
  label: string
  tabIndex?: number
  /** When true, keep label casing (desktop Reservation History PascalCase). */
  preserveCase?: boolean
  column: {
    toggleSorting: (desc?: boolean) => void
    getIsSorted: () => false | "asc" | "desc"
  }
}

/** Sortable column header for use in any DataTable column definition. */
export function DataTableColumnHeader({
  label,
  tabIndex,
  preserveCase = false,
  column,
}: DataTableColumnHeaderProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      tabIndex={tabIndex}
      className={cn(
        "-ml-3 h-7 gap-1 px-2 text-[10px] font-semibold tracking-wider hover:bg-transparent",
        !preserveCase && "uppercase"
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="size-3.5 opacity-50" />
    </Button>
  )
}
