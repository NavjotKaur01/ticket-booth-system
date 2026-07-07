import { RefreshCw } from "lucide-react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
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
import { sanitizeRefreshSecondsInput } from "@/lib/parse-refresh-interval"
import type { ShowOption } from "@/types/reservation"
import type { TransactionFilters } from "@/types/transaction"

function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

type TransactionToolbarProps = {
  filters: TransactionFilters
  shows: ShowOption[]
  showsLoading?: boolean
  showsError?: string | null
  onFilterChange: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void
  onRefresh: () => void
}

export function TransactionToolbar({
  filters,
  shows,
  showsLoading = false,
  showsError = null,
  onFilterChange,
  onRefresh,
}: TransactionToolbarProps) {
  const fieldClassName = "h-9 w-44"

  return (
    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
      <div className="space-y-1">
        <Label htmlFor="transaction-show-date" className="text-xs font-medium">
          Show Date
        </Label>
        <div className="flex items-center gap-1.5">
          <CalendarDatePickerControl
            id="transaction-show-date"
            value={filters.showDate}
            onChange={(value) => onFilterChange("showDate", value)}
            className={fieldClassName}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 shrink-0"
            onClick={() => onFilterChange("showDate", todayDateValue())}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="transaction-show-time" className="text-xs font-medium">
          Show Time
        </Label>
        <Select
          value={filters.showTimeId || undefined}
          onValueChange={(value) => onFilterChange("showTimeId", value)}
          disabled={showsLoading || shows.length === 0}
        >
          <SelectTrigger id="transaction-show-time" className={fieldClassName}>
            <SelectValue
              placeholder={
                showsLoading
                  ? "Loading shows..."
                  : shows.length === 0
                    ? "No shows found"
                    : "Select show"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {shows.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showsError ? (
          <p className="text-xs text-destructive">{showsError}</p>
        ) : null}
      </div>

      <div className="space-y-1 sm:ml-auto">
        <Label htmlFor="transaction-refresh" className="text-xs font-medium">
          Refresh
        </Label>
        <div className="flex items-center gap-1.5">
          <Input
            id="transaction-refresh"
            inputMode="numeric"
            value={filters.refreshSeconds}
            onChange={(event) =>
              onFilterChange(
                "refreshSeconds",
                sanitizeRefreshSecondsInput(event.target.value)
              )
            }
            className="w-16 tabular-nums"
          />
          <IconActionButton
            label="Refresh"
            icon={RefreshCw}
            variant="default"
            onClick={onRefresh}
          />
        </div>
      </div>
    </div>
  )
}
