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
import {
  EMPTY_ADMIN_USER_FORM,
  type AdminUserFormValues,
} from "@/types/user-admin"

type AddUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const [form, setForm] = useState<AdminUserFormValues>(EMPTY_ADMIN_USER_FORM)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_ADMIN_USER_FORM)
    }
  }, [open])

  function updateField<K extends keyof AdminUserFormValues>(
    field: K,
    value: AdminUserFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    onOpenChange(false)
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
              <Input
                id="add-user-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
              />
            </FormField>

            <FormField label="Confirm Password" htmlFor="add-user-confirm-password">
              <Input
                id="add-user-confirm-password"
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
