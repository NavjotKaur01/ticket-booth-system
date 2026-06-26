import { FileDown, Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { AddBusinessContactDialog } from "@/features/business-contacts/add-business-contact-dialog"
import { BusinessContactDataTable } from "@/features/business-contacts/business-contact-data-table"
import { BusinessContactDetailsDialog } from "@/features/business-contacts/business-contact-details-dialog"
import { BusinessContactToolbar } from "@/features/business-contacts/business-contact-toolbar"
import { useAppSession } from "@/hooks/use-app-session"
import { useBusinessContactSearch } from "@/hooks/use-business-contact-search"
import {
  archiveBusinessContact,
  getBusinessContactDeleteDetail,
} from "@/lib/api/business-contacts"
import { businessFormToSearchFilters } from "@/lib/map-business-contact-form"
import {
  EMPTY_BUSINESS_CONTACT_FILTERS,
  type BusinessContact,
  type BusinessContactFormValues,
} from "@/types/business-contact"

export function BusinessContacts() {
  const { connectionName, locationId, username, userRight, isReady } =
    useAppSession()

  const { contacts, loading, error, hasSearched, search, clear } =
    useBusinessContactSearch({
      connectionName,
      locationId,
      enabled: isReady,
    })

  const [draftFilters, setDraftFilters] = useState(
    EMPTY_BUSINESS_CONTACT_FILTERS
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editContact, setEditContact] = useState<BusinessContact | null>(null)
  const [detailsContact, setDetailsContact] = useState<BusinessContact | null>(
    null
  )
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  function updateDraftField(
    field: keyof typeof EMPTY_BUSINESS_CONTACT_FILTERS,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setActionError(null)
    void search(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_BUSINESS_CONTACT_FILTERS)
    setActionError(null)
    clear()
  }

  async function handleContactSaved(form: BusinessContactFormValues) {
    const filters = businessFormToSearchFilters(form)
    setDraftFilters(filters)
    await search(filters)
  }

  function handleOpenAdd() {
    setEditContact(null)
    setAddOpen(true)
  }

  function handleOpenEdit(contact: BusinessContact) {
    setDetailsOpen(false)
    setDetailsContact(null)
    setEditContact(contact)
    setAddOpen(true)
  }

  function handleAddOpenChange(open: boolean) {
    setAddOpen(open)
    if (!open) {
      setEditContact(null)
    }
  }

  function handleOpenDetails(contact: BusinessContact) {
    setDetailsContact(contact)
    setDetailsOpen(true)
  }

  function handleDetailsOpenChange(open: boolean) {
    setDetailsOpen(open)
    if (!open) {
      setDetailsContact(null)
    }
  }

  async function handleDelete(contact: BusinessContact) {
    setActionError(null)

    if (
      !window.confirm("Are you sure you want to delete this business contact?")
    ) {
      return
    }

    try {
      const detail = await getBusinessContactDeleteDetail({
        ConnectioString: connectionName,
        LocationId: locationId,
        BusinessId: contact.id,
        LastUpdateID: username,
        LastUpdateDt: new Date().toISOString(),
        TodayDate: new Date().toISOString(),
      })

      if (!detail) {
        setActionError("Business contact does not exist.")
        return
      }

      const canDelete =
        detail.LastUpdateID === username || userRight === "SEC01"

      if (!canDelete) {
        setActionError("You do not have rights to delete this business contact.")
        return
      }

      await archiveBusinessContact({
        connectionName,
        locationId,
        businessId: contact.id,
        lastUpdateId: username,
      })

      setDetailsOpen(false)
      setDetailsContact(null)
      await search(draftFilters)
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete business contact."
      )
    }
  }

  const tableLoading = loading
  const emptyMessage = tableLoading
    ? "Searching business contacts..."
    : hasSearched
      ? "No record found"
      : "Enter search criteria and click Search"

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
            <span className="font-semibold text-foreground">Note:</span> Double
            click a row to view business details
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {contacts.length}
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
              onClick={handleOpenAdd}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </div>

        {error || actionError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {error ?? actionError}
          </p>
        ) : null}

        <BusinessContactDataTable
          data={contacts}
          loading={tableLoading}
          emptyMessage={emptyMessage}
          onDetails={handleOpenDetails}
          onEdit={handleOpenEdit}
          onDelete={(contact) => void handleDelete(contact)}
        />
      </PanelCard>

      <BusinessContactDetailsDialog
        open={detailsOpen}
        onOpenChange={handleDetailsOpenChange}
        contact={detailsContact}
        connectionName={connectionName}
        locationId={locationId}
        onEdit={handleOpenEdit}
        onDelete={(contact) => void handleDelete(contact)}
      />

      <AddBusinessContactDialog
        open={addOpen}
        onOpenChange={handleAddOpenChange}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        contact={editContact}
        onSaved={handleContactSaved}
      />
    </div>
  )
}
