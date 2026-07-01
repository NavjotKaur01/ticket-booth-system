import { MessageCircle } from "lucide-react"
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
import type { CalendarEvent } from "@/types/calendar-event"

import {
  ADJUST_PROMO_ACCESS_DENIED_MESSAGE,
  getAdjustPromoDialogData,
  type AdjustPromoDialogData,
} from "../service/adjustPromo.service"

type AdjustPromoDialogProps = {
  open: boolean
  event: CalendarEvent | null
  username?: string
  onOpenChange: (open: boolean) => void
}

function AdjustPromoSkeleton() {
  return (
    <div className="flex items-start gap-4 px-6 py-5" aria-label="Loading adjust promo message">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

export default function AdjustPromoDialog({
  open,
  event,
  username,
  onOpenChange,
}: AdjustPromoDialogProps) {
  const [dialogData, setDialogData] = useState<AdjustPromoDialogData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setDialogData(null)
      return
    }

    if (!event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getAdjustPromoDialogData(event, username)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
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
  }, [event, open, username])

  const message = dialogData?.message ?? ADJUST_PROMO_ACCESS_DENIED_MESSAGE

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" disableOutsideDismiss showCloseButton={false}>
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg">Message</DialogTitle>
        </DialogHeader>

        {isLoading || !dialogData ? (
          <AdjustPromoSkeleton />
        ) : (
          <div className="flex items-start gap-4 px-6 py-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <MessageCircle className="size-6" aria-hidden="true" />
            </div>
            <DialogDescription className="pt-2 text-sm text-foreground">
              {message}
            </DialogDescription>
          </div>
        )}

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-6 py-4">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || !dialogData}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
