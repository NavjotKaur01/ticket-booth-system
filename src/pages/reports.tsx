import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  CLUB_NAME,
  managerCheckoutShows,
  reportTypeOptions,
} from "@/data/manager-checkout-reports"
import { ManagerCheckoutShowReport } from "@/features/reports/manager-checkout-show-report"
import { ReportFiltersToolbar } from "@/features/reports/report-filters-toolbar"
import { EMPTY_REPORT_FILTERS, type ReportFilters } from "@/types/manager-checkout-report"

function isoDateValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function shiftDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return isoDateValue(date)
}

export function Reports() {
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(
    EMPTY_REPORT_FILTERS
  )
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters | null>(null)

  const selectedReportLabel = useMemo(
    () =>
      reportTypeOptions.find((option) => option.id === draftFilters.reportType)
        ?.label ?? "Report",
    [draftFilters.reportType]
  )

  function updateDraftField<K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))
  }

  function handleGenerate() {
    setAppliedFilters(draftFilters)
  }

  function handleToday() {
    const today = isoDateValue(new Date())
    const nextFilters = {
      ...draftFilters,
      dateFrom: today,
      dateTo: today,
    }
    setDraftFilters(nextFilters)
    setAppliedFilters(nextFilters)
  }

  function handleYesterday() {
    const yesterday = shiftDate(-1)
    const nextFilters = {
      ...draftFilters,
      dateFrom: yesterday,
      dateTo: yesterday,
    }
    setDraftFilters(nextFilters)
    setAppliedFilters(nextFilters)
  }

  const showManagerCheckout =
    appliedFilters?.reportType === "manager-checkout" && appliedFilters != null

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Report Viewer
      </h1>

      <PanelCard>
        <ReportFiltersToolbar
          filters={draftFilters}
          onFilterChange={updateDraftField}
          onGenerate={handleGenerate}
          onToday={handleToday}
          onYesterday={handleYesterday}
          onPrint={() => window.print()}
          onExport={() => undefined}
          onPdf={() => undefined}
        />
      </PanelCard>

      {!appliedFilters ? (
        <PanelCard>
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Choose a report and date range, then generate.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use Today or Yesterday for quick date presets.
            </p>
          </div>
        </PanelCard>
      ) : showManagerCheckout ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {selectedReportLabel}
              </span>{" "}
              for{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {appliedFilters.dateFrom}
              </span>
              {appliedFilters.dateFrom !== appliedFilters.dateTo && (
                <>
                  {" "}
                  to{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {appliedFilters.dateTo}
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {managerCheckoutShows.length} show
              {managerCheckoutShows.length === 1 ? "" : "s"}
            </p>
          </div>

          {managerCheckoutShows.map((show) => (
            <PanelCard key={show.id} className="p-3 sm:p-4">
              <ManagerCheckoutShowReport clubName={CLUB_NAME} show={show} />
            </PanelCard>
          ))}
        </div>
      ) : (
        <PanelCard>
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              {selectedReportLabel} is not available yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Manager Checkout is fully supported. Other report types are coming
              soon.
            </p>
          </div>
        </PanelCard>
      )}
    </div>
  )
}
