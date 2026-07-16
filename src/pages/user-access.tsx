import { useCallback, useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { UserAccessDataTable } from "@/features/user-access/user-access-data-table"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { saveUserAccessibility } from "@/lib/api/user-access"
import { buildSaveUserAccessRequest } from "@/lib/build-save-user-access-request"
import { mapUserAccessPermissions } from "@/lib/map-user-access"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetUserPermissionDataQuery } from "@/store/api/clubmanApi"
import {
  getUserAccessEditableRoles,
  type PermissionRole,
  type ReportPermission,
} from "@/types/user-access"

export function UserAccess() {
  const { connectionName, locationId, username, userRight, isReady } =
    useAppSession()
  const [permissions, setPermissions] = useState<ReportPermission[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    data: apiItems = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetUserPermissionDataQuery(
    { connectionName, locationId },
    { skip: !isReady || !connectionName || !locationId }
  )

  const mappedPermissions = useMemo(
    () => mapUserAccessPermissions(apiItems, locationId),
    [apiItems, locationId]
  )

  useEffect(() => {
    setPermissions(mappedPermissions)
  }, [mappedPermissions])

  const editableRoles = useMemo(
    () => getUserAccessEditableRoles(userRight),
    [userRight]
  )

  const handleToggle = useCallback(
    (id: string, role: PermissionRole, checked: boolean) => {
      if (!editableRoles[role]) return
      setActionError(null)
      setActionMessage(null)
      setPermissions((current) =>
        current.map((item) =>
          item.id === id ? { ...item, [role]: checked } : item
        )
      )
    },
    [editableRoles]
  )

  async function handleSave() {
    if (!isReady || !connectionName || !locationId) {
      reportErrorMessage(
        setActionError,
        "Location is required before saving user access."
      )
      return
    }
    if (!editableRoles.user && !editableRoles.manager) {
      reportErrorMessage(
        setActionError,
        "You do not have permission to edit user access."
      )
      return
    }

    setSaving(true)
    setActionError(null)
    setActionMessage(null)

    try {
      const saved = await saveUserAccessibility(
        buildSaveUserAccessRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          permissions,
        })
      )
      if (!saved) {
        reportErrorMessage(setActionError, "Unable to save user access.")
        return
      }
      setActionMessage("User access saved.")
      toastSuccess("User access saved")
      await refetch()
    } catch (saveError) {
      reportError(setActionError, saveError, "Unable to save user access.")
    } finally {
      setSaving(false)
    }
  }

  const emptyMessage =
    isLoading || isFetching ? "Loading user access..." : "No reports found"

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        User Access — Reports
      </h1>

      <PanelCard>
        {error || actionError ? (
          <p className="border-b px-3 py-2 text-sm text-destructive">
            {actionError || getClubmanErrorMessage(error)}
          </p>
        ) : null}
        {actionMessage ? (
          <p className="border-b px-3 py-2 text-sm text-foreground">
            {actionMessage}
          </p>
        ) : null}

        <UserAccessDataTable
          data={permissions}
          emptyMessage={emptyMessage}
          editableRoles={editableRoles}
          onToggle={handleToggle}
        />

        <div className="border-t px-3 py-2">
          <Button
            type="button"
            size="sm"
            disabled={saving || isLoading}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </PanelCard>
    </div>
  )
}
