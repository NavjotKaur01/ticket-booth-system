import { FileDown, FileText, Printer, Search } from "lucide-react"
import type { ReactNode } from "react"

import {
  createFilterSearchHandlers,
  FILTER_SELECT_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { reportTypeOptions } from "@/data/manager-checkout-reports"
import { cn } from "@/lib/utils"
import type { ReportFilters } from "@/types/manager-checkout-report"

type ReportFiltersToolbarProps = {
  filters: ReportFilters
  hideDateFilters?: boolean
  embedded?: boolean
  leading?: ReactNode
  onFilterChange: <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K]
  ) => void
  onGenerate: () => void
  onToday: () => void
  onYesterday: () => void
  onPrint: () => void
  onExport: () => void
  onPdf: () => void
}

const compactFieldClassName = "h-9 w-full sm:w-44"

export function ReportFiltersToolbar({
  filters,
  hideDateFilters = false,
  embedded = false,
  leading,
  onFilterChange,
  onGenerate,
  onToday,
  onYesterday,
  onPrint,
  onExport,
  onPdf,
}: ReportFiltersToolbarProps) {
  const { handleSubmit, handleInputKeyDown } =
    createFilterSearchHandlers(onGenerate)

  return (
    <form
      className={cn(
        "flex flex-col gap-3 p-3 md:flex-row md:items-end md:justify-between",
        !embedded && "border-b"
      )}
      onSubmit={handleSubmit}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}

      <div
        className={cn(
          "flex min-w-0 flex-wrap items-end gap-2",
          leading && "flex-1 md:justify-end"
        )}
      >
        <div className="w-full space-y-1 sm:w-auto sm:min-w-48">
          <Label htmlFor="report-type" className="text-xs font-medium">
            Report
          </Label>
          <Select
            value={filters.reportType}
            onValueChange={(value) => onFilterChange("reportType", value)}
          >
            <SelectTrigger id="report-type" className={`${FILTER_SELECT_CLASS} w-full`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hideDateFilters ? (
          <>
            <div className="w-full space-y-1 sm:w-auto">
              <Label htmlFor="report-date-from" className="text-xs font-medium">
                From
              </Label>
              <Input
                id="report-date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(event) => onFilterChange("dateFrom", event.target.value)}
                onKeyDown={handleInputKeyDown}
                className={compactFieldClassName}
              />
            </div>

            <div className="w-full space-y-1 sm:w-auto">
              <Label htmlFor="report-date-to" className="text-xs font-medium">
                To
              </Label>
              <Input
                id="report-date-to"
                type="date"
                value={filters.dateTo}
                onChange={(event) => onFilterChange("dateTo", event.target.value)}
                onKeyDown={handleInputKeyDown}
                className={compactFieldClassName}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <IconActionButton
                label="Generate Report"
                icon={Search}
                variant="default"
                type="submit"
              />
              <Button type="button" size="sm" variant="outline" onClick={onToday}>
                Today
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onYesterday}>
                Yesterday
              </Button>
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onPrint}
          >
            <Printer className="size-3.5" />
            Print
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onExport}
          >
            <FileDown className="size-3.5" />
            Export
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onPdf}
          >
            <FileText className="size-3.5" />
            PDF
          </Button>
        </div>
      </div>
    </form>
  )
}
