import { FileDown, Plus } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { ExportDataDialog } from "@/components/common/export-data-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { AddCustomerDialog } from "@/features/customers/add-customer-dialog"
import { CustomerDataTable } from "@/features/customers/customer-data-table"
import { CustomerDetailsDialog } from "@/features/customers/customer-details-dialog"
import { CustomerSearchToolbar } from "@/features/customers/customer-search-toolbar"
import { useAppSession } from "@/hooks/use-app-session"
import { useCustomerSearch } from "@/hooks/use-customer-search"
import { reportError, toastError, toastSuccess } from "@/lib/app-toast"
import { customerFormToSearchFilters } from "@/lib/build-save-customer-request"
import { deleteCustomerRecord } from "@/lib/delete-customer"
import { exportCustomerRecords } from "@/lib/export-customers"
import type { ExportFormat } from "@/lib/export-table-data"
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

export function CommentCards() {
  const navigate = useNavigate()
  const { connectionName, locationId, username, userRight, isReady } =
    useAppSession()

  const {
    customers,
    exportRows,
    loading,
    error,
    hasSearched,
    search,
    removeCustomer,
    clear,
  } = useCustomerSearch({
    connectionName,
    locationId,
    enabled: isReady,
  })

  const [draftFilters, setDraftFilters] =
    useState<CustomerSearchFilters>(EMPTY_FILTERS)
  const [addOpen, setAddOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  function updateDraftField(
    field: keyof CustomerSearchFilters,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setActionError(null)
    void search(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_FILTERS)
    setActionError(null)
    clear()
  }

  async function handleCustomerSaved(form: CustomerFormValues) {
    const filters = customerFormToSearchFilters(form)
    setDraftFilters(filters)
    await search(filters)
  }

  function handleOpenAdd() {
    setEditCustomer(null)
    setAddOpen(true)
  }

  function handleOpenEdit(customer: Customer) {
    setDetailsOpen(false)
    setDetailsCustomer(null)
    setEditCustomer(customer)
    setAddOpen(true)
  }

  function handleAddOpenChange(open: boolean) {
    setAddOpen(open)
    if (!open) {
      setEditCustomer(null)
    }
  }

  function handleOpenDetails(customer: Customer) {
    setAddOpen(false)
    setEditCustomer(null)
    setDetailsCustomer(customer)
    setDetailsOpen(true)
  }

  function handleDetailsOpenChange(open: boolean) {
    setDetailsOpen(open)
    if (!open) {
      setDetailsCustomer(null)
    }
  }

  function handleBuyCertificate(customer: Customer) {
    setDetailsOpen(false)
    setDetailsCustomer(null)
    navigate(ROUTES.giftCertificate, {
      state: { customerId: customer.id },
    })
  }

  function handleExportOpen() {
    if (loading) {
      toastError("Please wait while loading data....")
      return
    }

    if (exportRows.length === 0) {
      toastError("Please search customer first!")
      return
    }

    setExportOpen(true)
  }

  function handleExport(format: ExportFormat) {
    return exportCustomerRecords(exportRows, format)
  }

  async function handleDelete(customer: Customer) {
    setActionError(null)

    try {
      const deleted = await deleteCustomerRecord({
        customer,
        connectionName,
        username,
        userRight,
      })

      if (!deleted) {
        return
      }

      removeCustomer(customer.id)
      setDetailsOpen(false)
      setDetailsCustomer(null)
      setAddOpen(false)
      setEditCustomer(null)
      toastSuccess("Customer deleted")
    } catch (requestError) {
      reportError(setActionError, requestError, "Unable to delete customer.")
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
            click to view details and buy gift certificate
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {customers.length}
              </span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExportOpen}
            >
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

        <CustomerDataTable
          data={customers}
          loading={tableLoading}
          emptyMessage={emptyMessage}
          onDetails={handleOpenDetails}
          onEdit={handleOpenEdit}
          onDelete={(customer) => void handleDelete(customer)}
        />
      </PanelCard>

      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={handleDetailsOpenChange}
        customer={detailsCustomer}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        onBuyCertificate={handleBuyCertificate}
        onDelete={(customer) => void handleDelete(customer)}
        onCustomerSaved={handleCustomerSaved}
      />

      <AddCustomerDialog
        open={addOpen}
        onOpenChange={handleAddOpenChange}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        customer={editCustomer}
        onSaved={handleCustomerSaved}
      />

      <ExportDataDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
      />
    </div>
  )
}
