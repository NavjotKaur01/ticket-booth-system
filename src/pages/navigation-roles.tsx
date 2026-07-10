import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/forms/multi-select"
import {
  navigationMenuTree,
  navigationRoleAssignments,
  USER_SETUP_ROLES,
} from "@/data/navigation-admin"
import {
  findNavigationMenuLabel,
  NavigationMenuTree,
} from "@/features/navigation-admin/navigation-menu-tree"
import { UserSetupColumn } from "@/features/user-setup/user-setup-column"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import type { UserSetupRole } from "@/data/user-setup"

export function NavigationRoles() {
  const [selectedMenuId, setSelectedMenuId] = useState("home")
  const [roleMap, setRoleMap] = useState<Record<string, UserSetupRole[]>>(() => ({
    ...navigationRoleAssignments,
  }))
  const [selectedRoles, setSelectedRoles] = useState<UserSetupRole[]>(
    navigationRoleAssignments.home ?? []
  )
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  const selectedMenuLabel = useMemo(
    () => findNavigationMenuLabel(navigationMenuTree, selectedMenuId),
    [selectedMenuId]
  )

  function handleSelectMenu(id: string) {
    setSelectedMenuId(id)
    setSelectedRoles(roleMap[id] ?? [])
    setMessage(null)
  }

  function toggleAllRoles() {
    setSelectedRoles((current) =>
      current.length === USER_SETUP_ROLES.length ? [] : [...USER_SETUP_ROLES]
    )
    setMessage(null)
  }

  function handleUpdate() {
    setRoleMap((current) => ({
      ...current,
      [selectedMenuId]: selectedRoles,
    }))
    setMessageVariant("success")
    setMessage(`Roles updated for "${selectedMenuLabel}".`)
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>
        Administration - Roles Management to Navigation Menu(s)
      </AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar>
          <AdminPanelStats>
            Menu:{" "}
            <span className="font-semibold text-foreground">{selectedMenuLabel}</span>
            {" · "}
            Roles:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {selectedRoles.length}
            </span>
          </AdminPanelStats>

          <AdminPanelActions>
            <Button type="button" variant="outline" size="sm" onClick={toggleAllRoles}>
              Toggle All Roles
            </Button>
            <Button type="button" size="sm" onClick={handleUpdate}>
              Update
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <div className="border-b px-3 py-3 sm:px-4">
          <div className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,24rem)] sm:items-center">
            <Label htmlFor="navigation-roles" className="text-xs font-medium text-foreground">
              Roles
            </Label>
            <MultiSelect
              id="navigation-roles"
              options={USER_SETUP_ROLES}
              selected={selectedRoles}
              onChange={(roles) => {
                setSelectedRoles(roles as UserSetupRole[])
                setMessage(null)
              }}
              placeholder="Select roles"
              searchPlaceholder="Search roles..."
              emptyMessage="No roles match your search."
              itemNoun="roles"
            />
          </div>
        </div>

        <UserSetupColumn title="Navigation Menu" contentClassName="p-3">
          <NavigationMenuTree
            nodes={navigationMenuTree}
            selectedId={selectedMenuId}
            onSelect={handleSelectMenu}
          />
        </UserSetupColumn>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>
    </AdminPageShell>
  )
}
