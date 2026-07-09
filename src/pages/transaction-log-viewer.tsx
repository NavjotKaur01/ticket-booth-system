import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import { transactionLogs as initialRecords } from "@/data/transaction-logs"
import { TransactionLogDataTable } from "@/features/transaction-log-viewer/transaction-log-data-table"
import { TransactionLogFiltersCard } from "@/features/transaction-log-viewer/transaction-log-filters-card"
import { useAppSession } from "@/hooks/use-app-session"
import { filterTransactionLogs } from "@/lib/filter-transaction-logs"
import type {
  TransactionLog,
  TransactionLogSearchFilters,
  TransactionLogTableFilters,
} from "@/types/transaction-log"
import {
  EMPTY_TRANSACTION_LOG_SEARCH,
  EMPTY_TRANSACTION_LOG_TABLE_FILTERS,
} from "@/types/transaction-log"

export function TransactionLogViewer() {
  const { locationId, locationName } = useAppSession()
  const [rows, setRows] = useState<TransactionLog[]>(initialRecords)
  const [draftSearch, setDraftSearch] = useState<TransactionLogSearchFilters>(
    EMPTY_TRANSACTION_LOG_SEARCH
  )
  const [appliedSearch, setAppliedSearch] = useState<TransactionLogSearchFilters>(
    EMPTY_TRANSACTION_LOG_SEARCH
  )
  const [tableFilters, setTableFilters] = useState<TransactionLogTableFilters>(
    EMPTY_TRANSACTION_LOG_TABLE_FILTERS
  )
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (!locationId) {
      return
    }

    setRows((current) => {
      const usesPlaceholderLocation = current.every(
        (row) => row.locationId === "standupmedia"
      )

      if (!usesPlaceholderLocation) {
        return current
      }

      return current.map((row) =>
        row.locationId === "standupmedia"
          ? {
              ...row,
              locationId,
              locationLabel: locationName || row.locationLabel,
            }
          : row
      )
    })
  }, [locationId, locationName])

  const filteredRows = useMemo(() => {
    if (!hasSearched) {
      return []
    }

    return filterTransactionLogs(rows, locationId, appliedSearch, tableFilters)
  }, [appliedSearch, hasSearched, locationId, rows, tableFilters])

  const emptyMessage = hasSearched
    ? "No data to display"
    : "Enter search criteria and click Search"

  function updateDraftSearch(
    field: keyof TransactionLogSearchFilters,
    value: string
  ) {
    setDraftSearch((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedSearch(draftSearch)
    setHasSearched(true)
  }

  function updateTableFilter<K extends keyof TransactionLogTableFilters>(
    key: K,
    value: TransactionLogTableFilters[K]
  ) {
    setTableFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Transaction Log Viewer
      </h1>

      <TransactionLogFiltersCard
        filters={draftSearch}
        onFilterChange={updateDraftSearch}
        onSearch={handleSearch}
      />

      <PanelCard>
        <div className={`${FILTER_ROW_INNER_CLASS} border-b px-3 py-3`}>
          <Input
            placeholder="First Name"
            value={tableFilters.firstName}
            onChange={(event) => updateTableFilter("firstName", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Last Name"
            value={tableFilters.lastName}
            onChange={(event) => updateTableFilter("lastName", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Email"
            value={tableFilters.email}
            onChange={(event) => updateTableFilter("email", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Transaction Date"
            value={tableFilters.transactionDate}
            onChange={(event) =>
              updateTableFilter("transactionDate", event.target.value)
            }
            className={FILTER_INPUT_CLASS}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Drag a column header here to group by that column
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredRows.length}
            </span>
          </p>
        </div>

        <TransactionLogDataTable data={filteredRows} emptyMessage={emptyMessage} />
      </PanelCard>
    </div>
  )
}
