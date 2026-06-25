import { FileDown, Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { AddCustomerDialog } from "@/features/customers/add-customer-dialog"
import { CustomerDataTable } from "@/features/customers/customer-data-table"
import { CustomerDetailsDialog } from "@/features/customers/customer-details-dialog"
import { CustomerFiltersCard } from "@/features/customers/customer-filters-card"
import { useAppSession } from "@/hooks/use-app-session"
import { useCustomerSearch } from "@/hooks/use-customer-search"
import { customerFormToSearchFilters } from "@/lib/build-save-customer-request"
import type { Customer, CustomerSearchFilters } from "@/types/customer"
import type { CustomerFormValues } from "@/types/customer-form"

const EMPTY_FILTERS: CustomerSearchFilters = {
  lastName: "",
  firstName: "",
  email: "",
  areaCode: "",
  phone1: "",
  phone2: "",
}

export function SearchCustomer() {
  const { connectionName, locationId, username, isReady } = useAppSession()

  const { customers, loading, error, hasSearched, search, clear } = useCustomerSearch({
    connectionName,
    locationId,
    enabled: isReady,
  })

  const [draftFilters, setDraftFilters] =
    useState<CustomerSearchFilters>(EMPTY_FILTERS)
  const [addOpen, setAddOpen] = useState(false)
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  function updateDraftField(
    field: keyof CustomerSearchFilters,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    void search(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_FILTERS)
    clear()
  }

  async function handleCustomerCreated(form: CustomerFormValues) {
    const filters = customerFormToSearchFilters(form)
    setDraftFilters(filters)
    await search(filters)
  }

  function handleOpenDetails(customer: Customer) {
    setDetailsCustomer(customer)
    setDetailsOpen(true)
  }

  function handleDetailsOpenChange(open: boolean) {
    setDetailsOpen(open)
    if (!open) {
      setDetailsCustomer(null)
    }
  }

  const tableLoading = loading
  const emptyMessage = tableLoading
    ? "Searching customers..."
    : hasSearched
      ? "No record found"
      : "Enter search criteria and click Search"

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Search Customer
      </h1>

      <CustomerFiltersCard
        filters={draftFilters}
        onFilterChange={updateDraftField}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <PanelCard>
        <div className="flex shrink-0 items-center justify-end gap-2 border-b p-3">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileDown className="size-3.5" />
            Export
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Double
            click to edit and buy gift certificate
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {customers.length}
            </span>
          </p>
        </div>

        {error ? (
          <p className="px-3 py-2 text-sm text-destructive">{error}</p>
        ) : null}

        <CustomerDataTable
          data={customers}
          loading={tableLoading}
          emptyMessage={emptyMessage}
          onDetails={handleOpenDetails}
        />
      </PanelCard>

      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={handleDetailsOpenChange}
        customer={detailsCustomer}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        onCustomerSaved={handleCustomerCreated}
      />

      <AddCustomerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        onSaved={handleCustomerCreated}
      />
    </div>
  )
}
