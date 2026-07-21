export type AppConfirmOptions = {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary"
  /** When true, only OK is shown (info alert). */
  hideCancel?: boolean
}

type PendingDialog = {
  options: AppConfirmOptions
  resolve: (confirmed: boolean) => void
}

type Listener = (pending: PendingDialog | null) => void

let pending: PendingDialog | null = null
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener(pending)
  }
}

export function subscribeAppDialog(listener: Listener) {
  listeners.add(listener)
  listener(pending)
  return () => {
    listeners.delete(listener)
  }
}

function enqueueDialog(options: AppConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // If a dialog is already open, resolve the previous one as cancelled.
    if (pending) {
      pending.resolve(false)
    }
    pending = { options, resolve }
    emit()
  })
}

export function resolveAppDialog(confirmed: boolean) {
  if (!pending) {
    return
  }
  const current = pending
  pending = null
  emit()
  current.resolve(confirmed)
}

/**
 * Promise-based confirmation (replacement for window.confirm).
 * Resolves true on confirm, false on cancel/dismiss.
 */
export function confirmDialog(options: AppConfirmOptions): Promise<boolean> {
  return enqueueDialog({
    title: "Confirm",
    confirmLabel: "Yes",
    cancelLabel: "No",
    ...options,
    hideCancel: false,
  })
}

/**
 * Promise-based info alert (replacement for window.alert).
 * Always resolves after the user dismisses OK.
 */
export async function alertDialog(options: AppConfirmOptions): Promise<void> {
  await enqueueDialog({
    title: "Message",
    confirmLabel: "OK",
    ...options,
    hideCancel: true,
  })
}
