import { useEffect, useState } from "react"

import CalendarDatePickerControl from "../controls/CalendarDatePickerControl"
import CalendarSelectControl from "../controls/CalendarSelectControl"
import CalendarTimeControl from "../controls/CalendarTimeControl"
import { Button } from "@/components/ui/button"
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
import type { CalendarEvent } from "@/types/calendar-event"

import {
  createPrivatePreSaleFormValues,
  getPrivatePreSaleDialogData,
  savePrivatePreSale,
  type PrivatePreSaleDialogData,
  type PrivatePreSaleFormValues,
} from "../service/privatePreSale.service"

type PrivatePreSaleDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

const FIELD_ROW_CLASS = "grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center"

function PrivatePreSaleSkeleton() {
  return (
    <div className="px-5 py-5" aria-label="Loading private pre-sale form">
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={FIELD_ROW_CLASS}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PrivatePreSaleDialog({
  open,
  event,
  onOpenChange,
  onSaved,
}: PrivatePreSaleDialogProps) {
  const [dialogData, setDialogData] = useState<PrivatePreSaleDialogData | null>(null)
  const [formValues, setFormValues] = useState<PrivatePreSaleFormValues | null>(null)
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
    getPrivatePreSaleDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
          setFormValues(createPrivatePreSaleFormValues(data))
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

  function updateField<K extends keyof PrivatePreSaleFormValues>(
    field: K,
    value: PrivatePreSaleFormValues[K]
  ) {
    setFormValues((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleSave() {
    if (!formValues || !dialogData) {
      return
    }

    setIsSubmitting(true)

    try {
      await savePrivatePreSale(dialogData.eventId, formValues)
      onSaved?.()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg">Private Pre-sale Setup</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
          {isLoading || !formValues || !dialogData ? (
            <PrivatePreSaleSkeleton />
          ) : (
            <div className="px-5 py-5">
              <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-show-date">Show Date</Label>
                  <CalendarDatePickerControl
                    id="private-pre-sale-show-date"
                    value={formValues.showDate}
                    onChange={(value) => updateField("showDate", value)}
                    disablePastDates
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-comic">Select Comic</Label>
                  <CalendarSelectControl
                    id="private-pre-sale-comic"
                    value={formValues.comicId}
                    onChange={(value) => updateField("comicId", value)}
                    placeholder="Select Comic"
                    options={dialogData.comicOptions}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-show">Select Show</Label>
                  <CalendarSelectControl
                    id="private-pre-sale-show"
                    value={formValues.showId}
                    onChange={(value) => updateField("showId", value)}
                    placeholder="Select Show"
                    options={dialogData.showOptions}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-access-code">Access Code</Label>
                  <Input
                    id="private-pre-sale-access-code"
                    value={formValues.accessCode}
                    onChange={(changeEvent) =>
                      updateField("accessCode", changeEvent.target.value)
                    }
                    className="h-9"
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-start-date">Start Date</Label>
                  <CalendarDatePickerControl
                    id="private-pre-sale-start-date"
                    value={formValues.startDate}
                    onChange={(value) => updateField("startDate", value)}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-start-time">Start Time</Label>
                  <CalendarTimeControl
                    id="private-pre-sale-start-time"
                    value={formValues.startTime}
                    onChange={(value) => updateField("startTime", value)}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-end-date">End Date</Label>
                  <CalendarDatePickerControl
                    id="private-pre-sale-end-date"
                    value={formValues.endDate}
                    onChange={(value) => updateField("endDate", value)}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-end-time">End Time</Label>
                  <CalendarTimeControl
                    id="private-pre-sale-end-time"
                    value={formValues.endTime}
                    onChange={(value) => updateField("endTime", value)}
                  />
                </div>
              </div>
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
