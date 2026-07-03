import { ChevronDown, ChevronUp, FileDown, FileText, Printer } from "lucide-react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import CalendarSelectControl from "@/components/calendar/controls/CalendarSelectControl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getReportConfig } from "@/features/reports/reports.service"
import type {
  ReportViewerFilters,
  ReportViewerOption,
} from "@/features/reports/reports.service"

type ComedianOption = {
  id: string
  label: string
}

type ReportFiltersToolbarProps = {
  filters: ReportViewerFilters
  reportOptions: ReportViewerOption[]
  comedianOptions?: ComedianOption[]
  isGenerating?: boolean
  isExportingPdf?: boolean
  exportError?: string | null
  isLoadingReportOptions?: boolean
  reportOptionsError?: boolean
  activeQuickRange?: "today" | "yesterday" | null
  isFilterHeaderOpen?: boolean
  onFilterChange: <K extends keyof ReportViewerFilters>(
    key: K,
    value: ReportViewerFilters[K]
  ) => void
  onFilterHeaderOpenChange?: (open: boolean) => void
  onGenerate: () => void
  onToday: () => void
  onYesterday: () => void
  onPrint: () => void
  onExport: () => void
  onPdf: () => void
}

export function ReportFiltersToolbar({
  filters,
  reportOptions,
  comedianOptions = [],
  isGenerating = false,
  isExportingPdf = false,
  exportError = null,
  isLoadingReportOptions = false,
  reportOptionsError = false,
  activeQuickRange = null,
  isFilterHeaderOpen = true,
  onFilterChange,
  onFilterHeaderOpenChange,
  onGenerate,
  onToday,
  onYesterday,
  onPrint,
  onExport,
  onPdf,
}: ReportFiltersToolbarProps) {
  const config = getReportConfig(filters.reportType)
  const showCustomerFilters = config.showCustomerFilters
  const showDateRange = config.showDateRange
  const showComicPicker = config.showComicPicker
  const showAllDatesOption = config.showAllDatesOption
  const showWebReservationOnly = config.showWebReservationOnly
  const showSeparateByUsers = config.showSeparateByUsers
  const effectiveDateRange = showDateRange && !filters.isAllDates
  const hasSecondaryFilters =
    showComicPicker ||
    showAllDatesOption ||
    showSeparateByUsers ||
    showWebReservationOnly ||
    showCustomerFilters
  const selectedReportLabel =
    reportOptions.find((option) => option.id === filters.reportType)?.label ??
    "Report Filters"
  const ToggleIcon = isFilterHeaderOpen ? ChevronUp : ChevronDown

  return (
    <div className="bg-background px-3 py-2 md:px-4 md:py-4">
      <div className="rounded-xl border border-border/70 bg-muted/10">
        <Button
          type="button"
          variant="ghost"
          className="flex h-auto w-full justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted/40 md:hidden"
          onClick={() => onFilterHeaderOpenChange?.(!isFilterHeaderOpen)}
          aria-expanded={isFilterHeaderOpen}
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">
              Report Filters
            </span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {selectedReportLabel}
            </span>
          </span>
          <ToggleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </Button>

        <div className={cn("space-y-4 p-4 sm:p-3.5", !isFilterHeaderOpen && "hidden md:block")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Report Viewer
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set filters, then generate the report when you are ready.
              </p>
            </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3"
              onClick={onPrint}
            >
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3"
              onClick={onExport}
            >
              <FileDown className="size-3.5" />
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3"
              onClick={onPdf}
              disabled={isExportingPdf}
            >
              <FileText className="size-3.5" />
              {isExportingPdf ? "PDF..." : "PDF"}
            </Button>
          </div>
        </div>

        {exportError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            PDF export failed: {exportError}
          </div>
        )}

        <div
          className={cn(
            "grid gap-3",
            effectiveDateRange
              ? "md:grid-cols-2 2xl:grid-cols-[minmax(15rem,19rem)_minmax(11rem,13rem)_minmax(11rem,13rem)_1fr] 2xl:items-end"
              : "md:grid-cols-2 2xl:grid-cols-[minmax(15rem,19rem)_1fr] 2xl:items-end"
          )}
        >
          <div className="space-y-1.5">
            <Label htmlFor="report-viewer-type">Report</Label>
            <CalendarSelectControl
              id="report-viewer-type"
              value={filters.reportType}
              onChange={(value) => onFilterChange("reportType", value)}
              disabled={isLoadingReportOptions || reportOptions.length === 0}
              placeholder={
                isLoadingReportOptions
                  ? "Loading reports..."
                  : reportOptionsError
                    ? "Failed to load reports"
                    : "Select report"
              }
              className="h-9 w-full bg-background"
              listClassName="max-h-80"
              options={reportOptions.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
            />
          </div>

          {effectiveDateRange && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="report-viewer-from">From</Label>
                <CalendarDatePickerControl
                  id="report-viewer-from"
                  value={filters.dateFrom}
                  onChange={(value) => onFilterChange("dateFrom", value)}
                  maxDate={filters.dateTo}
                  className="h-9 w-full bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-viewer-to">To</Label>
                <CalendarDatePickerControl
                  id="report-viewer-to"
                  value={filters.dateTo}
                  onChange={(value) => onFilterChange("dateTo", value)}
                  minDate={filters.dateFrom}
                  className="h-9 w-full bg-background"
                />
              </div>
            </>
          )}

          <div
            className={cn(
              "flex flex-wrap items-center gap-2 pt-2",
              effectiveDateRange
                ? "md:col-span-2 2xl:col-span-1 2xl:justify-end 2xl:pt-0"
                : "2xl:justify-end 2xl:pt-0"
            )}
          >
            {showDateRange && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-8 px-3 text-xs sm:text-sm",
                    activeQuickRange === "today" &&
                      "border-primary bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={onToday}
                  disabled={filters.isAllDates}
                >
                  Today
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-8 px-3 text-xs sm:text-sm",
                    activeQuickRange === "yesterday" &&
                      "border-primary bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={onYesterday}
                  disabled={filters.isAllDates}
                >
                  Yesterday
                </Button>

                <div className="hidden h-6 w-px bg-border lg:block" />
              </>
            )}

            <Button
              type="button"
              className="h-9 px-4 lg:ml-2"
              onClick={onGenerate}
              disabled={isGenerating || isLoadingReportOptions || reportOptions.length === 0}
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>

        {hasSecondaryFilters && (
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            {showComicPicker && (
              <div className="w-full max-w-[19rem] space-y-1.5">
                <Label htmlFor="report-viewer-comic">Comic Name</Label>
                <CalendarSelectControl
                  id="report-viewer-comic"
                  value={filters.headlinerId}
                  onChange={(value) => onFilterChange("headlinerId", value)}
                  placeholder="Select a comedian..."
                  className="h-9 w-full bg-background"
                  options={comedianOptions.map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))}
                />
              </div>
            )}

            {showAllDatesOption && (
              <label className="flex h-9 items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={filters.isAllDates}
                  onCheckedChange={(value) =>
                    onFilterChange("isAllDates", value === true)
                  }
                />
                All Dates
              </label>
            )}

            {showSeparateByUsers && (
              <label className="flex h-9 items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={filters.isSeparateByUsers}
                  onCheckedChange={(value) =>
                    onFilterChange("isSeparateByUsers", value === true)
                  }
                />
                Separate Report By Users
              </label>
            )}

            {showWebReservationOnly && (
              <label className="flex h-9 items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={filters.isWebReservationOnly}
                  onCheckedChange={(value) =>
                    onFilterChange("isWebReservationOnly", value === true)
                  }
                />
                Web Reservation Only
              </label>
            )}

            {showCustomerFilters && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <label className="flex h-9 items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={filters.withEmailAddress}
                    onCheckedChange={(value) =>
                      onFilterChange("withEmailAddress", value === true)
                    }
                  />
                  With Email Address
                </label>

                <label className="flex h-9 items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={filters.withAddress}
                    onCheckedChange={(value) =>
                      onFilterChange("withAddress", value === true)
                    }
                  />
                  With Address
                </label>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
