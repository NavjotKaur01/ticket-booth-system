import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ConfirmDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isPending?: boolean
}

/**
 * Delete confirmation matching app ConfirmDialog chrome (title, body, Cancel/Delete).
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete item?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isPending = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex w-full max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={!isPending}
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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Please wait…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
