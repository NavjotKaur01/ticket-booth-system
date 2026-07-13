import { ClipboardCopy, FileSpreadsheet, FileText } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ExportFormat } from "@/lib/export-table-data"
import { cn } from "@/lib/utils"

type ExportDataDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: ExportFormat) => Promise<boolean> | boolean
  defaultFormat?: ExportFormat
  excelDescription?: string
}

const EXPORT_OPTIONS: Array<{
  value: ExportFormat
  label: string
  description: string
  icon: typeof ClipboardCopy
}> = [
  {
    value: "clipboard",
    label: "Copy to Clipboard",
    description: "Paste the formatted table into another app.",
    icon: ClipboardCopy,
  },
  {
    value: "excel",
    label: "Export to Excel",
    description: "Download an Excel workbook (.xlsx).",
    icon: FileSpreadsheet,
  },
  {
    value: "html",
    label: "Export to HTML",
    description: "Download a standalone HTML table file.",
    icon: FileText,
  },
  {
    value: "csv",
    label: "Export to CSV",
    description: "Download a CSV file.",
    icon: FileText,
  },
]

export function ExportDataDialog({
  open,
  onOpenChange,
  onExport,
  defaultFormat = "excel",
  excelDescription = "Download a CSV file compatible with Excel.",
}: ExportDataDialogProps) {
  const [format, setFormat] = useState<ExportFormat>(defaultFormat)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFormat(defaultFormat)
      setError(null)
    }
  }, [defaultFormat, open])

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      const success = await onExport(format)
      if (success) {
        onOpenChange(false)
        return
      }

      setError("Unable to export data.")
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Unable to export data."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[82vh] w-[min(calc(100vw-2rem),84rem)] max-w-[84rem] flex-col overflow-hidden sm:max-w-[25rem]"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Export</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">
            Export options
          </p>

          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as ExportFormat)}
            className="flex flex-col gap-3"
          >
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon
              const selected = format === option.value

              return (
                <Label
                  key={option.value}
                  htmlFor={`export-format-${option.value}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-colors",
                    selected
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/15"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`export-format-${option.value}`}
                  />
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md border",
                        selected
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="block text-xs leading-relaxed text-muted-foreground">
                        {option.value === "excel"
                          ? excelDescription
                          : option.description}
                      </span>
                    </span>
                  </span>
                </Label>
              )
            })}
          </RadioGroup>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-end">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? "Exporting..." : "Export"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
