import { useEffect, useState } from "react"

import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { securityLevelOptions, userStatusOptions } from "@/data/users"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  adminUserToFormValues,
  formValuesToAdminUser,
} from "@/lib/admin-user-form"
import { updateSystemUser } from "@/lib/api/system-users"
import { buildUpdateSystemUserRequest } from "@/lib/build-update-system-user-request"
import {
  EMPTY_ADMIN_USER_FORM,
  type AdminUser,
  type AdminUserFormValues,
} from "@/types/user-admin"

type EditUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  connectionName: string
  locationId: string
  lastUpdateId: string
  onSaved?: (user: AdminUser) => Promise<void> | void
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  connectionName,
  locationId,
  lastUpdateId,
  onSaved,
}: EditUserDialogProps) {
  const [form, setForm] = useState<AdminUserFormValues>(EMPTY_ADMIN_USER_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !user) {
      setForm(EMPTY_ADMIN_USER_FORM)
      setSaving(false)
      setError(null)
      return
    }

    setForm(adminUserToFormValues(user))
    setSaving(false)
    setError(null)
  }, [open, user])

  function updateField<K extends keyof AdminUserFormValues>(
    field: K,
    value: AdminUserFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validateForm() {
    if (!user) {
      return "User is required."
    }
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
      return "Location is required before updating a user."
    }

    return null
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError || !user) {
      if (validationError) {
        reportErrorMessage(setError, validationError)
      }
      return
    }

    setSaving(true)
    setError(null)

    try {
      const request = buildUpdateSystemUserRequest({
        connectionName,
        locationId,
        lastUpdateId,
        userId: user.id,
        form,
      })

      await updateSystemUser(request)

      const updatedUser = formValuesToAdminUser(user, form, lastUpdateId)
      toastSuccess("User updated")
      await onSaved?.(updatedUser)
      onOpenChange(false)
    } catch (requestError) {
      reportError(setError, requestError, "Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Edit User</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          {error ? (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Last Name" htmlFor="edit-user-last-name">
              <Input
                id="edit-user-last-name"
                value={form.lastName}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
              />
            </FormField>

            <FormField label="First Name" htmlFor="edit-user-first-name">
              <Input
                id="edit-user-first-name"
                value={form.firstName}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
            </FormField>

            <FormField label="Email" htmlFor="edit-user-email">
              <Input
                id="edit-user-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </FormField>

            <FormField label="Username" htmlFor="edit-user-username">
              <Input
                id="edit-user-username"
                value={form.userName}
                onChange={(event) =>
                  updateField("userName", event.target.value)
                }
              />
            </FormField>

            <FormField label="Password" htmlFor="edit-user-password">
              <Input
                id="edit-user-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
              />
            </FormField>

            <FormField label="Confirm Password" htmlFor="edit-user-confirm-password">
              <Input
                id="edit-user-confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
              />
            </FormField>

            <FormField label="Security">
              <Select
                value={form.security || undefined}
                onValueChange={(value) => updateField("security", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Security Level" />
                </SelectTrigger>
                <SelectContent>
                  {securityLevelOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select
                value={form.status}
                onValueChange={(value) => updateField("status", value)}
              >
                <SelectTrigger className="w-full">
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
            </FormField>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2 sm:justify-end">
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
