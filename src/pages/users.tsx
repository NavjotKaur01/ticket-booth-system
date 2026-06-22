import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { userSession } from "@/data/dashboard"
import { AddUserDialog } from "@/features/users/add-user-dialog"
import { AdminUserDataTable } from "@/features/users/admin-user-data-table"
import { AdminUserFiltersCard } from "@/features/users/admin-user-filters-card"
import { EditUserDialog } from "@/features/users/edit-user-dialog"
import { useLocations } from "@/hooks/use-locations"
import { useSystemUsers } from "@/hooks/use-system-users"
import { syncFiltersAfterUserEdit } from "@/lib/admin-user-form"
import { filterAdminUsers } from "@/lib/filter-admin-users"
import { EMPTY_ADMIN_USER_FILTERS, type AdminUser } from "@/types/user-admin"

export function Users() {
  const { locations, loading: locationsLoading } = useLocations(
    userSession.clubSlug
  )
  const locationId = locations[0]?.id ?? ""

  const { users, loading: usersLoading, error: usersError, refresh, upsertUser } =
    useSystemUsers({
      organization: userSession.organization,
      locationId,
      userId: userSession.userId,
      userRight: userSession.userRight,
      enabled: !locationsLoading && Boolean(locationId),
    })

  const [draftFilters, setDraftFilters] = useState(EMPTY_ADMIN_USER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_ADMIN_USER_FILTERS)
  const [addOpen, setAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const filteredUsers = useMemo(
    () => filterAdminUsers(users, appliedFilters),
    [users, appliedFilters]
  )

  const loading = locationsLoading || usersLoading

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

  async function handleUserUpdated(updatedUser: AdminUser) {
    if (!editingUser) {
      return
    }

    upsertUser(updatedUser)
    setDraftFilters((current) =>
      syncFiltersAfterUserEdit(editingUser, updatedUser, current)
    )
    setAppliedFilters((current) =>
      syncFiltersAfterUserEdit(editingUser, updatedUser, current)
    )
    await refresh({ silent: true })
  }

  async function handleUserCreated() {
    await refresh({ silent: true })
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

        {usersError ? (
          <p className="px-3 py-2 text-sm text-destructive">{usersError}</p>
        ) : null}

        <AdminUserDataTable
          data={filteredUsers}
          loading={loading}
          onEdit={setEditingUser}
        />
      </PanelCard>

      <AddUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        connectionName={userSession.organization}
        locationId={locationId}
        lastUpdateId={userSession.username}
        onSaved={handleUserCreated}
      />

      <EditUserDialog
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null)
          }
        }}
        user={editingUser}
        connectionName={userSession.organization}
        locationId={locationId}
        lastUpdateId={userSession.username}
        onSaved={handleUserUpdated}
      />
    </div>
  )
}
