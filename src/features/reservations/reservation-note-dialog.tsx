import { LoaderCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useReservationNote } from '@/hooks/use-reservation-note'
import type { Reservation } from '@/types/reservation'

type ReservationNoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  connectionName: string
  isSubmitting?: boolean
  error?: string | null
  onSave: (note: string) => void | Promise<void>
}

export function ReservationNoteDialog ({
  open,
  onOpenChange,
  reservation,
  connectionName,
  isSubmitting = false,
  error = null,
  onSave
}: ReservationNoteDialogProps) {
  const reservationId = reservation?.id ?? ''
  const { note, loading, error: loadError } = useReservationNote(
    connectionName,
    reservationId,
    open && Boolean(reservationId)
  )
  const [noteValue, setNoteValue] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    if (!loading) {
      setNoteValue(note)
    }
  }, [loading, note, open])

  async function handleSave () {
    await onSave(noteValue)
  }

  const guestName = reservation
    ? `${reservation.firstName} ${reservation.lastName}`.trim()
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[82vh] max-w-lg flex-col overflow-hidden p-0 sm:max-w-lg'
      >
        <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
          <div className='min-w-0'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Add Note
            </DialogTitle>
            {reservation ? (
              <p className='truncate text-sm text-muted-foreground'>
                {guestName}
                {guestName ? ' · ' : ''}
                Party {reservation.qty}
              </p>
            ) : null}
          </div>
          <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
            <X className='size-4' />
            <span className='sr-only'>Close</span>
          </DialogClose>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4'>
          <section className='rounded-md border border-slate-200 bg-slate-50/60 p-3'>
            <h3 className='text-sm font-medium text-foreground'>Notes:</h3>
            {loading ? (
              <div className='mt-3 flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground'>
                <LoaderCircle className='size-4 animate-spin' />
                Loading note...
              </div>
            ) : (
              <Textarea
                value={noteValue}
                onChange={(event) => setNoteValue(event.target.value)}
                className='mt-3 min-h-28 resize-y text-sm shadow-xs'
                disabled={isSubmitting}
              />
            )}
          </section>

          {loadError ? (
            <p className='mt-3 text-sm text-destructive'>{loadError}</p>
          ) : null}
          {error ? <p className='mt-3 text-sm text-destructive'>{error}</p> : null}
        </div>

        <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-start'>
          <Button
            type='button'
            size='sm'
            onClick={() => void handleSave()}
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
