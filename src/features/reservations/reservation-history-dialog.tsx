import { LoaderCircle, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import {
  createFilterSearchHandlers,
  IconActionButton
} from '@/components/forms/form-fields'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { reservationHistoryColumns } from '@/features/reservations/reservation-history-columns'
import { useReservationHistory } from '@/hooks/use-reservation-history'
import type { Reservation } from '@/types/reservation'
import type { ReservationHistoryRow } from '@/types/reservation-history'

type ReservationHistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  connectionName: string
}

function filterReservationHistoryRows(
  rows: ReservationHistoryRow[],
  query: string
): ReservationHistoryRow[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter(row =>
    Object.values(row).some(value =>
      String(value ?? '')
        .toLowerCase()
        .includes(normalized)
    )
  )
}

export function ReservationHistoryDialog({
  open,
  onOpenChange,
  reservation,
  connectionName
}: ReservationHistoryDialogProps) {
  const [draftSearch, setDraftSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const reservationId = reservation?.id ?? ''
  const { rows, loading, error } = useReservationHistory(
    connectionName,
    reservationId,
    open && Boolean(reservationId)
  )

  const filteredRows = useMemo(
    () => filterReservationHistoryRows(rows, appliedSearch),
    [rows, appliedSearch]
  )

  const { handleSubmit, handleInputKeyDown } = createFilterSearchHandlers(() => {
    setAppliedSearch(draftSearch)
  })

  useEffect(() => {
    if (!open) {
      setDraftSearch('')
      setAppliedSearch('')
    }
  }, [open])

  function handleClear() {
    setDraftSearch('')
    setAppliedSearch('')
  }

  const guestName = reservation
    ? `${reservation.firstName} ${reservation.lastName}`.trim()
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[82vh] max-w-6xl flex-col overflow-hidden p-0 sm:max-w-6xl'
      >
        <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
          <div className='min-w-0'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Reservation History
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

        <div className='min-h-0 flex-1 overflow-y-auto p-4'>
          {loading ? (
            <div className='flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground'>
              <LoaderCircle className='size-4 animate-spin' />
              Loading reservation history...
            </div>
          ) : (
            <div className='space-y-3 rounded-md border border-slate-200 bg-slate-50/60 p-3'>
              <form
                className='flex w-full shrink-0 flex-wrap items-center gap-2 sm:max-w-md'
                onSubmit={handleSubmit}
              >
                <Input
                  placeholder='Search reservation history...'
                  value={draftSearch}
                  onChange={event => setDraftSearch(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className='min-w-0 flex-1 bg-white'
                />
                <div className='flex items-center gap-1.5'>
                  <IconActionButton
                    label='Search'
                    icon={Search}
                    variant='default'
                    type='submit'
                  />
                  <IconActionButton
                    label='Clear'
                    icon={X}
                    onClick={handleClear}
                  />
                </div>
              </form>
              <DataTable
                columns={reservationHistoryColumns}
                data={filteredRows}
                emptyMessage='No reservation history found.'
                entityLabel='history records'
                pageSize={12}
                preserveHeaderCase
                className='rounded-md border border-slate-200 bg-white'
              />
            </div>
          )}

          {error ? (
            <p className='mt-3 text-sm text-destructive'>{error}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
