import { FileDown } from "lucide-react"
import { useMemo, useState } from "react"

import { ExportDataDialog } from "@/components/common/export-data-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { TransactionDataTable } from "@/features/transactions/transaction-data-table"
import { TransactionToolbar } from "@/features/transactions/transaction-toolbar"
import { useAppSession } from "@/hooks/use-app-session"
import { useDailyTransactionData } from "@/hooks/use-daily-transaction-data"
import { useShowDetailsByDate } from "@/hooks/use-show-details-by-date"
import { exportDailyTransactions } from "@/lib/export-daily-transactions"
import type { ExportFormat } from "@/lib/export-table-data"
import {
  DEFAULT_TRANSACTION_REFRESH_SECONDS,
  type TransactionFilters,
} from "@/types/transaction"

function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function Transactions() {
  const { connectionName, locationId, isReady } = useAppSession()

  const [filters, setFilters] = useState<TransactionFilters>(() => ({
    showDate: todayDateValue(),
    showTimeId: "",
    refreshSeconds: DEFAULT_TRANSACTION_REFRESH_SECONDS,
  }))
  const [exportOpen, setExportOpen] = useState(false)

  const { shows, loading: showsLoading, error: showsError } =
    useShowDetailsByDate(
      connectionName,
      locationId,
      filters.showDate,
      false,
      isReady
    )

  const selectedShowId = useMemo(() => {
    if (shows.length === 0) {
      return ""
    }

    if (shows.some((show) => show.id === filters.showTimeId)) {
      return filters.showTimeId
    }

    return shows[0].id
  }, [shows, filters.showTimeId])

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refresh,
  } = useDailyTransactionData(
    connectionName,
    selectedShowId,
    filters.refreshSeconds,
    isReady && Boolean(selectedShowId)
  )

  function updateFilter<K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function handleRefresh() {
    void refresh()
  }

  function handleExport(format: ExportFormat) {
    return exportDailyTransactions(transactions, format)
  }

  const pageError = showsError ?? transactionsError

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Daily Transaction
      </h1>

      <PanelCard>
        <div className="border-b">
          <TransactionToolbar
            filters={{ ...filters, showTimeId: selectedShowId }}
            shows={shows}
            showsLoading={showsLoading}
            showsError={showsError}
            onFilterChange={updateFilter}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {transactions.length}
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={transactions.length === 0}
            onClick={() => setExportOpen(true)}
          >
            <FileDown className="size-3.5" />
            Export
          </Button>
        </div>

        {pageError ? (
          <p className="px-3 py-2 text-sm text-destructive">{pageError}</p>
        ) : null}

        <TransactionDataTable
          data={transactions}
          loading={transactionsLoading || showsLoading}
        />
      </PanelCard>

      <ExportDataDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
      />
    </div>
  )
}
