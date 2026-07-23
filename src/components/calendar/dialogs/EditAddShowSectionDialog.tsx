import { useEffect, useMemo, useState } from "react"

import CalendarSelectControl from "@/components/calendar/controls/CalendarSelectControl"
import CalendarTimeControl from "@/components/calendar/controls/CalendarTimeControl"
import { FormField, FormSection } from "@/components/forms/form-fields"
import { PrefixedInput } from "@/components/forms/prefixed-input"
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
import { dayOfWeekOptions } from "@/data/show-time-form-options"
import type { SectionLookupItem } from "@/types/api/system-lookup"
import type { ShowTimeOption, ShowTimeSection } from "@/types/calendar-show"

export type EditAddShowSectionSeed = {
  showTime: ShowTimeOption
  section: ShowTimeSection
  showTimeValue: string
  arrivalTimeValue: string
  dayOfWeek: string
}

export type EditAddShowSectionSaveResult = {
  sectionId: string
  showDefId: string
  dayOfWeek: string
  showTime: string
  arrivalTime: string
  sectionCode: string
  price: string
  seats: string
  walkupFee: string
  phoneFee: string
  webFee: string
  showOnWeb: boolean
  restrictShowPromo: boolean
}

type EditAddShowSectionForm = {
  dayOfWeek: string
  showTime: string
  arrivalTime: string
  sectionCode: string
  price: string
  seats: string
  walkupFee: string
  phoneFee: string
  webFee: string
  showOnWeb: boolean
  restrictShowPromo: boolean
}

type EditAddShowSectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  seed: EditAddShowSectionSeed | null
  sectionLookups?: SectionLookupItem[]
  nested?: boolean
  /** Returns an error message to keep the modal open, or null on success. */
  onUpdate?: (result: EditAddShowSectionSaveResult) => string | null
}

function formatFee(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "0"
  }
  return String(value)
}

function resolveSectionCode(
  section: string,
  sectionLookups: SectionLookupItem[]
) {
  const byCode = sectionLookups.find((item) => item.code === section)
  if (byCode) return byCode.code
  const byDescription = sectionLookups.find(
    (item) => item.description === section
  )
  if (byDescription) return byDescription.code
  return section
}

function buildFormFromSeed(
  seed: EditAddShowSectionSeed | null,
  sectionLookups: SectionLookupItem[]
): EditAddShowSectionForm {
  if (!seed) {
    return {
      dayOfWeek: "wed",
      showTime: "",
      arrivalTime: "",
      sectionCode: "",
      price: "0.00",
      seats: "",
      walkupFee: "0",
      phoneFee: "0",
      webFee: "0",
      showOnWeb: true,
      restrictShowPromo: false,
    }
  }

  return {
    dayOfWeek: seed.dayOfWeek,
    showTime: seed.showTimeValue,
    arrivalTime: seed.arrivalTimeValue,
    sectionCode: resolveSectionCode(seed.section.section, sectionLookups),
    price: seed.section.price.toFixed(2),
    seats: String(seed.section.seats ?? ""),
    walkupFee: formatFee(seed.section.walkupFee),
    phoneFee: formatFee(seed.section.phoneFee),
    webFee: formatFee(seed.section.webFee),
    showOnWeb: seed.section.web,
    restrictShowPromo: seed.section.restrictShowPromo,
  }
}

function createEmptyForm(dayOfWeek: string): EditAddShowSectionForm {
  return {
    dayOfWeek,
    showTime: "",
    arrivalTime: "",
    sectionCode: "",
    price: "0.00",
    seats: "",
    walkupFee: "0",
    phoneFee: "0",
    webFee: "0",
    showOnWeb: true,
    restrictShowPromo: false,
  }
}

export function EditAddShowSectionDialog({
  open,
  onOpenChange,
  seed,
  sectionLookups = [],
  nested = false,
  onUpdate,
}: EditAddShowSectionDialogProps) {
  const [form, setForm] = useState<EditAddShowSectionForm>(() =>
    buildFormFromSeed(seed, sectionLookups)
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setError(null)
      return
    }
    setForm(buildFormFromSeed(seed, sectionLookups))
    setError(null)
  }, [open, seed, sectionLookups])

  const sectionOptions = useMemo(
    () =>
      sectionLookups.map((item) => ({
        value: item.code,
        label: item.description,
      })),
    [sectionLookups]
  )

  const dayOptions = useMemo(() => {
    const currentDayId = form.dayOfWeek || seed?.dayOfWeek || "wed"
    return dayOfWeekOptions
      .filter((option) => option.id === currentDayId)
      .map((option) => ({
        value: option.id,
        label: option.label,
      }))
  }, [form.dayOfWeek, seed?.dayOfWeek])

  function updateField<K extends keyof EditAddShowSectionForm>(
    field: K,
    value: EditAddShowSectionForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleClear() {
    // Desktop cmdSectionClear — reset fields only; do not save or close.
    setError(null)
    setForm(createEmptyForm(seed?.dayOfWeek ?? form.dayOfWeek))
  }

  function handleUpdate() {
    if (!seed) {
      return
    }

    // Desktop IsSectionValid
    if (!form.showTime.trim()) {
      setError("Enter a show time.")
      return
    }

    if (!form.arrivalTime.trim()) {
      setError("Enter an arrival time.")
      return
    }

    if (!form.dayOfWeek.trim()) {
      setError("Select a day of week.")
      return
    }

    if (!form.sectionCode.trim()) {
      setError("Select a section before updating.")
      return
    }

    const price = Number(form.price)
    if (form.price.trim() === "" || Number.isNaN(price) || price < 0) {
      setError("Enter a valid price.")
      return
    }

    const seats = Number(form.seats)
    if (
      form.seats.trim() === "" ||
      Number.isNaN(seats) ||
      !Number.isInteger(seats) ||
      seats < 0
    ) {
      setError("Enter a valid number of seats.")
      return
    }

    const updateError = onUpdate?.({
      sectionId: seed.section.id,
      showDefId: seed.showTime.id,
      dayOfWeek: form.dayOfWeek,
      showTime: form.showTime,
      arrivalTime: form.arrivalTime,
      sectionCode: form.sectionCode.trim(),
      price: Number(form.price).toFixed(2),
      seats: String(Number(form.seats)),
      walkupFee: form.walkupFee || "0",
      phoneFee: form.phoneFee || "0",
      webFee: form.webFee || "0",
      showOnWeb: form.showOnWeb,
      restrictShowPromo: form.restrictShowPromo,
    })

    if (updateError) {
      setError(updateError)
      return
    }

    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        nested={nested}
        className="flex max-h-[92vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Edit show</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="rounded-md border p-3">
            <FormSection title="Section">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Show Time" htmlFor="edit-add-show-time">
                  <CalendarTimeControl
                    id="edit-add-show-time"
                    value={form.showTime}
                    onChange={(value) => updateField("showTime", value)}
                  />
                </FormField>
                <FormField label="Arrival Time" htmlFor="edit-add-arrival-time">
                  <CalendarTimeControl
                    id="edit-add-arrival-time"
                    value={form.arrivalTime}
                    onChange={(value) => updateField("arrivalTime", value)}
                  />
                </FormField>

                <FormField label="Day Of Week">
                  <CalendarSelectControl
                    id="edit-add-day-of-week"
                    value={form.dayOfWeek}
                    onChange={(value) => updateField("dayOfWeek", value)}
                    options={dayOptions}
                    placeholder="Select Day"
                    ariaLabel="Day Of Week"
                    disabled
                  />
                </FormField>
                <FormField label="Price">
                  <PrefixedInput
                    value={form.price}
                    onChange={(value) => updateField("price", value)}
                  />
                </FormField>

                <FormField label="Select Section">
                  <CalendarSelectControl
                    id="edit-add-select-section"
                    value={form.sectionCode}
                    onChange={(value) => updateField("sectionCode", value)}
                    options={sectionOptions}
                    placeholder="Select Section"
                    ariaLabel="Select Section"
                  />
                </FormField>
                <FormField label="Number of Seats">
                  <Input
                    type="number"
                    min={0}
                    value={form.seats}
                    onChange={(event) =>
                      updateField("seats", event.target.value)
                    }
                    className="h-9"
                  />
                </FormField>

                <FormField label="Walkup SVC">
                  <PrefixedInput
                    value={form.walkupFee}
                    onChange={(value) => updateField("walkupFee", value)}
                  />
                </FormField>
                <FormField label="Phone SVC">
                  <PrefixedInput
                    value={form.phoneFee}
                    onChange={(value) => updateField("phoneFee", value)}
                  />
                </FormField>

                <FormField label="Web SVC">
                  <PrefixedInput
                    value={form.webFee}
                    onChange={(value) => updateField("webFee", value)}
                  />
                </FormField>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    checked={form.showOnWeb}
                    onCheckedChange={(value) =>
                      updateField("showOnWeb", value === true)
                    }
                  />
                  Show on Web
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    checked={form.restrictShowPromo}
                    onCheckedChange={(value) =>
                      updateField("restrictShowPromo", value === true)
                    }
                  />
                  Restrict Show Promo
                </label>
              </div>
            </FormSection>
          </div>
        </div>

        <DialogFooter className="shrink-0 justify-start gap-2 border-t px-4 py-3 sm:justify-start">
          <Button type="button" onClick={handleUpdate}>
            Update Section
          </Button>
          <Button type="button" variant="link" onClick={handleClear}>
            Clear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
