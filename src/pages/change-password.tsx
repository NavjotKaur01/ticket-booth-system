import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "@/features/change-password/change-password-dialog"

export function ChangePassword() {
  const [open, setOpen] = useState(true)

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Change Password
      </h1>

      {!open && (
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Change Password
        </Button>
      )}

      <ChangePasswordDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
