import { Plus, Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import {
  FILTER_AREA_CLASS,
  FILTER_EMAIL_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
  FILTER_SELECT_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { performers } from "@/data/performers"
import { dobMonthOptions } from "@/data/customer-form-options"
import type { MarketingFilterForm } from "@/types/marketing-filter"

type MarketingFilterFiltersCardProps = {
  filters: MarketingFilterForm
  onFilterChange: <K extends keyof MarketingFilterForm>(
    key: K,
    value: MarketingFilterForm[K]
  ) => void
  onZipCodeChange: (index: number, value: string) => void
  onSearch: () => void
  onClear: () => void
  onClearComics: () => void
  onAddComic: () => void
}

const ADDITIONAL_FILTER_OPTIONS = [
  {
    key: "excludeBanned" as const,
    label: "Do not include customer who are banned",
  },
  {
    key: "onlyWithPhone" as const,
    label: "Only include customer with phone number",
  },
  {
    key: "onlyWithEmail" as const,
    label: "Only include customer with an email address",
  },
  {
    key: "excludeInactive" as const,
    label: "Do not include inactive customer",
  },
  {
    key: "onlyWithStreetAddress" as const,
    label: "Only include customer with a street address",
  },
  {
    key: "excludeFutureReservations" as const,
    label: "Do not include customer with future reservations",
  },
  {
    key: "excludeNoCallList" as const,
    label: "Do not include customer on no call list",
  },
]

export function MarketingFilterFiltersCard({
  filters,
  onFilterChange,
  onZipCodeChange,
  onSearch,
  onClear,
  onClearComics,
  onAddComic,
}: MarketingFilterFiltersCardProps) {
  const selectedComics = filters.comedianIds
    .map((id) => performers.find((performer) => performer.id === id))
    .filter((performer) => performer != null)

  return (
    <PanelCard>
      <div className="space-y-3 p-3">
        <div className={FILTER_ROW_INNER_CLASS}>
          <Input
            placeholder="Last Name"
            value={filters.lastName}
            onChange={(event) =>
              onFilterChange("lastName", event.target.value)
            }
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="First Name"
            value={filters.firstName}
            onChange={(event) =>
              onFilterChange("firstName", event.target.value)
            }
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Email"
            value={filters.email}
            onChange={(event) => onFilterChange("email", event.target.value)}
            className={FILTER_EMAIL_CLASS}
          />
          <Select
            value={filters.birthMonth || undefined}
            onValueChange={(value) => onFilterChange("birthMonth", value)}
          >
            <SelectTrigger className={FILTER_SELECT_CLASS}>
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              {dobMonthOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Area Code"
            value={filters.areaCode}
            onChange={(event) =>
              onFilterChange("areaCode", event.target.value)
            }
            className={FILTER_AREA_CLASS}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.zipCodes.map((zipCode, index) => (
              <Input
                key={index}
                placeholder="Zip Code"
                value={zipCode}
                onChange={(event) => onZipCodeChange(index, event.target.value)}
                className="w-24 shrink-0"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Label className="shrink-0 text-xs font-medium text-foreground">
            Only include new customer since:
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDatePickerControl
              id="marketing-filter-from-date"
              value={filters.newCustomerFrom}
              onChange={(value) => onFilterChange("newCustomerFrom", value)}
              placeholder="From date"
              className="w-[10.5rem]"
            />
            <span className="text-xs text-muted-foreground">To</span>
            <CalendarDatePickerControl
              id="marketing-filter-to-date"
              value={filters.newCustomerTo}
              onChange={(value) => onFilterChange("newCustomerTo", value)}
              placeholder="To date"
              className="w-[10.5rem]"
            />
          </div>
        </div>

        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-semibold text-foreground">
            Additional Filters
          </p>
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ADDITIONAL_FILTER_OPTIONS.map((option) => (
              <label
                key={option.key}
                className="flex cursor-pointer items-start gap-2 text-xs text-foreground"
              >
                <Checkbox
                  checked={filters[option.key]}
                  onCheckedChange={(value) =>
                    onFilterChange(option.key, value === true)
                  }
                  className="mt-0.5"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-semibold text-foreground">
              Comedian Attended
            </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-h-24 flex-1 rounded-md border bg-muted/20 p-2">
              {selectedComics.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">
                  No comics selected
                </p>
              ) : (
                <ul className="space-y-1">
                  {selectedComics.map((performer) => (
                    <li
                      key={performer.id}
                      className="truncate text-sm text-foreground"
                    >
                      {performer.stageName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={onAddComic}
              >
                <Plus className="size-3.5" />
                Add Comic
              </Button>
              <IconActionButton
                label="Clear"
                icon={X}
                variant="outline"
                onClick={onClearComics}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-t pt-3">
          <IconActionButton
            label="Search"
            icon={Search}
            variant="default"
            onClick={onSearch}
          />
          <IconActionButton
            label="Clear"
            icon={X}
            variant="outline"
            onClick={onClear}
          />
        </div>
      </div>
    </PanelCard>
  )
}
