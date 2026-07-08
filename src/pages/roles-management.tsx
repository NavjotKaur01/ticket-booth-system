import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createSystemRole, systemRoles as initialRoles } from "@/data/system-roles"
import { RolesManagementList } from "@/features/roles-management/roles-management-list"
import { UserSetupColumn } from "@/features/user-setup/user-setup-column"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import type { SystemRole } from "@/types/system-role"

export function RolesManagement() {
  const [roles, setRoles] = useState<SystemRole[]>(initialRoles)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [newRoleName, setNewRoleName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  function toggleRole(roleId: string, checked: boolean) {
    setSelectedRoleIds((current) =>
      checked ? [...current, roleId] : current.filter((id) => id !== roleId)
    )
    setMessage(null)
  }

  function handleRemove() {
    if (selectedRoleIds.length === 0) {
      setMessageVariant("error")
      setMessage("Select at least one role to remove.")
      return
    }

    const count = selectedRoleIds.length
    setRoles((current) => current.filter((role) => !selectedRoleIds.includes(role.id)))
    setSelectedRoleIds([])
    setMessageVariant("success")
    setMessage(`Removed ${count} role(s).`)
  }

  function handleAddRole() {
    const trimmed = newRoleName.trim()
    if (!trimmed) {
      setMessageVariant("error")
      setMessage("Enter a role name to add.")
      return
    }

    const exists = roles.some(
      (role) => role.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) {
      setMessageVariant("error")
      setMessage(`Role "${trimmed}" already exists.`)
      return
    }

    const role = createSystemRole(trimmed)
    setRoles((current) => [...current, role])
    setNewRoleName("")
    setMessageVariant("success")
    setMessage(`Role "${role.name}" added.`)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Roles Management
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Roles:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {roles.length}
            </span>
            {" · "}
            Selected:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {selectedRoleIds.length}
            </span>
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleRemove}
          >
            <Trash2 className="size-3.5" />
            Remove
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 lg:divide-x">
          <UserSetupColumn title="Roles" contentClassName="p-3">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="border-b bg-muted/50 px-3 py-2">
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  Role Name
                </span>
              </div>
              <div className="p-3">
                <RolesManagementList
                  roles={roles}
                  selectedRoleIds={selectedRoleIds}
                  onToggleRole={toggleRole}
                />
              </div>
            </div>
          </UserSetupColumn>

          <UserSetupColumn title="Add Role" contentClassName="p-3">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="border-b bg-muted/50 px-3 py-2">
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  New Role
                </span>
              </div>
              <div className="space-y-4 p-4">
                <FormField label="New Role" htmlFor="new-role-name">
                  <Input
                    id="new-role-name"
                    value={newRoleName}
                    placeholder="Enter role name"
                    onChange={(event) => {
                      setNewRoleName(event.target.value)
                      setMessage(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        handleAddRole()
                      }
                    }}
                  />
                </FormField>

                <Button type="button" className="gap-1.5" onClick={handleAddRole}>
                  <Plus className="size-4" />
                  Add Role
                </Button>
              </div>
            </div>
          </UserSetupColumn>
        </div>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>
    </div>
  )
}
