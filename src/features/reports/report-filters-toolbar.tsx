import { FileDown, FileText, Printer } from "lucide-react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getReportConfig } from "@/features/reports/reports.service"
import type {
  ReportViewerFilters,
  ReportViewerLocationOption,
  ReportViewerOption,
} from "@/features/reports/reports.service"

type ReportFiltersToolbarProps = {
  filters: ReportViewerFilters
  reportOptions: ReportViewerOption[]
  locationOptions: ReportViewerLocationOption[]
  isGenerating?: boolean
  activeQuickRange?: "today" | "yesterday" | null
  onFilterChange: <K extends keyof ReportViewerFilters>(
    key: K,
    value: ReportViewerFilters[K]
  ) => void
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
  locationOptions,
  isGenerating = false,
  activeQuickRange = null,
  onFilterChange,
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

  return (
    <div className="border-b border-border/70 bg-background px-4 py-4">
      <div className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-4 sm:p-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
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
            >
              <FileText className="size-3.5" />
              PDF
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-3",
            showDateRange
              ? "md:grid-cols-2 2xl:grid-cols-[minmax(15rem,19rem)_minmax(11rem,13rem)_minmax(11rem,13rem)_1fr] 2xl:items-end"
              : "md:grid-cols-2 2xl:grid-cols-[minmax(15rem,19rem)_1fr] 2xl:items-end"
          )}
        >
          <div className="space-y-1.5">
            <Label htmlFor="report-viewer-type">Report</Label>
            <Select
              value={filters.reportType}
              onValueChange={(value) => onFilterChange("reportType", value)}
            >
              <SelectTrigger id="report-viewer-type" className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showDateRange && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="report-viewer-from">From</Label>
                <CalendarDatePickerControl
                  id="report-viewer-from"
                  value={filters.dateFrom}
                  onChange={(value) => onFilterChange("dateFrom", value)}
                  className="h-9 w-full bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-viewer-to">To</Label>
                <CalendarDatePickerControl
                  id="report-viewer-to"
                  value={filters.dateTo}
                  onChange={(value) => onFilterChange("dateTo", value)}
                  className="h-9 w-full bg-background"
                />
              </div>
            </>
          )}

          <div
            className={cn(
              "flex flex-wrap items-center gap-2 pt-2",
              showDateRange
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
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="report-viewer-location">Location</Label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <div className="w-full max-w-[19rem]">
              <Select
                value={filters.locationId}
                onValueChange={(value) => onFilterChange("locationId", value)}
              >
                <SelectTrigger id="report-viewer-location" className="h-9 w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showCustomerFilters && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={filters.withEmailAddress}
                    onCheckedChange={(value) =>
                      onFilterChange("withEmailAddress", value === true)
                    }
                  />
                  With Email Address
                </label>

                <label className="flex items-center gap-2 text-sm text-foreground">
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
        </div>
      </div>
    </div>
  )
}
