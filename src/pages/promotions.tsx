import { Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { AddPromotionDialog } from "@/features/promotions/add-promotion-dialog"
import { PromotionDataTable } from "@/features/promotions/promotion-data-table"
import { PromotionFiltersCard } from "@/features/promotions/promotion-filters-card"
import { useAppSession } from "@/hooks/use-app-session"
import { usePromotionSearch } from "@/hooks/use-promotion-search"
import {
  DEFAULT_PROMOTION_FILTERS,
  type PromotionFilters,
} from "@/types/promotion"

export function Promotions() {
  const { connectionName, locationId, isReady } = useAppSession()

  const { promotions, loading, error, hasSearched, search, clear } =
    usePromotionSearch({
      connectionName,
      locationId,
      enabled: isReady,
    })

  const [draftFilters, setDraftFilters] = useState<PromotionFilters>(
    DEFAULT_PROMOTION_FILTERS
  )
  const [addOpen, setAddOpen] = useState(false)

  function updateDraftField<K extends keyof PromotionFilters>(
    key: K,
    value: PromotionFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))
  }

  function handleSearch() {
    void search(draftFilters)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_PROMOTION_FILTERS)
    clear()
  }

  const tableLoading = loading
  const emptyMessage = tableLoading
    ? "Searching promotions..."
    : hasSearched
      ? "No promotion found"
      : "Enter search criteria and click Search"

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Promotion
      </h1>

      <PromotionFiltersCard
        filters={draftFilters}
        onFilterChange={updateDraftField}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {promotions.length}
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {error ? (
          <p className="px-3 py-2 text-sm text-destructive">{error}</p>
        ) : null}

        <PromotionDataTable
          data={promotions}
          loading={tableLoading}
          emptyMessage={emptyMessage}
        />
      </PanelCard>

      <AddPromotionDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
