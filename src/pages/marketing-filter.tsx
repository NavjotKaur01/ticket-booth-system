import { FileDown } from "lucide-react"
import { useState } from "react"

import { ExportDataDialog } from "@/components/common/export-data-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { CustomerDetailsDialog } from "@/features/customers/customer-details-dialog"
import { AddComicDialog } from "@/features/marketing-filter/add-comic-dialog"
import { MarketingFilterDataTable } from "@/features/marketing-filter/marketing-filter-data-table"
import { MarketingFilterFiltersCard } from "@/features/marketing-filter/marketing-filter-filters-card"
import { useAppSession } from "@/hooks/use-app-session"
import { useMarketingFilterSearch } from "@/hooks/use-marketing-filter-search"
import { marketingFilterRecordToCustomer } from "@/lib/filter-marketing-records"
import { exportMarketingFilterRecords } from "@/lib/marketing-filter-export"
import type { ExportFormat } from "@/lib/export-table-data"
import {
  CLEARED_MARKETING_FILTER_FORM,
  DEFAULT_MARKETING_FILTER_FORM,
  type MarketingFilterForm,
  type MarketingFilterRecord,
} from "@/types/marketing-filter"
import type { Customer } from "@/types/customer"

export function MarketingFilter() {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const [draftFilters, setDraftFilters] = useState<MarketingFilterForm>(
    DEFAULT_MARKETING_FILTER_FORM
  )
  const [addComicOpen, setAddComicOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { records, loading, error, hasSearched, search } =
    useMarketingFilterSearch({
      connectionName,
      locationId,
      enabled: isReady,
    })

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
    void search(draftFilters)
  }

  function handleClear() {
    setDraftFilters(CLEARED_MARKETING_FILTER_FORM)
  }

  function handleClearComics() {
    updateDraftField("selectedComedians", [])
  }

  function handleRemoveComic(comedianId: string) {
    setDraftFilters((current) => ({
      ...current,
      selectedComedians: current.selectedComedians.filter(
        (comedian) => comedian.id !== comedianId
      ),
    }))
  }

  function handleConfirmComics(
    comedians: MarketingFilterForm["selectedComedians"]
  ) {
    updateDraftField("selectedComedians", comedians)
  }

  function handleOpenDetails(record: MarketingFilterRecord) {
    setDetailsCustomer(marketingFilterRecordToCustomer(record))
    setDetailsOpen(true)
  }

  function handleDetailsOpenChange(open: boolean) {
    setDetailsOpen(open)
    if (!open) {
      setDetailsCustomer(null)
    }
  }

  function handleExportOpen() {
    if (loading) {
      window.alert("Please wait while data is loading.")
      return
    }

    if (records.length === 0) {
      window.alert("Please search customer first!")
      return
    }

    setExportOpen(true)
  }

  function handleExport(format: ExportFormat) {
    return exportMarketingFilterRecords(records, format)
  }

  const emptyMessage = loading
    ? "Please wait while data is loading..."
    : hasSearched
      ? "No record found"
      : "Enter search criteria and click Search"

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
        onRemoveComic={handleRemoveComic}
        onAddComic={() => setAddComicOpen(true)}
      />

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Count:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {records.length}
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleExportOpen}
          >
            <FileDown className="size-3.5" />
            Export
          </Button>
        </div>

        {error ? (
          <p className="px-3 py-2 text-sm text-destructive">{error}</p>
        ) : null}

        <div className="border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Double
            click to view customer details
          </p>
        </div>

        <MarketingFilterDataTable
          data={records}
          loading={loading}
          emptyMessage={emptyMessage}
          onDetails={handleOpenDetails}
        />
      </PanelCard>

      <AddComicDialog
        open={addComicOpen}
        onOpenChange={setAddComicOpen}
        connectionName={connectionName}
        locationId={locationId}
        selectedComedians={draftFilters.selectedComedians}
        onConfirm={handleConfirmComics}
      />

      <ExportDataDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
      />

      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={handleDetailsOpenChange}
        customer={detailsCustomer}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
      />
    </div>
  )
}
