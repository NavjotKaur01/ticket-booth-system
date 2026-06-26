import { useEffect, useState } from "react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { FormField, FormSection } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ccRequiredOptions,
  discountOptions,
  weekDayOptions,
} from "@/data/promotion-form-options"
import {
  createEmptyPromotionForm,
  type PromotionFormValues,
} from "@/types/promotion-form"

type AddPromotionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPromotionDialog({
  open,
  onOpenChange,
}: AddPromotionDialogProps) {
  const [form, setForm] = useState<PromotionFormValues>(createEmptyPromotionForm())

  useEffect(() => {
    if (!open) {
      setForm(createEmptyPromotionForm())
    }
  }, [open])

  function updateField<K extends keyof PromotionFormValues>(
    field: K,
    value: PromotionFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleValidDay(dayId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      validDays: { ...current.validDays, [dayId]: checked },
    }))
  }

  function toggleSelectAllDays(checked: boolean) {
    setForm((current) => ({
      ...current,
      validDays: Object.fromEntries(
        weekDayOptions.map((day) => [day.id, checked])
      ),
    }))
  }

  const allDaysSelected = weekDayOptions.every((day) => form.validDays[day.id])

  function handleSave() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Add Promotion</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto px-4 py-2">
          <div className="rounded-md border p-2.5">
            <FormSection title="Promotion Details">
              <div className="flex flex-wrap items-end gap-2">
                <FormField
                  label="Promotion Name"
                  htmlFor="add-promo-name"
                  className="min-w-[8rem] flex-1 sm:max-w-48"
                >
                  <Input
                    id="add-promo-name"
                    value={form.promotionName}
                    onChange={(event) =>
                      updateField("promotionName", event.target.value)
                    }
                  />
                </FormField>
                <FormField
                  label="Promotion Code"
                  htmlFor="add-promo-code"
                  className="min-w-[8rem] flex-1 sm:max-w-48"
                >
                  <Input
                    id="add-promo-code"
                    value={form.promotionCode}
                    onChange={(event) =>
                      updateField("promotionCode", event.target.value)
                    }
                  />
                </FormField>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.walkUp}
                      onCheckedChange={(value) =>
                        updateField("walkUp", value === true)
                      }
                    />
                    Walk-Up
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.phoneIn}
                      onCheckedChange={(value) =>
                        updateField("phoneIn", value === true)
                      }
                    />
                    Phone-In
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.web}
                      onCheckedChange={(value) =>
                        updateField("web", value === true)
                      }
                    />
                    Web
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.managerComp}
                      onCheckedChange={(value) =>
                        updateField("managerComp", value === true)
                      }
                    />
                    Manager Comp
                  </label>
                </div>
              </div>
            </FormSection>
          </div>

          <div className="rounded-md border p-2.5">
            <FormSection title="Valid Days">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {weekDayOptions.map((day) => (
                  <label
                    key={day.id}
                    className="flex cursor-pointer items-center gap-2 text-xs"
                  >
                    <Checkbox
                      checked={form.validDays[day.id] ?? false}
                      onCheckedChange={(value) =>
                        toggleValidDay(day.id, value === true)
                      }
                    />
                    {day.label}
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    checked={allDaysSelected}
                    onCheckedChange={(value) =>
                      toggleSelectAllDays(value === true)
                    }
                  />
                  Select All
                </label>
              </div>
            </FormSection>
          </div>

          <div className="rounded-md border p-2.5">
            <FormSection title="Promotion Period">
              <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-end">
                <FormField label="Credit Card" className="min-w-0 flex-1 md:min-w-[14rem]">
                  <Select
                    value={form.ccRequired}
                    onValueChange={(value) => updateField("ccRequired", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ccRequiredOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Start Date" htmlFor="add-promo-start-date">
                  <CalendarDatePickerControl
                    id="add-promo-start-date"
                    value={form.startDate}
                    onChange={(value) => updateField("startDate", value)}
                    className="w-[10.5rem]"
                  />
                </FormField>
                <FormField label="End Date" htmlFor="add-promo-end-date">
                  <CalendarDatePickerControl
                    id="add-promo-end-date"
                    value={form.endDate}
                    onChange={(value) => updateField("endDate", value)}
                    className="w-[10.5rem]"
                  />
                </FormField>
                <p className="pb-2 text-xs text-muted-foreground md:max-w-[11rem]">
                  Leave end date empty for permanent discount.
                </p>
              </div>
            </FormSection>
          </div>

          <div className="rounded-md border p-2.5">
            <FormSection title="Show Fees">
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex cursor-pointer items-center gap-2 pb-2 text-xs">
                  <Checkbox
                    checked={form.showFees}
                    onCheckedChange={(value) =>
                      updateField("showFees", value === true)
                    }
                  />
                  Show Fees
                </label>
                <FormField label="Day Of Show" htmlFor="add-promo-dos-fee">
                  <Input
                    id="add-promo-dos-fee"
                    value={form.dayOfShowFee}
                    onChange={(event) =>
                      updateField("dayOfShowFee", event.target.value)
                    }
                    className="h-9 w-24 tabular-nums"
                  />
                </FormField>
                <FormField label="Walkup" htmlFor="add-promo-walkup-fee">
                  <Input
                    id="add-promo-walkup-fee"
                    value={form.walkupFee}
                    onChange={(event) =>
                      updateField("walkupFee", event.target.value)
                    }
                    className="h-9 w-24 tabular-nums"
                  />
                </FormField>
                <FormField label="Phone" htmlFor="add-promo-phone-fee">
                  <Input
                    id="add-promo-phone-fee"
                    value={form.phoneFee}
                    onChange={(event) =>
                      updateField("phoneFee", event.target.value)
                    }
                    className="h-9 w-24 tabular-nums"
                  />
                </FormField>
                <FormField label="Web" htmlFor="add-promo-web-fee">
                  <Input
                    id="add-promo-web-fee"
                    value={form.webFee}
                    onChange={(event) =>
                      updateField("webFee", event.target.value)
                    }
                    className="h-9 w-24 tabular-nums"
                  />
                </FormField>
                <label className="flex cursor-pointer items-center gap-2 pb-2 text-xs">
                  <Checkbox
                    checked={form.overrideCcFee}
                    onCheckedChange={(value) =>
                      updateField("overrideCcFee", value === true)
                    }
                  />
                  Over-ride CC Fee to $0
                </label>
              </div>
            </FormSection>
          </div>

          <div className="rounded-md border p-2.5">
            <div className="space-y-2">
              <FormSection title="Discount Options">
                <Select
                  value={form.discountOption || undefined}
                  onValueChange={(value) =>
                    updateField("discountOption", value)
                  }
                >
                  <SelectTrigger className="w-full sm:max-w-md">
                    <SelectValue placeholder="Discount options" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormSection>

              <FormSection title="Additional Options">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                  <FormField
                    label="Minimum Tickets"
                    htmlFor="add-promo-min-tickets"
                    className="shrink-0"
                  >
                    <Input
                      id="add-promo-min-tickets"
                      type="number"
                      min={0}
                      value={form.minimumTickets}
                      onChange={(event) =>
                        updateField("minimumTickets", event.target.value)
                      }
                      className="h-9 w-24"
                    />
                  </FormField>

                  <FormField label="Limit per Pass" className="shrink-0">
                    <RadioGroup
                      value={form.limitPerPassType}
                      onValueChange={(value) =>
                        updateField(
                          "limitPerPassType",
                          value as PromotionFormValues["limitPerPassType"]
                        )
                      }
                      className="flex h-9 items-center gap-x-4"
                    >
                      <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <RadioGroupItem value="dollar" id="limit-dollar" />
                        Dollar Amount
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <RadioGroupItem value="tickets" id="limit-tickets" />
                        Tickets
                      </label>
                    </RadioGroup>
                  </FormField>

                  <FormField
                    label="Maximum Discount"
                    htmlFor="add-promo-max-discount"
                    className="shrink-0"
                  >
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="add-promo-max-discount"
                        value={form.maximumDiscount}
                        onChange={(event) =>
                          updateField("maximumDiscount", event.target.value)
                        }
                        className="h-9 w-full pl-6 tabular-nums"
                      />
                    </div>
                  </FormField>
                </div>
              </FormSection>
            </div>
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
