import { LoaderCircle, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  createFilterSearchHandlers,
  IconActionButton
} from '@/components/forms/form-fields'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useReservationDetail } from '@/hooks/use-reservation-detail'
import { prepareCancelReservationPayments } from '@/lib/prepare-cancel-reservation-payments'
import { cn } from '@/lib/utils'
import type { CancelReservationPaymentRow } from '@/types/cancel-reservation-payment'
import type { Reservation } from '@/types/reservation'

type CancelReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  connectionName: string
  showDate: string
  showTime?: string
  showHeadliner?: string
  userRight: string
  isSubmitting?: boolean
  error?: string | null
  onSave: (payload: {
    reservationNote: string
    payments: CancelReservationPaymentRow[]
  }) => void | Promise<void>
}

function formatShowDate (dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatCurrency (value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

function SummaryField ({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className='flex min-w-0 items-center gap-2 text-sm'>
      <span className='shrink-0 font-medium text-foreground'>{label}</span>
      <span className='truncate text-muted-foreground'>{value}</span>
    </div>
  )
}

const paymentTableColumns = [
  { key: 'select', label: '#', className: 'w-10' },
  { key: 'transaction', label: 'Transaction', className: 'min-w-28' },
  { key: 'lastName', label: 'Last Name', className: 'min-w-28' },
  { key: 'firstName', label: 'First Name', className: 'min-w-28' },
  { key: 'payment', label: 'Payment', className: 'min-w-24' },
  { key: 'cardType', label: 'Card Type', className: 'min-w-24' },
  { key: 'cardNumber', label: 'Card Number', className: 'min-w-32' },
  { key: 'amount', label: 'Amount', className: 'min-w-24' },
  { key: 'authorization', label: 'Authorization', className: 'min-w-52' },
  { key: 'pnref', label: 'PNREF', className: 'min-w-52' },
  { key: 'split', label: 'Split', className: 'min-w-20' }
] as const

function filterCancelReservationPayments(
  rows: CancelReservationPaymentRow[],
  query: string
): CancelReservationPaymentRow[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter(payment => {
    const searchableValues = [
      payment.pymtStatus,
      payment.lastName,
      payment.firstName,
      payment.pymtType,
      payment.ccType,
      payment.cardNum,
      formatCurrency(payment.amount),
      String(payment.amount),
      payment.auth,
      payment.pnref,
      payment.split
    ]

    return searchableValues.some(value =>
      String(value ?? '')
        .toLowerCase()
        .includes(normalized)
    )
  })
}

export function CancelReservationDialog ({
  open,
  onOpenChange,
  reservation,
  connectionName,
  showDate,
  showTime = '',
  showHeadliner = '',
  userRight,
  isSubmitting = false,
  error,
  onSave
}: CancelReservationDialogProps) {
  const reservationId = reservation?.id ?? ''
  const { detail, loading, error: detailError } = useReservationDetail(
    connectionName,
    reservationId,
    open && Boolean(reservationId)
  )

  const [payments, setPayments] = useState<CancelReservationPaymentRow[]>([])
  const [reservationNote, setReservationNote] = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  useEffect(() => {
    if (!open) {
      setPayments([])
      setReservationNote('')
      setDraftSearch('')
      setAppliedSearch('')
      return
    }

    if (!detail) {
      return
    }

    setPayments(prepareCancelReservationPayments(detail.PaymentList, userRight))
    setReservationNote('')
    setDraftSearch('')
    setAppliedSearch('')
  }, [detail, open, userRight])

  const filteredPayments = useMemo(
    () => filterCancelReservationPayments(payments, appliedSearch),
    [payments, appliedSearch]
  )

  const { handleSubmit, handleInputKeyDown } = createFilterSearchHandlers(() => {
    setAppliedSearch(draftSearch)
  })

  function handleClearSearch() {
    setDraftSearch('')
    setAppliedSearch('')
  }

  const paidAmount = useMemo(() => {
    if (detail?.ResPayments != null) {
      return detail.ResPayments
    }

    const parsed = Number.parseFloat(
      (reservation?.paid ?? '').replace(/[^0-9.-]+/g, '')
    )
    return Number.isFinite(parsed) ? parsed : 0
  }, [detail?.ResPayments, reservation?.paid])

  const customerName = useMemo(() => {
    const parts = [
      reservation?.lastName,
      reservation?.firstName,
      reservation?.businessName
    ].filter(Boolean)

    return parts.join(' ').trim()
  }, [reservation])

  const loadError = detailError

  function togglePayment (paymentId: string, checked: boolean) {
    setPayments((current) =>
      current.map((payment) =>
        payment.paymentId === paymentId
          ? { ...payment, isSelected: checked }
          : payment
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        disableOutsideDismiss
        showCloseButton={false}
        className='flex max-h-[82vh] max-w-6xl flex-col overflow-hidden p-0 sm:max-w-6xl'
      >
        <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
          <DialogTitle className='text-base font-semibold text-foreground'>
            Cancel Reservation
          </DialogTitle>
          <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
            <X className='size-4' />
            <span className='sr-only'>Close</span>
          </DialogClose>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4'>
          {reservation ? (
            <section className='rounded-md border border-slate-200 bg-slate-50/60 p-3'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <SummaryField
                  label='Show Date:'
                  value={formatShowDate(showDate)}
                />
                <SummaryField label='Show Time:' value={showTime || '—'} />
                <SummaryField label='Comic:' value={showHeadliner || '—'} />
                <SummaryField label='Customer:' value={customerName || '—'} />
                <SummaryField
                  label='Party No:'
                  value={String(detail?.PartyNo ?? reservation.qty)}
                />
                <SummaryField
                  label='Amount:'
                  value={formatCurrency(paidAmount)}
                />
              </div>
            </section>
          ) : null}

          <section className='rounded-md border border-slate-200 bg-slate-50/60 p-3'>
            <h3 className='text-sm font-medium text-foreground'>
              Payments : Check the payment to Void/Refund
            </h3>

            {loading ? (
              <div className='flex min-h-40 items-center justify-center gap-2 py-8 text-sm text-muted-foreground'>
                <LoaderCircle className='size-4 animate-spin' />
                Loading payments...
              </div>
            ) : (
              <div className='mt-3 space-y-3'>
                <form
                  className='flex w-full shrink-0 flex-wrap items-center gap-2 sm:max-w-md'
                  onSubmit={handleSubmit}
                >
                  <Input
                    placeholder='Search payments...'
                    value={draftSearch}
                    onChange={event => setDraftSearch(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className='min-w-0 flex-1 bg-white'
                    disabled={isSubmitting}
                  />
                  <div className='flex items-center gap-1.5'>
                    <IconActionButton
                      label='Search'
                      icon={Search}
                      variant='default'
                      type='submit'
                      disabled={isSubmitting}
                    />
                    <IconActionButton
                      label='Clear'
                      icon={X}
                      onClick={handleClearSearch}
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
                <div className='overflow-x-auto rounded-md border border-slate-200 bg-white'>
                  <table className='min-w-[1100px] w-full border-collapse text-sm'>
                    <thead>
                      <tr className='border-b border-slate-200 bg-muted/40 text-left text-xs font-semibold text-foreground'>
                        {paymentTableColumns.map(column => (
                          <th
                            key={column.key}
                            className={cn('h-10 px-3 py-2', column.className)}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={paymentTableColumns.length}
                            className='px-3 py-8 text-center text-sm text-muted-foreground'
                          >
                            {payments.length === 0
                              ? 'No payments found for this reservation.'
                              : 'No payments match your search.'}
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((payment, index) => (
                          <tr
                            key={payment.paymentId}
                            className={cn(
                              'border-b border-slate-200 last:border-b-0',
                              index % 2 === 1 && 'bg-muted/20'
                            )}
                          >
                            <td className='px-3 py-2'>
                              <Checkbox
                                checked={payment.isSelected}
                                disabled={!payment.canSelect || isSubmitting}
                                onCheckedChange={checked =>
                                  togglePayment(
                                    payment.paymentId,
                                    checked === true
                                  )
                                }
                                aria-label={`Select payment ${payment.pymtType}`}
                              />
                            </td>
                            <td className='px-3 py-2'>{payment.pymtStatus}</td>
                            <td className='px-3 py-2'>{payment.lastName}</td>
                            <td className='px-3 py-2'>{payment.firstName}</td>
                            <td className='px-3 py-2'>{payment.pymtType}</td>
                            <td className='px-3 py-2'>{payment.ccType}</td>
                            <td className='px-3 py-2'>{payment.cardNum}</td>
                            <td className='px-3 py-2'>
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className='px-3 py-2 font-mono text-xs whitespace-nowrap'>
                              {payment.auth}
                            </td>
                            <td className='px-3 py-2 font-mono text-xs whitespace-nowrap'>
                              {payment.pnref}
                            </td>
                            <td className='px-3 py-2'>{payment.split}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          <section className='rounded-md border border-slate-200 bg-slate-50/60 p-3'>
            <h3 className='text-sm font-medium text-foreground'>
              Cancellation Notes:
            </h3>
            <Textarea
              value={reservationNote}
              onChange={(event) => setReservationNote(event.target.value)}
              className='mt-3 min-h-20 resize-y text-sm shadow-xs'
              disabled={isSubmitting || loading}
            />
          </section>

          {loadError ? (
            <p className='text-sm text-destructive'>{loadError}</p>
          ) : null}
          {error ? <p className='text-sm text-destructive'>{error}</p> : null}
        </div>

        <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-start'>
          <Button
            type='button'
            size='sm'
            onClick={() => void onSave({ reservationNote, payments })}
            disabled={!reservation || isSubmitting || loading}
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
