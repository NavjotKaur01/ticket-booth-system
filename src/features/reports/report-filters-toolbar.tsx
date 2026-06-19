import { FileDown, FileText, Printer, Search } from "lucide-react"

import { IconActionButton } from "@/components/forms/form-fields"
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
import {
  reportLocationOptions,
  reportTypeOptions,
} from "@/data/manager-checkout-reports"
import type { ReportFilters } from "@/types/manager-checkout-report"

type ReportFiltersToolbarProps = {
  filters: ReportFilters
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

const compactFieldClassName = "h-9 w-44"
const compactSelectClassName = "h-9 w-48"

export function ReportFiltersToolbar({
  filters,
  onFilterChange,
  onGenerate,
  onToday,
  onYesterday,
  onPrint,
  onExport,
  onPdf,
}: ReportFiltersToolbarProps) {
  return (
    <>
      <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-2">
        <div className="space-y-1">
          <Label htmlFor="report-type" className="text-xs font-medium">
            Report
          </Label>
          <Select
            value={filters.reportType}
            onValueChange={(value) => onFilterChange("reportType", value)}
          >
            <SelectTrigger id="report-type" className={compactSelectClassName}>
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

        <div className="space-y-1">
          <Label htmlFor="report-date-from" className="text-xs font-medium">
            From
          </Label>
          <Input
            id="report-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onFilterChange("dateFrom", event.target.value)}
            className={compactFieldClassName}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="report-date-to" className="text-xs font-medium">
            To
          </Label>
          <Input
            id="report-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(event) => onFilterChange("dateTo", event.target.value)}
            className={compactFieldClassName}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 lg:ml-auto">
          <IconActionButton
            label="Generate Report"
            icon={Search}
            variant="default"
            onClick={onGenerate}
          />
          <Button type="button" size="sm" variant="outline" onClick={onToday}>
            Today
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onYesterday}>
            Yesterday
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-2">
        <div className="space-y-1">
          <Label htmlFor="report-location" className="text-xs font-medium">
            Location
          </Label>
          <Select
            value={filters.location}
            onValueChange={(value) => onFilterChange("location", value)}
          >
            <SelectTrigger id="report-location" className={compactSelectClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportLocationOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
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
    </>
  )
}
