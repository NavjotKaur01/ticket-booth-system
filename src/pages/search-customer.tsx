import { FileDown, Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { userSession } from "@/data/dashboard"
import { AddCustomerDialog } from "@/features/customers/add-customer-dialog"
import { CustomerDataTable } from "@/features/customers/customer-data-table"
import { CustomerFiltersCard } from "@/features/customers/customer-filters-card"
import { useCustomerSearch } from "@/hooks/use-customer-search"
import { useLocations } from "@/hooks/use-locations"
import { customerFormToSearchFilters } from "@/lib/build-save-customer-request"
import type { CustomerSearchFilters } from "@/types/customer"
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
  const { locations, loading: locationsLoading } = useLocations(
    userSession.clubSlug
  )
  const locationId = locations[0]?.id ?? ""

  const { customers, loading, error, hasSearched, search, clear } = useCustomerSearch({
    connectionName: userSession.organization,
    locationId,
    enabled: !locationsLoading && Boolean(locationId),
  })

  const [draftFilters, setDraftFilters] =
    useState<CustomerSearchFilters>(EMPTY_FILTERS)
  const [addOpen, setAddOpen] = useState(false)

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

  const tableLoading = locationsLoading || loading
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
        />
      </PanelCard>

      <AddCustomerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        connectionName={userSession.organization}
        locationId={locationId}
        lastUpdateId={userSession.username}
        onSaved={handleCustomerCreated}
      />
    </div>
  )
}
