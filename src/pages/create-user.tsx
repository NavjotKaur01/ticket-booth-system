import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
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
import { userStatusOptions } from "@/data/users"
import { useAppSession } from "@/hooks/use-app-session"
import { useSecurityLevelOptions } from "@/hooks/use-security-level-options"
import { getErrorMessage, toastError, toastSuccess } from "@/lib/app-toast"
import { saveSystemUser } from "@/lib/api/system-users"
import { buildSaveSystemUserRequest } from "@/lib/build-save-system-user-request"
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
  const {
    connectionName,
    locationId,
    username,
    isReady,
  } = useAppSession()
  const { options: securityOptions, isLoading: securityLoading } =
    useSecurityLevelOptions({ skip: !isReady })

  const [form, setForm] = useState<CreateUserFormValues>(EMPTY_CREATE_USER_FORM)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">(
    "success"
  )

  function updateField<K extends keyof CreateUserFormValues>(
    field: K,
    value: CreateUserFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setMessage(null)
  }

  function validateForm() {
    if (!form.lastName.trim()) {
      return "Last name is required."
    }
    if (!form.firstName.trim()) {
      return "First name is required."
    }
    if (!form.userName.trim()) {
      return "Username is required."
    }
    if (!form.password) {
      return "Password is required."
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match."
    }
    if (!form.security) {
      return "Security level is required."
    }
    if (!locationId) {
      return "Location is required before creating a user."
    }
    if (!connectionName) {
      return "Organization is required before creating a user."
    }

    return null
  }

  async function handleCreate() {
    const validationError = validateForm()
    if (validationError) {
      setMessageVariant("error")
      setMessage(validationError)
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      await saveSystemUser(
        buildSaveSystemUserRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          form,
        })
      )

      toastSuccess("User saved")
      setMessageVariant("success")
      setMessage(`User "${form.userName.trim()}" created successfully.`)
      setForm(EMPTY_CREATE_USER_FORM)
    } catch (requestError) {
      const text = getErrorMessage(requestError, "Failed to save user")
      setMessageVariant("error")
      setMessage(text)
      toastError(text)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>Create User</AdminPageTitle>

      <PanelCard className="w-fit max-w-full">
        <div className="p-3 sm:p-4">
          <div className={cn("space-y-4", CREATE_USER_FORM_CLASS)}>
            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="create-user-last-name" className={CREATE_USER_LABEL_CLASS}>
                Last Name
              </Label>
              <Input
                id="create-user-last-name"
                className="h-9"
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
              />
            </div>

            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label htmlFor="create-user-first-name" className={CREATE_USER_LABEL_CLASS}>
                First Name
              </Label>
              <Input
                id="create-user-first-name"
                className="h-9"
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
              />
            </div>

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
              <Label className={CREATE_USER_LABEL_CLASS}>Security</Label>
              <Select
                value={form.security || undefined}
                onValueChange={(value) => updateField("security", value)}
                disabled={securityLoading || securityOptions.length === 0}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue
                    placeholder={
                      securityLoading ? "Loading..." : "Security Level"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {securityOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={CREATE_USER_FIELD_ROW_CLASS}>
              <Label className={CREATE_USER_LABEL_CLASS}>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => updateField("status", value)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userStatusOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Button
                  type="button"
                  size="sm"
                  disabled={saving || !isReady}
                  onClick={() => void handleCreate()}
                >
                  {saving ? "Saving..." : "Create User"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </AdminPageShell>
  )
}
