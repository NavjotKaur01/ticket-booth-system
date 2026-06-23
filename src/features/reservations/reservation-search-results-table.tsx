import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import type {
  ReservationBusinessSearchResult,
  ReservationCustomerSearchResult,
} from "@/data/reservation-search-results"
import {
  reservationBusinessSearchColumns,
  reservationCustomerSearchColumns,
} from "@/features/reservations/reservation-search-columns"
import { cn } from "@/lib/utils"

/** Compact table styling scoped to the add-reservation search results only. */
const RESERVATION_SEARCH_TABLE_COMPACT_CLASS = cn(
  "[&_[data-slot=table-head]]:h-8 [&_[data-slot=table-head]]:px-2.5 [&_[data-slot=table-head]]:text-[9px]",
  "[&_[data-slot=table-cell]]:px-2.5 [&_[data-slot=table-cell]]:py-1.5 [&_[data-slot=table-cell]]:text-xs",
  "[&_[data-slot=table-cell]_a]:text-xs",
  "[&_button]:h-6 [&_button]:px-1.5 [&_button]:text-[9px]"
)

type ReservationSearchResultsTableProps = {
  searchType: "customer" | "business"
  customerResults: ReservationCustomerSearchResult[]
  businessResults: ReservationBusinessSearchResult[]
  hasSearched: boolean
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
}

export function ReservationSearchResultsTable ({
  searchType,
  customerResults,
  businessResults,
  hasSearched,
  rowSelection,
  onRowSelectionChange
}: ReservationSearchResultsTableProps) {
  if (!hasSearched) {
    return null
  }

  const emptyMessage = "No record found"

  const tableProps = {
    className: RESERVATION_SEARCH_TABLE_COMPACT_CLASS,
    emptyMessage,
    entityLabel: "records" as const,
    enablePagination: false as const,
    enableRowSelection: true as const,
    enableMultiRowSelection: false as const,
    rowSelection,
    onRowSelectionChange,
    getRowId: (row: { id: string }) => row.id,
    onRowClick: (row: { id: string }) => onRowSelectionChange({ [row.id]: true }),
  }

  return (
    <div className="overflow-hidden rounded-md border">
      {searchType === "business" ? (
        <DataTable
          columns={reservationBusinessSearchColumns}
          data={businessResults}
          {...tableProps}
        />
      ) : (
        <DataTable
          columns={reservationCustomerSearchColumns}
          data={customerResults}
          {...tableProps}
        />
      )}
    </div>
  )
}
