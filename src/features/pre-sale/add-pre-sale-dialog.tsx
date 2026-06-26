import { useEffect, useState } from "react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  preSaleComicOptions,
  preSaleShowOptions,
} from "@/data/pre-sale"
import {
  createEmptyPreSaleForm,
  type PreSaleFormValues,
} from "@/types/pre-sale"

type AddPreSaleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPreSaleDialog({
  open,
  onOpenChange,
}: AddPreSaleDialogProps) {
  const [form, setForm] = useState<PreSaleFormValues>(createEmptyPreSaleForm())

  useEffect(() => {
    if (!open) {
      setForm(createEmptyPreSaleForm())
    }
  }, [open])

  function updateField<K extends keyof PreSaleFormValues>(
    field: K,
    value: PreSaleFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              Private Pre-sale Setup
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Show Date" htmlFor="pre-sale-show-date">
              <CalendarDatePickerControl
                id="pre-sale-show-date"
                value={form.showDate}
                onChange={(value) => updateField("showDate", value)}
              />
            </FormField>

            <FormField label="Select Comic">
              <Select
                value={form.comicId || undefined}
                onValueChange={(value) => updateField("comicId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Comic" />
                </SelectTrigger>
                <SelectContent>
                  {preSaleComicOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select Show">
              <Select
                value={form.showId || undefined}
                onValueChange={(value) => updateField("showId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Show" />
                </SelectTrigger>
                <SelectContent>
                  {preSaleShowOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Access Code" htmlFor="pre-sale-access-code">
              <Input
                id="pre-sale-access-code"
                value={form.accessCode}
                onChange={(event) =>
                  updateField("accessCode", event.target.value)
                }
              />
            </FormField>

            <FormField label="Start Date" htmlFor="pre-sale-start-date">
              <CalendarDatePickerControl
                id="pre-sale-start-date"
                value={form.startDate}
                onChange={(value) => updateField("startDate", value)}
              />
            </FormField>

            <FormField label="Start Time" htmlFor="pre-sale-start-time">
              <Input
                id="pre-sale-start-time"
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  updateField("startTime", event.target.value)
                }
              />
            </FormField>

            <FormField label="End Date" htmlFor="pre-sale-end-date">
              <CalendarDatePickerControl
                id="pre-sale-end-date"
                value={form.endDate}
                onChange={(value) => updateField("endDate", value)}
              />
            </FormField>

            <FormField label="End Time" htmlFor="pre-sale-end-time">
              <Input
                id="pre-sale-end-time"
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  updateField("endTime", event.target.value)
                }
              />
            </FormField>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
