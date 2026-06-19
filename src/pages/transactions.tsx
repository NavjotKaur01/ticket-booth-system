import { FileDown } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { dailyTransactions } from "@/data/transactions"
import { TransactionDataTable } from "@/features/transactions/transaction-data-table"
import { TransactionToolbar } from "@/features/transactions/transaction-toolbar"
import { filterTransactions } from "@/lib/filter-transactions"
import { DEFAULT_TRANSACTION_FILTERS } from "@/types/transaction"

export function Transactions() {
  const [filters, setFilters] = useState(DEFAULT_TRANSACTION_FILTERS)

  const filteredTransactions = useMemo(
    () => filterTransactions(dailyTransactions, filters),
    [filters]
  )

  function updateFilter<K extends keyof typeof DEFAULT_TRANSACTION_FILTERS>(
    key: K,
    value: (typeof DEFAULT_TRANSACTION_FILTERS)[K]
  ) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function handleRefresh() {
    // Placeholder for API refresh when wired up
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Daily Transaction
      </h1>

      <PanelCard>
        <div className="border-b">
          <TransactionToolbar
            filters={filters}
            onFilterChange={updateFilter}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredTransactions.length}
            </span>
          </p>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileDown className="size-3.5" />
            Export
          </Button>
        </div>

        <TransactionDataTable data={filteredTransactions} />
      </PanelCard>
    </div>
  )
}
