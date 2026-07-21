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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { promotionFormDiscountSelectOptions } from "@/data/promotions"
import { weekDayOptions, yesNoOptions } from "@/data/promotion-form-options"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  getPromotionDetails,
  savePromotion,
  updatePromotion,
} from "@/lib/api/promotions"
import { mapPromotionDetailsToForm } from "@/lib/map-promotion-details-to-form"
import { cn } from "@/lib/utils"
import type { Promotion } from "@/types/promotion"
import {
  createEmptyPromotionForm,
  type FreeTicketsKind,
  type PromotionFormValues,
  type YesNo,
} from "@/types/promotion-form"

type AddPromotionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion?: Promotion | null
  onSaved?: () => void | Promise<void>
}

const FORM_GRID =
  "grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-12"
const SPAN_HALF = "lg:col-span-6"
const SPAN_QUARTER = "lg:col-span-3"

function FormGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(FORM_GRID, className)}>{children}</div>
}

/** Matches show-times / other admin dialogs: bordered FormSection panel. */
function SectionPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-md border p-2.5">
      <FormSection title={title}>{children}</FormSection>
    </div>
  )
}

function YesNoRadio({
  name,
  value,
  onChange,
  disabled = false,
}: {
  name: string
  value: YesNo
  onChange: (value: YesNo) => void
  disabled?: boolean
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as YesNo)}
      className="flex h-9 items-center gap-x-4"
      disabled={disabled}
    >
      {yesNoOptions.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center gap-2 text-xs"
        >
          <RadioGroupItem value={option.id} id={`${name}-${option.id}`} />
          {option.label}
        </label>
      ))}
    </RadioGroup>
  )
}

function YesNoField({
  label,
  name,
  value,
  onChange,
  className,
  disabled = false,
}: {
  label: string
  name: string
  value: YesNo
  onChange: (value: YesNo) => void
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      <YesNoRadio
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}

function MoneyInput({
  id,
  value,
  onChange,
  suffix,
  className,
  disabled = false,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  suffix?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        value={value}
        disabled={disabled}
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
  disabled = false,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 pr-12 tabular-nums"
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
        % Off
      </span>
    </div>
  )
}

function CheckboxOption({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 text-xs",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      {label}
    </label>
  )
}

export function AddPromotionDialog({
  open,
  onOpenChange,
  promotion = null,
  onSaved,
}: AddPromotionDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const isEditMode = promotion != null
  const [form, setForm] = useState<PromotionFormValues>(createEmptyPromotionForm())
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(createEmptyPromotionForm())
      setError(null)
      setSaving(false)
      setLoadingDetails(false)
      return
    }

    if (!promotion) {
      setForm(createEmptyPromotionForm())
      setError(null)
      return
    }

    const promotionId = promotion.id
    let cancelled = false

    async function loadPromotionDetails() {
      if (!connectionName) {
        reportErrorMessage(
          setError,
          "Connection is required before loading a promotion."
        )
        return
      }

      setLoadingDetails(true)
      setError(null)

      try {
        const details = await getPromotionDetails({
          connectionName,
          promotionId,
        })
        if (cancelled) return
        setForm(mapPromotionDetailsToForm(details))
      } catch (requestError) {
        if (!cancelled) {
          reportError(
            setError,
            requestError,
            "Unable to load promotion details."
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingDetails(false)
        }
      }
    }

    void loadPromotionDetails()

    return () => {
      cancelled = true
    }
  }, [open, promotion, connectionName])

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
  // Desktop IsShowFees / "Show Fees" checked → fee inputs disabled.
  const feeInputsDisabled = form.overrideShowFees === "yes"
  const formDisabled = loadingDetails || saving

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
    if (form.endDate.trim()) {
      const start = new Date(`${form.startDate.trim()}T00:00:00`)
      const end = new Date(`${form.endDate.trim()}T00:00:00`)
      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end < start
      ) {
        return "End date must be greater than or equal to start date."
      }
    }
    if (!form.walkUp && !form.phoneIn && !form.web && !form.managerComp) {
      return "Select at least one of Walk-Up, Phone-In, Web, or Manager Comp."
    }
    // ClubMan IsValid: DiscountType == "Discount options" → invalid
    if (form.discountType === "discount-options") {
      return "Select a discount option."
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
      if (!form.freeTicketsKind) {
        return "Select Buy or Special Promotion."
      }
      if (form.freeTicketsKind === "buy") {
        if (!form.buyTix.trim() || !form.buyTixFree.trim()) {
          return "Buy and free ticket counts are required."
        }
      }
      if (
        form.freeTicketsKind === "special-promotion" &&
        !form.specialReq.trim()
      ) {
        return "Special promotion label is required."
      }
      if (
        form.freeTicketsKind === "special-promotion" &&
        form.specialReq.trim().length > 100
      ) {
        return "Special promotion label must be 100 characters or fewer."
      }
    }
    if (form.discountType === "set-price" && !form.setPrice.trim()) {
      return "Set price is required."
    }
    if (!isReady || !connectionName || !locationId) {
      return "Location is required before saving a promotion."
    }
    if (isEditMode && !promotion?.id) {
      return "Promotion id is required before updating."
    }
    return null
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError) {
      reportErrorMessage(setError, validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEditMode && promotion) {
        await updatePromotion({
          connectionName,
          locationId,
          lastUpdateId: username,
          form,
          promotionId: promotion.id,
        })
      } else {
        await savePromotion({
          connectionName,
          locationId,
          lastUpdateId: username,
          form,
        })
      }
      toastSuccess(isEditMode ? "Promotion updated" : "Promotion saved")
      await onSaved?.()
      onOpenChange(false)
    } catch (requestError) {
      reportError(
        setError,
        requestError,
        isEditMode ? "Failed to update promotion" : "Failed to save promotion"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-4xl flex-col overflow-hidden sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              {isEditMode ? "Edit Promotion" : "Add Promotion"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-2">
          {loadingDetails ? (
            <p className="text-sm text-muted-foreground">
              Loading promotion details...
            </p>
          ) : null}

          <div className="rounded-md border p-2.5">
            <FormGrid>
              <FormField
                label="Promotion Name"
                htmlFor="add-promo-name"
                className={SPAN_HALF}
              >
                <Input
                  id="add-promo-name"
                  value={form.promotionName}
                  disabled={formDisabled}
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
                  disabled={formDisabled}
                  onChange={(event) =>
                    updateField("promotionCode", event.target.value)
                  }
                />
              </FormField>
            </FormGrid>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              {(
                [
                  ["walkUp", "Walk-Up"],
                  ["phoneIn", "Phone-In"],
                  ["web", "Web"],
                  ["managerComp", "Manager Comp"],
                ] as const
              ).map(([field, label]) => (
                <CheckboxOption
                  key={field}
                  label={label}
                  checked={form[field]}
                  disabled={formDisabled}
                  onCheckedChange={(checked) => updateField(field, checked)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-md border p-2.5">
            <p className="mb-2 text-xs text-muted-foreground">
              Leave end date empty for permanent discount.
            </p>
            <FormGrid className="items-end">
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
              <div className={SPAN_HALF}>
                <YesNoField
                  label="CC Required to hold reservation"
                  name="cc-required"
                  value={form.ccRequired}
                  disabled={formDisabled}
                  onChange={(value) => updateField("ccRequired", value)}
                />
              </div>
            </FormGrid>
            <div className="mt-2 space-y-1">
              <Label className="text-xs font-medium">Valid Days</Label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {weekDayOptions.map((day) => (
                  <CheckboxOption
                    key={day.id}
                    label={day.label}
                    checked={form.validDays[day.id] ?? false}
                    disabled={formDisabled}
                    onCheckedChange={(checked) =>
                      toggleValidDay(day.id, checked)
                    }
                  />
                ))}
                <CheckboxOption
                  label="Select All"
                  checked={allDaysSelected}
                  disabled={formDisabled}
                  onCheckedChange={(checked) => toggleSelectAllDays(checked)}
                />
              </div>
            </div>
          </div>

          <SectionPanel title="Show Fees">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <CheckboxOption
                label="Show Fees"
                checked={form.overrideShowFees === "yes"}
                disabled={formDisabled}
                onCheckedChange={(checked) =>
                  updateField("overrideShowFees", checked ? "yes" : "no")
                }
              />
              <CheckboxOption
                label="Over-ride CC Fee to $0"
                checked={form.overrideCcFee === "yes"}
                disabled={formDisabled}
                onCheckedChange={(checked) =>
                  updateField("overrideCcFee", checked ? "yes" : "no")
                }
              />
            </div>
            <div className="mt-2 rounded-md border p-2.5">
              <FormGrid>
                <FormField
                  label="Day of Show Fee"
                  htmlFor="add-promo-dos-fee"
                  className={SPAN_QUARTER}
                >
                  <Input
                    id="add-promo-dos-fee"
                    value={form.dayOfShowFee}
                    disabled={formDisabled || feeInputsDisabled}
                    onChange={(event) =>
                      updateField("dayOfShowFee", event.target.value)
                    }
                    className="h-9 tabular-nums"
                  />
                </FormField>
                <FormField
                  label="Walk-Up Fee"
                  htmlFor="add-promo-walkup-fee"
                  className={SPAN_QUARTER}
                >
                  <Input
                    id="add-promo-walkup-fee"
                    value={form.walkupFee}
                    disabled={formDisabled || feeInputsDisabled}
                    onChange={(event) =>
                      updateField("walkupFee", event.target.value)
                    }
                    className="h-9 tabular-nums"
                  />
                </FormField>
                <FormField
                  label="Phone-In Fee"
                  htmlFor="add-promo-phone-fee"
                  className={SPAN_QUARTER}
                >
                  <Input
                    id="add-promo-phone-fee"
                    value={form.phoneFee}
                    disabled={formDisabled || feeInputsDisabled}
                    onChange={(event) =>
                      updateField("phoneFee", event.target.value)
                    }
                    className="h-9 tabular-nums"
                  />
                </FormField>
                <FormField
                  label="Web Fee"
                  htmlFor="add-promo-web-fee"
                  className={SPAN_QUARTER}
                >
                  <Input
                    id="add-promo-web-fee"
                    value={form.webFee}
                    disabled={formDisabled || feeInputsDisabled}
                    onChange={(event) =>
                      updateField("webFee", event.target.value)
                    }
                    className="h-9 tabular-nums"
                  />
                </FormField>
              </FormGrid>
            </div>
          </SectionPanel>

          <SectionPanel title="Discount Options">
            <div className="space-y-2">
              <Select
                value={form.discountType}
                onValueChange={(value) => {
                  const discountType =
                    value as PromotionFormValues["discountType"]
                  setForm((current) => ({
                    ...current,
                    discountType,
                    // Reset free-ticket sub-mode when switching discount types
                    freeTicketsKind:
                      discountType === "free-tickets"
                        ? current.freeTicketsKind
                        : "",
                  }))
                }}
                disabled={formDisabled}
              >
                <SelectTrigger id="add-promo-discount-type" className="w-full max-w-xs">
                  <SelectValue placeholder="Discount options" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {promotionFormDiscountSelectOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.discountType === "amount" ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <RadioGroup
                    value={form.amountDiscountKind}
                    onValueChange={(value) =>
                      updateField(
                        "amountDiscountKind",
                        value as PromotionFormValues["amountDiscountKind"]
                      )
                    }
                    className="flex flex-wrap items-center gap-x-4"
                    disabled={formDisabled}
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <RadioGroupItem value="dollar" id="amount-dollar" />
                      Dollar Amount
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <RadioGroupItem
                        value="percentage"
                        id="amount-percent"
                      />
                      Percentage
                    </label>
                  </RadioGroup>
                  <div className="w-36">
                    {form.amountDiscountKind === "dollar" ? (
                      <MoneyInput
                        id="add-promo-dollar-off"
                        suffix="Off"
                        value={form.dollarOff}
                        disabled={formDisabled}
                        onChange={(value) => updateField("dollarOff", value)}
                      />
                    ) : (
                      <PercentInput
                        id="add-promo-perc-off"
                        value={form.percOff}
                        disabled={formDisabled}
                        onChange={(value) => updateField("percOff", value)}
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {form.discountType === "free-tickets" ? (
                <div className="space-y-2">
                  <RadioGroup
                    value={form.freeTicketsKind || undefined}
                    onValueChange={(value) =>
                      updateField(
                        "freeTicketsKind",
                        value as FreeTicketsKind
                      )
                    }
                    className="flex flex-wrap items-center gap-x-4"
                    disabled={formDisabled}
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <RadioGroupItem value="buy" id="free-tickets-buy" />
                      Buy
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <RadioGroupItem
                        value="special-promotion"
                        id="free-tickets-special"
                      />
                      Special Promotion
                    </label>
                  </RadioGroup>

                  {form.freeTicketsKind === "buy" ? (
                    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                      <FormField
                        label="Buy"
                        htmlFor="add-promo-buy-tix"
                        className="w-28"
                      >
                        <Input
                          id="add-promo-buy-tix"
                          type="number"
                          min={0}
                          value={form.buyTix}
                          disabled={formDisabled}
                          onChange={(event) =>
                            updateField("buyTix", event.target.value)
                          }
                          className="h-9 tabular-nums"
                        />
                      </FormField>
                      <FormField
                        label="Get Free"
                        htmlFor="add-promo-buy-tix-free"
                        className="w-28"
                      >
                        <Input
                          id="add-promo-buy-tix-free"
                          type="number"
                          min={0}
                          value={form.buyTixFree}
                          disabled={formDisabled}
                          onChange={(event) =>
                            updateField("buyTixFree", event.target.value)
                          }
                          className="h-9 tabular-nums"
                        />
                      </FormField>
                    </div>
                  ) : null}

                  {form.freeTicketsKind === "special-promotion" ? (
                    <div className="w-56">
                      <Input
                        id="add-promo-special-req"
                        type="text"
                        maxLength={100}
                        value={form.specialReq}
                        disabled={formDisabled}
                        onChange={(event) =>
                          updateField("specialReq", event.target.value)
                        }
                        className="h-9"
                        placeholder="e.g. Admit4"
                        aria-label="Special promotion"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {form.discountType === "set-price" ? (
                <div className="w-36">
                  <MoneyInput
                    id="add-promo-set-price"
                    value={form.setPrice}
                    disabled={formDisabled}
                    onChange={(value) => updateField("setPrice", value)}
                  />
                </div>
              ) : null}
            </div>
          </SectionPanel>

          <SectionPanel title="Additional Options">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <FormField
                label="Minimum Tickets"
                htmlFor="add-promo-min-tickets"
                className="w-28"
              >
                <Input
                  id="add-promo-min-tickets"
                  type="number"
                  min={0}
                  value={form.minimumTickets}
                  disabled={formDisabled}
                  onChange={(event) =>
                    updateField("minimumTickets", event.target.value)
                  }
                  className="h-9 tabular-nums"
                />
              </FormField>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Limit per Pass</Label>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <RadioGroup
                    value={form.limitPerPassType}
                    onValueChange={(value) =>
                      updateField(
                        "limitPerPassType",
                        value as PromotionFormValues["limitPerPassType"]
                      )
                    }
                    className="flex flex-wrap items-center gap-x-4"
                    disabled={formDisabled}
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

                  {form.limitPerPassType === "dollar" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-28">
                        <MoneyInput
                          id="add-promo-max-discount"
                          value={form.maximumDiscount}
                          disabled={formDisabled}
                          onChange={(value) =>
                            updateField("maximumDiscount", value)
                          }
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Maximum Discount
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="add-promo-max-tickets"
                        type="number"
                        min={0}
                        value={form.maximumTickets}
                        disabled={formDisabled}
                        onChange={(event) =>
                          updateField("maximumTickets", event.target.value)
                        }
                        className="h-9 w-20 tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">
                        Maximum Tickets
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionPanel>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
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
          <Button
            type="button"
            disabled={formDisabled}
            onClick={() => void handleSave()}
          >
            {saving
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
                ? "Update"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
