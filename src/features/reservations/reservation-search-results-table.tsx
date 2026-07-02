import type { OnChangeFn, Row, RowSelectionState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
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
  "[&_[data-slot=table-row][data-state=selected]]:bg-primary/20 [&_[data-slot=table-row][data-state=selected]:hover]:bg-primary/20",
  "[&_button]:h-6 [&_button]:px-1.5 [&_button]:text-[9px]"
)

type ReservationSearchResult =
  | ReservationCustomerSearchResult
  | ReservationBusinessSearchResult

type ReservationSearchResultsTableProps = {
  searchType: "customer" | "business"
  customerResults: ReservationCustomerSearchResult[]
  businessResults: ReservationBusinessSearchResult[]
  hasSearched: boolean
  loading?: boolean
  canAddNewCustomer?: boolean
  creatingCustomer?: boolean
  onAddNewCustomer?: () => void
  onFillMoreDetails?: () => void
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onResultSelect?: (result: ReservationSearchResult) => void
}

function CustomerSearchEmptyState ({
  loading,
  canAddNewCustomer,
  creatingCustomer,
  onAddNewCustomer,
  onFillMoreDetails
}: {
  loading: boolean
  canAddNewCustomer: boolean
  creatingCustomer: boolean
  onAddNewCustomer?: () => void
  onFillMoreDetails?: () => void
}) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Searching...</p>
    )
  }

  if (canAddNewCustomer) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          No matching customer found.
        </p>
        <Button
          type="button"
          size="sm"
          disabled={creatingCustomer}
          onClick={onAddNewCustomer}
        >
          {creatingCustomer ? "Adding customer..." : "Add new customer"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        No matching customer found. Enter first name, last name, email, and a
        complete phone number to add a new customer.
      </p>
      <Button type="button" size="sm" variant="outline" onClick={onFillMoreDetails}>
        Fill more details
      </Button>
    </div>
  )
}

export function ReservationSearchResultsTable ({
  searchType,
  customerResults,
  businessResults,
  hasSearched,
  loading = false,
  canAddNewCustomer = false,
  creatingCustomer = false,
  onAddNewCustomer,
  onFillMoreDetails,
  rowSelection,
  onRowSelectionChange,
  onResultSelect
}: ReservationSearchResultsTableProps) {
  if (!hasSearched) {
    return null
  }

  const showCustomerEmptyState =
    searchType === "customer" && !loading && customerResults.length === 0

  if (showCustomerEmptyState) {
    return (
      <div className="overflow-hidden rounded-md border px-4 py-6 text-center">
        <CustomerSearchEmptyState
          loading={loading}
          canAddNewCustomer={canAddNewCustomer}
          creatingCustomer={creatingCustomer}
          onAddNewCustomer={onAddNewCustomer}
          onFillMoreDetails={onFillMoreDetails}
        />
      </div>
    )
  }

  const emptyMessage = loading ? "Searching..." : "No record found"

  function selectResultRow<T extends ReservationSearchResult>(row: Row<T>) {
    onRowSelectionChange({ [row.id]: true })
    onResultSelect?.(row.original)
  }

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
  }

  return (
    <div className="overflow-hidden rounded-md border">
      {searchType === "business" ? (
        <DataTable
          columns={reservationBusinessSearchColumns}
          data={businessResults}
          {...tableProps}
          onRowClick={(row) => selectResultRow(row)}
        />
      ) : (
        <DataTable
          columns={reservationCustomerSearchColumns}
          data={customerResults}
          {...tableProps}
          onRowClick={(row) => selectResultRow(row)}
        />
      )}
    </div>
  )
}
