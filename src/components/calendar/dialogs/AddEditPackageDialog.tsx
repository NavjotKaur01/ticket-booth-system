import { useEffect, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import type { CalendarEvent } from "@/data/calendarEvents"

import CalendarTimeControl from "../controls/CalendarTimeControl"

import {
  getAddEditPackageDialogData,
  type AddEditPackageDialogData,
} from "../service/addEditPackage.service"

type AddEditPackageDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
  onSave?: (value: AddEditPackageDialogData) => void
}

function AddEditPackageSkeleton() {
  return (
    <div className="space-y-5 px-5 py-5">
      <div className="grid gap-x-16 gap-y-5 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

export default function AddEditPackageDialog({
  open,
  event,
  onOpenChange,
  onAfterClose,
  onSave,
}: AddEditPackageDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formValues, setFormValues] = useState<AddEditPackageDialogData | null>(null)

  function resetDialogSession() {
    setIsLoading(false)
    setFormValues(null)
    onAfterClose?.()
  }

  useEffect(() => {
    if (!open || !event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getAddEditPackageDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setFormValues(data)
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

  function updateField<K extends keyof AddEditPackageDialogData>(
    field: K,
    value: AddEditPackageDialogData[K]
  ) {
    setFormValues((current) => current ? { ...current, [field]: value } : current)
  }

  function handleSave() {
    if (formValues) {
      onSave?.(formValues)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        disableOutsideDismiss
        className="flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden sm:max-w-6xl"
        onAfterClose={resetDialogSession}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Add Package</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading || !formValues ? (
            <AddEditPackageSkeleton />
          ) : (
            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-x-16 gap-y-4 md:grid-cols-2">
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label>Date</Label>
                  <p className="text-sm font-medium">{formValues.dateLabel}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label>Time</Label>
                  <p className="text-sm font-medium">{formValues.timeLabel}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label htmlFor="package-start-time">Start Time</Label>
                  <CalendarTimeControl
                    id="package-start-time"
                    value={formValues.startTime}
                    onChange={(value) => updateField("startTime", value)}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label htmlFor="package-arrival-time">Arrival Time</Label>
                  <CalendarTimeControl
                    id="package-arrival-time"
                    value={formValues.arrivalTime}
                    onChange={(value) => updateField("arrivalTime", value)}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label htmlFor="package-price">Price</Label>
                  <Input
                    id="package-price"
                    value={formValues.price}
                    onChange={(changeEvent) => updateField("price", changeEvent.target.value)}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label htmlFor="package-seats">Seats</Label>
                  <Input
                    id="package-seats"
                    value={formValues.seats}
                    onChange={(changeEvent) => updateField("seats", changeEvent.target.value)}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label htmlFor="package-name">Package Name</Label>
                  <Input
                    id="package-name"
                    value={formValues.packageName}
                    onChange={(changeEvent) => updateField("packageName", changeEvent.target.value)}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <Label>Comic</Label>
                  <p className="text-sm font-medium">{formValues.comic}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-text">Package Text</Label>
                <Textarea
                  id="package-text"
                  value={formValues.packageText}
                  onChange={(changeEvent) => updateField("packageText", changeEvent.target.value)}
                  className="min-h-72 resize-y"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-5 py-4">
          <Button type="button" onClick={handleSave} disabled={!formValues || isLoading}>
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






