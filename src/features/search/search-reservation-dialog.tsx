import { Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
import {
  createFilterSearchHandlers,
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

const INPUT_CLASS = "h-9 w-full min-w-0"
const CUSTOMER_FIELD_CLASS = "min-w-0 flex-1 basis-[8.5rem]"
const CUSTOMER_PHONE_FIELD_CLASS = "min-w-0 flex-[1.35] basis-[12rem]"
const SINGLE_FIELD_CLASS = "min-w-0 w-full sm:max-w-xs sm:flex-1 sm:basis-[12rem]"

type SearchReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SearchCriteriaActions({
  onClear,
}: {
  onClear: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <IconActionButton
        label="Search"
        icon={Search}
        variant="default"
        type="submit"
      />
      <IconActionButton
        label="Clear"
        icon={X}
        variant="outline"
        onClick={onClear}
      />
    </div>
  )
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

  function handleSearch() {
    setAppliedFilters(draftFilters)
    setSearched(true)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
    setAppliedFilters(DEFAULT_RESERVATION_SEARCH_FILTERS)
    setSearched(true)
  }

  const { handleSubmit, handleInputKeyDown } =
    createFilterSearchHandlers(handleSearch)

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

  function renderCriteriaFields() {
    switch (draftFilters.option) {
      case "confirmation-number":
        return (
          <FormField
            label="Confirmation Number"
            htmlFor="search-confirmation-number"
            className={SINGLE_FIELD_CLASS}
          >
            <Input
              id="search-confirmation-number"
              value={draftFilters.confirmationNumber}
              onChange={(event) =>
                updateDraftField("confirmationNumber", event.target.value)
              }
              onKeyDown={handleInputKeyDown}
              className={INPUT_CLASS}
            />
          </FormField>
        )

      case "customer":
        return (
          <>
            <FormField
              label="Last Name"
              htmlFor="search-last-name"
              className={CUSTOMER_FIELD_CLASS}
            >
              <Input
                id="search-last-name"
                value={draftFilters.lastName}
                onChange={(event) =>
                  updateDraftField("lastName", event.target.value)
                }
                onKeyDown={handleInputKeyDown}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField
              label="First Name"
              htmlFor="search-first-name"
              className={CUSTOMER_FIELD_CLASS}
            >
              <Input
                id="search-first-name"
                value={draftFilters.firstName}
                onChange={(event) =>
                  updateDraftField("firstName", event.target.value)
                }
                onKeyDown={handleInputKeyDown}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label="Phone" className={CUSTOMER_PHONE_FIELD_CLASS}>
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
              className={CUSTOMER_FIELD_CLASS}
            >
              <Input
                id="search-since"
                type="date"
                value={draftFilters.since}
                onChange={(event) =>
                  updateDraftField("since", event.target.value)
                }
                className={INPUT_CLASS}
              />
            </FormField>
          </>
        )

      case "comedian":
        return (
          <FormField
            label="Comedian"
            htmlFor="search-comedian"
            className={SINGLE_FIELD_CLASS}
          >
            <Input
              id="search-comedian"
              value={draftFilters.comedian}
              onChange={(event) =>
                updateDraftField("comedian", event.target.value)
              }
              onKeyDown={handleInputKeyDown}
              className={INPUT_CLASS}
            />
          </FormField>
        )

      case "date":
        return (
          <FormField
            label="Show Date"
            htmlFor="search-show-date"
            className={SINGLE_FIELD_CLASS}
          >
            <Input
              id="search-show-date"
              type="date"
              value={draftFilters.showDate}
              onChange={(event) =>
                updateDraftField("showDate", event.target.value)
              }
              className={INPUT_CLASS}
            />
          </FormField>
        )

      case "payment":
        return (
          <FormField
            label="Payment Reference"
            htmlFor="search-payment-reference"
            className={SINGLE_FIELD_CLASS}
          >
            <Input
              id="search-payment-reference"
              value={draftFilters.paymentReference}
              onChange={(event) =>
                updateDraftField("paymentReference", event.target.value)
              }
              onKeyDown={handleInputKeyDown}
              className={INPUT_CLASS}
            />
          </FormField>
        )

      default:
        return null
    }
  }

  const criteriaTitle =
    draftFilters.option === "customer" ? "Customer Search" : "Search Criteria"

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

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          <PanelCard>
            <form className="space-y-4 p-3" onSubmit={handleSubmit}>
              <FormSection title="Reservation Option" className="space-y-2">
                <RadioGroup
                  value={draftFilters.option}
                  onValueChange={(value) =>
                    updateDraftField(
                      "option",
                      value as ReservationSearchOption
                    )
                  }
                  className="flex flex-wrap gap-x-5 gap-y-2"
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

              <div className="border-t border-border/60 pt-4">
                <FormSection title={criteriaTitle} className="space-y-3">
                  <div className="flex flex-wrap items-end gap-2">
                    {renderCriteriaFields()}
                    <SearchCriteriaActions onClear={handleClear} />
                  </div>
                </FormSection>
              </div>
            </form>
          </PanelCard>

          <PanelCard>
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
