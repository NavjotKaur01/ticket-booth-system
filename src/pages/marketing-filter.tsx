import { FileDown } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { marketingFilterRecords } from "@/data/marketing-filter"
import { AddComicDialog } from "@/features/marketing-filter/add-comic-dialog"
import { MarketingFilterDataTable } from "@/features/marketing-filter/marketing-filter-data-table"
import { MarketingFilterFiltersCard } from "@/features/marketing-filter/marketing-filter-filters-card"
import { filterMarketingRecords } from "@/lib/filter-marketing-records"
import {
  DEFAULT_MARKETING_FILTER_FORM,
  type MarketingFilterForm,
} from "@/types/marketing-filter"

export function MarketingFilter() {
  const [draftFilters, setDraftFilters] = useState<MarketingFilterForm>(
    DEFAULT_MARKETING_FILTER_FORM
  )
  const [appliedFilters, setAppliedFilters] = useState<MarketingFilterForm>(
    DEFAULT_MARKETING_FILTER_FORM
  )
  const [addComicOpen, setAddComicOpen] = useState(false)

  const filteredRecords = useMemo(
    () => filterMarketingRecords(marketingFilterRecords, appliedFilters),
    [appliedFilters]
  )

  function updateDraftField<K extends keyof MarketingFilterForm>(
    key: K,
    value: MarketingFilterForm[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))
  }

  function updateZipCode(index: number, value: string) {
    setDraftFilters((current) => {
      const zipCodes = [...current.zipCodes] as MarketingFilterForm["zipCodes"]
      zipCodes[index] = value
      return { ...current, zipCodes }
    })
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_MARKETING_FILTER_FORM)
    setAppliedFilters(DEFAULT_MARKETING_FILTER_FORM)
  }

  function handleClearComics() {
    updateDraftField("comedianIds", [])
  }

  function handleConfirmComics(ids: string[]) {
    updateDraftField("comedianIds", ids)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Marketing Filter
      </h1>

      <MarketingFilterFiltersCard
        filters={draftFilters}
        onFilterChange={updateDraftField}
        onZipCodeChange={updateZipCode}
        onSearch={handleSearch}
        onClear={handleClear}
        onClearComics={handleClearComics}
        onAddComic={() => setAddComicOpen(true)}
      />

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Count:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredRecords.length}
            </span>
          </p>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileDown className="size-3.5" />
            Export
          </Button>
        </div>

        <MarketingFilterDataTable data={filteredRecords} />
      </PanelCard>

      <AddComicDialog
        open={addComicOpen}
        onOpenChange={setAddComicOpen}
        selectedIds={draftFilters.comedianIds}
        onConfirm={handleConfirmComics}
      />
    </div>
  )
}
