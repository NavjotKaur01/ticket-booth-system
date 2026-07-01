import { CircleAlert } from "lucide-react"
import { useEffect, useState } from "react"

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
  cancelShow,
  getCancelShowDialogData,
  type CancelShowDialogData,
} from "../service/cancelShow.service"

type CancelShowDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
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
  onCancelShow,
}: CancelShowDialogProps) {
  const [dialogData, setDialogData] = useState<CancelShowDialogData | null>(null)
  const [step, setStep] = useState<CancelShowStep>("confirm")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep("confirm")
      setDialogData(null)
      return
    }

    if (!event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getCancelShowDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
          setStep("confirm")
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

  async function handleConfirmCancel() {
    if (!dialogData) {
      return
    }

    setIsSubmitting(true)

    try {
      await cancelShow(dialogData.eventId)
      onCancelShow?.(dialogData.eventId)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
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
    onOpenChange(false)
  }

  const isReservationsStep = step === "reservations"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" disableOutsideDismiss showCloseButton={false}>
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
                    <span className="font-medium">Date:</span> {dialogData.showDate}
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

