import { FileDown, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { businessContacts } from "@/data/business-contacts"
import { AddBusinessContactDialog } from "@/features/business-contacts/add-business-contact-dialog"
import { BusinessContactDataTable } from "@/features/business-contacts/business-contact-data-table"
import { BusinessContactToolbar } from "@/features/business-contacts/business-contact-toolbar"
import { filterBusinessContacts } from "@/lib/filter-business-contacts"
import { EMPTY_BUSINESS_CONTACT_FILTERS } from "@/types/business-contact"

export function BusinessContacts() {
  const [draftFilters, setDraftFilters] = useState(EMPTY_BUSINESS_CONTACT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(
    EMPTY_BUSINESS_CONTACT_FILTERS
  )
  const [addOpen, setAddOpen] = useState(false)

  const filteredContacts = useMemo(
    () => filterBusinessContacts(businessContacts, appliedFilters),
    [appliedFilters]
  )

  function updateDraftField(
    field: keyof typeof EMPTY_BUSINESS_CONTACT_FILTERS,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_BUSINESS_CONTACT_FILTERS)
    setAppliedFilters(EMPTY_BUSINESS_CONTACT_FILTERS)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Business Contacts
      </h1>

      <PanelCard>
        <div className="border-b">
          <BusinessContactToolbar
            filters={draftFilters}
            onFilterChange={updateDraftField}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredContacts.length}
            </span>
          </p>
          <div className="flex items-center gap-2">
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

        <BusinessContactDataTable data={filteredContacts} />
      </PanelCard>

      <AddBusinessContactDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
