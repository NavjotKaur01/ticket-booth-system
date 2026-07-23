import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import CalendarSelectControl from "@/components/calendar/controls/CalendarSelectControl"
import CalendarTimeControl from "@/components/calendar/controls/CalendarTimeControl"
import { DataTable } from "@/components/data-table/data-table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  dayOfWeekOptions,
  weekDayCheckboxOptions,
} from "@/data/show-time-form-options"
import type { SectionLookupItem } from "@/types/api/system-lookup"
import type { ShowTimeOption, ShowTimeSection } from "@/types/calendar-show"
import {
  EMPTY_ALSO_APPLIES_TO,
  type ShowTimeFormValues,
  type ShowTimeSectionDraft,
} from "@/types/show-time"

export type EditCalendarShowTimesSeed = {
  showTime: ShowTimeOption
  dayLabel?: string
  showTimeValue?: string
  arrivalTimeValue?: string
  dinner?: boolean
  noPasses?: boolean
  vipSeating?: boolean
  hub?: boolean
  age21Plus?: boolean
  sections?: ShowTimeSection[]
}

type EditCalendarShowTimesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  seed: EditCalendarShowTimesSeed | null
  sectionLookups?: SectionLookupItem[]
  nested?: boolean
  onSave?: (result: EditCalendarShowTimesSaveResult) => void
}

export type EditCalendarShowTimesSaveResult = {
  showTime: string
  arrivalTime: string
  dinner: boolean
  noPasses: boolean
  vipSeating: boolean
  age21Plus: boolean
  hub: boolean
  alsoAppliesTo: Record<string, boolean>
  sections: ShowTimeSectionDraft[]
}

function dayLabelToId(dayLabel: string | undefined) {
  const normalized = (dayLabel ?? "").trim().toLowerCase()
  const match = weekDayCheckboxOptions.find(
    (day) =>
      day.label.toLowerCase() === normalized ||
      day.label.slice(0, 3).toLowerCase() === normalized.slice(0, 3)
  )
  return match?.id ?? "sat"
}

function formatFee(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "0.00"
  }
  return value.toFixed(2)
}

function sectionToDraft(section: ShowTimeSection): ShowTimeSectionDraft {
  return {
    id: section.id,
    sectionId: section.section,
    price: section.price.toFixed(2),
    walkupFee: formatFee(section.walkupFee),
    phoneFee: formatFee(section.phoneFee),
    webFee: formatFee(section.webFee),
    seats: String(section.seats ?? ""),
    showOnWeb: section.web,
    restrictShowPromo: section.restrictShowPromo,
  }
}

function buildFormFromSeed(
  seed: EditCalendarShowTimesSeed | null
): ShowTimeFormValues {
  const dayId = dayLabelToId(seed?.dayLabel ?? seed?.showTime.dayLabel)
  const sections = (seed?.sections ?? seed?.showTime.sections ?? []).map(
    sectionToDraft
  )

  return {
    dayOfWeek: dayId,
    alsoAppliesTo: {
      ...EMPTY_ALSO_APPLIES_TO,
      mon: false,
      [dayId]: true,
    },
    showTime: seed?.showTimeValue ?? "",
    arrivalTime: seed?.arrivalTimeValue ?? "",
    dinner: seed?.dinner ?? false,
    noPasses: seed?.noPasses ?? false,
    vipSeating: seed?.vipSeating ?? false,
    age21Plus: seed?.age21Plus ?? false,
    hub: seed?.hub ?? false,
    sectionId: "",
    price: "25.00",
    walkupFee: "0.00",
    phoneFee: "0.00",
    webFee: "0.00",
    seats: "",
    showOnWeb: true,
    restrictShowPromo: false,
    sections,
  }
}

function formatTimeRange(showTime: string, arrivalTime: string) {
  if (arrivalTime && showTime) {
    return `${arrivalTime}-${showTime}`
  }
  return arrivalTime || showTime || "—"
}

function createSectionColumns(
  sectionLabelByCode: Map<string, string>,
  timeRange: string,
  onEdit: (section: ShowTimeSectionDraft) => void,
  onRemove: (id: string) => void
): ColumnDef<ShowTimeSectionDraft>[] {
  return [
    {
      id: "time",
      header: "Time",
      cell: () => (
        <span className="whitespace-nowrap text-xs">{timeRange}</span>
      ),
    },
    {
      accessorKey: "sectionId",
      header: "Section",
      cell: ({ row }) =>
        sectionLabelByCode.get(row.original.sectionId) ??
        row.original.sectionId,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.price || "0.00"}</span>
      ),
    },
    {
      accessorKey: "seats",
      header: "Seats",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.seats || "\u00A0"}</span>
      ),
    },
    {
      accessorKey: "restrictShowPromo",
      header: "Restricted Promo",
      cell: ({ row }) => (row.original.restrictShowPromo ? "Y" : "N"),
    },
    {
      accessorKey: "showOnWeb",
      header: "Show on Web",
      cell: ({ row }) => (row.original.showOnWeb ? "Yes" : "No"),
    },
    {
      accessorKey: "walkupFee",
      header: "Walkup Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.walkupFee || "0.00"}</span>
      ),
    },
    {
      accessorKey: "phoneFee",
      header: "Phone Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.phoneFee || "0.00"}</span>
      ),
    },
    {
      accessorKey: "webFee",
      header: "Web Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.webFee || "0.00"}</span>
      ),
    },
    {
      id: "action",
      header: "Actions",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit section"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete section"
            onClick={(event) => {
              event.stopPropagation()
              onRemove(row.original.id)
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ]
}

export function EditCalendarShowTimesDialog({
  open,
  onOpenChange,
  seed,
  sectionLookups = [],
  nested = false,
  onSave,
}: EditCalendarShowTimesDialogProps) {
  const [form, setForm] = useState<ShowTimeFormValues>(() =>
    buildFormFromSeed(seed)
  )
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setEditingSectionId(null)
      setError(null)
      return
    }
    setForm(buildFormFromSeed(seed))
    setEditingSectionId(null)
    setError(null)
  }, [open, seed])

  const sectionLabelByCode = useMemo(
    () =>
      new Map(sectionLookups.map((item) => [item.code, item.description])),
    [sectionLookups]
  )

  const sectionOptions = useMemo(
    () =>
      sectionLookups.map((item) => ({
        value: item.code,
        label: item.description,
      })),
    [sectionLookups]
  )

  function updateField<K extends keyof ShowTimeFormValues>(
    field: K,
    value: ShowTimeFormValues[K]
  ) {
    setForm((current) => {
      if (field === "dayOfWeek" && typeof value === "string") {
        return {
          ...current,
          dayOfWeek: value,
          alsoAppliesTo: {
            ...EMPTY_ALSO_APPLIES_TO,
            mon: false,
            [value]: true,
          },
        }
      }
      return { ...current, [field]: value }
    })
  }

  function toggleAlsoAppliesTo(dayId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      alsoAppliesTo: { ...current.alsoAppliesTo, [dayId]: checked },
    }))
  }

  /** Desktop SetEditShowTime / Reset — clears section form only (not the grid). */
  function clearSectionForm(
    current: ShowTimeFormValues
  ): ShowTimeFormValues {
    return {
      ...current,
      sectionId: "",
      price: "25.00",
      seats: "",
      walkupFee: "0.00",
      phoneFee: "0.00",
      webFee: "0.00",
      showOnWeb: true,
      restrictShowPromo: false,
    }
  }

  /** Desktop IsEditShowSectionValid */
  function getSectionFormError(): string | null {
    if (!form.sectionId.trim()) {
      return "Select a section before adding."
    }

    const price = Number(form.price)
    if (form.price.trim() === "" || Number.isNaN(price) || price < 0) {
      return "Enter a valid price."
    }

    const seats = Number(form.seats)
    if (
      form.seats.trim() === "" ||
      Number.isNaN(seats) ||
      !Number.isInteger(seats) ||
      seats < 0
    ) {
      return "Enter a valid number of seats."
    }

    return null
  }

  /**
   * Desktop CmdAddSection / AddSection (and update-in-place when a row is selected).
   * Adds/updates a row in the local grid only — no API call.
   */
  function handleAddOrUpdateSection() {
    const validationError = getSectionFormError()
    if (validationError) {
      setError(validationError)
      return
    }

    const sectionName = form.sectionId.trim()
    const duplicate = form.sections.find(
      (section) =>
        section.sectionId.trim().toLowerCase() === sectionName.toLowerCase() &&
        section.id !== editingSectionId
    )
    if (duplicate) {
      setError("Show section already exist with this data ..")
      return
    }

    const nextSection: ShowTimeSectionDraft = {
      // Temporary client id (desktop Guid.NewGuid) so the grid can track the row.
      id: editingSectionId ?? crypto.randomUUID(),
      sectionId: sectionName,
      price: Number(form.price).toFixed(2),
      walkupFee: form.walkupFee || "0.00",
      phoneFee: form.phoneFee || "0.00",
      webFee: form.webFee || "0.00",
      seats: String(Number(form.seats)),
      showOnWeb: form.showOnWeb,
      restrictShowPromo: form.restrictShowPromo,
    }

    setError(null)
    setForm((current) => {
      const sections = editingSectionId
        ? current.sections.map((section) =>
            section.id === editingSectionId ? nextSection : section
          )
        : [...current.sections, nextSection]

      return clearSectionForm({ ...current, sections })
    })
    setEditingSectionId(null)
  }

  function handleEditSection(section: ShowTimeSectionDraft) {
    setEditingSectionId(section.id)
    setError(null)
    setForm((current) => ({
      ...current,
      sectionId: section.sectionId,
      price: section.price,
      seats: section.seats,
      walkupFee: section.walkupFee,
      phoneFee: section.phoneFee,
      webFee: section.webFee,
      showOnWeb: section.showOnWeb,
      restrictShowPromo: section.restrictShowPromo,
    }))
  }

  function handleRemoveSection(id: string) {
    setForm((current) => {
      const next = {
        ...current,
        sections: current.sections.filter((section) => section.id !== id),
      }
      if (editingSectionId === id) {
        return clearSectionForm(next)
      }
      return next
    })
    if (editingSectionId === id) {
      setEditingSectionId(null)
    }
  }

  function handleSave() {
    if (form.sections.length === 0) {
      setError("Add at least one section before saving.")
      return
    }

    onSave?.({
      showTime: form.showTime,
      arrivalTime: form.arrivalTime,
      dinner: form.dinner,
      noPasses: form.noPasses,
      vipSeating: form.vipSeating,
      age21Plus: form.age21Plus,
      hub: form.hub,
      alsoAppliesTo: { ...form.alsoAppliesTo },
      sections: form.sections.map((section) => ({ ...section })),
    })
    onOpenChange(false)
  }

  const timeRange = formatTimeRange(form.showTime, form.arrivalTime)
  const sectionColumns = createSectionColumns(
    sectionLabelByCode,
    timeRange,
    handleEditSection,
    handleRemoveSection
  )
  const isUpdatingSection = Boolean(editingSectionId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        nested={nested}
        className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              Edit Show Times
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto px-4 py-2">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="rounded-md border p-2.5">
            <FormSection title="Show Details">
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-start">
                  <FormField label="Day Of Week">
                    <Select
                      value={form.dayOfWeek}
                      disabled
                      onValueChange={(value) => updateField("dayOfWeek", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOfWeekOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-foreground">
                      Also Applies to
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {weekDayCheckboxOptions.map((day) => {
                        const isLockedDay = day.id === form.dayOfWeek
                        return (
                          <label
                            key={day.id}
                            className={
                              isLockedDay
                                ? "flex cursor-not-allowed items-center gap-1.5 text-xs text-muted-foreground"
                                : "flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                            }
                          >
                            <Checkbox
                              checked={form.alsoAppliesTo[day.id] ?? false}
                              disabled={isLockedDay}
                              onCheckedChange={(value) =>
                                toggleAlsoAppliesTo(day.id, value === true)
                              }
                            />
                            {day.label.slice(0, 3)}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField label="Show Time" htmlFor="edit-calendar-show-time">
                    <CalendarTimeControl
                      id="edit-calendar-show-time"
                      value={form.showTime}
                      onChange={(value) => updateField("showTime", value)}
                    />
                  </FormField>
                  <FormField
                    label="Arrival Time"
                    htmlFor="edit-calendar-arrival-time"
                  >
                    <CalendarTimeControl
                      id="edit-calendar-arrival-time"
                      value={form.arrivalTime}
                      onChange={(value) => updateField("arrivalTime", value)}
                    />
                  </FormField>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-foreground">Options</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {(
                      [
                        ["dinner", "Dinner"],
                        ["noPasses", "No Passes"],
                        ["vipSeating", "VIP Seating"],
                        ["age21Plus", "21 and Over"],
                        // ["hub", "Hub"],
                      ] as const
                    ).map(([field, label]) => (
                      <label
                        key={field}
                        className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
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
                  </div>
                </div>
              </div>
            </FormSection>
          </div>

          <div className="rounded-md border p-2.5">
            <FormSection title="Section">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Select Section">
                  <CalendarSelectControl
                    id="edit-calendar-select-section"
                    value={form.sectionId}
                    onChange={(value) => updateField("sectionId", value)}
                    options={sectionOptions}
                    placeholder="Select Section"
                    ariaLabel="Select Section"
                  />
                </FormField>
                <FormField label="Price">
                  <PrefixedInput
                    value={form.price}
                    onChange={(value) => updateField("price", value)}
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
                <FormField label="Walkup Fee">
                  <PrefixedInput
                    value={form.walkupFee}
                    onChange={(value) => updateField("walkupFee", value)}
                  />
                </FormField>
                <FormField label="Phone Fee">
                  <PrefixedInput
                    value={form.phoneFee}
                    onChange={(value) => updateField("phoneFee", value)}
                  />
                </FormField>
                <FormField label="Web Fee">
                  <PrefixedInput
                    value={form.webFee}
                    onChange={(value) => updateField("webFee", value)}
                  />
                </FormField>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleAddOrUpdateSection}
                >
                  <Plus className="size-3.5" />
                  {isUpdatingSection ? "Update Section" : "Add Section"}
                </Button>
              </div>

              <div className="mt-2 overflow-hidden rounded-md border">
                <DataTable
                  columns={sectionColumns}
                  data={form.sections}
                  emptyMessage="No record found"
                  entityLabel="sections"
                  enablePagination={false}
                  getRowId={(row) => row.id}
                  onRowClick={(row) => handleEditSection(row.original)}
                />
              </div>
            </FormSection>
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

