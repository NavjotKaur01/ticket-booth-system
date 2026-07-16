import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ResendEmailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingEmail?: string
  isSubmitting?: boolean
  error?: string | null
  onResend: (payload: {
    email: string
    overwriteEmail: boolean
  }) => void | Promise<void>
}

/** Desktop Check-in Resend Email popup. */
export function ResendEmailDialog({
  open,
  onOpenChange,
  existingEmail = "",
  isSubmitting = false,
  error = null,
  onResend,
}: ResendEmailDialogProps) {
  const [email, setEmail] = useState("")
  const [overwriteEmail, setOverwriteEmail] = useState(false)
  const trimmedExisting = existingEmail.trim()

  useEffect(() => {
    if (!open) {
      return
    }

    setEmail("")
    setOverwriteEmail(false)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-md flex-col overflow-hidden p-0 sm:max-w-md"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">
            Resend Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="resend-email">Email:</Label>
            <Input
              id="resend-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-9"
              disabled={isSubmitting}
              autoComplete="email"
              placeholder="email@example.com"
            />
          </div>

          {trimmedExisting ? (
            <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
              <Checkbox
                checked={overwriteEmail}
                onCheckedChange={(value) => setOverwriteEmail(value === true)}
                disabled={isSubmitting}
                className="mt-0.5"
              />
              <span>
                Do you want to overwrite {trimmedExisting} email
              </span>
            </label>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              void onResend({
                email: email.trim(),
                overwriteEmail,
              })
            }}
          >
            {isSubmitting ? "Sending…" : "RESEND"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
