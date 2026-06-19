import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { PanelCard } from "@/components/common/panel-card"
import { userSession } from "@/data/dashboard"
import {
  CLUB_NAME,
  managerCheckoutShows,
  reportTypeOptions,
} from "@/data/manager-checkout-reports"
import { ManagerCheckoutShowReport } from "@/features/reports/manager-checkout-show-report"
import { PastCustomerReport } from "@/features/reports/past-customer-report"
import { ReportFiltersToolbar } from "@/features/reports/report-filters-toolbar"
import { TodaySalesReport } from "@/features/reports/today-sales-report"
import { useLocations } from "@/hooks/use-locations"
import {
  EMPTY_REPORT_FILTERS,
  type ReportFilters,
} from "@/types/manager-checkout-report"

function getReportTypeFromParams(searchParams: URLSearchParams) {
  const reportType = searchParams.get("report")
  if (
    reportType &&
    reportTypeOptions.some((option) => option.id === reportType)
  ) {
    return reportType
  }

  return EMPTY_REPORT_FILTERS.reportType
}

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

function withDefaultLocation(
  filters: ReportFilters,
  locationId: string
): ReportFilters {
  if (filters.location || !locationId) {
    return filters
  }

  return { ...filters, location: locationId }
}

function isTodaySalesReport(reportType: string) {
  return reportType === "today-sales"
}

export function Reports() {
  const [searchParams] = useSearchParams()
  const initialReportType = getReportTypeFromParams(searchParams)
  const { locations, loading: locationsLoading, error: locationsError } =
    useLocations(userSession.clubSlug)
  const defaultLocationId = locations[0]?.id ?? ""

  const [draftFilters, setDraftFilters] = useState<ReportFilters>({
    ...EMPTY_REPORT_FILTERS,
    reportType: initialReportType,
  })
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters | null>(null)

  const isTodaySalesView =
    draftFilters.reportType === "today-sales" ||
    getReportTypeFromParams(searchParams) === "today-sales"

  useEffect(() => {
    const reportType = getReportTypeFromParams(searchParams)
    const paramReport = searchParams.get("report")

    setDraftFilters((current) =>
      withDefaultLocation({ ...current, reportType }, defaultLocationId)
    )

    if (!paramReport || locationsLoading) {
      return
    }

    const today = isoDateValue(new Date())
    const filters = withDefaultLocation(
      {
        ...EMPTY_REPORT_FILTERS,
        reportType,
        dateFrom: today,
        dateTo: today,
      },
      defaultLocationId
    )

    setDraftFilters(filters)

    if (isTodaySalesReport(reportType) && !filters.location) {
      return
    }

    setAppliedFilters(filters)
  }, [searchParams, defaultLocationId, locationsLoading])

  useEffect(() => {
    if (locationsLoading || !defaultLocationId) {
      return
    }

    setDraftFilters((current) => withDefaultLocation(current, defaultLocationId))
    setAppliedFilters((current) => {
      if (!current) {
        return current
      }

      const next = withDefaultLocation(current, defaultLocationId)
      if (isTodaySalesReport(current.reportType) && !next.location) {
        return null
      }

      return next
    })
  }, [defaultLocationId, locationsLoading])

  const selectedReportLabel = useMemo(
    () =>
      reportTypeOptions.find((option) => option.id === draftFilters.reportType)
        ?.label ?? "Report",
    [draftFilters.reportType]
  )

  function maybeAutoApplyTodaySales(nextFilters: ReportFilters) {
    if (!isTodaySalesReport(nextFilters.reportType)) {
      return
    }

    const filters = withDefaultLocation(nextFilters, defaultLocationId)
    if (filters.location) {
      setAppliedFilters(filters)
    }
  }

  function updateDraftField<K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K]
  ) {
    setDraftFilters((current) => {
      const next = { ...current, [key]: value }

      if (key === "reportType" && !isTodaySalesReport(String(value))) {
        setAppliedFilters(null)
      } else {
        maybeAutoApplyTodaySales(next)
      }

      return next
    })
  }

  function applyFilters(nextFilters: ReportFilters) {
    const filters = withDefaultLocation(nextFilters, defaultLocationId)
    setDraftFilters(filters)

    if (isTodaySalesReport(filters.reportType) && !filters.location) {
      return
    }

    setAppliedFilters(filters)
  }

  function handleGenerate() {
    applyFilters(draftFilters)
  }

  function handleToday() {
    const today = isoDateValue(new Date())
    applyFilters({
      ...draftFilters,
      dateFrom: today,
      dateTo: today,
    })
  }

  function handleYesterday() {
    applyFilters({
      ...draftFilters,
      dateFrom: shiftDate(-1),
      dateTo: shiftDate(-1),
    })
  }

  const toolbarProps = {
    filters: draftFilters,
    locationOptions: locations,
    locationsLoading,
    locationsError,
    hideDateFilters: isTodaySalesView,
    onFilterChange: updateDraftField,
    onGenerate: handleGenerate,
    onToday: handleToday,
    onYesterday: handleYesterday,
    onPrint: () => window.print(),
    onExport: () => undefined,
    onPdf: () => undefined,
  }

  const showManagerCheckout =
    appliedFilters?.reportType === "manager-checkout" && appliedFilters != null

  const showPastCustomers =
    appliedFilters?.reportType === "past-customers" && appliedFilters != null

  const showTodaySales =
    appliedFilters?.reportType === "today-sales" &&
    appliedFilters != null &&
    Boolean(appliedFilters.location)

  const pendingTodaySales =
    getReportTypeFromParams(searchParams) === "today-sales" &&
    (locationsLoading || (!appliedFilters && !locationsError))

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Report Viewer
      </h1>

      {isTodaySalesView ? (
        pendingTodaySales ? (
          <PanelCard>
            <ReportFiltersToolbar {...toolbarProps} />
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Loading locations...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Report data will load after locations are ready.
              </p>
            </div>
          </PanelCard>
        ) : showTodaySales ? (
          <TodaySalesReport
            clubSlug={userSession.clubSlug}
            location={appliedFilters.location}
            locationsReady={!locationsLoading}
            toolbar={<ReportFiltersToolbar {...toolbarProps} embedded />}
          />
        ) : (
          <PanelCard>
            <ReportFiltersToolbar {...toolbarProps} />
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Select a location to view today&apos;s sales.
              </p>
            </div>
          </PanelCard>
        )
      ) : (
        <>
          <PanelCard>
            <ReportFiltersToolbar {...toolbarProps} />
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
          ) : showPastCustomers ? (
            <PastCustomerReport
              dateFrom={appliedFilters.dateFrom}
              dateTo={appliedFilters.dateTo}
            />
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
                  Past Customers, Today Sales, and Manager Checkout are fully
                  supported. Other report types are coming soon.
                </p>
              </div>
            </PanelCard>
          )}
        </>
      )}
    </div>
  )
}
