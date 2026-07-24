import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useAuth } from "@/contexts/auth-context"
import { AddUserDialog } from "@/features/users/add-user-dialog"
import { AdminUserDataTable } from "@/features/users/admin-user-data-table"
import { AdminUserFiltersCard } from "@/features/users/admin-user-filters-card"
import { EditUserDialog } from "@/features/users/edit-user-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import { useSystemUsers } from "@/hooks/use-system-users"
import { confirmDialog } from "@/lib/app-dialog"
import { reportError, reportErrorMessage, toastError, toastSuccess } from "@/lib/app-toast"
import { archiveSystemCustomer } from "@/lib/api/system-users"
import { buildArchiveSystemCustomerRequest } from "@/lib/build-archive-system-customer-request"
import { syncFiltersAfterUserEdit } from "@/lib/admin-user-form"
import { filterAdminUsers } from "@/lib/filter-admin-users"
import { EMPTY_ADMIN_USER_FILTERS, type AdminUser } from "@/types/user-admin"

export function Users() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    connectionName,
    locationId,
    userId,
    userRight,
    username,
    isReady,
  } = useAppSession()

  const { users, loading: usersLoading, error: usersError, refresh, upsertUser } =
    useSystemUsers({
      organization: connectionName,
      locationId,
      userId,
      userRight,
      enabled: isReady,
    })

  const [draftFilters, setDraftFilters] = useState(EMPTY_ADMIN_USER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_ADMIN_USER_FILTERS)
  const [addOpen, setAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredUsers = useMemo(
    () => filterAdminUsers(users, appliedFilters),
    [users, appliedFilters]
  )

  useEffect(() => {
    if (usersError) {
      toastError(usersError)
    }
  }, [usersError])

  const loading = usersLoading

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

  async function handleDelete(user: AdminUser) {
    if (!isReady || !connectionName || !locationId) {
      reportErrorMessage(
        setActionError,
        "Location is required before deleting a user."
      )
      return
    }

    const confirmed = await confirmDialog({
      title: "Delete User",
      description: "Are you sure you want to delete?",
    })
    if (!confirmed) return

    setActionError(null)
    try {
      await archiveSystemCustomer(
        buildArchiveSystemCustomerRequest({
          connectionName,
          locationId,
          userId: user.id,
        })
      )

      // ClubMan logs out when the signed-in user deletes themselves.
      if (user.id.toLowerCase() === userId.toLowerCase()) {
        logout()
        navigate(ROUTES.login, { replace: true })
        return
      }

      await refresh({ silent: true })
      toastSuccess("User deleted")
    } catch (deleteError) {
      reportError(setActionError, deleteError, "Unable to delete user.")
    }
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

        {usersError || actionError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {actionError || usersError}
          </p>
        ) : null}

        <AdminUserDataTable
          data={filteredUsers}
          loading={loading}
          onEdit={setEditingUser}
          onDelete={(user) => void handleDelete(user)}
        />
      </PanelCard>

      <AddUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
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
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        onSaved={handleUserUpdated}
      />
    </div>
  )
}
