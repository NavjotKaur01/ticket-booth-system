import { useEffect, useMemo, useState } from "react"

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

import CalendarSelectControl from "../controls/CalendarSelectControl"
import {
  applyAdjustAgeModeChange,
  applyAgeFlagChange,
  applyMinAgeChange,
  parseInitialAgeValues,
  getSelectedAgeParam,
  AGE_FLAG_OPTIONS,
  type AdjustAgeFormValues,
  type AdjustAgeMode,
} from "../service/adjustAge.service"
import { useAppSession } from "@/hooks/use-app-session"
import { useGetShowPropertiesQuery, useAdjustShowAgeMutation } from "@/store/api/clubmanApi"

type AdjustAgeDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onSave?: (values: AdjustAgeFormValues) => void
}

const AGE_FLAG_NOTE =
  "Note: [ Blank = Do not show age on web, A = All ages, Y = Over 21, N = Over 18, S = Special case set min age ]"

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
  const { connectionName, locationId } = useAppSession()
  const [formValues, setFormValues] = useState<AdjustAgeFormValues | null>(null)

  const {
    data: showProperties,
    isFetching,
  } = useGetShowPropertiesQuery(
    { connectionName, showId: event?.showId || "" },
    { skip: !open || !event || !connectionName }
  )

  const [adjustShowAge, { isLoading: isSaving }] = useAdjustShowAgeMutation()

  const initialAgeValues = useMemo(() => {
    if (!showProperties) return null
    return parseInitialAgeValues(showProperties)
  }, [showProperties])

  useEffect(() => {
    if (open && initialAgeValues) {
      setFormValues(initialAgeValues)
    }
  }, [open, initialAgeValues])

  // Clear state when closed
  useEffect(() => {
    if (!open) {
      setFormValues(null)
    }
  }, [open])

  function handleModeChange(mode: AdjustAgeMode) {
    setFormValues((current) => (current ? applyAdjustAgeModeChange(current, mode) : current))
  }

  function handleAgeFlagChange(ageFlag: string) {
    setFormValues((current) => (current ? applyAgeFlagChange(current, ageFlag) : current))
  }

  function handleMinAgeChange(minAge: string) {
    setFormValues((current) => (current ? applyMinAgeChange(current, minAge) : current))
  }

  async function handleSave() {
    if (!event || !formValues) {
      return
    }


    const selectedAgeParam = getSelectedAgeParam(formValues.ageFlag, formValues.mode)
    const specialAgeParam = formValues.mode === "minAge" ? formValues.minAge : null

    try {
      await adjustShowAge({
        CalendarShowId: event.showId,
        ConnectionString: connectionName,
        LocationId: locationId,
        SelectedAge: selectedAgeParam,
        SpecialAge: specialAgeParam,
      }).unwrap()

      onSave?.(formValues)
      onOpenChange(false)
    } catch {
      // silently ignore save errors
    }
  }

  const headerTitle = "Adjust Age"

  const isFlagMode = formValues?.mode === "flag"
  const isMinAgeMode = formValues?.mode === "minAge"
  const isLoading = isFetching || !formValues

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        disableOutsideDismiss
        className="flex w-full max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">{headerTitle}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
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
                        options={AGE_FLAG_OPTIONS}
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

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-5 py-4">
          <Button type="button" onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

