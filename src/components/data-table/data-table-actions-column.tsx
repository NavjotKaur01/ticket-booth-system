import type { ColumnDef } from "@tanstack/react-table"

import { StandardRowActionsMenu } from "@/components/common/standard-row-actions-menu"

type DataTableActionsColumnOptions<TData> = {
  header?: string
  ariaLabel?: string
  getRowSpan?: (row: { id: string; original: TData }) => number
  isVisible?: (row: { id: string; original: TData }) => boolean
}

/** Sticky Action column with Add / Edit / Delete menu items. */
export function dataTableActionsColumn<TData>(
  options: DataTableActionsColumnOptions<TData> = {}
): ColumnDef<TData> {
  const {
    header = "Action",
    ariaLabel,
    getRowSpan,
    isVisible,
  } = options

  return {
    id: "actions",
    header,
    enableSorting: false,
    meta: {
      sticky: "right",
      ...(getRowSpan ? { getRowSpan } : {}),
    },
    cell: ({ row }) => {
      if (isVisible && !isVisible(row)) {
        return null
      }

      return <StandardRowActionsMenu ariaLabel={ariaLabel} />
    },
  }
}
