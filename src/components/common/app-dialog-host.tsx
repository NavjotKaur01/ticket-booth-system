import { useEffect, useState } from "react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  resolveAppDialog,
  subscribeAppDialog,
  type AppConfirmOptions,
} from "@/lib/app-dialog"

type PendingDialog = {
  options: AppConfirmOptions
  resolve: (confirmed: boolean) => void
}

/**
 * Global host for promise-based confirm/alert dialogs.
 * Mount once near the app root (alongside AppToaster).
 */
export function AppDialogHost() {
  const [pending, setPending] = useState<PendingDialog | null>(null)

  useEffect(() => subscribeAppDialog(setPending), [])

  const open = Boolean(pending)
  const options = pending?.options

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resolveAppDialog(false)
        }
      }}
      title={options?.title ?? "Confirm"}
      description={options?.description ?? ""}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      hideCancel={options?.hideCancel}
      confirmVariant={options?.confirmVariant}
      nested
      onConfirm={() => {
        resolveAppDialog(true)
      }}
      onCancel={() => {
        resolveAppDialog(false)
      }}
    />
  )
}
