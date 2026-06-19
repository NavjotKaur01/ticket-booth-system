import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { adminUsers } from "@/data/users"
import { AddUserDialog } from "@/features/users/add-user-dialog"
import { AdminUserDataTable } from "@/features/users/admin-user-data-table"
import { AdminUserFiltersCard } from "@/features/users/admin-user-filters-card"
import { filterAdminUsers } from "@/lib/filter-admin-users"
import { EMPTY_ADMIN_USER_FILTERS } from "@/types/user-admin"

export function Users() {
  const [draftFilters, setDraftFilters] = useState(EMPTY_ADMIN_USER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_ADMIN_USER_FILTERS)
  const [addOpen, setAddOpen] = useState(false)

  const filteredUsers = useMemo(
    () => filterAdminUsers(adminUsers, appliedFilters),
    [appliedFilters]
  )

  function updateDraftField(
    field: keyof typeof EMPTY_ADMIN_USER_FILTERS,
    value: string
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_ADMIN_USER_FILTERS)
    setAppliedFilters(EMPTY_ADMIN_USER_FILTERS)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        User
      </h1>

      <AdminUserFiltersCard
        filters={draftFilters}
        onFilterChange={updateDraftField}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <PanelCard>
        <div className="flex shrink-0 items-center justify-end gap-2 border-b p-3">
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

        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredUsers.length}
            </span>
          </p>
        </div>

        <AdminUserDataTable data={filteredUsers} />
      </PanelCard>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
