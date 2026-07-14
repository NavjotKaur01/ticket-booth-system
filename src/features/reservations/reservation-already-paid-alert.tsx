import { CircleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

type ReservationAlreadyPaidAlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Stack above an open parent dialog (e.g. Payment / edit reservation). */
  nested?: boolean
}

/** Shown instead of SplitReservationDialog when the party is already fully paid. */
export function ReservationAlreadyPaidAlert({
  open,
  onOpenChange,
  nested = false
}: ReservationAlreadyPaidAlertProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent nested={nested} className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader className='shrink-0 border-b px-6 py-4'>
          <DialogTitle className='text-lg'>Alert</DialogTitle>
        </DialogHeader>

        <div className='flex items-start gap-4 px-6 py-5'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'>
            <CircleAlert className='size-6' aria-hidden='true' />
          </div>
          <DialogDescription className='pt-2 text-sm text-foreground'>
            Entire party already paid. Cannot be split.
          </DialogDescription>
        </div>

        <DialogFooter className='!flex-row flex-wrap justify-start border-t px-6 py-4'>
          <Button type='button' onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
