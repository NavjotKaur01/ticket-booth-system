import { Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
import {
  FormField,
  FormSection,
  IconActionButton,
} from "@/components/forms/form-fields"
import { PhoneInputGroup } from "@/components/forms/phone-input-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { reservationSearchResults } from "@/data/search-reservations"
import { searchReservationColumns } from "@/features/search/search-reservation-columns"
import { filterReservationSearchResults } from "@/lib/filter-search-reservations"
import {
  DEFAULT_RESERVATION_SEARCH_FILTERS,
  RESERVATION_SEARCH_OPTIONS,
  type ReservationSearchFilters,
  type ReservationSearchOption,
} from "@/types/search-reservation"

const compactFieldClass = "w-full shrink-0 sm:w-36"
const compactDateClass = "w-full shrink-0 sm:w-40"

type SearchReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchReservationDialog({
  open,
  onOpenChange,
}: SearchReservationDialogProps) {
  const [draftFilters, setDraftFilters] = useState(
    DEFAULT_RESERVATION_SEARCH_FILTERS
  )
  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_RESERVATION_SEARCH_FILTERS
  )
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!open) {
      setDraftFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
      setAppliedFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
      setSearched(false)
      return
    }

    setDraftFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
    setAppliedFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
    setSearched(true)
  }, [open])

  const results = useMemo(
    () =>
      filterReservationSearchResults(
        reservationSearchResults,
        appliedFilters,
        searched
      ),
    [appliedFilters, searched]
  )

  function updateDraftField<K extends keyof ReservationSearchFilters>(
    field: K,
    value: ReservationSearchFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
    setSearched(true)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
    setAppliedFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
    setSearched(true)
  }

  function renderCriteriaFields() {
    switch (draftFilters.option) {
      case "confirmation-number":
        return (
          <FormField
            label="Confirmation Number"
            htmlFor="search-confirmation-number"
            className="w-full shrink-0 sm:w-48"
          >
            <Input
              id="search-confirmation-number"
              value={draftFilters.confirmationNumber}
              onChange={(event) =>
                updateDraftField("confirmationNumber", event.target.value)
              }
              className="h-9"
            />
          </FormField>
        )

      case "customer":
        return (
          <>
            <FormField
              label="Last Name"
              htmlFor="search-last-name"
              className={compactFieldClass}
            >
              <Input
                id="search-last-name"
                value={draftFilters.lastName}
                onChange={(event) =>
                  updateDraftField("lastName", event.target.value)
                }
                className="h-9"
              />
            </FormField>
            <FormField
              label="First Name"
              htmlFor="search-first-name"
              className={compactFieldClass}
            >
              <Input
                id="search-first-name"
                value={draftFilters.firstName}
                onChange={(event) =>
                  updateDraftField("firstName", event.target.value)
                }
                className="h-9"
              />
            </FormField>
            <FormField label="Phone" className="shrink-0">
              <PhoneInputGroup
                idPrefix="search-phone"
                value={{
                  area: draftFilters.phoneArea,
                  prefix: draftFilters.phonePrefix,
                  line: draftFilters.phoneLine,
                }}
                onChange={(value) => {
                  updateDraftField("phoneArea", value.area)
                  updateDraftField("phonePrefix", value.prefix)
                  updateDraftField("phoneLine", value.line)
                }}
              />
            </FormField>
            <FormField
              label="Since"
              htmlFor="search-since"
              className={compactDateClass}
            >
              <Input
                id="search-since"
                type="date"
                value={draftFilters.since}
                onChange={(event) =>
                  updateDraftField("since", event.target.value)
                }
                className="h-9"
              />
            </FormField>
          </>
        )

      case "comedian":
        return (
          <FormField
            label="Comedian"
            htmlFor="search-comedian"
            className="w-full shrink-0 sm:w-48"
          >
            <Input
              id="search-comedian"
              value={draftFilters.comedian}
              onChange={(event) =>
                updateDraftField("comedian", event.target.value)
              }
              className="h-9"
            />
          </FormField>
        )

      case "date":
        return (
          <FormField
            label="Show Date"
            htmlFor="search-show-date"
            className={compactDateClass}
          >
            <Input
              id="search-show-date"
              type="date"
              value={draftFilters.showDate}
              onChange={(event) =>
                updateDraftField("showDate", event.target.value)
              }
              className="h-9"
            />
          </FormField>
        )

      case "payment":
        return (
          <FormField
            label="Payment Reference"
            htmlFor="search-payment-reference"
            className="w-full shrink-0 sm:w-48"
          >
            <Input
              id="search-payment-reference"
              value={draftFilters.paymentReference}
              onChange={(event) =>
                updateDraftField("paymentReference", event.target.value)
              }
              className="h-9"
            />
          </FormField>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-4xl flex-col overflow-hidden p-0 sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Search</span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <PanelCard>
            <div className="space-y-2 border-b p-3">
              <FormSection title="Reservation Option" className="space-y-1.5">
                <RadioGroup
                  value={draftFilters.option}
                  onValueChange={(value) =>
                    updateDraftField(
                      "option",
                      value as ReservationSearchOption
                    )
                  }
                  className="flex flex-wrap gap-x-4 gap-y-1"
                >
                  {RESERVATION_SEARCH_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`search-option-${option.value}`}
                      />
                      <Label
                        htmlFor={`search-option-${option.value}`}
                        className="text-sm font-normal"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormSection>

              {draftFilters.option === "customer" ? (
                <FormSection title="Customer Search" className="space-y-1.5">
                  <div className="flex flex-wrap items-end gap-2">
                    {renderCriteriaFields()}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <IconActionButton
                        label="Search"
                        icon={Search}
                        variant="default"
                        onClick={handleSearch}
                      />
                      <IconActionButton
                        label="Clear"
                        icon={X}
                        onClick={handleClear}
                      />
                    </div>
                  </div>
                </FormSection>
              ) : (
                <div className="flex flex-wrap items-end gap-2">
                  {renderCriteriaFields()}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <IconActionButton
                      label="Search"
                      icon={Search}
                      variant="default"
                      onClick={handleSearch}
                    />
                    <IconActionButton
                      label="Clear"
                      icon={X}
                      onClick={handleClear}
                    />
                  </div>
                </div>
              )}
            </div>

            <DataTable
              columns={searchReservationColumns}
              data={results}
              emptyMessage="No record found"
              entityLabel="records"
            />
          </PanelCard>
        </div>
      </DialogContent>
    </Dialog>
  )
}
