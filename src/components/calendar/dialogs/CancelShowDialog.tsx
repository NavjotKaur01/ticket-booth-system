import { CircleAlert } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CalendarEvent } from "@/data/calendarEvents"

import {
  getCancelShowDialogData,
  type CancelShowDialogData,
} from "../service/cancelShow.service"
import { useCancelShowMutation } from "@/store/api/clubmanApi"
import { useAppSession } from "@/hooks/use-app-session"

type CancelShowDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
  onCancelShow?: (eventId: string) => void
}

type CancelShowStep = "confirm" | "reservations"

function CancelShowSkeleton() {
  return (
    <div className="flex items-start gap-4 px-6 py-5" aria-label="Loading cancel show warning">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-3 pt-2">
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

function WarningIcon() {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
      <CircleAlert className="size-6" aria-hidden="true" />
    </div>
  )
}

export default function CancelShowDialog({
  open,
  event,
  onOpenChange,
  onAfterClose,
  onCancelShow,
}: CancelShowDialogProps) {
  const { connectionName } = useAppSession()
  const [dialogData, setDialogData] = useState<CancelShowDialogData | null>(null)
  const [step, setStep] = useState<CancelShowStep>("confirm")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sessionGenerationRef = useRef(0)

  const [cancelShow] = useCancelShowMutation()

  function resetDialogSession() {
    setDialogData(null)
    setStep("confirm")
    setIsLoading(false)
    setIsSubmitting(false)
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

    if (!event) {
      return
    }

    let isCurrent = true
    const generation = sessionGenerationRef.current

    setIsLoading(true)
    getCancelShowDialogData(event)
      .then((data) => {
        if (isCurrent && generation === sessionGenerationRef.current) {
          setDialogData(data)
          setStep("confirm")
        }
      })
      .finally(() => {
        if (isCurrent && generation === sessionGenerationRef.current) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [event, open])

  async function handleConfirmCancel() {
    if (!dialogData) {
      return
    }

    setIsSubmitting(true)
    const generation = sessionGenerationRef.current

    try {
      await cancelShow({
        ConnectionString: connectionName,
        CalendarShowId: dialogData.eventId,
        IsSoftDelete: dialogData.reservationCount > 0,
      }).unwrap()

      if (generation !== sessionGenerationRef.current) return
      onCancelShow?.(dialogData.eventId)
      handleOpenChange(false)
    } catch (err) {
      if (generation !== sessionGenerationRef.current) return
      console.error("Failed to cancel show", err)
    } finally {
      if (generation === sessionGenerationRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  function handleYes() {
    if (!dialogData) {
      return
    }

    if (step === "confirm" && dialogData.reservationCount > 0) {
      setStep("reservations")
      return
    }

    void handleConfirmCancel()
  }

  function handleNo() {
    handleOpenChange(false)
  }

  const isReservationsStep = step === "reservations"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full sm:max-w-lg"
        disableOutsideDismiss
        showCloseButton={false}
        onAfterClose={resetDialogSession}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg">Cancel Warning</DialogTitle>
        </DialogHeader>

        {isLoading || !dialogData ? (
          <CancelShowSkeleton />
        ) : isReservationsStep ? (
          <div className="flex items-start gap-4 px-6 py-5">
            <WarningIcon />
            <DialogDescription className="pt-2 text-sm text-foreground">
              There are {dialogData.reservationCount} reservations made for this show. Continue
              cancellation?
            </DialogDescription>
          </div>
        ) : (
          <div className="flex items-start gap-4 px-6 py-5">
            <WarningIcon />
            <div className="space-y-3 pt-2 text-sm text-foreground">
              <DialogDescription className="text-sm text-foreground">
                Are you sure you want to cancel the following show.
              </DialogDescription>
              <dl className="space-y-1">
                <div>
                  <dt className="sr-only">Date</dt>
                  <dd>
                    <span className="font-medium">Date:</span> {dialogData.showDate} 12:00:00 AM
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Time</dt>
                  <dd>
                    <span className="font-medium">Time:</span> {dialogData.showTime}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Comic</dt>
                  <dd>
                    <span className="font-medium">Comic:</span> {dialogData.comic}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-6 py-4">
          <Button
            type="button"
            onClick={handleYes}
            disabled={isLoading || !dialogData || isSubmitting}
          >
            Yes
          </Button>
          <Button type="button" variant="ghost" onClick={handleNo} disabled={isSubmitting}>
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

