import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { touchSectionOptions, type TouchSectionId } from "@/data/touch-sections"

type SelectSectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectSection?: (sectionId: TouchSectionId) => void
}

export function SelectSectionDialog({
  open,
  onOpenChange,
  onSelectSection,
}: SelectSectionDialogProps) {
  function handleSelect(sectionId: TouchSectionId) {
    onSelectSection?.(sectionId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-w-sm flex-col overflow-hidden sm:max-w-sm"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Select Section</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 px-4 py-4">
          {touchSectionOptions.map((section) => (
            <Button
              key={section.id}
              type="button"
              className="h-11 w-full justify-center text-sm font-semibold"
              onClick={() => handleSelect(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
