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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import type { CalendarEvent } from "@/data/calendarEvents"
import { cn } from "@/lib/utils"

import { calendarDialogMaxWidth } from "./calendar-dialog-width"
import CalendarSelectControl from "../controls/CalendarSelectControl"
import {
  applyAdjustAgeModeChange,
  applyAgeFlagChange,
  applyMinAgeChange,
  createAdjustAgeFormValues,
  getAdjustAgeDialogData,
  type AdjustAgeDialogData,
  type AdjustAgeFormValues,
  type AdjustAgeMode,
} from "../service/adjustAge.service"

type AdjustAgeDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onSave?: (values: AdjustAgeFormValues) => void
}

const AGE_FLAG_NOTE =
  "Note: Select age = Do not show age on web, A = All ages, Y = Over 21, N = Over 18, S = Special case set min age"

function AdjustAgeSkeleton() {
  return (
    <div className="space-y-4 px-5 py-5" aria-label="Loading adjust age form">
      <Skeleton className="h-4 w-48" />
      <fieldset className="rounded-md border p-4">
        <div className="space-y-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-9 w-full max-w-sm" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
      </fieldset>
    </div>
  )
}

export default function AdjustAgeDialog({
  open,
  event,
  onOpenChange,
  onSave,
}: AdjustAgeDialogProps) {
  const [dialogData, setDialogData] = useState<AdjustAgeDialogData | null>(null)
  const [formValues, setFormValues] = useState<AdjustAgeFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open || !event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getAdjustAgeDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
          setFormValues(createAdjustAgeFormValues(data))
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

  function handleModeChange(mode: AdjustAgeMode) {
    setFormValues((current) => (current ? applyAdjustAgeModeChange(current, mode) : current))
  }

  function handleAgeFlagChange(ageFlag: string) {
    setFormValues((current) => (current ? applyAgeFlagChange(current, ageFlag) : current))
  }

  function handleMinAgeChange(minAge: string) {
    setFormValues((current) => (current ? applyMinAgeChange(current, minAge) : current))
  }

  function handleSave() {
    if (formValues) {
      onSave?.(formValues)
    }

    onOpenChange(false)
  }

  const headerTitle = dialogData
    ? `Adjust Age :- ${dialogData.performer}    ${dialogData.showDateLabel}`
    : "Adjust Age"

  const isFlagMode = formValues?.mode === "flag"
  const isMinAgeMode = formValues?.mode === "minAge"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className={cn(calendarDialogMaxWidth("2xl"), "max-h-[calc(100vh-2rem)] overflow-hidden")}>
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg">{headerTitle}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
          {isLoading || !formValues || !dialogData ? (
            <AdjustAgeSkeleton />
          ) : (
            <div className="space-y-4 px-5 py-5">
              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Age Settings</legend>
                <RadioGroup
                  value={formValues.mode}
                  onValueChange={(value) => handleModeChange(value as AdjustAgeMode)}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="flag" id="adjust-age-flag-mode" />
                      <Label htmlFor="adjust-age-flag-mode">Set Minimum Age Flag</Label>
                    </div>
                    <div
                      className={cn(
                        "grid gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center sm:pl-6",
                        !isFlagMode && "pointer-events-none opacity-50"
                      )}
                    >
                      <Label htmlFor="adjust-age-flag">Age Flag</Label>
                      <CalendarSelectControl
                        id="adjust-age-flag"
                        value={formValues.ageFlag}
                        onChange={handleAgeFlagChange}
                        placeholder="Select age"
                        disabled={!isFlagMode}
                        options={dialogData.ageFlagOptions}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="minAge" id="adjust-age-min-mode" />
                      <Label htmlFor="adjust-age-min-mode">Select Age</Label>
                    </div>
                    <div
                      className={cn(
                        "grid gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center sm:pl-6",
                        !isMinAgeMode && "pointer-events-none opacity-50"
                      )}
                    >
                      <Label htmlFor="adjust-age-min-age">Min Age</Label>
                      <Input
                        id="adjust-age-min-age"
                        type="number"
                        min={0}
                        value={formValues.minAge}
                        onChange={(changeEvent) => handleMinAgeChange(changeEvent.target.value)}
                        disabled={!isMinAgeMode}
                        className="h-9 max-w-32"
                      />
                    </div>
                  </div>
                </RadioGroup>

                <p className="mt-4 text-sm text-muted-foreground">{AGE_FLAG_NOTE}</p>
              </fieldset>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4 sm:justify-start">
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
