import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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
import { ShowTimeSectionActionsMenu } from "@/features/show-times/show-time-row-actions-menu"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  getDefShowInfo,
  saveShowDef,
  updateShowDef,
} from "@/lib/api/show-times"
import {
  buildSaveShowDefRequests,
  buildUpdateShowDefRequests,
} from "@/lib/build-show-def-request"
import { mapDefShowInfoToForm } from "@/lib/map-def-show-info"
import { mapSystemLookupsToSectionItems } from "@/lib/section-lookup"
import { useGetSystemLookupQuery } from "@/store/api/clubmanApi"
import type { ApiSystemLookupItem } from "@/types/api/system-lookup"
import {
  createEmptyShowTimeForm,
  EMPTY_ALSO_APPLIES_TO,
  type ShowTimeFormValues,
  type ShowTimeSectionDraft,
} from "@/types/show-time"

/** Stable fallback — inline `= []` creates a new array every render and can loop. */
const EMPTY_SYSTEM_LOOKUPS: ApiSystemLookupItem[] = []

type AddShowTimeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingShowDefId?: string | null
  defaultDayOfWeek?: string
  onSaved?: () => void | Promise<void>
}

function createSectionColumns(
  sectionLabelByCode: Map<string, string>,
  onRemove: (id: string) => void
): ColumnDef<ShowTimeSectionDraft>[] {
  return [
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
        <span className="tabular-nums">${row.original.price || "0.00"}</span>
      ),
    },
    {
      accessorKey: "walkupFee",
      header: "Walkup Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">${row.original.walkupFee || "0.00"}</span>
      ),
    },
    {
      accessorKey: "phoneFee",
      header: "Phone Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">${row.original.phoneFee || "0.00"}</span>
      ),
    },
    {
      accessorKey: "webFee",
      header: "Web Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">${row.original.webFee || "0.00"}</span>
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
      accessorKey: "showOnWeb",
      header: "Show on Web",
      cell: ({ row }) => (row.original.showOnWeb ? "Y" : "N"),
    },
    {
      accessorKey: "restrictShowPromo",
      header: "Restricted Promo",
      cell: ({ row }) => (row.original.restrictShowPromo ? "Y" : "N"),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <ShowTimeSectionActionsMenu onRemove={() => onRemove(row.original.id)} />
      ),
    },
  ]
}

function buildInitialForm(defaultDayOfWeek?: string): ShowTimeFormValues {
  const form = createEmptyShowTimeForm()
  if (!defaultDayOfWeek || defaultDayOfWeek === "all") return form

  form.dayOfWeek = defaultDayOfWeek
  form.alsoAppliesTo = {
    ...EMPTY_ALSO_APPLIES_TO,
    mon: false,
    [defaultDayOfWeek]: true,
  }
  return form
}

export function AddShowTimeDialog({
  open,
  onOpenChange,
  editingShowDefId = null,
  defaultDayOfWeek,
  onSaved,
}: AddShowTimeDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const isEdit = Boolean(editingShowDefId)
  const [form, setForm] = useState<ShowTimeFormValues>(() =>
    buildInitialForm(defaultDayOfWeek)
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const { data: systemLookupsData } = useGetSystemLookupQuery(connectionName, {
    skip: !open || !connectionName,
  })
  const systemLookups = systemLookupsData ?? EMPTY_SYSTEM_LOOKUPS
  const sectionLookups = useMemo(
    () => mapSystemLookupsToSectionItems(systemLookups),
    [systemLookups]
  )
  const sectionLabelByCode = useMemo(
    () =>
      new Map(sectionLookups.map((item) => [item.code, item.description])),
    [sectionLookups]
  )

  // Reset only when the dialog closes / default day changes — not when lookups identity churns.
  useEffect(() => {
    if (open) return
    setForm(buildInitialForm(defaultDayOfWeek))
    setError(null)
    setSaving(false)
    setLoadingDetails(false)
  }, [open, defaultDayOfWeek])

  useEffect(() => {
    if (!open) return

    if (!editingShowDefId || !connectionName) {
      setForm(buildInitialForm(defaultDayOfWeek))
      return
    }

    let cancelled = false
    setLoadingDetails(true)
    setError(null)

    void getDefShowInfo(connectionName, editingShowDefId)
      .then((items) => {
        if (cancelled) return
        setForm(mapDefShowInfoToForm(items ?? [], sectionLookups))
      })
      .catch((loadError) => {
        if (cancelled) return
        reportError(
          setError,
          loadError,
          "Unable to load show time details."
        )
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, editingShowDefId, connectionName, defaultDayOfWeek, sectionLookups])

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

  function handleAddSection() {
    if (!form.sectionId) {
      reportErrorMessage(setError, "Select a section before adding.")
      return
    }

    const section: ShowTimeSectionDraft = {
      id: crypto.randomUUID(),
      sectionId: form.sectionId,
      price: form.price,
      walkupFee: form.walkupFee,
      phoneFee: form.phoneFee,
      webFee: form.webFee,
      seats: form.seats,
      showOnWeb: form.showOnWeb,
      restrictShowPromo: form.restrictShowPromo,
    }

    setError(null)
    setForm((current) => ({
      ...current,
      sections: [...current.sections, section],
      sectionId: "",
      price: "",
      seats: "",
      walkupFee: "0.00",
      phoneFee: "0.00",
      webFee: "0.00",
      showOnWeb: true,
      restrictShowPromo: false,
    }))
  }

  function handleRemoveSection(id: string) {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== id),
    }))
  }

  async function handleSave() {
    if (!isReady || !connectionName || !locationId) {
      reportErrorMessage(
        setError,
        "Location is required before saving a show time."
      )
      return
    }
    if (form.sections.length === 0) {
      reportErrorMessage(setError, "Add at least one section before saving.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEdit && editingShowDefId) {
        const { updates, creates } = buildUpdateShowDefRequests({
          connectionName,
          locationId,
          lastUpdateId: username,
          form,
          sectionLookups,
          showDefId: editingShowDefId,
        })
        for (const request of updates) {
          await updateShowDef(request)
        }
        for (const request of creates) {
          await saveShowDef(request)
        }
      } else {
        const requests = buildSaveShowDefRequests({
          connectionName,
          locationId,
          lastUpdateId: username,
          form,
          sectionLookups,
        })
        if (requests.length === 0) {
          reportErrorMessage(setError, "Select at least one day before saving.")
          return
        }
        for (const request of requests) {
          await saveShowDef(request)
        }
      }

      toastSuccess(isEdit ? "Show time updated" : "Show time saved")
      await onSaved?.()
      onOpenChange(false)
    } catch (saveError) {
      reportError(setError, saveError, "Unable to save show time.")
    } finally {
      setSaving(false)
    }
  }

  const sectionColumns = createSectionColumns(
    sectionLabelByCode,
    handleRemoveSection
  )
  const formDisabled = saving || loadingDetails

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              {isEdit ? "Edit Show Times" : "Add Show Times"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto px-4 py-2">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loadingDetails ? (
            <p className="text-sm text-muted-foreground">
              Loading show time details...
            </p>
          ) : null}

          <div className="rounded-md border p-2.5">
            <FormSection title="Show Details">
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-start">
                  <FormField label="Day Of Week">
                    <Select
                      value={form.dayOfWeek}
                      onValueChange={(value) => updateField("dayOfWeek", value)}
                      disabled={formDisabled}
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
                      {weekDayCheckboxOptions.map((day) => (
                        <label
                          key={day.id}
                          className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                        >
                          <Checkbox
                            checked={form.alsoAppliesTo[day.id] ?? false}
                            disabled={formDisabled}
                            onCheckedChange={(value) =>
                              toggleAlsoAppliesTo(day.id, value === true)
                            }
                          />
                          {day.label.slice(0, 3)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField label="Show Time" htmlFor="add-show-time">
                    <Input
                      id="add-show-time"
                      type="time"
                      value={form.showTime}
                      disabled={formDisabled}
                      onChange={(event) =>
                        updateField("showTime", event.target.value)
                      }
                    />
                  </FormField>
                  <FormField label="Arrival Time" htmlFor="add-arrival-time">
                    <Input
                      id="add-arrival-time"
                      type="time"
                      value={form.arrivalTime}
                      disabled={formDisabled}
                      onChange={(event) =>
                        updateField("arrivalTime", event.target.value)
                      }
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
                      ] as const
                    ).map(([field, label]) => (
                      <label
                        key={field}
                        className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                      >
                        <Checkbox
                          checked={form[field]}
                          disabled={formDisabled}
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
                  <Select
                    value={form.sectionId || undefined}
                    onValueChange={(value) => updateField("sectionId", value)}
                    disabled={formDisabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionLookups.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Price">
                  <PrefixedInput
                    value={form.price}
                    onChange={(value) => updateField("price", value)}
                    disabled={formDisabled}
                  />
                </FormField>
                <FormField label="Number of Seats">
                  <Input
                    type="number"
                    min={0}
                    value={form.seats}
                    disabled={formDisabled}
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
                    disabled={formDisabled}
                  />
                </FormField>
                <FormField label="Phone Fee">
                  <PrefixedInput
                    value={form.phoneFee}
                    onChange={(value) => updateField("phoneFee", value)}
                    disabled={formDisabled}
                  />
                </FormField>
                <FormField label="Web Fee">
                  <PrefixedInput
                    value={form.webFee}
                    onChange={(value) => updateField("webFee", value)}
                    disabled={formDisabled}
                  />
                </FormField>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.showOnWeb}
                      disabled={formDisabled}
                      onCheckedChange={(value) =>
                        updateField("showOnWeb", value === true)
                      }
                    />
                    Show on Web
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.restrictShowPromo}
                      disabled={formDisabled}
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
                  disabled={formDisabled}
                  onClick={handleAddSection}
                >
                  <Plus className="size-3.5" />
                  Add Section
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
                />
              </div>
            </FormSection>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
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
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
