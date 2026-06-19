import { FileDown, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { customers } from "@/data/customers"
import { AddCustomerDialog } from "@/features/customers/add-customer-dialog"
import { CustomerDataTable } from "@/features/customers/customer-data-table"
import { CustomerFiltersCard } from "@/features/customers/customer-filters-card"
import { filterCustomers } from "@/lib/filter-customers"
import type { CustomerSearchFilters } from "@/types/customer"

const EMPTY_FILTERS: CustomerSearchFilters = {
  lastName: "",
  firstName: "",
  email: "",
  areaCode: "",
  phone1: "",
  phone2: "",
}

export function SearchCustomer() {
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

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Search Customer
      </h1>

      <CustomerFiltersCard
        filters={draftFilters}
        onFilterChange={updateDraftField}
        onSearch={handleSearch}
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
              {filteredCustomers.length}
            </span>
          </p>
        </div>

        <CustomerDataTable data={filteredCustomers} />
      </PanelCard>

      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
