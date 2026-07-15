import { LoaderCircle, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { ShowDateField } from '@/components/common/show-date-field'
import { ShowTimePicker } from '@/components/common/show-time-picker'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import { ReservationPaymentPanel } from '@/features/reservations/reservation-payment-panel'
import { useReservationDetail } from '@/hooks/use-reservation-detail'
import {
  buildMoveReservationRequest,
  calculateMoveReservationDifference,
  calculateMoveReservationTotals,
  isPastShowDate,
  validateMoveReservationSection
} from '@/lib/build-move-reservation-request'
import { formatReservationMoney, parseReservationMoney } from '@/lib/calculate-reservation-totals'
import { fetchUpcomingShowDetails, moveReservation } from '@/lib/api/reservations'
import { mapReservationSourceToOrigin } from '@/lib/reservation-edit'
import {
  getFirstReservationPaymentError,
  validateReservationPaymentFields,
  type ReservationPaymentValidationErrors
} from '@/lib/validate-reservation-payment'
import {
  filterUpcomingShowsByDate,
  getActiveUpcomingShows,
  toIsoShowDate
} from '@/lib/map-upcoming-show-details'
import { mapShowDetailsToOptions } from '@/lib/map-show-details'
import { mapShowSectionsToOptions } from '@/lib/map-show-sections'
import { cn } from '@/lib/utils'
import { useGetShowSectionsQuery } from '@/store/api/clubmanApi'
import {
  createEmptyReservationPaymentFields,
  type ReservationPaymentFields
} from '@/types/reservation-payment'
import type { Reservation, ReservationSectionOption } from '@/types/reservation'
import type { ShowDetailsByDateItem } from '@/types/api/show-details'

type MoveReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  connectionName: string
  locationId: string
  username: string
  currentShowId: string
  onMoved?: () => void | Promise<void>
}

function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function formatShowDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
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

function SummaryField({
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

function SectionCard({
  title,
  children,
  className
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-md border border-slate-200 bg-slate-50/60 p-3',
        className
      )}
    >
      <h3 className='text-sm font-medium text-foreground'>{title}</h3>
      <div className='mt-3'>{children}</div>
    </section>
  )
}

function MoneyField({
  label,
  value,
  highlight
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className='min-w-0 space-y-1'>
      <span className='text-xs font-medium text-foreground'>{label}</span>
      <Input
        readOnly
        value={formatReservationMoney(value)}
        className={cn(
          'h-9 bg-white text-sm shadow-xs',
          highlight && value > 0 && 'font-medium text-destructive'
        )}
      />
    </div>
  )
}

export function MoveReservationDialog({
  open,
  onOpenChange,
  reservation,
  connectionName,
  locationId,
  username,
  currentShowId,
  onMoved
}: MoveReservationDialogProps) {
  const reservationId = reservation?.id ?? ''
  const { detail, loading: detailLoading, error: detailError } = useReservationDetail(
    connectionName,
    reservationId,
    open && Boolean(reservationId)
  )

  const [upcomingShows, setUpcomingShows] = useState<ShowDetailsByDateItem[]>([])
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [upcomingError, setUpcomingError] = useState<string | null>(null)
  const [destinationDate, setDestinationDate] = useState(todayDateValue)
  const [destinationShowId, setDestinationShowId] = useState('')
  const [destinationSectionId, setDestinationSectionId] = useState('')
  const [dinner, setDinner] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [paymentValidationErrors, setPaymentValidationErrors] =
    useState<ReservationPaymentValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chargeConfirmOpen, setChargeConfirmOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentType, setPaymentType] =
    useState<ReservationPaymentType>('credit-card')
  const [paymentFields, setPaymentFields] = useState<ReservationPaymentFields>(
    () => createEmptyReservationPaymentFields()
  )

  const originShowId = detail?.ShowId?.trim() || currentShowId
  const party = detail?.PartyNo ?? reservation?.qty ?? 0
  const origParty = detail?.OrigPartyNo ?? party
  const passes = detail?.NumPasses ?? 0
  const promotionCode = detail?.Promo?.trim() ?? reservation?.promo.trim() ?? ''
  const origin = reservation ? mapReservationSourceToOrigin(reservation.source) : 'phone'
  const reservationNotes =
    detail?.ReservationNotes?.trim() ??
    detail?.Note?.trim() ??
    reservation?.notes.trim() ??
    ''
  const reservationSectionCode = detail?.ResSec ?? ''
  const isVip = detail?.VIP?.trim().toUpperCase() === 'Y'

  const origSubTotal = detail?.SubTotal ?? 0
  const origServiceCharge = detail?.SVC ?? 0
  const origDiscount = detail?.Discount ?? 0
  const origTaxes = detail?.SalesTax ?? 0
  const origTotal =
    detail?.Total ??
    parseReservationMoney(reservation?.total ?? '0')

  const activeUpcomingShows = useMemo(
    () => getActiveUpcomingShows(upcomingShows),
    [upcomingShows]
  )

  const showsForSelectedDate = useMemo(
    () => filterUpcomingShowsByDate(activeUpcomingShows, destinationDate),
    [activeUpcomingShows, destinationDate]
  )

  const destinationShowOptions = useMemo(
    () => mapShowDetailsToOptions(showsForSelectedDate),
    [showsForSelectedDate]
  )

  const selectedDestinationShowId =
    destinationShowOptions.find(show => show.id === destinationShowId)?.id ??
    destinationShowOptions[0]?.id ??
    ''

  const { data: destinationSectionsRaw = [], isFetching: sectionsLoading } =
    useGetShowSectionsQuery(
      {
        connectionString: connectionName,
        showId: selectedDestinationShowId
      },
      {
        skip: !open || !connectionName || !selectedDestinationShowId
      }
    )

  const destinationSections = useMemo(
    () => mapShowSectionsToOptions(destinationSectionsRaw),
    [destinationSectionsRaw]
  )

  const selectedSection = useMemo(
    () =>
      destinationSections.find(section => section.id === destinationSectionId) ??
      destinationSections[0] ??
      null,
    [destinationSectionId, destinationSections]
  )

  const moveTotals = useMemo(() => {
    if (!selectedSection || party <= 0) {
      return {
        subtotal: 0,
        serviceCharge: 0,
        discount: origDiscount,
        taxes: 0,
        total: 0
      }
    }

    return calculateMoveReservationTotals({
      sectionPrice: selectedSection.price,
      party,
      origDiscount
    })
  }, [origDiscount, party, selectedSection])

  const { difference, isPayable, chargeAmount } = useMemo(
    () => calculateMoveReservationDifference(origTotal, moveTotals.total),
    [moveTotals.total, origTotal]
  )

  useEffect(() => {
    if (!open) {
      setUpcomingShows([])
      setUpcomingError(null)
      setDestinationDate(todayDateValue())
      setDestinationShowId('')
      setDestinationSectionId('')
      setDinner(false)
      setSubmitError(null)
      setIsSubmitting(false)
      setChargeConfirmOpen(false)
      setPaymentDialogOpen(false)
      setPaymentType('credit-card')
      setPaymentFields(createEmptyReservationPaymentFields())
      return
    }

    if (!connectionName || !locationId) {
      return
    }

    let isCurrent = true
    setUpcomingLoading(true)
    setUpcomingError(null)

    fetchUpcomingShowDetails({
      connectionString: connectionName,
      locationId,
      startDateIso: todayDateValue()
    })
      .then(shows => {
        if (isCurrent) {
          setUpcomingShows(shows)
        }
      })
      .catch(error => {
        if (isCurrent) {
          setUpcomingError(
            error instanceof Error
              ? error.message
              : 'Failed to load upcoming shows'
          )
        }
      })
      .finally(() => {
        if (isCurrent) {
          setUpcomingLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [connectionName, locationId, open])

  useEffect(() => {
    if (!open || !detail) {
      return
    }

    setDinner(detail.Dinner?.trim().toUpperCase() === 'Y')
  }, [detail, open])

  useEffect(() => {
    if (!open) {
      return
    }

    if (!destinationShowOptions.some(show => show.id === destinationShowId)) {
      setDestinationShowId(destinationShowOptions[0]?.id ?? '')
    }
  }, [destinationShowId, destinationShowOptions, open])

  useEffect(() => {
    if (!open) {
      return
    }

    if (!destinationSections.some(section => section.id === destinationSectionId)) {
      setDestinationSectionId(destinationSections[0]?.id ?? '')
    }
  }, [destinationSectionId, destinationSections, open])

  function validateMoveSelection(section: ReservationSectionOption | null) {
    if (!section || !selectedDestinationShowId) {
      return 'Invalid show selected. Please select show date and time to move reservation to.'
    }

    if (selectedDestinationShowId === originShowId) {
      return 'You can not move reservation to same show please choose another date.'
    }

    if (isPastShowDate(destinationDate)) {
      return 'Can not move reservation of past days.'
    }

    const sectionError = validateMoveReservationSection({
      reservationSectionCode,
      destinationSectionCode: section.showSec
    })

    if (sectionError) {
      return sectionError
    }

    return null
  }

  async function submitMoveReservation({
    includePayment,
    isPaymentWindowRequest = false,
    appendMovedNoChangesNote = false
  }: {
    includePayment: boolean
    isPaymentWindowRequest?: boolean
    appendMovedNoChangesNote?: boolean
  }) {
    if (!reservation || !selectedSection) {
      return
    }

    const validationError = validateMoveSelection(selectedSection)
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    if (includePayment) {
      const nextPaymentErrors = validateReservationPaymentFields({
        paymentType,
        fields: paymentFields,
        paymentAmount: formatReservationMoney(chargeAmount),
        paymentRequired: true,
        disallowCash: origin === 'phone'
      })
      const paymentError = getFirstReservationPaymentError(nextPaymentErrors)

      if (paymentError) {
        setPaymentValidationErrors(nextPaymentErrors)
        setSubmitError(paymentError)
        return
      }
    }

    setIsSubmitting(true)
    setPaymentValidationErrors({})
    setSubmitError(null)

    try {
      await moveReservation(
        buildMoveReservationRequest({
          connectionName,
          locationId,
          reservationId: reservation.id,
          lastUpdateId: username,
          selectedSection,
          origin,
          party,
          origParty,
          passes,
          promotionCode,
          reservationNotes,
          dinner,
          isVip,
          extraAmount: includePayment ? chargeAmount : 0,
          isExtraAmountPayable: includePayment,
          isPaymentWindowRequest,
          appendMovedNoChangesNote,
          paymentType: includePayment ? paymentType : undefined,
          paymentFields: includePayment ? paymentFields : undefined
        })
      )

      setChargeConfirmOpen(false)
      setPaymentDialogOpen(false)
      onOpenChange(false)
      await onMoved?.()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to move reservation'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleMoveClick() {
    const validationError = validateMoveSelection(selectedSection)
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    if (isPayable && chargeAmount > 0) {
      setSubmitError(null)
      setChargeConfirmOpen(true)
      return
    }

    void submitMoveReservation({ includePayment: false })
  }

  function handleOpenPaymentDialog() {
    setChargeConfirmOpen(false)
    setPaymentDialogOpen(true)
  }

  function handleDoNotCharge() {
    void submitMoveReservation({
      includePayment: false,
      appendMovedNoChangesNote: true
    })
  }

  function handleSelectUpcomingShow(show: ShowDetailsByDateItem) {
    const isoDate = toIsoShowDate(show.ShowDate)
    if (isoDate) {
      setDestinationDate(isoDate)
    }
    setDestinationShowId(show.ShowId)
    setSubmitError(null)
  }

  const isLoading = detailLoading || upcomingLoading
  const customerName = reservation
    ? `${reservation.lastName}, ${reservation.firstName}`.trim()
    : ''

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          disableOutsideDismiss
          showCloseButton={false}
          className='flex max-h-[82vh] max-w-6xl flex-col overflow-hidden p-0 sm:max-w-6xl'
        >
          <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
            <div className='min-w-0'>
              <DialogTitle className='text-base font-semibold text-foreground'>
                Move Reservation
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

            {!isLoading && (detailError || upcomingError) ? (
              <p className='text-sm text-destructive'>
                {detailError ?? upcomingError}
              </p>
            ) : null}

            {!isLoading ? (
              <>
                <SectionCard title='Reservation Details'>
                  <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                    <SummaryField label='Customer:' value={customerName || '—'} />
                    <SummaryField label='Source:' value={reservation?.source ?? '—'} />
                    <SummaryField
                      label={reservationSectionCode ? 'Table:' : 'Party:'}
                      value={String(party || '—')}
                    />
                    <SummaryField label='Promo Code:' value={promotionCode || '—'} />
                  </div>
                  <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
                    <MoneyField label='Subtotal' value={origSubTotal} />
                    <MoneyField label='Service Charge' value={origServiceCharge} />
                    <MoneyField label='Discount' value={origDiscount} />
                    <MoneyField label='Taxes' value={origTaxes} />
                    <MoneyField label='Total' value={origTotal} />
                  </div>
                </SectionCard>

                <SectionCard title='Select a Show'>
                  <div className='grid gap-4 xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] xl:items-end'>
                    <div className='space-y-2'>
                      <span className='block text-xs font-medium text-foreground'>
                        Show Date
                      </span>
                      <ShowDateField
                        showDate={destinationDate}
                        onShowDateChange={value => {
                          setDestinationDate(value)
                          setSubmitError(null)
                        }}
                        className='w-full'
                      />
                    </div>

                    <label className='flex h-9 items-center gap-2 self-end text-sm xl:justify-self-end'>
                      <Checkbox
                        checked={dinner}
                        onCheckedChange={value => setDinner(value === true)}
                      />
                      Dinner
                    </label>
                  </div>

                  <div className='mt-4 space-y-1.5'>
                    <span className='text-xs font-medium text-foreground'>
                      Show Time
                    </span>
                    <ShowTimePicker
                      shows={destinationShowOptions}
                      showTime={selectedDestinationShowId}
                      onShowTimeChange={value => {
                        setDestinationShowId(value)
                        setSubmitError(null)
                      }}
                      className='w-full'
                    />
                  </div>

                  <div className='mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_8rem] lg:items-end'>
                    <div className='space-y-1.5'>
                      <span className='text-xs font-medium text-foreground'>
                        Section
                      </span>
                      <Select
                        value={selectedSection?.id ?? ''}
                        onValueChange={value => {
                          setDestinationSectionId(value)
                          setSubmitError(null)
                        }}
                        disabled={!selectedDestinationShowId || sectionsLoading}
                      >
                        <SelectTrigger className='h-9 w-full bg-white shadow-xs'>
                          <SelectValue placeholder='Select section' />
                        </SelectTrigger>
                        <SelectContent>
                          {destinationSections.map(section => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-1.5'>
                      <span className='text-xs font-medium text-foreground'>
                        Available
                      </span>
                      <Input
                        readOnly
                        value={String(selectedSection?.available ?? 0)}
                        className='h-9 bg-white shadow-xs'
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title='Reservation Details (With Move)'>
                  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
                    <MoneyField label='Subtotal' value={moveTotals.subtotal} />
                    <MoneyField
                      label='Service Charge'
                      value={moveTotals.serviceCharge}
                    />
                    <MoneyField label='Discount' value={moveTotals.discount} />
                    <MoneyField label='Taxes' value={moveTotals.taxes} />
                    <MoneyField label='Total' value={moveTotals.total} />
                    <MoneyField
                      label='Difference'
                      value={difference}
                      highlight
                    />
                  </div>
                </SectionCard>

                <SectionCard title='Upcoming Shows'>
                  <p className='mb-3 text-xs text-muted-foreground'>
                    Double-click a show to move to
                  </p>
                  <div className='overflow-hidden rounded-md border border-slate-200 bg-white'>
                    <div className='max-h-52 overflow-auto'>
                      <table className='min-w-full w-full border-collapse text-sm'>
                        <thead>
                          <tr className='border-b border-slate-200 bg-muted/40 text-left text-xs font-semibold text-foreground'>
                            <th className='h-10 px-3 py-2'>Show Date</th>
                            <th className='h-10 px-3 py-2'>Show Time</th>
                            <th className='h-10 px-3 py-2'>Comic Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeUpcomingShows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className='px-3 py-8 text-center text-muted-foreground'
                              >
                                No upcoming shows found.
                              </td>
                            </tr>
                          ) : (
                            activeUpcomingShows.map(show => {
                              const showOption = mapShowDetailsToOptions([show])[0]
                              const isSelected = show.ShowId === selectedDestinationShowId

                              return (
                                <tr
                                  key={show.ShowId}
                                  className={cn(
                                    'cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-muted/30',
                                    isSelected && 'bg-primary/5'
                                  )}
                                  onDoubleClick={() => handleSelectUpcomingShow(show)}
                                >
                                  <td className='px-3 py-2.5'>
                                    {toIsoShowDate(show.ShowDate)
                                      ? formatShowDate(toIsoShowDate(show.ShowDate))
                                      : show.ShowDate}
                                  </td>
                                  <td className='px-3 py-2.5'>
                                    {showOption?.time ?? show.ShowTim}
                                  </td>
                                  <td className='px-3 py-2.5'>
                                    {showOption?.headliner ?? show.HeadlinerName ?? '—'}
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
              onClick={handleMoveClick}
              disabled={isLoading || isSubmitting || !selectedSection}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='size-4 animate-spin' />
                  Moving...
                </>
              ) : (
                'Move'
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

      <Dialog open={chargeConfirmOpen} onOpenChange={setChargeConfirmOpen}>
        <DialogContent
          showCloseButton={false}
          className='flex max-w-md flex-col overflow-hidden p-0 sm:max-w-md'
        >
          <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Moveable Show Charge
            </DialogTitle>
            <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
              <X className='size-4' />
              <span className='sr-only'>Close</span>
            </DialogClose>
          </DialogHeader>

          <div className='px-4 py-5'>
            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium text-foreground'>
                Payment Amount
              </span>
              <Input
                readOnly
                value={formatReservationMoney(chargeAmount)}
                className='h-9 max-w-40 bg-white shadow-xs'
              />
            </div>

            {submitError ? (
              <p className='mt-4 text-sm text-destructive'>{submitError}</p>
            ) : null}
          </div>

          <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-center sm:gap-3'>
            <Button
              type='button'
              size='sm'
              onClick={handleOpenPaymentDialog}
              disabled={isSubmitting}
            >
              Charge
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={handleDoNotCharge}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='size-4 animate-spin' />
                  Moving...
                </>
              ) : (
                'Do not charge'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className='flex max-h-[82vh] max-w-lg flex-col overflow-hidden p-0 sm:max-w-lg'
        >
          <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Payment
            </DialogTitle>
            <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
              <X className='size-4' />
              <span className='sr-only'>Close</span>
            </DialogClose>
          </DialogHeader>

          <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4'>
            <div className='space-y-1.5'>
              <span className='text-sm font-medium text-foreground'>
                Payment Amount
              </span>
              <Input
                readOnly
                value={formatReservationMoney(chargeAmount)}
                className='bg-white shadow-xs'
              />
            </div>

            <ReservationPaymentPanel
              paymentType={paymentType}
              onPaymentTypeChange={value => {
                setPaymentType(value)
                setPaymentFields(createEmptyReservationPaymentFields())
                setPaymentValidationErrors({})
                setSubmitError(null)
              }}
              paymentAmount={formatReservationMoney(chargeAmount)}
              onPaymentAmountChange={() => undefined}
              fields={paymentFields}
              onFieldChange={(key, value) => {
                setPaymentFields(current => ({ ...current, [key]: value }))
                setPaymentValidationErrors({})
                setSubmitError(null)
              }}
              paymentDisabled
              validationErrors={paymentValidationErrors}
            />

            {submitError && Object.keys(paymentValidationErrors).length === 0 ? (
              <p className='text-sm text-destructive'>{submitError}</p>
            ) : null}
          </div>

          <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-start'>
            <Button
              type='button'
              size='sm'
              onClick={() =>
                void submitMoveReservation({
                  includePayment: true,
                  isPaymentWindowRequest: true
                })
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='size-4 animate-spin' />
                  Charging...
                </>
              ) : (
                'Charge'
              )}
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setPaymentDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
