import { Save } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
  ADMIN_SPLIT_PANEL_NAV_CLASS,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
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
import { UserRoleChecklist } from "@/features/user-setup/user-role-checklist"
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

  function toggleRole(role: UserSetupRole, checked: boolean) {
    setSelectedRoles((current) =>
      checked ? [...current, role] : current.filter((item) => item !== role)
    )
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
            <Button type="button" size="sm" className="gap-1.5" onClick={handleUpdate}>
              <Save className="size-3.5" />
              Update
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <div className={ADMIN_SPLIT_PANEL_NAV_CLASS}>
          <UserSetupColumn title="Navigation Menu" contentClassName="p-3">
            <NavigationMenuTree
              nodes={navigationMenuTree}
              selectedId={selectedMenuId}
              onSelect={handleSelectMenu}
            />
          </UserSetupColumn>

          <UserSetupColumn title="Roles" contentClassName="p-3">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="border-b bg-muted/50 px-3 py-2">
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  Roles
                </span>
              </div>
              <div className="p-3">
                <UserRoleChecklist
                  selectedRoles={selectedRoles}
                  onToggleRole={toggleRole}
                />
              </div>
            </div>
          </UserSetupColumn>
        </div>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>
    </AdminPageShell>
  )
}
