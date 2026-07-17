import { useEffect, useRef, useState } from "react"

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
import { useAppSession } from "@/hooks/use-app-session"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import {
  useGetShowByIdQuery,
  useGetShowSectionListQuery,
  useMoveShowToUpcomingDateMutation,
} from "@/store/api/clubmanApi"
import type { CalendarEvent } from "@/types/calendar-event"

import {
  buildMoveShowRequest,
  createMoveShowFormValues,
  isSameCalendarDay,
  type MoveShowFormValues,
} from "../service/moveShow.service"

type MoveShowDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
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
  onAfterClose,
  onMoved,
}: MoveShowDialogProps) {
  const { connectionName, locationId, username } = useAppSession()
  const [formValues, setFormValues] = useState<MoveShowFormValues | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const sessionGenerationRef = useRef(0)

  const showId = event?.showId || event?.id || ""
  const shouldSkip =
    !open || !event || !connectionName || !locationId || !showId

  const showQuery = useGetShowByIdQuery(
    { connectionName, locationId, showId },
    { skip: shouldSkip, refetchOnMountOrArgChange: true }
  )
  const sectionQuery = useGetShowSectionListQuery(
    { connectionName, showId },
    { skip: shouldSkip, refetchOnMountOrArgChange: true }
  )
  const [moveShowToUpcomingDate, { isLoading: isSubmitting }] =
    useMoveShowToUpcomingDateMutation()

  const show = showQuery.data?.[0]

  function resetDialogSession() {
    setFormValues(null)
    setSubmitError(null)
    onAfterClose?.()
  }

  useEffect(() => {
    if (open) {
      sessionGenerationRef.current += 1
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      sessionGenerationRef.current += 1
    }
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open) {
      return
    }

    if (show) {
      setFormValues(createMoveShowFormValues(show))
    } else {
      setFormValues(null)
    }
  }, [open, show, showId])

  function updateField<K extends keyof MoveShowFormValues>(
    field: K,
    value: MoveShowFormValues[K]
  ) {
    setSubmitError(null)
    setFormValues((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleMove() {
    if (!formValues || !show || !showId) {
      return
    }

    if (isSameCalendarDay(formValues.moveDate, show.ShowDate)) {
      setSubmitError("Select a date other than the show's current date.")
      return
    }

    const generation = sessionGenerationRef.current

    try {
      setSubmitError(null)
      const request = buildMoveShowRequest({
        connectionString: connectionName,
        locationId,
        calendarShowId: showId,
        username,
        values: formValues,
      })
      const didMove = await moveShowToUpcomingDate(request).unwrap()
      if (generation !== sessionGenerationRef.current) return
      if (!didMove) {
        setSubmitError("Unable to move show.")
        return
      }
      onMoved?.()
      handleOpenChange(false)
    } catch (error: unknown) {
      if (generation !== sessionGenerationRef.current) return
      setSubmitError(
        error instanceof Error
          ? error.message
          : getClubmanErrorMessage(error)
      )
    }
  }

  const loadError = showQuery.error ?? sectionQuery.error
  const noShowError =
    !shouldSkip && showQuery.isSuccess && !show
      ? "No show details found."
      : null
  const errorMessage =
    submitError ??
    (loadError ? getClubmanErrorMessage(loadError) : noShowError)
  const isLoading =
    !shouldSkip && (showQuery.isFetching || sectionQuery.isFetching)
  const isFetching = showQuery.isFetching || sectionQuery.isFetching
  const canMove =
    Boolean(
      formValues?.moveDate &&
        formValues.showTime &&
        formValues.arrivalTime &&
        show
    ) &&
    !isLoading &&
    !isFetching &&
    !isSubmitting &&
    !loadError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        disableOutsideDismiss
        onAfterClose={resetDialogSession}
        className="flex w-full max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Move Show</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <MoveShowSkeleton />
          ) : (
            <div className="px-5 py-5">
              {errorMessage ? (
                <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Select date to move show</legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-6">
                  <div className="grid min-w-0 gap-2">
                    <Label htmlFor="move-show-date">Select Date</Label>
                    <CalendarDatePickerControl
                      id="move-show-date"
                      value={formValues?.moveDate ?? ""}
                      onChange={(value) => updateField("moveDate", value)}
                      disablePastDates
                      placeholder="Select a date"
                      disabled={!formValues || isSubmitting}
                    />
                  </div>

                  <div className="grid min-w-0 gap-2">
                    <Label htmlFor="move-show-time">Show Time</Label>
                    <CalendarTimeControl
                      id="move-show-time"
                      value={formValues?.showTime ?? ""}
                      onChange={(value) => updateField("showTime", value)}
                      disabled={!formValues || isSubmitting}
                    />
                  </div>

                  <div className="grid min-w-0 gap-2">
                    <Label htmlFor="move-show-arrival-time">Arrival Time</Label>
                    <CalendarTimeControl
                      id="move-show-arrival-time"
                      value={formValues?.arrivalTime ?? ""}
                      onChange={(value) => updateField("arrivalTime", value)}
                      disabled={!formValues || isSubmitting}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}
        </div>

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-5 py-4">
          <Button type="button" onClick={() => void handleMove()} disabled={!canMove}>
            {isSubmitting ? "Moving…" : "Move"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
