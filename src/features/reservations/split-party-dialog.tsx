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
import { Input } from '@/components/ui/input'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import { ReservationPaymentPanel } from '@/features/reservations/reservation-payment-panel'
import { SplitReservationTicketPicker } from '@/features/reservations/split-reservation-ticket-picker'
import { useCachedReservationShowData } from '@/hooks/use-cached-reservation-show-data'
import { useReservationDetail } from '@/hooks/use-reservation-detail'
import { openCashDrawer } from '@/lib/api/reservation-pos-actions'
import {
  buildSplitReservationRequest,
  calculateSplitReservationTotals,
  validateReservationSplit
} from '@/lib/build-split-reservation-request'
import { formatReservationMoney, parseReservationMoney } from '@/lib/calculate-reservation-totals'
import {
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
import { useSaveSplitReservationMutation, useGetShowDataQuery } from '@/store/api/clubmanApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

export function SplitPartyDialog({
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
  const [splitFirstName, setSplitFirstName] = useState('')
  const [splitLastName, setSplitLastName] = useState('')
  const [paymentType, setPaymentType] = useState<ReservationPaymentType>('credit-card')
  const [paymentFields, setPaymentFields] = useState<ReservationPaymentFields>(
    () => createEmptyReservationPaymentFields()
  )
  const [paymentValidationErrors, setPaymentValidationErrors] =
    useState<ReservationPaymentValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCashDrawerBusy, setIsCashDrawerBusy] = useState(false)

  const [splitSelectedPromo, setSplitSelectedPromo] = useState('none')
  const [paymentDue, setPaymentDue] = useState(0)
  const [paymentAmountInput, setPaymentAmountInput] = useState('')
  const [saveSplitReservation] = useSaveSplitReservationMutation()

  const showId = detail?.ShowId?.trim() || currentShowId

  const origin = reservation ? mapReservationSourceToOrigin(reservation.source) : 'phone'
  const promoOrigin = origin === 'phone' ? 'phone' : 'walkup'

  const { data: showDataPayload } = useGetShowDataQuery(
    { connectionName, showId },
    { skip: !open || !connectionName || !showId }
  )

  const { sections, sectionsLoading, promoOptions, promoById } =
    useCachedReservationShowData({
      connectionName,
      locationId,
      showDate,
      showId,
      enabled: open && Boolean(showId),
      isManager: showDataPayload?.[0]?.NoPasses === 'Y',
      origin: promoOrigin
    })

  const matchedSection =
    findReservationSection(sections, detail?.ResSec ?? reservation?.section ?? '') ??
    sections[0] ??
    null

  const party = detail?.PartyNo ?? reservation?.qty ?? 0
  const remainingTickets = Math.max(0, party - (detail?.CheckedIn ?? 0))
  const unitPrice = parseReservationMoney(matchedSection?.price ?? '0')
  const promotionCode = detail?.Promo?.trim() ?? reservation?.promo.trim() ?? ''


  const origTotals = {
    subtotal: detail?.SubTotal ?? 0,
    serviceCharge: detail?.SVC ?? 0,
    discount: detail?.Discount ?? 0,
    taxes: detail?.SalesTax ?? 0,
    total: detail?.Total ?? parseReservationMoney(reservation?.total ?? '0')
  }

  const alreadyPaidAmount = parseReservationMoney(reservation?.paid ?? '$0.00')
  const isFullyPaid = origTotals.total > 0 && alreadyPaidAmount >= origTotals.total

  const effectiveSplitPromo = splitSelectedPromo !== 'none' ? splitSelectedPromo : null
  const splitPromoObj = effectiveSplitPromo ? promoById.get(effectiveSplitPromo) ?? null : null

  const baseFee = origin === 'phone' ? (detail?.PhoneInFee ?? 0)
    : origin === 'walkup' ? (detail?.WalkUpFee ?? 0)
      : (detail?.WebFee ?? 0)
  const dayOfShowFee = detail?.DayOfShowFee ?? 0
  const serviceChargePerTicket = baseFee + dayOfShowFee

  const origTaxable = Math.max(0, (detail?.SubTotal ?? 0) + (detail?.SVC ?? 0) - (detail?.Discount ?? 0))
  const impliedTaxRate = origTaxable > 0 ? (detail?.SalesTax ?? 0) / origTaxable : 0

  const splitTotals = calculateSplitReservationTotals({
    sectionPrice: matchedSection?.price ?? '0',
    splitCount,
    promo: splitPromoObj,
    serviceChargePerTicket,
    taxRate: impliedTaxRate
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
      setPaymentDue(0)
      setPaymentAmountInput('')
      setSplitSelectedPromo('none')
      setSplitFirstName('')
      setSplitLastName('')
    }
  }, [open])

  useEffect(() => {
    setPaymentDue(splitTotals.total)
    setPaymentAmountInput(formatReservationMoney(splitTotals.total))
  }, [splitTotals.total])

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

    const inputAmount = parseReservationMoney(paymentAmountInput)
    if (inputAmount > paymentDue) {
      setSubmitError("Payment amount cannot be greater than the remaining due.")
      return
    }

    const nextPaymentErrors = validateReservationPaymentFields({
      paymentType,
      fields: paymentFields,
      paymentAmount: paymentAmountInput,
      paymentRequired: true,
      disallowCash: origin === 'phone'
    })
    const paymentError = getFirstReservationPaymentError(nextPaymentErrors)

    if (paymentError) {
      setPaymentValidationErrors(nextPaymentErrors)
      setSubmitError(paymentError)
      return
    }

    if (inputAmount < paymentDue) {
      setSubmitError("Full payment is required when splitting the party.")
      return
    }

    setIsSubmitting(true)
    setPaymentValidationErrors({})
    setSubmitError(null)

    try {
      const payload = buildSplitReservationRequest({
        connectionName,
        locationId,
        reservationId: reservation.id,
        lastUpdateId: username,
        splitCount,
        remainingTickets,
        paymentType,
        paymentFields,
        totals: splitTotals,
        isSplitFlag: false,
        paymentAmount: inputAmount,
        promoId: splitSelectedPromo !== 'none' ? splitSelectedPromo : undefined,
        taxRate: impliedTaxRate,
        detail
      })

      // Overrides for Split Party
      payload.Action = 'CMDSaveSplitReservation'
      payload.ActionForm = 'fromReservation'
      payload.IsSplitReservation = true
      if (splitFirstName.trim()) payload.SplitCustomerFirstName = splitFirstName.trim()
      if (splitLastName.trim()) payload.SplitCustomerLastName = splitLastName.trim()
      payload.SplitParty = splitCount

      await saveSplitReservation(payload).unwrap()

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

  function handleOpenChange(newOpen: boolean) {
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <SectionCard title='Original Customer Details'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <SummaryField label='Last Name:' value={reservation?.lastName || '—'} />
                  <SummaryField label='First Name:' value={reservation?.firstName || '—'} />
                </div>
              </SectionCard>

              <SectionCard title='New Party Name (Optional)'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-medium text-muted-foreground'>New First Name</label>
                    <Input
                      value={splitFirstName}
                      onChange={e => setSplitFirstName(e.target.value)}
                      placeholder={reservation?.firstName || ''}
                      className='h-8'
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-medium text-muted-foreground'>New Last Name</label>
                    <Input
                      value={splitLastName}
                      onChange={e => setSplitLastName(e.target.value)}
                      placeholder={reservation?.lastName || ''}
                      className='h-8'
                    />
                  </div>
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
                      { label: 'Checked In', value: String(detail?.CheckedIn ?? 0) },
                      { label: 'Remaining', value: String(remainingTickets) },
                      { label: 'Price Per Ticket', value: formatReservationMoney(unitPrice) }
                    ]}
                  />
                </div>
              </SectionCard>

              <SectionCard title='Select Tickets to Split'>
                <SplitReservationTicketPicker
                  remainingTickets={remainingTickets}
                  totalAmount={origTotals.total}
                  partySize={party}
                  selectedCount={splitCount}
                  onSelect={count => {
                    setSplitCount(count)
                    setSubmitError(null)
                  }}
                />
              </SectionCard>

              <SectionCard title='Split Details'>
                <div className='mb-4 flex items-center justify-between gap-4'>
                  <span className='text-sm font-medium text-foreground'>Split Promo</span>
                  <Select
                    value={splitSelectedPromo}
                    onValueChange={setSplitSelectedPromo}
                  >
                    <SelectTrigger className='h-8 w-48 text-sm'>
                      <SelectValue placeholder='None' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>None</SelectItem>
                      {promoOptions.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  excludedPaymentTypes={['hold-cc']}
                  paymentType={paymentType}
                  onPaymentTypeChange={value => {
                    setPaymentType(value)
                    setPaymentFields(createEmptyReservationPaymentFields())
                    setPaymentValidationErrors({})
                    setSubmitError(null)
                  }}
                  paymentAmount={paymentAmountInput}
                  onPaymentAmountChange={setPaymentAmountInput}
                  fields={paymentFields}
                  onFieldChange={(key, value) => {
                    setPaymentFields(current => ({ ...current, [key]: value }))
                    setPaymentValidationErrors({})
                    setSubmitError(null)
                  }}
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
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
