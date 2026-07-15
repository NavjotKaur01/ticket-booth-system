import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SplitPromoConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isSubmitting?: boolean
  onConfirm: () => void | Promise<void>
}

/** Desktop split unpaid path: promo will be removed confirm. */
export function SplitPromoConfirmDialog({
  open,
  onOpenChange,
  isSubmitting = false,
  onConfirm,
}: SplitPromoConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-w-md flex-col overflow-hidden p-0 sm:max-w-md"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">
            Split Party
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-5 text-sm text-foreground">
          Promotion will be removed from this reservation. Continue?
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            No
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
          >
            {isSubmitting ? "Continuing…" : "Yes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
