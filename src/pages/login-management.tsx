import { useCallback, useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import { customerLogins as initialRecords } from "@/data/customer-logins"
import { LoginManagementDataTable } from "@/features/login-management/login-management-data-table"
import { LoginManagementDialog } from "@/features/login-management/login-management-dialog"
import { LoginManagementFiltersCard } from "@/features/login-management/login-management-filters-card"
import { useAppSession } from "@/hooks/use-app-session"
import { filterCustomerLogins } from "@/lib/filter-customer-logins"
import type {
  CustomerLogin,
  CustomerLoginSearchFilters,
  CustomerLoginTableFilters,
} from "@/types/customer-login"
import {
  EMPTY_CUSTOMER_LOGIN_SEARCH,
  EMPTY_CUSTOMER_LOGIN_TABLE_FILTERS,
} from "@/types/customer-login"

export function LoginManagement() {
  const { locationId, locationName } = useAppSession()
  const [rows, setRows] = useState<CustomerLogin[]>(initialRecords)
  const [draftSearch, setDraftSearch] =
    useState<CustomerLoginSearchFilters>(EMPTY_CUSTOMER_LOGIN_SEARCH)
  const [appliedSearch, setAppliedSearch] =
    useState<CustomerLoginSearchFilters>(EMPTY_CUSTOMER_LOGIN_SEARCH)
  const [tableFilters, setTableFilters] = useState<CustomerLoginTableFilters>(
    EMPTY_CUSTOMER_LOGIN_TABLE_FILTERS
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<CustomerLogin | null>(null)

  useEffect(() => {
    if (!locationId) {
      return
    }

    setRows((current) => {
      const usesPlaceholderLocation = current.every(
        (row) => row.locationId === "standupmedia"
      )

      if (!usesPlaceholderLocation) {
        return current
      }

      return current.map((row) =>
        row.locationId === "standupmedia"
          ? {
              ...row,
              locationId,
              locationLabel: locationName || row.locationLabel,
            }
          : row
      )
    })
  }, [locationId, locationName])

  const filteredRows = useMemo(
    () => filterCustomerLogins(rows, locationId, appliedSearch, tableFilters),
    [appliedSearch, locationId, rows, tableFilters]
  )

  function updateDraftSearch(
    field: keyof CustomerLoginSearchFilters,
    value: string
  ) {
    setDraftSearch((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedSearch(draftSearch)
  }

  function updateTableFilter<K extends keyof CustomerLoginTableFilters>(
    key: K,
    value: CustomerLoginTableFilters[K]
  ) {
    setTableFilters((current) => ({ ...current, [key]: value }))
  }

  const handleEdit = useCallback((record: CustomerLogin) => {
    setEditingRecord(record)
    setDialogOpen(true)
  }, [])

  function handleSave(record: CustomerLogin) {
    setRows((current) =>
      current.map((row) => (row.id === record.id ? record : row))
    )
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Customer Login Management
      </h1>

      <LoginManagementFiltersCard
        filters={draftSearch}
        onFilterChange={updateDraftSearch}
        onSearch={handleSearch}
      />

      <PanelCard>
        <div className={`${FILTER_ROW_INNER_CLASS} border-b px-3 py-3`}>
          <Input
            placeholder="Customer ID"
            value={tableFilters.customerId}
            onChange={(event) => updateTableFilter("customerId", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="First Name"
            value={tableFilters.firstName}
            onChange={(event) => updateTableFilter("firstName", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Last Name"
            value={tableFilters.lastName}
            onChange={(event) => updateTableFilter("lastName", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Email"
            value={tableFilters.email}
            onChange={(event) => updateTableFilter("email", event.target.value)}
            className={FILTER_INPUT_CLASS}
          />
          <Input
            placeholder="Banned"
            value={tableFilters.banned}
            onChange={(event) => updateTableFilter("banned", event.target.value)}
            className="h-9 w-full sm:w-24"
          />
          <Input
            placeholder="Inactive"
            value={tableFilters.inactive}
            onChange={(event) => updateTableFilter("inactive", event.target.value)}
            className="h-9 w-full sm:w-24"
          />
          <Input
            placeholder="Active"
            value={tableFilters.active}
            onChange={(event) => updateTableFilter("active", event.target.value)}
            className="h-9 w-full sm:w-24"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Drag a column header here to group by that column
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredRows.length}
            </span>
          </p>
        </div>

        <LoginManagementDataTable data={filteredRows} onEdit={handleEdit} />
      </PanelCard>

      <LoginManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
        onSaved={handleSave}
      />
    </div>
  )
}
