import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { MultiSelect } from "@/components/forms/multi-select"
import { AdminPageShell, AdminPageTitle } from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import { modifyUserOptions, USER_SETUP_ROLES, YES_NO_OPTIONS, type UserSetupRole } from "@/data/user-setup"
import { cn } from "@/lib/utils"
import {
  EMPTY_MODIFY_USER_FORM,
  type ModifyUserFormValues,
} from "@/types/user-setup"

const MODIFY_USER_FIELD_ROW_CLASS =
  "grid gap-2 sm:grid-cols-[8.5rem_24rem] sm:items-center"

const MODIFY_USER_FORM_CLASS = "w-full sm:w-[33rem]"

const MODIFY_USER_LABEL_CLASS = "text-xs font-medium text-foreground"

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

      <PanelCard className="w-fit max-w-full">
        <div className="p-3 sm:p-4">
          <div className={cn("space-y-4", MODIFY_USER_FORM_CLASS)}>
            <div className={MODIFY_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="modify-user-select" className={MODIFY_USER_LABEL_CLASS}>
                Users
              </Label>
              <Select
                value={selectedUserId}
                onValueChange={(value) => {
                  setSelectedUserId(value)
                  setMessage(null)
                }}
              >
                <SelectTrigger id="modify-user-select" className="h-9 w-full">
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
            </div>

            <div className={MODIFY_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="modify-user-email" className={MODIFY_USER_LABEL_CLASS}>
                Email Address
              </Label>
              <Input
                id="modify-user-email"
                type="email"
                className="h-9"
                value={form.email}
                disabled={!selectedUser}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>

            <div className={MODIFY_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="modify-user-locked-out" className={MODIFY_USER_LABEL_CLASS}>
                Locked Out
              </Label>
              <Select
                value={form.lockedOut}
                onValueChange={(value) =>
                  updateField("lockedOut", value as ModifyUserFormValues["lockedOut"])
                }
                disabled={!selectedUser}
              >
                <SelectTrigger id="modify-user-locked-out" className="h-9 w-full">
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
            </div>

            <div className={MODIFY_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="modify-user-suspended" className={MODIFY_USER_LABEL_CLASS}>
                Suspended
              </Label>
              <Select
                value={form.suspended}
                onValueChange={(value) =>
                  updateField("suspended", value as ModifyUserFormValues["suspended"])
                }
                disabled={!selectedUser}
              >
                <SelectTrigger id="modify-user-suspended" className="h-9 w-full">
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
            </div>

            <div className={MODIFY_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="modify-user-roles" className={MODIFY_USER_LABEL_CLASS}>
                Roles
              </Label>
              <MultiSelect
                id="modify-user-roles"
                options={USER_SETUP_ROLES}
                selected={form.roles}
                onChange={(roles) => updateField("roles", roles as UserSetupRole[])}
                placeholder="Select roles"
                searchPlaceholder="Search roles..."
                emptyMessage="No roles match your search."
                itemNoun="roles"
                disabled={!selectedUser}
              />
            </div>

            {message ? (
              <div className={MODIFY_USER_FIELD_ROW_CLASS}>
                <div className="hidden sm:block" />
                <UserSetupFeedback
                  message={message}
                  variant={messageVariant}
                  className="rounded-md border px-3 py-2"
                />
              </div>
            ) : null}

            <div className={cn(MODIFY_USER_FIELD_ROW_CLASS, "pt-1")}>
              <div className="hidden sm:block" />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={!selectedUser}
                  onClick={handleUpdate}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </AdminPageShell>
  )
}
