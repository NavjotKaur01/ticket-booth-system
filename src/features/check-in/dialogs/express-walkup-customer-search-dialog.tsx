import { useEffect, useState } from "react"
import type { RowSelectionState } from "@tanstack/react-table"

import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PhoneInputGroup } from "@/components/forms/phone-input-group"
import type { ReservationCustomerSearchResult } from "@/data/reservation-search-results"
import { ReservationSearchResultsTable } from "@/features/reservations/reservation-search-results-table"
import { useReservationCustomerSearch } from "@/hooks/use-reservation-customer-search"
import {
  EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA,
  hasReservationCustomerSearchCriteria,
  type ReservationCustomerSearchCriteria,
} from "@/lib/reservation-customer-search-criteria"

type ExpressWalkupCustomerSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  onContinue: (customer: ReservationCustomerSearchResult) => void
}

/** Desktop Express Walkup Other → customer search popup. */
export function ExpressWalkupCustomerSearchDialog({
  open,
  onOpenChange,
  connectionName,
  onContinue,
}: ExpressWalkupCustomerSearchDialogProps) {
  const [criteria, setCriteria] = useState<ReservationCustomerSearchCriteria>(
    EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA
  )
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const {
    customerResults,
    loading,
    error,
    search,
    clear,
  } = useReservationCustomerSearch({
    connectionName,
    enabled: open && Boolean(connectionName),
  })

  useEffect(() => {
    if (!open) {
      setCriteria(EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA)
      setRowSelection({})
      clear()
    }
  }, [clear, open])

  const selectedId = Object.keys(rowSelection).find((id) => rowSelection[id])
  const selectedCustomer = customerResults.find((row) => row.id === selectedId)

  function handleSearch() {
    if (!hasReservationCustomerSearchCriteria("customer", criteria)) {
      clear()
      setRowSelection({})
      return
    }

    setRowSelection({})
    void search("customer", criteria)
  }

  function handleContinue() {
    if (!selectedCustomer) {
      return
    }

    onContinue(selectedCustomer)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested
        showCloseButton
        className="flex max-h-[85vh] w-[min(92vw,48rem)] flex-col overflow-hidden p-0 sm:max-w-[48rem]"
      >
        <DialogHeader className="shrink-0 border-b bg-primary px-4 py-3 pr-12 text-primary-foreground">
          <DialogTitle className="text-base font-semibold">
            Search Customer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Last Name">
              <Input
                value={criteria.lastName}
                onChange={(event) =>
                  setCriteria((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                className="h-9 text-sm"
              />
            </FormField>
            <FormField label="First Name">
              <Input
                value={criteria.firstName}
                onChange={(event) =>
                  setCriteria((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                className="h-9 text-sm"
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={criteria.email}
                onChange={(event) =>
                  setCriteria((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="h-9 text-sm"
              />
            </FormField>
            <FormField label="Phone">
              <PhoneInputGroup
                idPrefix="express-walkup-customer-phone"
                value={{
                  area: criteria.areaCode,
                  prefix: criteria.phone1,
                  line: criteria.phone2,
                }}
                onChange={(phone) =>
                  setCriteria((current) => ({
                    ...current,
                    areaCode: phone.area,
                    phone1: phone.prefix,
                    phone2: phone.line,
                  }))
                }
                onEnter={handleSearch}
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCriteria(EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA)
                setRowSelection({})
                clear()
              }}
            >
              Clear
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <ReservationSearchResultsTable
            searchType="customer"
            customerResults={customerResults}
            businessResults={[]}
            hasSearched
            loading={loading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onResultSelect={(row) => {
              if ("email" in row) {
                setRowSelection({ [row.id]: true })
              }
            }}
          />
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedCustomer}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
