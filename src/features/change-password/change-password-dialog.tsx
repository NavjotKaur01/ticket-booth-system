import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  EMPTY_CHANGE_PASSWORD_FORM,
  type ChangePasswordFormValues,
} from "@/types/change-password"

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [form, setForm] = useState<ChangePasswordFormValues>(
    EMPTY_CHANGE_PASSWORD_FORM
  )

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_CHANGE_PASSWORD_FORM)
    }
  }, [open])

  function updateField<K extends keyof ChangePasswordFormValues>(
    field: K,
    value: ChangePasswordFormValues[K]
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
        className="flex max-h-[92vh] max-w-lg flex-col overflow-hidden sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Change Password</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center">
            <Label htmlFor="change-password-current" className="text-xs font-medium">
              Current Password
            </Label>
            <Input
              id="change-password-current"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(event) =>
                updateField("currentPassword", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center">
            <Label htmlFor="change-password-new" className="text-xs font-medium">
              New Password
            </Label>
            <Input
              id="change-password-new"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(event) =>
                updateField("newPassword", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center">
            <Label htmlFor="change-password-verify" className="text-xs font-medium">
              Verify Password
            </Label>
            <Input
              id="change-password-verify"
              type="password"
              autoComplete="new-password"
              value={form.verifyPassword}
              onChange={(event) =>
                updateField("verifyPassword", event.target.value)
              }
            />
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
