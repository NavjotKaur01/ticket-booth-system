import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { MultiSelect } from "@/components/forms/multi-select"
import { AdminPageShell, AdminPageTitle } from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import { USER_SETUP_ROLES, type UserSetupRole } from "@/data/user-setup"
import { cn } from "@/lib/utils"
import {
  EMPTY_CREATE_USER_FORM,
  type CreateUserFormValues,
} from "@/types/user-setup"

const CREATE_USER_FIELD_ROW_CLASS =
  "grid gap-2 sm:grid-cols-[8.5rem_24rem] sm:items-center"

const CREATE_USER_FORM_CLASS = "w-full sm:w-[33rem]"

const CREATE_USER_LABEL_CLASS = "text-xs font-medium text-foreground"

export function CreateUser() {
  const [form, setForm] = useState<CreateUserFormValues>(EMPTY_CREATE_USER_FORM)
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  function updateField<K extends keyof CreateUserFormValues>(
    field: K,
    value: CreateUserFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setMessage(null)
  }

  function handleCreate() {
    if (!form.userName.trim()) {
      setMessageVariant("error")
      setMessage("User name is required.")
      return
    }
    if (!form.password) {
      setMessageVariant("error")
      setMessage("Password is required.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setMessageVariant("error")
      setMessage("Passwords do not match.")
      return
    }

    setMessageVariant("success")
    setMessage(`User "${form.userName.trim()}" created successfully.`)
    setForm(EMPTY_CREATE_USER_FORM)
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>Create User</AdminPageTitle>

      <PanelCard className="w-fit max-w-full">
        <div className="p-3 sm:p-4">
          <div className={cn("space-y-4", CREATE_USER_FORM_CLASS)}>
            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="create-user-name" className={CREATE_USER_LABEL_CLASS}>
                User Name
              </Label>
              <Input
                id="create-user-name"
                className="h-9"
                value={form.userName}
                onChange={(event) => updateField("userName", event.target.value)}
              />
            </div>

            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="create-user-password" className={CREATE_USER_LABEL_CLASS}>
                Password
              </Label>
              <Input
                id="create-user-password"
                type="password"
                className="h-9"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
              />
            </div>

            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label
                htmlFor="create-user-confirm-password"
                className={CREATE_USER_LABEL_CLASS}
              >
                Confirm Password
              </Label>
              <Input
                id="create-user-confirm-password"
                type="password"
                className="h-9"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
              />
            </div>

            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="create-user-email" className={CREATE_USER_LABEL_CLASS}>
                E-mail
              </Label>
              <Input
                id="create-user-email"
                type="email"
                className="h-9"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>

            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="create-user-roles" className={CREATE_USER_LABEL_CLASS}>
                Roles
              </Label>
              <MultiSelect
                id="create-user-roles"
                options={USER_SETUP_ROLES}
                selected={form.roles}
                onChange={(roles) => updateField("roles", roles as UserSetupRole[])}
                placeholder="Select roles"
                searchPlaceholder="Search roles..."
                emptyMessage="No roles match your search."
                itemNoun="roles"
              />
            </div>

            {message ? (
              <div className={CREATE_USER_FIELD_ROW_CLASS}>
                <div className="hidden sm:block" />
                <UserSetupFeedback
                  message={message}
                  variant={messageVariant}
                  className="rounded-md border px-3 py-2"
                />
              </div>
            ) : null}

            <div className={cn(CREATE_USER_FIELD_ROW_CLASS, "pt-1")}>
              <div className="hidden sm:block" />
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={handleCreate}>
                  Create User
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </AdminPageShell>
  )
}
