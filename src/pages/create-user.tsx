import { UserPlus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserSetupColumn } from "@/features/user-setup/user-setup-column"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import { UserRoleChecklist } from "@/features/user-setup/user-role-checklist"
import type { UserSetupRole } from "@/data/user-setup"
import {
  EMPTY_CREATE_USER_FORM,
  type CreateUserFormValues,
} from "@/types/user-setup"

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

  function toggleRole(role: UserSetupRole, checked: boolean) {
    setForm((current) => ({
      ...current,
      roles: checked
        ? [...current.roles, role]
        : current.roles.filter((item) => item !== role),
    }))
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
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Create User
      </h1>

      <PanelCard>
        <div className="grid lg:grid-cols-2 lg:divide-x">
          <UserSetupColumn title="Sign Up for Your New Account">
            <div className="mx-auto w-full max-w-sm space-y-4">
              <FormField label="User Name" htmlFor="create-user-name">
                <Input
                  id="create-user-name"
                  value={form.userName}
                  onChange={(event) => updateField("userName", event.target.value)}
                />
              </FormField>

              <FormField label="Password" htmlFor="create-user-password">
                <Input
                  id="create-user-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </FormField>

              <FormField label="Confirm Password" htmlFor="create-user-confirm-password">
                <Input
                  id="create-user-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                />
              </FormField>

              <FormField label="E-mail" htmlFor="create-user-email">
                <Input
                  id="create-user-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </FormField>

              <Button type="button" className="gap-1.5" onClick={handleCreate}>
                <UserPlus className="size-4" />
                Create User
              </Button>
            </div>
          </UserSetupColumn>

          <UserSetupColumn title="Select roles for this user">
            <UserRoleChecklist
              selectedRoles={form.roles}
              onToggleRole={toggleRole}
            />
          </UserSetupColumn>
        </div>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>
    </div>
  )
}
