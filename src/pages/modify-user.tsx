import { Save } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { FormField } from "@/components/forms/form-fields"
import {
  AdminPageShell,
  AdminPageTitle,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserSetupActionBar } from "@/features/user-setup/user-setup-action-bar"
import { UserSetupColumn } from "@/features/user-setup/user-setup-column"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import { UserRoleChecklist } from "@/features/user-setup/user-role-checklist"
import {
  modifyUserOptions,
  YES_NO_OPTIONS,
  type UserSetupRole,
} from "@/data/user-setup"
import {
  EMPTY_MODIFY_USER_FORM,
  type ModifyUserFormValues,
} from "@/types/user-setup"

export function ModifyUser() {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [form, setForm] = useState<ModifyUserFormValues>(EMPTY_MODIFY_USER_FORM)
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  const selectedUser = useMemo(
    () => modifyUserOptions.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId]
  )

  useEffect(() => {
    if (!selectedUser) {
      setForm(EMPTY_MODIFY_USER_FORM)
      return
    }

    setForm({
      email: selectedUser.email,
      lockedOut: selectedUser.lockedOut,
      suspended: selectedUser.suspended,
      roles: [...selectedUser.roles],
    })
    setMessage(null)
  }, [selectedUser])

  function updateField<K extends keyof ModifyUserFormValues>(
    field: K,
    value: ModifyUserFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setMessage(null)
  }

  function toggleRole(role: UserSetupRole, checked: boolean) {
    setForm((current) => ({
      ...current,
      roles: checked
        ? [...current.roles, role]
        : current.roles.filter((item) => item !== role),
    }))
    setMessage(null)
  }

  function handleUpdate() {
    if (!selectedUser) {
      setMessageVariant("error")
      setMessage("Select a user to update.")
      return
    }
    if (!form.email.trim()) {
      setMessageVariant("error")
      setMessage("Email address is required.")
      return
    }

    setMessageVariant("success")
    setMessage(`User "${selectedUser.label}" updated successfully.`)
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>Modify Users</AdminPageTitle>

      <PanelCard>
        <div className="border-b px-3 py-3 sm:px-4">
          <FormField label="Users" htmlFor="modify-user-select">
            <Select
              value={selectedUserId}
              onValueChange={(value) => {
                setSelectedUserId(value)
                setMessage(null)
              }}
            >
              <SelectTrigger id="modify-user-select" className="h-9 w-full max-w-md">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {modifyUserOptions.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <UserSetupColumn title="Selected User Info">
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <FormField label="Email Address" htmlFor="modify-user-email">
              <Input
                id="modify-user-email"
                type="email"
                value={form.email}
                disabled={!selectedUser}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Locked Out" htmlFor="modify-user-locked-out">
                <Select
                  value={form.lockedOut}
                  onValueChange={(value) =>
                    updateField("lockedOut", value as ModifyUserFormValues["lockedOut"])
                  }
                  disabled={!selectedUser}
                >
                  <SelectTrigger id="modify-user-locked-out" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Suspended" htmlFor="modify-user-suspended">
                <Select
                  value={form.suspended}
                  onValueChange={(value) =>
                    updateField("suspended", value as ModifyUserFormValues["suspended"])
                  }
                  disabled={!selectedUser}
                >
                  <SelectTrigger id="modify-user-suspended" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Roles">
              <UserRoleChecklist
                selectedRoles={form.roles}
                onToggleRole={toggleRole}
                disabled={!selectedUser}
              />
            </FormField>
          </div>
        </UserSetupColumn>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}

        <UserSetupActionBar>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            disabled={!selectedUser}
            onClick={handleUpdate}
          >
            <Save className="size-4" />
            Update
          </Button>
        </UserSetupActionBar>
      </PanelCard>
    </AdminPageShell>
  )
}
