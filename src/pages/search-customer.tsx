import { FileDown, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { customers } from "@/data/customers"
import { CustomerDataTable } from "@/features/customers/customer-data-table"
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

      <PanelCard>
        <div className="flex flex-col gap-3 border-b p-3 xl:flex-row xl:items-end xl:gap-2">
          <Input
            placeholder="Last Name"
            value={draftFilters.lastName}
            onChange={(event) =>
              updateDraftField("lastName", event.target.value)
            }
            className="xl:max-w-[9rem]"
          />
          <Input
            placeholder="First Name"
            value={draftFilters.firstName}
            onChange={(event) =>
              updateDraftField("firstName", event.target.value)
            }
            className="xl:max-w-[9rem]"
          />
          <Input
            placeholder="Email"
            value={draftFilters.email}
            onChange={(event) => updateDraftField("email", event.target.value)}
            className="min-w-0 flex-1"
          />
          <Input
            placeholder="Area Code"
            value={draftFilters.areaCode}
            onChange={(event) =>
              updateDraftField("areaCode", event.target.value)
            }
            className="xl:max-w-[7rem]"
          />
          <Input
            placeholder="Phone1"
            value={draftFilters.phone1}
            onChange={(event) => updateDraftField("phone1", event.target.value)}
            className="xl:max-w-[8rem]"
          />
          <Input
            placeholder="Phone2"
            value={draftFilters.phone2}
            onChange={(event) => updateDraftField("phone2", event.target.value)}
            className="xl:max-w-[8rem]"
          />

          <div className="flex shrink-0 items-center gap-2 xl:ml-auto">
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={handleSearch}
            >
              <Search className="size-3.5" />
              Search
            </Button>
            <Button type="button" size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileDown className="size-3.5" />
              Export
            </Button>
          </div>
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
    </div>
  )
}
