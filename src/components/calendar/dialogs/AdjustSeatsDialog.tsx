import { useEffect, useState } from "react"

import CalendarSelectControl from "../controls/CalendarSelectControl"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CalendarEvent } from "@/types/calendar-event"

import {
  applySectionFormChange,
  applySectionUpdate,
  createAdjustSeatsFormValues,
  getAdjustSeatsDialogData,
  resetSectionForm,
  saveAdjustSeats,
  type AdjustSeatsDialogData,
  type AdjustSeatsFormValues,
  type AdjustSeatsSectionRow,
} from "../service/adjustSeats.service"

type AdjustSeatsDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

const FIELD_ROW_CLASS = "grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center"

function AdjustSeatsSkeleton() {
  return (
    <div className="space-y-5 px-5 py-5" aria-label="Loading adjust seats form">
      <fieldset className="rounded-md border p-4">
        <legend className="px-2 text-sm font-medium">Section</legend>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={FIELD_ROW_CLASS}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-56" />
        </div>
      </fieldset>
      <div className="overflow-hidden border">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

function AdjustSeatsTable({ sections }: { sections: AdjustSeatsSectionRow[] }) {
  return (
    <div className="overflow-auto border">
      <Table className="min-w-[32rem] border-collapse">
        <TableHeader className="bg-muted text-muted-foreground">
          <TableRow>
            <TableHead className="border px-3 py-2 font-semibold">Section</TableHead>
            <TableHead className="border px-3 py-2 font-semibold">Price</TableHead>
            <TableHead className="border px-3 py-2 font-semibold">Seats</TableHead>
            <TableHead className="border px-3 py-2 font-semibold">Show on Web</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <TableRow key={section.id} className="odd:bg-background even:bg-muted/20">
              <TableCell className="border px-3 py-2">{section.section}</TableCell>
              <TableCell className="border px-3 py-2">{section.price}</TableCell>
              <TableCell className="border px-3 py-2">{section.seats}</TableCell>
              <TableCell className="border px-3 py-2">
                {section.showOnWeb ? "Yes" : "No"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function AdjustSeatsDialog({
  open,
  event,
  onOpenChange,
  onSaved,
}: AdjustSeatsDialogProps) {
  const [dialogData, setDialogData] = useState<AdjustSeatsDialogData | null>(null)
  const [formValues, setFormValues] = useState<AdjustSeatsFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setDialogData(null)
      setFormValues(null)
      return
    }

    if (!event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getAdjustSeatsDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
          setFormValues(createAdjustSeatsFormValues(data))
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [event, open])

  function updateSectionField<K extends keyof AdjustSeatsFormValues["sectionForm"]>(
    field: K,
    value: AdjustSeatsFormValues["sectionForm"][K]
  ) {
    setFormValues((current) =>
      current
        ? {
            ...current,
            sectionForm: applySectionFormChange(current.sectionForm, field, value),
          }
        : current
    )
  }

  function handleUpdateSection() {
    if (!formValues || !dialogData) {
      return
    }

    setFormValues(applySectionUpdate(formValues, dialogData.sectionOptions))
  }

  function handleCancelSectionForm() {
    setFormValues((current) =>
      current ? { ...current, sectionForm: resetSectionForm() } : current
    )
  }

  async function handleSave() {
    if (!formValues || !dialogData) {
      return
    }

    setIsSubmitting(true)

    try {
      await saveAdjustSeats(dialogData.eventId, formValues)
      onSaved?.()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-4xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg">Adjust Seats</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
          {isLoading || !formValues || !dialogData ? (
            <AdjustSeatsSkeleton />
          ) : (
            <div className="space-y-5 px-5 py-5">
              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Section</legend>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className={FIELD_ROW_CLASS}>
                      <Label htmlFor="adjust-seats-section">Select Section</Label>
                      <CalendarSelectControl
                        id="adjust-seats-section"
                        value={formValues.sectionForm.sectionId}
                        onChange={(value) => updateSectionField("sectionId", value)}
                        placeholder="Section"
                        options={dialogData.sectionOptions}
                      />
                    </div>

                    <div className={FIELD_ROW_CLASS}>
                      <Label htmlFor="adjust-seats-price">Price</Label>
                      <Input
                        id="adjust-seats-price"
                        value={formValues.sectionForm.price}
                        onChange={(changeEvent) =>
                          updateSectionField("price", changeEvent.target.value)
                        }
                        className="h-9"
                      />
                    </div>

                    <div className={FIELD_ROW_CLASS}>
                      <Label htmlFor="adjust-seats-seat-count">Number of Seats</Label>
                      <Input
                        id="adjust-seats-seat-count"
                        value={formValues.sectionForm.seatCount}
                        onChange={(changeEvent) =>
                          updateSectionField("seatCount", changeEvent.target.value)
                        }
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="adjust-seats-show-on-web"
                        checked={formValues.sectionForm.showOnWeb}
                        onCheckedChange={(checked) =>
                          updateSectionField("showOnWeb", checked === true)
                        }
                      />
                      <Label htmlFor="adjust-seats-show-on-web">Show on Web</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="adjust-seats-hub"
                        checked={formValues.sectionForm.hub}
                        onCheckedChange={(checked) =>
                          updateSectionField("hub", checked === true)
                        }
                      />
                      <Label htmlFor="adjust-seats-hub">Hub</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="adjust-seats-show-appearing"
                        checked={formValues.sectionForm.showAppearing}
                        onCheckedChange={(checked) =>
                          updateSectionField("showAppearing", checked === true)
                        }
                      />
                      <Label htmlFor="adjust-seats-show-appearing">Show Appearing</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" onClick={handleUpdateSection}>
                        Update Section
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelSectionForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </fieldset>

              <AdjustSeatsTable sections={formValues.sections} />
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4 sm:justify-start">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!formValues || isLoading || isSubmitting}
          >
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
