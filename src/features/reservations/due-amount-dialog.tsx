import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { X } from 'lucide-react'

export type DueAmountOption =
  | 'additional-payment'
  | 'cancel-reservation'
  | 'continue-without-payment'

type DueAmountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  option: DueAmountOption
  onOptionChange: (option: DueAmountOption) => void
  isPending?: boolean
  onConfirm: () => void | Promise<void>
}

/**
 * Desktop ReservationPayment dueAmountPop — shown when Cancel/X is used
 * while amount is still due (and in some incomplete-payment save paths).
 */
export function DueAmountDialog({
  open,
  onOpenChange,
  option,
  onOptionChange,
  isPending = false,
  onConfirm
}: DueAmountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested
        showCloseButton={false}
        disableOutsideDismiss
        className='flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md'
      >
        <DialogHeader className='shrink-0 flex-row items-center justify-between gap-3 border-b border-border/50 bg-[#155abb] px-4 py-3 text-white'>
          <DialogTitle className='text-base font-semibold text-white'>
            Due Amount
          </DialogTitle>
          <DialogClose
            disabled={isPending}
            className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus:ring-2 focus:ring-white/40 focus:outline-none disabled:opacity-50'
          >
            <X className='size-3.5' />
            <span className='sr-only'>Close</span>
          </DialogClose>
        </DialogHeader>

        <div className='space-y-3 px-4 py-4'>
          <p className='text-sm font-semibold text-foreground'>
            Amount still due. What action would you like?
          </p>

          <div className='rounded-md border border-border/70 bg-muted/20 p-3'>
            <p className='mb-2 text-xs font-semibold text-muted-foreground'>
              Options
            </p>
            <RadioGroup
              value={option}
              onValueChange={value => onOptionChange(value as DueAmountOption)}
              className='gap-2.5'
              disabled={isPending}
            >
              <div className='flex items-start gap-2.5'>
                <RadioGroupItem
                  value='additional-payment'
                  id='due-amount-additional'
                  className='mt-0.5'
                />
                <Label
                  htmlFor='due-amount-additional'
                  className='cursor-pointer text-sm font-normal leading-snug'
                >
                  Add additional payment or credit card to hold.
                </Label>
              </div>
              <div className='flex items-start gap-2.5'>
                <RadioGroupItem
                  value='cancel-reservation'
                  id='due-amount-cancel'
                  className='mt-0.5'
                />
                <Label
                  htmlFor='due-amount-cancel'
                  className='cursor-pointer text-sm font-normal leading-snug'
                >
                  Cancel Reservation.
                </Label>
              </div>
              <div className='flex items-start gap-2.5'>
                <RadioGroupItem
                  value='continue-without-payment'
                  id='due-amount-continue'
                  className='mt-0.5'
                />
                <Label
                  htmlFor='due-amount-continue'
                  className='cursor-pointer text-sm font-normal leading-snug'
                >
                  Continue without payment.
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className='shrink-0 border-t border-border/50 bg-muted/40 px-4 py-3 sm:justify-start'>
          <Button
            type='button'
            className='bg-emerald-600 hover:bg-emerald-700'
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? 'Please wait...' : 'Ok'}
          </Button>
          <Button
            type='button'
            variant='ghost'
            className='text-primary'
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
