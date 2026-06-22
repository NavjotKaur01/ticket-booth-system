import { FileDown, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { userSession } from "@/data/dashboard"
import { customers } from "@/data/customers"
import { AddCustomerDialog } from "@/features/customers/add-customer-dialog"
import { CustomerDataTable } from "@/features/customers/customer-data-table"
import { CustomerSearchToolbar } from "@/features/customers/customer-search-toolbar"
import { useLocations } from "@/hooks/use-locations"
import { customerFormToSearchFilters } from "@/lib/build-save-customer-request"
import { filterCustomers } from "@/lib/filter-customers"
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

export function CommentCards() {
  const { locations } = useLocations(userSession.clubSlug)
  const locationId = locations[0]?.id ?? ""

  const [draftFilters, setDraftFilters] =
    useState<CustomerSearchFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] =
    useState<CustomerSearchFilters>(EMPTY_FILTERS)
  const [addOpen, setAddOpen] = useState(false)

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, appliedFilters),
    [appliedFilters]
  )

  function updateDraftField(
    field: keyof CustomerSearchFilters,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
  }

  function handleCustomerCreated(form: CustomerFormValues) {
    const filters = customerFormToSearchFilters(form)
    setDraftFilters(filters)
    setAppliedFilters(filters)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Comment Cards
      </h1>

      <PanelCard>
        <div className="border-b">
          <CustomerSearchToolbar
            filters={draftFilters}
            onFilterChange={updateDraftField}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Double
            click to edit and buy gift certificate
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {filteredCustomers.length}
              </span>
            </p>
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
        </div>

        <CustomerDataTable data={filteredCustomers} />
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
