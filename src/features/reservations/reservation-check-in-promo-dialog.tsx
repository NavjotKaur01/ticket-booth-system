import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

type ReservationCheckInPromoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promo: string
  passes: number
  isSubmitting?: boolean
  onConfirm: () => void | Promise<void>
}

export function ReservationCheckInPromoDialog({
  open,
  onOpenChange,
  promo,
  passes,
  isSubmitting = false,
  onConfirm
}: ReservationCheckInPromoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='flex max-w-md flex-col overflow-hidden p-0 sm:max-w-md'
      >
        <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
          <DialogTitle className='text-base font-semibold text-foreground'>
            Validate Promotion
          </DialogTitle>
          <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
            <X className='size-4' />
            <span className='sr-only'>Close</span>
          </DialogClose>
        </DialogHeader>

        <div className='space-y-2 px-4 py-5 text-sm'>
          <p>
            <span className='font-medium text-foreground'>Promo:</span>{' '}
            <span className='text-muted-foreground'>{promo}</span>
          </p>
          <p>
            <span className='font-medium text-foreground'>Passes:</span>{' '}
            <span className='text-muted-foreground'>{passes}</span>
          </p>
        </div>

        <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-end sm:gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Checking in...' : 'OK'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
