import { useEffect } from "react"

export const DIALOG_OPEN_EVENT = "app:dialog-open"

export function dispatchDialogOpenEvent() {
  document.dispatchEvent(new CustomEvent(DIALOG_OPEN_EVENT))
}

export function useCloseWhenDialogOpens(
  isOpen: boolean | undefined,
  onClose: () => void
) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleDialogOpen() {
      onClose()
    }

    document.addEventListener(DIALOG_OPEN_EVENT, handleDialogOpen)
    return () => document.removeEventListener(DIALOG_OPEN_EVENT, handleDialogOpen)
  }, [isOpen, onClose])
}
