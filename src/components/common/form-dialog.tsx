import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type FormDialogSize = "md" | "lg" | "xl"

const SIZE_CLASS: Record<FormDialogSize, string> = {
  md: "max-w-md sm:max-w-md",
  lg: "max-w-lg sm:max-w-lg",
  xl: "max-w-2xl sm:max-w-2xl",
}

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  error?: string | null
  onSave: () => void
  saveLabel?: string
  cancelLabel?: string
  saving?: boolean
  size?: FormDialogSize
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  children,
  error,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saving = false,
  size = "md",
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex w-full max-h-[92vh] flex-col overflow-hidden",
          SIZE_CLASS[size]
        )}
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-5 py-4 pr-14">
          <DialogTitle className="text-lg font-semibold leading-snug">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
          <div className="space-y-4">{children}</div>
        </div>

        <DialogFooter className="shrink-0 border-t px-5 py-3 sm:justify-end">
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button type="button" disabled={saving} onClick={onSave}>
              {saving ? "Saving..." : saveLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
