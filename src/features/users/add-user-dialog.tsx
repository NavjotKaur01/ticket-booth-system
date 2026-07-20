import { Eye, EyeOff } from "lucide-react"
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
import { userStatusOptions } from "@/data/users"
import { useSecurityLevelOptions } from "@/hooks/use-security-level-options"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { saveSystemUser } from "@/lib/api/system-users"
import { buildSaveSystemUserRequest } from "@/lib/build-save-system-user-request"
import {
  EMPTY_ADMIN_USER_FORM,
  type AdminUserFormValues,
} from "@/types/user-admin"

type AddUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  lastUpdateId: string
  onSaved?: () => Promise<void>
}

export function AddUserDialog({
  open,
  onOpenChange,
  connectionName,
  locationId,
  lastUpdateId,
  onSaved,
}: AddUserDialogProps) {
  const [form, setForm] = useState<AdminUserFormValues>(EMPTY_ADMIN_USER_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { options: securityOptions, isLoading: securityLoading } =
    useSecurityLevelOptions({ skip: !open })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_ADMIN_USER_FORM)
      setSaving(false)
      setError(null)
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [open])

  function updateField<K extends keyof AdminUserFormValues>(
    field: K,
    value: AdminUserFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
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

    return null
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError) {
      reportErrorMessage(setError, validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      await saveSystemUser(
        buildSaveSystemUserRequest({
          connectionName,
          locationId,
          lastUpdateId,
          form,
        })
      )

      toastSuccess("User saved")
      await onSaved?.()
      onOpenChange(false)
    } catch (requestError) {
      reportError(setError, requestError, "Failed to save user")
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
            <span className="font-semibold text-foreground">Add User</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          {error ? (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Last Name" htmlFor="add-user-last-name">
              <Input
                id="add-user-last-name"
                value={form.lastName}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
              />
            </FormField>

            <FormField label="First Name" htmlFor="add-user-first-name">
              <Input
                id="add-user-first-name"
                value={form.firstName}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
            </FormField>

            <FormField label="Email" htmlFor="add-user-email">
              <Input
                id="add-user-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </FormField>

            <FormField label="Username" htmlFor="add-user-username">
              <Input
                id="add-user-username"
                value={form.userName}
                onChange={(event) =>
                  updateField("userName", event.target.value)
                }
              />
            </FormField>

            <FormField label="Password" htmlFor="add-user-password">
              <div className="relative">
                <Input
                  id="add-user-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" htmlFor="add-user-confirm-password">
              <div className="relative">
                <Input
                  id="add-user-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <Eye className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            <FormField label="Security">
              <Select
                value={form.security || undefined}
                onValueChange={(value) => updateField("security", value)}
                disabled={securityLoading || securityOptions.length === 0}
              >
                <SelectTrigger className="w-full">
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
