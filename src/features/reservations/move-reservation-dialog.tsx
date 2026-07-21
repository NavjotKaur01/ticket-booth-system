import { LoaderCircle, LockKeyhole, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { ShowDateField } from '@/components/common/show-date-field'
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
import {
  reportError,
  reportErrorMessage,
  toastSuccess,
} from '@/lib/app-toast'
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

/** Desktop MoveReservation.xaml table-section visibility (BookTableSecVisibility). */
const TABLE_SECTION_CODES = new Set([
  'SECT12',
  'SECT16',
  'SECT13',
  'SECT17',
  'SECT10',
  'SECT15',
  'SECT05',
])

const READONLY_FIELD_CLASS =
  'h-9 cursor-default border-slate-200 bg-slate-100/80 text-muted-foreground shadow-none focus-visible:border-slate-200 focus-visible:ring-0'

/** Desktop section combo: `$ price Name Seats: n` (Available is a separate field). */
function formatMoveSectionLabel(section: ReservationSectionOption) {
  return `${section.price} ${section.name} Seats: ${section.seats}`
}

function formatShowDateShort(dateValue: string) {
  const iso = toIsoShowDate(dateValue) || dateValue
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}/${date.getFullYear()}`
}

function formatDifferenceMoney(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    currencySign: 'accounting',
  })
}

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

function SectionCard({
  title,
  children,
  className,
  readOnly = false,
}: {
  title: string
  children: ReactNode
  className?: string
  readOnly?: boolean
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
      </div>
      <div className='mt-3'>{children}</div>
    </section>
  )
}

function MoneyField({
  label,
  value,
  className,
  readOnlyTone = false,
}: {
  label: string
  value: number
  className?: string
  readOnlyTone?: boolean
}) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <span className='text-xs font-medium text-foreground'>{label}</span>
      <Input
        readOnly
        value={formatReservationMoney(value)}
        className={cn(
          'h-9 bg-white text-sm shadow-xs',
          readOnlyTone && READONLY_FIELD_CLASS
        )}
      />
    </div>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className='block text-xs font-semibold text-foreground'>{children}</span>
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
  const [displayedMoveTotals, setDisplayedMoveTotals] = useState({
    subtotal: 0,
    serviceCharge: 0,
    discount: 0,
    taxes: 0,
    total: 0,
  })
  const [displayedDifference, setDisplayedDifference] = useState(0)

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
  const isTableReservation = TABLE_SECTION_CODES.has(
    reservationSectionCode.trim().toUpperCase()
  )
  const originLabel = reservation?.source ?? 'Phone'
  const partyOrTableLabel = isTableReservation ? 'Table :' : 'Party :'
  const partyOrTableValue = String(party || '')

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

  function applyMoveTotalsDisplay() {
    setDisplayedMoveTotals(moveTotals)
    setDisplayedDifference(difference)
  }

  useEffect(() => {
    if (!open) {
      return
    }
    // Desktop recalcs when show/section selection changes; keep charge math live.
    applyMoveTotalsDisplay()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync display from current memo values
  }, [open, moveTotals, difference])

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
      setDisplayedMoveTotals({
        subtotal: 0,
        serviceCharge: 0,
        discount: 0,
        taxes: 0,
        total: 0,
      })
      setDisplayedDifference(0)
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
          reportError(
            setUpcomingError,
            error,
            'Failed to load upcoming shows'
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
      reportErrorMessage(setSubmitError, validationError)
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
        reportErrorMessage(setSubmitError, paymentError)
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
      toastSuccess('Reservation moved')
    } catch (error) {
      reportError(setSubmitError, error, 'Failed to move reservation')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleMoveClick() {
    const validationError = validateMoveSelection(selectedSection)
    if (validationError) {
      reportErrorMessage(setSubmitError, validationError)
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
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          disableOutsideDismiss
          showCloseButton={false}
          className='flex max-h-[90vh] max-w-5xl flex-col overflow-hidden p-0 sm:max-w-5xl'
        >
          <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Move Reservation
            </DialogTitle>
            <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
              <X className='size-4' />
              <span className='sr-only'>Close</span>
            </DialogClose>
          </DialogHeader>

          <div className='min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4'>
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
                <SectionCard title='Reservation Details' readOnly>
                  <div className='grid gap-3 md:grid-cols-[minmax(0,7rem)_minmax(0,12rem)_minmax(0,5rem)_minmax(0,7rem)_minmax(0,6rem)_minmax(0,12rem)] md:items-end'>
                    <div className='space-y-1'>
                      <FieldLabel>Origin :</FieldLabel>
                      <Input
                        readOnly
                        value={originLabel}
                        aria-label='Origin (read only)'
                        className={READONLY_FIELD_CLASS}
                      />
                    </div>

                    <div className='space-y-1 md:col-start-3'>
                      <FieldLabel>{partyOrTableLabel}</FieldLabel>
                      <Input
                        readOnly
                        value={partyOrTableValue}
                        className={cn(READONLY_FIELD_CLASS, 'max-w-28')}
                      />
                    </div>

                    <div className='space-y-1 md:col-span-2'>
                      <FieldLabel>Promo Code</FieldLabel>
                      <Input
                        readOnly
                        value={promotionCode || 'None'}
                        aria-label='Promo Code (read only)'
                        className={READONLY_FIELD_CLASS}
                      />
                    </div>
                  </div>

                  <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
                    <MoneyField label='Subtotal' value={origSubTotal} readOnlyTone />
                    <MoneyField
                      label='Service Charge'
                      value={origServiceCharge}
                      readOnlyTone
                    />
                    <MoneyField label='Discount' value={origDiscount} readOnlyTone />
                    <MoneyField label='Taxes' value={origTaxes} readOnlyTone />
                    <MoneyField label='Total' value={origTotal} readOnlyTone />
                  </div>
                </SectionCard>

                <SectionCard title='Select a Show'>
                  <div className='grid gap-3 lg:grid-cols-[minmax(0,11rem)_minmax(0,5rem)_minmax(0,1fr)_auto] lg:items-end'>
                    <div className='space-y-1'>
                      <FieldLabel>Show Date</FieldLabel>
                      <ShowDateField
                        showDate={destinationDate}
                        onShowDateChange={value => {
                          setDestinationDate(value)
                          setSubmitError(null)
                        }}
                        className='w-full'
                      />
                    </div>

                    <div className='space-y-1 lg:col-start-2 lg:col-span-2'>
                      <FieldLabel>Show Time</FieldLabel>
                      <Select
                        value={selectedDestinationShowId || undefined}
                        onValueChange={value => {
                          setDestinationShowId(value)
                          setSubmitError(null)
                        }}
                        disabled={destinationShowOptions.length === 0}
                      >
                        <SelectTrigger className='h-9 w-full min-w-[16rem] bg-white shadow-xs'>
                          <SelectValue placeholder='Select show time' />
                        </SelectTrigger>
                        <SelectContent>
                          {destinationShowOptions.map(show => (
                            <SelectItem key={show.id} value={show.id}>
                              {show.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex h-9 items-center gap-2 self-end text-sm'>
                      <Checkbox
                        checked={dinner}
                        disabled
                        className='cursor-default border-slate-300 bg-slate-100 opacity-100 disabled:cursor-default disabled:opacity-100'
                      />
                      Dinner
                    </div>
                  </div>

                  <div className='mt-4 grid gap-3 lg:grid-cols-[minmax(0,5rem)_minmax(0,1fr)_auto] lg:items-end'>
                    <div className='space-y-1 lg:col-span-2'>
                      <FieldLabel>Section:</FieldLabel>
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
                              {formatMoveSectionLabel(section)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex items-center gap-2 self-end'>
                      <span className='shrink-0 text-xs font-semibold text-foreground'>
                        Available :
                      </span>
                      <Input
                        readOnly
                        value={String(selectedSection?.available ?? 0)}
                        className='h-9 w-24 bg-white shadow-xs'
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title='Reservation Details ( With Move )'>
                  <div className='grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end'>
                    <MoneyField
                      label='Subtotal'
                      value={displayedMoveTotals.subtotal}
                    />
                    <MoneyField
                      label='Service Charge'
                      value={displayedMoveTotals.serviceCharge}
                    />
                    <MoneyField
                      label='Discount'
                      value={displayedMoveTotals.discount}
                    />
                    <Button
                      type='button'
                      size='sm'
                      className='h-9 self-end bg-emerald-600 text-white hover:bg-emerald-700'
                      onClick={() => {
                        applyMoveTotalsDisplay()
                        setSubmitError(null)
                      }}
                    >
                      Re-Calculate Total
                    </Button>
                  </div>

                  <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                    <MoneyField label='Taxes' value={displayedMoveTotals.taxes} />
                    <MoneyField label='Total' value={displayedMoveTotals.total} />
                  </div>
                </SectionCard>

                <section className='rounded-md border border-slate-200 bg-white'>
                  <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-3 py-2'>
                    <p className='text-xs text-muted-foreground'>
                      Upcoming Shows : ( DblClick show to move to )
                    </p>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-semibold text-foreground'>
                        Difference :
                      </span>
                      <Input
                        readOnly
                        value={formatDifferenceMoney(displayedDifference)}
                        className={cn(
                          'h-9 w-32 bg-white text-sm shadow-xs',
                          displayedDifference > 0 && 'font-medium text-destructive'
                        )}
                      />
                    </div>
                  </div>

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
                            const isSelected =
                              show.ShowId === selectedDestinationShowId

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
                                  {formatShowDateShort(show.ShowDate)}
                                </td>
                                <td className='px-3 py-2.5'>
                                  {showOption?.time ?? show.ShowTim}
                                </td>
                                <td className='px-3 py-2.5'>
                                  {showOption?.headliner ??
                                    show.HeadlinerName ??
                                    '—'}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

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
