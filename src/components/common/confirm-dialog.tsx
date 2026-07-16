import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  /** Defaults to "Yes" (desktop WPF Yes/No). */
  confirmLabel?: string
  /** Defaults to "No". Pass empty string or set hideCancel to show OK-only Alert. */
  cancelLabel?: string
  /** When true, only the confirm button is shown (desktop Alert / OK). */
  hideCancel?: boolean
  confirmVariant?: "default" | "destructive" | "outline" | "secondary"
  isPending?: boolean
  /** Open above another dialog (Assign Seats / Payment). */
  nested?: boolean
  onConfirm: () => void | Promise<void>
  /** Called when Cancel/No is clicked (before close). */
  onCancel?: () => void | Promise<void>
}

/**
 * Reusable Yes/No confirmation dialog (site Dialog chrome).
 * Prefer this over window.confirm for in-app flows.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Yes",
  cancelLabel = "No",
  hideCancel = false,
  confirmVariant = "default",
  isPending = false,
  nested = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested={nested}
        showCloseButton={!isPending}
        disableOutsideDismiss={isPending || nested}
        className="flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <DialogHeader className="shrink-0 border-b border-border/50 px-4 py-3">
          <DialogTitle className="text-base font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="px-4 py-5 text-sm text-foreground">
          {description}
        </DialogDescription>

        <DialogFooter className="shrink-0 border-t border-border/50 bg-muted/40 px-4 py-3 sm:justify-end">
          {!hideCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void onCancel?.()
                onOpenChange(false)
              }}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? "Please wait…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
