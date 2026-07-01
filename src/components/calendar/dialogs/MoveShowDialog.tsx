import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { calendarDialogMaxWidth } from "./calendar-dialog-width"
import CalendarDatePickerControl from "../controls/CalendarDatePickerControl"
import CalendarTimeControl from "../controls/CalendarTimeControl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { CalendarEvent } from "@/types/calendar-event"

import {
  createMoveShowFormValues,
  getMoveShowDialogData,
  moveShow,
  type MoveShowDialogData,
  type MoveShowFormValues,
} from "../service/moveShow.service"

type MoveShowDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onMoved?: () => void
}

function MoveShowSkeleton() {
  return (
    <div className="px-5 py-5" aria-label="Loading move show form">
      <fieldset className="rounded-md border p-4">
        <legend className="px-2 text-sm font-medium">Select date to move show</legend>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="grid min-w-[12rem] flex-1 gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full max-w-48" />
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default function MoveShowDialog({
  open,
  event,
  onOpenChange,
  onMoved,
}: MoveShowDialogProps) {
  const [dialogData, setDialogData] = useState<MoveShowDialogData | null>(null)
  const [formValues, setFormValues] = useState<MoveShowFormValues | null>(null)
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
    getMoveShowDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
          setFormValues(createMoveShowFormValues(data))
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

  function updateField<K extends keyof MoveShowFormValues>(
    field: K,
    value: MoveShowFormValues[K]
  ) {
    setFormValues((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleMove() {
    if (!formValues || !dialogData || !formValues.moveDate) {
      return
    }

    setIsSubmitting(true)

    try {
      await moveShow(dialogData.eventId, formValues)
      onMoved?.()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canMove = Boolean(formValues?.moveDate) && !isLoading && !isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className={cn(calendarDialogMaxWidth("3xl"), "max-h-[calc(100vh-2rem)] overflow-hidden")}>
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg">Move Show</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
          {isLoading || !formValues || !dialogData ? (
            <MoveShowSkeleton />
          ) : (
            <div className="px-5 py-5">
              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Select date to move show</legend>
                <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                  <div className="grid min-w-[12rem] flex-1 gap-2">
                    <Label htmlFor="move-show-date">Select Date</Label>
                    <CalendarDatePickerControl
                      id="move-show-date"
                      value={formValues.moveDate}
                      onChange={(value) => updateField("moveDate", value)}
                      disablePastDates
                      placeholder="Select a date"
                    />
                  </div>

                  <div className="grid min-w-[12rem] flex-1 gap-2">
                    <Label htmlFor="move-show-time">Show Time</Label>
                    <CalendarTimeControl
                      id="move-show-time"
                      value={formValues.showTime}
                      onChange={(value) => updateField("showTime", value)}
                    />
                  </div>

                  <div className="grid min-w-[12rem] flex-1 gap-2">
                    <Label htmlFor="move-show-arrival-time">Arrival Time</Label>
                    <CalendarTimeControl
                      id="move-show-arrival-time"
                      value={formValues.arrivalTime}
                      onChange={(value) => updateField("arrivalTime", value)}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4 sm:justify-start">
          <Button type="button" onClick={handleMove} disabled={!canMove}>
            Move
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
