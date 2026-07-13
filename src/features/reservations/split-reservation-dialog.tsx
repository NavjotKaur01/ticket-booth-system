import { LoaderCircle, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { ReservationTotalsCard } from '@/components/reservation/reservation-totals-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import { ReservationPaymentPanel } from '@/features/reservations/reservation-payment-panel'
import { SplitReservationTicketPicker } from '@/features/reservations/split-reservation-ticket-picker'
import { useCachedReservationShowData } from '@/hooks/use-cached-reservation-show-data'
import { useReservationDetail } from '@/hooks/use-reservation-detail'
import { openCashDrawer, splitReservation } from '@/lib/api/reservation-pos-actions'
import {
  buildSplitReservationRequest,
  calculateSplitReservationTotals,
  validateReservationSplit
} from '@/lib/build-split-reservation-request'
import { formatReservationMoney, parseReservationMoney } from '@/lib/calculate-reservation-totals'
import {
  findReservationPromoId,
  findReservationSection,
  mapReservationSourceToOrigin
} from '@/lib/reservation-edit'
import {
  getFirstReservationPaymentError,
  validateReservationPaymentFields,
  type ReservationPaymentValidationErrors
} from '@/lib/validate-reservation-payment'
import { cn } from '@/lib/utils'
import {
  createEmptyReservationPaymentFields,
  type ReservationPaymentFields
} from '@/types/reservation-payment'
import type { Reservation } from '@/types/reservation'

type SplitReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  connectionName: string
  locationId: string
  username: string
  showDate: string
  currentShowId: string
  onSplit?: () => void | Promise<void>
  /** Stack above an open parent dialog (e.g. Payment / edit reservation). */
  nested?: boolean
}

function SectionCard({
  title,
  children,
  className,
  headerAction
}: {
  title: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-md border border-slate-200 bg-slate-50/60 p-3',
        className
      )}
    >
      <div className='flex items-center justify-between gap-3'>
        <h3 className='text-sm font-medium text-foreground'>{title}</h3>
        {headerAction}
      </div>
      <div className='mt-3'>{children}</div>
    </section>
  )
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex min-w-0 items-center gap-2 text-sm'>
      <span className='shrink-0 font-medium text-foreground'>{label}</span>
      <span className='truncate text-muted-foreground'>{value}</span>
    </div>
  )
}

export function SplitReservationDialog({
  open,
  onOpenChange,
  reservation,
  connectionName,
  locationId,
  username,
  showDate,
  currentShowId,
  onSplit,
  nested = false
}: SplitReservationDialogProps) {
  const reservationId = reservation?.id ?? ''
  const { detail, loading: detailLoading, error: detailError } = useReservationDetail(
    connectionName,
    reservationId,
    open && Boolean(reservationId)
  )

  const [splitCount, setSplitCount] = useState(1)
  const [paymentType, setPaymentType] = useState<ReservationPaymentType>('credit-card')
  const [paymentFields, setPaymentFields] = useState<ReservationPaymentFields>(
    () => createEmptyReservationPaymentFields()
  )
  const [paymentValidationErrors, setPaymentValidationErrors] =
    useState<ReservationPaymentValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCashDrawerBusy, setIsCashDrawerBusy] = useState(false)

  const showId = detail?.ShowId?.trim() || currentShowId

  const { sections, sectionsLoading, promoOptions, promoById } =
    useCachedReservationShowData({
      connectionName,
      locationId,
      showDate,
      showId,
      enabled: open && Boolean(showId)
    })

  const matchedSection =
    findReservationSection(sections, detail?.ResSec ?? reservation?.section ?? '') ??
    sections[0] ??
    null

  const party = detail?.PartyNo ?? reservation?.qty ?? 0
  const seated = reservation?.seated ?? 0
  const remainingTickets = Math.max(0, party - seated)
  const unitPrice = parseReservationMoney(matchedSection?.price ?? '0')
  const origin = reservation ? mapReservationSourceToOrigin(reservation.source) : 'phone'
  const promotionCode = detail?.Promo?.trim() ?? reservation?.promo.trim() ?? ''
  const matchedPromoId = findReservationPromoId(promoOptions, promotionCode)
  const promo = promoById.get(matchedPromoId) ?? null

  const origTotals = {
    subtotal: detail?.SubTotal ?? 0,
    serviceCharge: detail?.SVC ?? 0,
    discount: detail?.Discount ?? 0,
    taxes: detail?.SalesTax ?? 0,
    total: detail?.Total ?? parseReservationMoney(reservation?.total ?? '0')
  }

  const alreadyPaidAmount = parseReservationMoney(reservation?.paid ?? '$0.00')
  const isFullyPaid = origTotals.total > 0 && alreadyPaidAmount >= origTotals.total

  const splitTotals = calculateSplitReservationTotals({
    sectionPrice: matchedSection?.price ?? '0',
    splitCount,
    promo
  })

  useEffect(() => {
    if (!open) {
      setSplitCount(1)
      setPaymentType('credit-card')
      setPaymentFields(createEmptyReservationPaymentFields())
      setPaymentValidationErrors({})
      setSubmitError(null)
      setIsSubmitting(false)
      setIsCashDrawerBusy(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    if (remainingTickets <= 0) {
      setSplitCount(0)
      return
    }

    setSplitCount(current =>
      current >= 1 && current <= remainingTickets ? current : 1
    )
  }, [open, remainingTickets])

  const isLoading = detailLoading || sectionsLoading

  const customerName = reservation
    ? `${reservation.lastName}, ${reservation.firstName}`.trim()
    : ''

  async function handleCashDrawerClick() {
    setIsCashDrawerBusy(true)
    setSubmitError(null)

    try {
      await openCashDrawer()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to open cash drawer'
      )
    } finally {
      setIsCashDrawerBusy(false)
    }
  }

  async function handleSave() {
    if (!reservation) {
      return
    }

    const validationError = validateReservationSplit({
      splitCount,
      remainingTickets,
      isFullyPaid
    })

    if (validationError) {
      setSubmitError(validationError)
      return
    }

    const nextPaymentErrors = validateReservationPaymentFields({
      paymentType,
      fields: paymentFields,
      paymentAmount: formatReservationMoney(splitTotals.total),
      paymentRequired: true,
      disallowCash: origin === 'phone'
    })
    const paymentError = getFirstReservationPaymentError(nextPaymentErrors)

    if (paymentError) {
      setPaymentValidationErrors(nextPaymentErrors)
      setSubmitError(paymentError)
      return
    }

    setIsSubmitting(true)
    setPaymentValidationErrors({})
    setSubmitError(null)

    try {
      await splitReservation(
        buildSplitReservationRequest({
          connectionName,
          locationId,
          reservationId: reservation.id,
          lastUpdateId: username,
          splitCount,
          remainingTickets,
          paymentType,
          paymentFields,
          totals: splitTotals
        })
      )

      onOpenChange(false)
      await onSplit?.()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to split reservation'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested={nested}
        disableOutsideDismiss
        showCloseButton={false}
        className='flex max-h-[82vh] max-w-4xl flex-col overflow-hidden p-0 sm:max-w-4xl'
      >
        <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
          <div className='min-w-0'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Split Reservation
            </DialogTitle>
            {reservation ? (
              <p className='truncate text-sm text-muted-foreground'>
                {customerName || 'Guest'}
                {customerName ? ' · ' : ''}
                Party {party}
              </p>
            ) : null}
          </div>
          <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
            <X className='size-4' />
            <span className='sr-only'>Close</span>
          </DialogClose>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4'>
          {isLoading ? (
            <div className='flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground'>
              <LoaderCircle className='size-4 animate-spin' />
              Loading reservation details...
            </div>
          ) : null}

          {!isLoading && detailError ? (
            <p className='text-sm text-destructive'>{detailError}</p>
          ) : null}

          {!isLoading ? (
            <>
              <SectionCard title='Customer Details'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <SummaryField label='Last Name:' value={reservation?.lastName || '—'} />
                  <SummaryField label='First Name:' value={reservation?.firstName || '—'} />
                </div>
              </SectionCard>

              {isFullyPaid ? (
                <p className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800'>
                  Entire party already paid. Cannot be split.
                </p>
              ) : null}

              <SectionCard title='Reservation Details'>
                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                  <SummaryField label='Origin:' value={reservation?.source ?? '—'} />
                  <SummaryField label='Party:' value={String(party || '—')} />
                  <SummaryField label='Promo Code:' value={promotionCode || '—'} />
                  <SummaryField label='Passes:' value={String(detail?.NumPasses ?? 0)} />
                </div>
                <div className='mt-3'>
                  <ReservationTotalsCard
                    selectedSection={matchedSection}
                    partySize={party}
                    totals={origTotals}
                    summaryFields={[
                      { label: 'Checked In', value: String(seated) },
                      { label: 'Remaining', value: String(remainingTickets) },
                      { label: 'Price Per Ticket', value: formatReservationMoney(unitPrice) }
                    ]}
                  />
                </div>
              </SectionCard>

              <SectionCard title='Select Tickets to Split'>
                <SplitReservationTicketPicker
                  remainingTickets={remainingTickets}
                  unitPrice={unitPrice}
                  selectedCount={splitCount}
                  onSelect={count => {
                    setSplitCount(count)
                    setSubmitError(null)
                  }}
                />
              </SectionCard>

              <SectionCard title='Split Details'>
                <ReservationTotalsCard
                  selectedSection={matchedSection}
                  partySize={splitCount}
                  totals={splitTotals}
                />
              </SectionCard>

              <SectionCard
                title='Payment Information'
                headerAction={
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => void handleCashDrawerClick()}
                    disabled={isCashDrawerBusy}
                  >
                    Cash Drawer
                  </Button>
                }
              >
                <ReservationPaymentPanel
                  paymentType={paymentType}
                  onPaymentTypeChange={value => {
                    setPaymentType(value)
                    setPaymentFields(createEmptyReservationPaymentFields())
                    setPaymentValidationErrors({})
                    setSubmitError(null)
                  }}
                  paymentAmount={formatReservationMoney(splitTotals.total)}
                  onPaymentAmountChange={() => undefined}
                  fields={paymentFields}
                  onFieldChange={(key, value) => {
                    setPaymentFields(current => ({ ...current, [key]: value }))
                    setPaymentValidationErrors({})
                    setSubmitError(null)
                  }}
                  paymentDisabled
                  showAuthFields
                  validationErrors={paymentValidationErrors}
                />
              </SectionCard>

              {submitError ? (
                <p className='text-sm text-destructive'>{submitError}</p>
              ) : null}
            </>
          ) : null}
        </div>

        <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-start'>
          <Button
            type='button'
            size='sm'
            onClick={() => void handleSave()}
            disabled={isLoading || isSubmitting || isFullyPaid || splitCount <= 0}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className='size-4 animate-spin' />
                Splitting...
              </>
            ) : (
              'Save'
            )}
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
