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

type SplitPromoAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  /** Stack above an open parent dialog (e.g. Payment / edit reservation). */
  nested?: boolean
}

/** Shown when a user tries to split a reservation that currently has a promo applied. */
export function SplitPromoAlertDialog({
  open,
  onOpenChange,
  onConfirm,
  nested = false
}: SplitPromoAlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent nested={nested} className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader className='shrink-0 border-b px-6 py-4'>
          <DialogTitle className='text-lg'>Remove Promo?</DialogTitle>
        </DialogHeader>

        <div className='flex items-start gap-4 px-6 py-5'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'>
            <CircleAlert className='size-6' aria-hidden='true' />
          </div>
          <DialogDescription className='pt-2 text-sm text-foreground'>
            Promo will be removed from the whole party. Continue?
          </DialogDescription>
        </div>

        <DialogFooter className='!flex-row flex-wrap justify-end gap-2 border-t px-6 py-4'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='button' onClick={() => {
            onConfirm()
            onOpenChange(false)
          }}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
