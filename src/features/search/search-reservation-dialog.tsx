import { Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
import { FormField, FormSection, IconActionButton } from "@/components/forms/form-fields"
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
    }
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
    setSearched(false)
  }

  function renderCriteriaFields() {
    switch (draftFilters.option) {
      case "confirmation-number":
        return (
          <FormField
            label="Confirmation Number"
            htmlFor="search-confirmation-number"
          >
            <Input
              id="search-confirmation-number"
              value={draftFilters.confirmationNumber}
              onChange={(event) =>
                updateDraftField("confirmationNumber", event.target.value)
              }
            />
          </FormField>
        )

      case "customer":
        return (
          <div className="space-y-3">
            <FormSection title="Customer Search">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Last Name" htmlFor="search-last-name">
                  <Input
                    id="search-last-name"
                    value={draftFilters.lastName}
                    onChange={(event) =>
                      updateDraftField("lastName", event.target.value)
                    }
                  />
                </FormField>
                <FormField label="First Name" htmlFor="search-first-name">
                  <Input
                    id="search-first-name"
                    value={draftFilters.firstName}
                    onChange={(event) =>
                      updateDraftField("firstName", event.target.value)
                    }
                  />
                </FormField>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-[5rem_5rem_minmax(0,1fr)]">
                <FormField label="Phone" htmlFor="search-phone-area">
                  <Input
                    id="search-phone-area"
                    value={draftFilters.phoneArea}
                    onChange={(event) =>
                      updateDraftField("phoneArea", event.target.value)
                    }
                    className="sm:col-start-1"
                  />
                </FormField>
                <Input
                  aria-label="Phone prefix"
                  value={draftFilters.phonePrefix}
                  onChange={(event) =>
                    updateDraftField("phonePrefix", event.target.value)
                  }
                  className="sm:col-start-2 sm:mt-5"
                />
                <Input
                  aria-label="Phone line"
                  value={draftFilters.phoneLine}
                  onChange={(event) =>
                    updateDraftField("phoneLine", event.target.value)
                  }
                  className="sm:col-start-3 sm:mt-5"
                />
              </div>

              <div className="mt-3 max-w-xs">
                <FormField label="Since" htmlFor="search-since">
                  <Input
                    id="search-since"
                    type="date"
                    value={draftFilters.since}
                    onChange={(event) =>
                      updateDraftField("since", event.target.value)
                    }
                  />
                </FormField>
              </div>
            </FormSection>
          </div>
        )

      case "comedian":
        return (
          <FormField label="Comedian" htmlFor="search-comedian">
            <Input
              id="search-comedian"
              value={draftFilters.comedian}
              onChange={(event) =>
                updateDraftField("comedian", event.target.value)
              }
            />
          </FormField>
        )

      case "date":
        return (
          <FormField label="Show Date" htmlFor="search-show-date">
            <Input
              id="search-show-date"
              type="date"
              value={draftFilters.showDate}
              onChange={(event) =>
                updateDraftField("showDate", event.target.value)
              }
              className="max-w-xs"
            />
          </FormField>
        )

      case "payment":
        return (
          <FormField label="Payment Reference" htmlFor="search-payment-reference">
            <Input
              id="search-payment-reference"
              value={draftFilters.paymentReference}
              onChange={(event) =>
                updateDraftField("paymentReference", event.target.value)
              }
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
        className="flex max-h-[92vh] max-w-6xl flex-col overflow-hidden p-0 sm:max-w-6xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Search</span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <PanelCard>
            <div className="grid gap-4 border-b p-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
              <FormSection title="Reservation Option">
                <RadioGroup
                  value={draftFilters.option}
                  onValueChange={(value) =>
                    updateDraftField(
                      "option",
                      value as ReservationSearchOption
                    )
                  }
                  className="space-y-2"
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

              <div className="space-y-3">
                {renderCriteriaFields()}

                <div className="flex items-center gap-1.5">
                  <IconActionButton
                    label="Search"
                    icon={Search}
                    variant="default"
                    onClick={handleSearch}
                  />
                  <IconActionButton label="Clear" icon={X} onClick={handleClear} />
                </div>
              </div>
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
