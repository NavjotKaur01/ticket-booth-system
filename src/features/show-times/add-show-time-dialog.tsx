import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

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
  getSectionLabel,
  showSectionOptions,
  weekDayCheckboxOptions,
} from "@/data/show-time-form-options"
import { ShowTimeSectionActionsMenu } from "@/features/show-times/show-time-row-actions-menu"
import {
  createEmptyShowTimeForm,
  type ShowTimeFormValues,
  type ShowTimeSectionDraft,
} from "@/types/show-time"

type AddShowTimeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createSectionColumns(
  onRemove: (id: string) => void
): ColumnDef<ShowTimeSectionDraft>[] {
  return [
    {
      accessorKey: "sectionId",
      header: "Section",
      cell: ({ row }) => getSectionLabel(row.original.sectionId),
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

export function AddShowTimeDialog({
  open,
  onOpenChange,
}: AddShowTimeDialogProps) {
  const [form, setForm] = useState<ShowTimeFormValues>(createEmptyShowTimeForm())

  useEffect(() => {
    if (!open) {
      setForm(createEmptyShowTimeForm())
    }
  }, [open])

  function updateField<K extends keyof ShowTimeFormValues>(
    field: K,
    value: ShowTimeFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleAlsoAppliesTo(dayId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      alsoAppliesTo: { ...current.alsoAppliesTo, [dayId]: checked },
    }))
  }

  function handleAddSection() {
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

  function handleSave() {
    onOpenChange(false)
  }

  const sectionColumns = createSectionColumns(handleRemoveSection)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Add Show Times</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto px-4 py-2">
          <div className="rounded-md border p-2.5">
            <FormSection title="Show Details">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-3">
                <FormField label="Day Of Week" className="shrink-0 sm:w-40">
                  <Select
                    value={form.dayOfWeek}
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

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    Also Applies to
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {weekDayCheckboxOptions.map((day) => (
                      <label
                        key={day.id}
                        className="flex cursor-pointer items-center gap-1.5 text-xs"
                      >
                        <Checkbox
                          checked={form.alsoAppliesTo[day.id] ?? false}
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

              <div className="mt-2 flex flex-wrap items-end gap-3">
                <FormField label="Show Time" htmlFor="add-show-time">
                  <Input
                    id="add-show-time"
                    type="time"
                    value={form.showTime}
                    onChange={(event) =>
                      updateField("showTime", event.target.value)
                    }
                    className="w-[8.5rem]"
                  />
                </FormField>
                <FormField label="Arrival Time" htmlFor="add-arrival-time">
                  <Input
                    id="add-arrival-time"
                    type="time"
                    value={form.arrivalTime}
                    onChange={(event) =>
                      updateField("arrivalTime", event.target.value)
                    }
                    className="w-[8.5rem]"
                  />
                </FormField>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.dinner}
                      onCheckedChange={(value) =>
                        updateField("dinner", value === true)
                      }
                    />
                    Dinner
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.noPasses}
                      onCheckedChange={(value) =>
                        updateField("noPasses", value === true)
                      }
                    />
                    No Passes
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.vipSeating}
                      onCheckedChange={(value) =>
                        updateField("vipSeating", value === true)
                      }
                    />
                    VIP Seating
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.age21Plus}
                      onCheckedChange={(value) =>
                        updateField("age21Plus", value === true)
                      }
                    />
                    21 and Over
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.hub}
                      onCheckedChange={(value) =>
                        updateField("hub", value === true)
                      }
                    />
                    Hub
                  </label>
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
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {showSectionOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
