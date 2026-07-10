import { useEffect, useState, type ReactNode } from "react"

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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { weekDayOptions, yesNoOptions } from "@/data/promotion-form-options"
import { useAppSession } from "@/hooks/use-app-session"
import { savePromotion } from "@/lib/api/promotions"
import { cn } from "@/lib/utils"
import {
  createEmptyPromotionForm,
  type PromotionFormValues,
  type YesNo,
} from "@/types/promotion-form"

type AddPromotionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void | Promise<void>
}

const FORM_GRID = "grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-12"
const SPAN_HALF = "lg:col-span-6"
const SPAN_THIRD = "lg:col-span-4"
const SPAN_QUARTER = "lg:col-span-3"
const SPAN_FULL = "lg:col-span-12"
const SECTION_PAD = "px-6 py-5"

function FormGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(FORM_GRID, className)}>{children}</div>
}

function YesNoRadio({
  name,
  value,
  onChange,
}: {
  name: string
  value: YesNo
  onChange: (value: YesNo) => void
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as YesNo)}
      className="flex h-9 items-center gap-x-5"
    >
      {yesNoOptions.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center gap-2 text-sm"
        >
          <RadioGroupItem value={option.id} id={`${name}-${option.id}`} />
          {option.label}
        </label>
      ))}
    </RadioGroup>
  )
}

function YesNoRow({
  label,
  name,
  value,
  onChange,
  className,
}: {
  label: string
  name: string
  value: YesNo
  onChange: (value: YesNo) => void
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-1 items-center gap-2 sm:grid-cols-[10rem_1fr]", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      <YesNoRadio name={name} value={value} onChange={onChange} />
    </div>
  )
}

function MoneyInput({
  id,
  value,
  onChange,
  suffix,
  className,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  suffix?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("h-9 pl-6 tabular-nums", suffix && "pr-14")}
      />
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </div>
  )
}

function PercentInput({
  id,
  value,
  onChange,
  className,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 pr-12 tabular-nums"
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
        % Off
      </span>
    </div>
  )
}

function DiscountSubRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-end gap-4 pl-6 lg:grid-cols-12 lg:pl-8">
      {children}
    </div>
  )
}

export function AddPromotionDialog({
  open,
  onOpenChange,
  onSaved,
}: AddPromotionDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const [form, setForm] = useState<PromotionFormValues>(createEmptyPromotionForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(createEmptyPromotionForm())
      setError(null)
      setSaving(false)
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
  const showFeeInputs = form.overrideShowFees === "yes"

  function validateForm() {
    if (!form.promotionName.trim()) {
      return "Promotion name is required."
    }
    if (!form.promotionCode.trim()) {
      return "Promotion code is required."
    }
    if (!form.startDate.trim()) {
      return "Start date is required."
    }
    if (!form.walkUp && !form.phoneIn && !form.web && !form.managerComp) {
      return "Select at least one of Walk-Up, Phone-In, Web, or Manager Comp."
    }
    if (form.discountType === "amount") {
      if (
        form.amountDiscountKind === "dollar" &&
        !form.dollarOff.trim()
      ) {
        return "Dollar off amount is required."
      }
      if (
        form.amountDiscountKind === "percentage" &&
        !form.percOff.trim()
      ) {
        return "Percentage off is required."
      }
    }
    if (form.discountType === "free-tickets") {
      if (!form.buyTix.trim() || !form.buyTixFree.trim()) {
        return "Buy and free ticket counts are required."
      }
    }
    if (form.discountType === "set-price" && !form.setPrice.trim()) {
      return "Set price is required."
    }
    if (!isReady || !connectionName || !locationId) {
      return "Location is required before saving a promotion."
    }
    return null
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      await savePromotion({
        connectionName,
        locationId,
        lastUpdateId: username,
        form,
      })
      await onSaved?.()
      onOpenChange(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save promotion"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-4xl flex-col overflow-hidden p-0 sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12">
          <DialogTitle>Add Promotion</DialogTitle>
        </DialogHeader>

        <div className="divide-y overflow-y-auto">
          {/* Promotion Details */}
          <div className={SECTION_PAD}>
            <FormSection title="Promotion Details">
              <FormGrid>
                <FormField
                  label="Promotion Name"
                  htmlFor="add-promo-name"
                  className={SPAN_HALF}
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
                  className={SPAN_HALF}
                >
                  <Input
                    id="add-promo-code"
                    value={form.promotionCode}
                    onChange={(event) =>
                      updateField("promotionCode", event.target.value)
                    }
                  />
                </FormField>
                {(
                  [
                    ["walkUp", "Walk-Up"],
                    ["phoneIn", "Phone-In"],
                    ["web", "Web"],
                    ["managerComp", "Manager Comp"],
                  ] as const
                ).map(([field, label]) => (
                  <label
                    key={field}
                    className={cn(
                      "flex h-9 cursor-pointer items-center gap-2 text-sm",
                      SPAN_QUARTER
                    )}
                  >
                    <Checkbox
                      checked={form[field]}
                      onCheckedChange={(value) =>
                        updateField(field, value === true)
                      }
                    />
                    {label}
                  </label>
                ))}
              </FormGrid>
            </FormSection>
          </div>

          {/* Fee Overrides */}
          <div className={SECTION_PAD}>
            <FormSection title="Fee Overrides">
              <FormGrid>
                <div className={SPAN_HALF}>
                  <YesNoRow
                    label="Override Show Fees"
                    name="override-show-fees"
                    value={form.overrideShowFees}
                    onChange={(value) => updateField("overrideShowFees", value)}
                  />
                </div>
                <div className={SPAN_HALF}>
                  <YesNoRow
                    label="Over-ride CC Fee to $0"
                    name="override-cc-fee"
                    value={form.overrideCcFee}
                    onChange={(value) => updateField("overrideCcFee", value)}
                  />
                </div>

                {showFeeInputs ? (
                  <>
                    <FormField
                      label="Day Of Show"
                      htmlFor="add-promo-dos-fee"
                      className={SPAN_QUARTER}
                    >
                      <Input
                        id="add-promo-dos-fee"
                        value={form.dayOfShowFee}
                        onChange={(event) =>
                          updateField("dayOfShowFee", event.target.value)
                        }
                        className="h-9 tabular-nums"
                      />
                    </FormField>
                    <FormField
                      label="Walkup"
                      htmlFor="add-promo-walkup-fee"
                      className={SPAN_QUARTER}
                    >
                      <Input
                        id="add-promo-walkup-fee"
                        value={form.walkupFee}
                        onChange={(event) =>
                          updateField("walkupFee", event.target.value)
                        }
                        className="h-9 tabular-nums"
                      />
                    </FormField>
                    <FormField
                      label="Phone"
                      htmlFor="add-promo-phone-fee"
                      className={SPAN_QUARTER}
                    >
                      <Input
                        id="add-promo-phone-fee"
                        value={form.phoneFee}
                        onChange={(event) =>
                          updateField("phoneFee", event.target.value)
                        }
                        className="h-9 tabular-nums"
                      />
                    </FormField>
                    <FormField
                      label="Web"
                      htmlFor="add-promo-web-fee"
                      className={SPAN_QUARTER}
                    >
                      <Input
                        id="add-promo-web-fee"
                        value={form.webFee}
                        onChange={(event) =>
                          updateField("webFee", event.target.value)
                        }
                        className="h-9 tabular-nums"
                      />
                    </FormField>
                  </>
                ) : null}
              </FormGrid>
            </FormSection>
          </div>

          {/* Valid Days */}
          <div className={SECTION_PAD}>
            <FormSection title="Valid Days">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {weekDayOptions.map((day) => (
                  <label
                    key={day.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
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
                <label className="flex cursor-pointer items-center gap-2 text-sm">
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

          {/* Promotion Period */}
          <div className={SECTION_PAD}>
            <FormSection title="Promotion Period">
              <p className={cn("mb-4 text-xs text-muted-foreground", SPAN_FULL)}>
                Leave end date empty for permanent discount.
              </p>
              <FormGrid className="items-end">
                <div className={SPAN_HALF}>
                  <YesNoRow
                    label="CC Required to hold reservation"
                    name="cc-required"
                    value={form.ccRequired}
                    onChange={(value) => updateField("ccRequired", value)}
                  />
                </div>
                <FormField
                  label="Start Date"
                  htmlFor="add-promo-start-date"
                  className={SPAN_QUARTER}
                >
                  <CalendarDatePickerControl
                    id="add-promo-start-date"
                    value={form.startDate}
                    onChange={(value) => updateField("startDate", value)}
                    className="w-full"
                  />
                </FormField>
                <FormField
                  label="End Date"
                  htmlFor="add-promo-end-date"
                  className={SPAN_QUARTER}
                >
                  <CalendarDatePickerControl
                    id="add-promo-end-date"
                    value={form.endDate}
                    onChange={(value) => updateField("endDate", value)}
                    className="w-full"
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </div>

          {/* Discount Options */}
          <div className={SECTION_PAD}>
            <FormSection title="Discount Options">
              <RadioGroup
                value={form.discountType}
                onValueChange={(value) =>
                  updateField(
                    "discountType",
                    value as PromotionFormValues["discountType"]
                  )
                }
                className="space-y-4"
              >
                {/* Amount Discount */}
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                    <RadioGroupItem value="amount" id="discount-amount" />
                    Amount Discount
                  </label>
                  {form.discountType === "amount" ? (
                    <DiscountSubRow>
                      <RadioGroup
                        value={form.amountDiscountKind}
                        onValueChange={(value) =>
                          updateField(
                            "amountDiscountKind",
                            value as PromotionFormValues["amountDiscountKind"]
                          )
                        }
                        className="flex items-center gap-x-5 lg:col-span-5"
                      >
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <RadioGroupItem value="dollar" id="amount-dollar" />
                          Dollar Amount
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <RadioGroupItem value="percentage" id="amount-percent" />
                          Percentage
                        </label>
                      </RadioGroup>
                      <div className="lg:col-span-4 lg:max-w-xs">
                        {form.amountDiscountKind === "dollar" ? (
                          <MoneyInput
                            id="add-promo-dollar-off"
                            suffix="Off"
                            value={form.dollarOff}
                            onChange={(value) => updateField("dollarOff", value)}
                          />
                        ) : (
                          <PercentInput
                            id="add-promo-perc-off"
                            value={form.percOff}
                            onChange={(value) => updateField("percOff", value)}
                          />
                        )}
                      </div>
                    </DiscountSubRow>
                  ) : null}
                </div>

                {/* Free Tickets */}
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                    <RadioGroupItem value="free-tickets" id="discount-free-tickets" />
                    Free Tickets
                  </label>
                  {form.discountType === "free-tickets" ? (
                    <DiscountSubRow>
                      <FormField
                        label="Buy"
                        htmlFor="add-promo-buy-tix"
                        className="lg:col-span-3"
                      >
                        <Input
                          id="add-promo-buy-tix"
                          type="number"
                          min={0}
                          value={form.buyTix}
                          onChange={(event) =>
                            updateField("buyTix", event.target.value)
                          }
                          className="h-9 tabular-nums"
                        />
                      </FormField>
                      <FormField
                        label="Special Promotion"
                        htmlFor="add-promo-buy-tix-free"
                        className="lg:col-span-3"
                      >
                        <Input
                          id="add-promo-buy-tix-free"
                          type="number"
                          min={0}
                          value={form.buyTixFree}
                          onChange={(event) =>
                            updateField("buyTixFree", event.target.value)
                          }
                          className="h-9 tabular-nums"
                        />
                      </FormField>
                    </DiscountSubRow>
                  ) : null}
                </div>

                {/* Set Price */}
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                    <RadioGroupItem value="set-price" id="discount-set-price" />
                    Set Price
                  </label>
                  {form.discountType === "set-price" ? (
                    <DiscountSubRow>
                      <div className="lg:col-span-4 lg:max-w-xs">
                        <MoneyInput
                          id="add-promo-set-price"
                          value={form.setPrice}
                          onChange={(value) => updateField("setPrice", value)}
                        />
                      </div>
                    </DiscountSubRow>
                  ) : null}
                </div>
              </RadioGroup>
            </FormSection>
          </div>

          {/* Additional Options */}
          <div className={SECTION_PAD}>
            <FormSection title="Additional Options">
              <FormGrid className="items-end">
                <FormField
                  label="Minimum Tickets"
                  htmlFor="add-promo-min-tickets"
                  className={SPAN_THIRD}
                >
                  <Input
                    id="add-promo-min-tickets"
                    type="number"
                    min={0}
                    value={form.minimumTickets}
                    onChange={(event) =>
                      updateField("minimumTickets", event.target.value)
                    }
                    className="h-9 tabular-nums"
                  />
                </FormField>

                <FormField label="Limit per Pass" className={SPAN_THIRD}>
                  <RadioGroup
                    value={form.limitPerPassType}
                    onValueChange={(value) =>
                      updateField(
                        "limitPerPassType",
                        value as PromotionFormValues["limitPerPassType"]
                      )
                    }
                    className="flex h-9 flex-row flex-wrap items-center gap-x-5"
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <RadioGroupItem value="dollar" id="limit-dollar" />
                      Dollar Amount
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <RadioGroupItem value="tickets" id="limit-tickets" />
                      Tickets
                    </label>
                  </RadioGroup>
                </FormField>

                {form.limitPerPassType === "dollar" ? (
                  <FormField
                    label="Maximum Discount"
                    htmlFor="add-promo-max-discount"
                    className={SPAN_THIRD}
                  >
                    <MoneyInput
                      id="add-promo-max-discount"
                      value={form.maximumDiscount}
                      onChange={(value) => updateField("maximumDiscount", value)}
                    />
                  </FormField>
                ) : (
                  <FormField
                    label="Maximum Tickets"
                    htmlFor="add-promo-max-tickets"
                    className={SPAN_THIRD}
                  >
                    <Input
                      id="add-promo-max-tickets"
                      type="number"
                      min={0}
                      value={form.maximumTickets}
                      onChange={(event) =>
                        updateField("maximumTickets", event.target.value)
                      }
                      className="h-9 tabular-nums"
                    />
                  </FormField>
                )}
              </FormGrid>
            </FormSection>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          {error ? (
            <p className="mr-auto max-w-md text-sm text-destructive">{error}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
