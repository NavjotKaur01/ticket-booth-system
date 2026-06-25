import { FileDown } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { giftCertificates } from "@/data/gift-certificates"
import { GiftCertificateDataTable } from "@/features/gift-certificates/gift-certificate-data-table"
import { GiftCertificateToolbar } from "@/features/gift-certificates/gift-certificate-toolbar"
import { filterGiftCertificates } from "@/lib/filter-gift-certificates"
import { EMPTY_GIFT_CERTIFICATE_FILTERS } from "@/types/gift-certificate"

export function GiftCertificate() {
  const [draftFilters, setDraftFilters] = useState(
    EMPTY_GIFT_CERTIFICATE_FILTERS
  )
  const [appliedFilters, setAppliedFilters] = useState(
    EMPTY_GIFT_CERTIFICATE_FILTERS
  )
  const filteredCertificates = useMemo(
    () => filterGiftCertificates(giftCertificates, appliedFilters),
    [appliedFilters]
  )

  function updateDraftField(
    field: keyof typeof EMPTY_GIFT_CERTIFICATE_FILTERS,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_GIFT_CERTIFICATE_FILTERS)
    setAppliedFilters(EMPTY_GIFT_CERTIFICATE_FILTERS)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Web Gift Certificate
      </h1>

      <PanelCard>
        <div className="border-b">
          <GiftCertificateToolbar
            filters={draftFilters}
            onFilterChange={updateDraftField}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Double
            click to edit and cash out gift certificate amount
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {filteredCertificates.length}
              </span>
            </p>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileDown className="size-3.5" />
              Export
            </Button>
          </div>
        </div>

        <GiftCertificateDataTable data={filteredCertificates} />
      </PanelCard>
    </div>
  )
}