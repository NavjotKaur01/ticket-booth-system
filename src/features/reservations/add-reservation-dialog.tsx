import {
  Calendar,
  ChevronDown,
  Info,
  LoaderCircle,
  Pencil,
  Search,
  UserPlus,
  X,
  type LucideIcon
} from 'lucide-react'
import type { FocusEvent, KeyboardEvent, MutableRefObject, RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'

import { DatePickerCalendarPanel } from '@/components/calendar/controls/date-picker-calendar-panel'
import { CalendarScrollSelectList } from '@/components/calendar/controls/CalendarScrollSelectList'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ReservationSearchResultsTable } from '@/features/reservations/reservation-search-results-table'

import {
  FormField,
  IconActionButton
} from '@/components/forms/form-fields'
import { ReservationTotalsCard } from '@/components/reservation/reservation-totals-card'
import { PhoneInputGroup } from '@/components/forms/phone-input-group'
import { ShowTimePicker } from '@/components/common/show-time-picker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  reservationShowMeta,
  showOptions,
  formatSectionDesktopPrice,
} from '@/data/reservation'
import { EXPIRATION_MONTHS } from '@/data/reservation-payment-options'
import { AssignSeatsDialog } from '@/features/check-in/dialogs/assign-seats-dialog'
import type { ExpressWalkupPaymentSeed } from '@/features/check-in/service/express-walkup-payment.types'
import { ComicInfoDialog } from '@/features/reservations/comic-info-dialog'
import type {
  ReservationBusinessSearchResult,
  ReservationCustomerSearchResult
} from '@/data/reservation-search-results'
import { AddCustomerDialog } from '@/features/customers/add-customer-dialog'
import {
  ReservationPaymentActions,
  ReservationPaymentPanel,
} from '@/features/reservations/reservation-payment-panel'
import { ReservationTransactionsTable } from '@/features/reservations/reservation-transactions-table'
import { SplitPromoAlertDialog } from '@/features/reservations/split-promo-alert-dialog'
import { useCachedReservationShowData } from '@/hooks/use-cached-reservation-show-data'
import { useReservationCustomerSearch } from '@/hooks/use-reservation-customer-search'
import { useReservationDetail } from '@/hooks/use-reservation-detail'
import { useReservationPrintProperties } from '@/hooks/use-reservation-print-properties'
import { useReservationTransactions } from '@/hooks/use-reservation-transactions'
import { useShowDetailsByDate } from '@/hooks/use-show-details-by-date'
import { getPromoApplicableTickets } from '@/lib/calculate-promo-discount'
import {
  calculateReservationTotals,
  formatReservationMoney,
  parseReservationMoney
} from '@/lib/calculate-reservation-totals'
import { calculatePromoFeeAdjustment, calculateSvcBase, mapOriginToCode } from '@/lib/calculate-svc-base'
import { readCheckInConfirmOnPaymentVisible } from '@/lib/check-in-defaults'
import { formatUsDateTime } from '@/lib/format-us-datetime'
import { showTimeLabelsMatch } from '@/lib/parse-admin-event-show-time'
import {
  EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA,
  hasCompleteNewCustomerCriteria,
  hasReservationCustomerSearchCriteria,
  type ReservationCustomerSearchCriteria
} from '@/lib/reservation-customer-search-criteria'
import { saveCustomer } from '@/lib/api/customers'
import {
  getReservationPaymentById,
  openCashDrawer,
  refundReservationPayment,
  voidReservationPayment
} from '@/lib/api/reservation-pos-actions'
import {
  RefundPaymentDialog,
  type RefundCardOption
} from '@/features/reservations/refund-payment-dialog'
import { ReprintTicketDialog } from '@/features/ticket-print/reprint-ticket-dialog'
import {
  createNewReservation,
  cancelReservation,
  reservationCheckIn,
  saveReservationNote,
  updateReservation
} from '@/lib/api/reservations'
import { buildCancelReservationRequest } from '@/lib/build-cancel-reservation-request'
import { buildReservationCheckInRequest } from '@/lib/build-reservation-check-in-request'
import { buildReservationNoteRequest } from '@/lib/build-reservation-note-request'
import {
  buildSaveReservationOnlyRequest,
  buildSaveReservationWithPaymentRequest,
  buildUpdateReservationPaymentRequest
} from '@/lib/build-save-reservation-request'
import {
  DueAmountDialog,
  type DueAmountOption
} from '@/features/reservations/due-amount-dialog'
import { useUpdateSplitReservationMutation, useRemoveReservationPromoMutation, useGetShowDataQuery, useGetSystemDefaultsQuery } from '@/store/api/clubmanApi'
import { mapReservationSearchCriteriaToCustomerForm } from '@/lib/map-reservation-search-to-customer-form'
import { parsePhoneSearchParts, normalizePhoneSearchParts } from '@/lib/parse-phone-search-parts'
import { resolveReservationBooking } from '@/lib/resolve-reservation-booking'
import {
  buildReservationEditSearchCriteria,
  findReservationPromoId,
  findReservationSection,
  formatReservationPaymentError,
  isReservationChanged,
  mapReservationSourceToOrigin,
  resolveReservationEditCustomerId
} from '@/lib/reservation-edit'
import {
  EMPTY_GUID,
  PAYMENT_STATUS_PAYMENT,
  PAYMENT_STATUS_REFUND,
  PAYMENT_STATUS_PROMO,
  RESERVATION_STATUS_CANCELLED
} from '@/lib/reservation-lookup-codes'
import { syncReservationCustomerIfChanged, syncReservationCustomerSearchResultIfChanged } from '@/lib/sync-reservation-customer'
import { validateReservationParty } from '@/lib/validate-reservation-party'
import {
  getFirstReservationPaymentError,
  validateReservationPaymentFields,
  type ReservationPaymentValidationErrors
} from '@/lib/validate-reservation-payment'
import { todayDateValue } from '@/lib/today-date-value'
import {
  getErrorMessage,
  reportError,
  reportErrorMessage,
  toastError,
  toastSuccess,
} from '@/lib/app-toast'
import { alertDialog } from '@/lib/app-dialog'
import { cn } from '@/lib/utils'
import { useAppSession } from '@/hooks/use-app-session'
import { createTicketPrintData } from '@/services/ticket-print.service'
import type { CustomerFormValues } from '@/types/customer-form'
import type { Customer } from '@/types/customer'
import {
  RESERVATION_PAYMENT_TYPES,
  type ReservationPaymentType
} from '@/data/reservation-payment-options'
import {
  createEmptyReservationPaymentFields,
  type ReservationPaymentFields
} from '@/types/reservation-payment'
import type { ReservationPromoOption } from '@/types/reservation-promo'
import type { ReservationSectionOption, SectionOption } from '@/types/reservation'
import type { Reservation } from '@/types/reservation'
import type { ReservationTransactionRow } from '@/types/reservation-transaction'
import type { TicketPrintData } from '@/types/ticket-print'

type AddReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
  onSaved?: (
    reservationIds: string[],
    ticketData?: TicketPrintData
  ) => void | Promise<void>
  reservation?: Reservation | null
  showDate?: string
  showTime?: string
  preferredShowTimeLabel?: string
  /** Edit mode only — opens SplitReservationDialog (lifted to the page) for this reservation. */
  onSplitReservation?: (reservation: Reservation) => void
  /** Edit mode only — opens SplitPartyDialog (lifted to the page) for this reservation. */
  onSplitParty?: (reservation: Reservation) => void
  /** Edit mode only — the reservation is already fully paid, so splitting isn't possible. */
  onAlreadyPaidAlert?: () => void
  /**
   * Express Walkup Other/Express → Reservation Payment.
   * Prefills walk-up booking + customer and locks origin.
   */
  expressWalkupSeed?: ExpressWalkupPaymentSeed | null
}

const COMPACT_INPUT = 'h-9 text-sm'
const COMPACT_FIELD_HOVER = 'hover:border-ring/60 hover:bg-accent/15'
const COMPACT_NUMBER = `h-9 w-14 px-1 text-center text-sm tabular-nums ${COMPACT_FIELD_HOVER} focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40`
const COMPACT_SELECT = 'h-9 w-44 min-w-0 text-sm'
const INLINE_LABEL = 'mb-1.5 block text-xs font-medium text-muted-foreground'

function mapPaymentLabelToType(label: string): ReservationPaymentType {
  const normalized = label.trim().toLowerCase()
  const match = RESERVATION_PAYMENT_TYPES.find(
    option => option.label.trim().toLowerCase() === normalized
  )

  return match?.id ?? 'credit-card'
}

const ORIGIN_OPTIONS = [
  { id: 'walkup', label: 'Walk-in' },
  { id: 'phone', label: 'Phone-in' }
] as const

type CustomerSearchCriteria = ReservationCustomerSearchCriteria

const EMPTY_CUSTOMER_SEARCH_CRITERIA = EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA

function hasCustomerSearchCriteria(
  searchType: 'customer' | 'business',
  criteria: CustomerSearchCriteria
) {
  return hasReservationCustomerSearchCriteria(searchType, criteria)
}

const SECTION_SEAT_STYLES = {
  seatsLabel: 'text-slate-600',
  seatsValue: 'font-semibold text-slate-800',
  availableLabel: 'text-emerald-800/80',
  availableValue: 'font-semibold text-emerald-600'
} as const

function SectionSeatDisplay({
  option,
  className
}: {
  option: SectionOption
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-max items-center justify-end gap-x-1.5 whitespace-nowrap text-sm tabular-nums',
        className
      )}
    >
      {/* price only renders here from sm+ — hidden on mobile to avoid duplication */}
      <span className='hidden shrink-0 tabular-nums text-foreground sm:inline'>
        {formatSectionDesktopPrice(option.price)}
      </span>

      <span className='inline-flex items-center gap-x-0.5 whitespace-nowrap'>
        <span className={SECTION_SEAT_STYLES.seatsLabel}>Seats:</span>
        <span className={SECTION_SEAT_STYLES.seatsValue}>{option.seats}</span>
      </span>

      <span className='text-border'>|</span>

      <span className='inline-flex items-center gap-x-0.5 whitespace-nowrap'>
        <span className={SECTION_SEAT_STYLES.availableLabel}>Available:</span>
        <span className={SECTION_SEAT_STYLES.availableValue}>
          {option.available}
        </span>
      </span>
    </div>
  )
}

function selectNumericInput(event: FocusEvent<HTMLInputElement>) {
  event.target.select()
}

function SectionPicker({
  sections,
  sectionsLoading,
  section,
  onSectionChange,
  partyBySection,
  onPartyChange,
  partyInputRefs,
  onPartyInputKeyDown,
  partyError,
  promo,
  onPromoChange,
  promoOptions,
  promoLoading,
  passes,
  onPassesChange,
  onPassesTabForward
}: {
  sections: ReservationSectionOption[]
  sectionsLoading?: boolean
  section: string
  onSectionChange: (value: string) => void
  partyBySection: Record<string, number>
  onPartyChange: (sectionId: string, value: number) => void
  partyInputRefs: MutableRefObject<Record<string, HTMLInputElement | null>>
  onPartyInputKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    sectionId: string
  ) => void
  partyError?: string | null
  promo: string
  onPromoChange: (value: string) => void
  promoOptions: ReservationPromoOption[]
  promoLoading?: boolean
  passes: number
  onPassesChange: (value: number) => void
  onPassesTabForward: () => void
}) {
  const passesInputRef = useRef<HTMLInputElement>(null)
  const promoTriggerRef = useRef<HTMLButtonElement>(null)
  const focusPassesAfterPromoCloseRef = useRef(false)
  const [isPromoOpen, setIsPromoOpen] = useState(false)

  if (sectionsLoading) {
    return (
      <div>
        <span className={INLINE_LABEL}>Section</span>
        <p className='text-xs text-muted-foreground'>Loading sections...</p>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div>
        <span className={INLINE_LABEL}>Section</span>
        <p className='text-xs text-muted-foreground'>
          No sections available for this show.
        </p>
      </div>
    )
  }

  function focusPartyInput(sectionId: string) {
    requestAnimationFrame(() => {
      const input = partyInputRefs.current[sectionId]
      input?.focus({ preventScroll: true })
      input?.select()
    })
  }

  function handleSectionValueChange(value: string) {
    onSectionChange(value)
    focusPartyInput(value)
  }

  function focusPassesInput() {
    requestAnimationFrame(() => {
      const input = passesInputRef.current
      input?.focus({ preventScroll: true })
      input?.select()
    })
  }

  function handlePromoChange(value: string) {
    onPromoChange(value)
    focusPassesAfterPromoCloseRef.current = true
  }

  function handlePromoCloseAutoFocus(event: Event) {
    if (!focusPassesAfterPromoCloseRef.current) {
      return
    }

    focusPassesAfterPromoCloseRef.current = false
    event.preventDefault()
    focusPassesInput()
  }

  function handlePassesInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Tab') {
      return
    }

    event.preventDefault()

    if (event.shiftKey) {
      promoTriggerRef.current?.focus({ preventScroll: true })
      return
    }

    onPassesTabForward()
  }

  return (
    <div>
      <span className={INLINE_LABEL}>Section</span>
      <RadioGroup value={section} onValueChange={handleSectionValueChange} className='gap-0'>
        <div className='overflow-x-auto rounded-lg border border-border/60 divide-y divide-border/50'>
          {sections.map(option => (
            <div
              key={option.id}
              className={cn(
                'grid items-center gap-x-2 gap-y-1.5 px-2.5 py-1.5',
                // mobile: 2 cols, 2 rows — col2 fits both price (row1) and input (row2)
                'grid-cols-[minmax(0,1fr)_auto]',
                // sm and up: original single-row 4-col grid
                'sm:min-w-[36rem] sm:grid-cols-[auto_minmax(7rem,11rem)_minmax(0,1fr)_3.5rem]',
                // lg only: collapse to 3 cols / 2 rows
                'lg:min-w-0 lg:grid-cols-[auto_1fr_3.5rem]',
                // xl+: revert to the sm layout
                'xl:min-w-[36rem] xl:grid-cols-[auto_minmax(7rem,11rem)_minmax(0,1fr)_3.5rem]'
              )}
            >
              <label htmlFor={`section-${option.id}`} className='contents cursor-pointer'>
                {/* row 1, col 1: radio + name (mobile); flattens into grid at sm+ */}
                <div className='flex min-w-0 items-center gap-2 sm:contents'>
                  <RadioGroupItem
                    value={option.id}
                    id={`section-${option.id}`}
                    className='shrink-0'
                  />
                  <span className='min-w-0 truncate text-sm font-semibold leading-tight text-foreground lg:col-span-2 xl:col-span-1'>
                    {option.name}
                  </span>
                </div>

                {/* row 1, col 2: price (mobile only — SectionSeatDisplay shows its own copy from sm+) */}
                <span className='shrink-0 self-center tabular-nums text-sm text-foreground sm:hidden'>
                  {formatSectionDesktopPrice(option.price)}
                </span>

                {/* row 2, col 1: seat display */}
                <SectionSeatDisplay
                  option={option}
                  className='justify-start sm:justify-end lg:col-span-2 lg:justify-start xl:col-span-1 xl:justify-end'
                />
              </label>

              {/* row 2, col 2: input — sits naturally beside SectionSeatDisplay, no extra row needed */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    ref={element => {
                      partyInputRefs.current[option.id] = element
                    }}
                    type='number'
                    min={0}
                    value={partyBySection[option.id] ?? 0}
                    onChange={event =>
                      onPartyChange(option.id, Number(event.target.value) || 0)
                    }
                    onFocus={event => {
                      onSectionChange(option.id)
                      selectNumericInput(event)
                    }}
                    onKeyDown={event => onPartyInputKeyDown(event, option.id)}
                    onClick={event => {
                      event.stopPropagation()
                      event.currentTarget.select()
                    }}
                    onPointerDown={event => event.stopPropagation()}
                    className={cn(COMPACT_NUMBER, 'shrink-0 self-center')}
                    aria-label={`${option.name} party size`}
                  />
                </TooltipTrigger>
                <TooltipContent side='top' collisionPadding={12} avoidCollisions>
                  Number of customers to reserve in {option.name}
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </RadioGroup>

      {partyError ? (
        <p className='mt-1.5 text-xs text-destructive'>{partyError}</p>
      ) : null}

      <div className='mt-2 flex flex-wrap items-center gap-2'>
        <div className='min-w-0 flex-1 sm:flex-initial sm:shrink-0'>
          <span className='sr-only'>Promo Code (Optional)</span>
          <Popover open={isPromoOpen} onOpenChange={setIsPromoOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={promoTriggerRef}
                variant="outline"
                disabled={promoLoading}
                className={cn(
                  COMPACT_SELECT,
                  COMPACT_FIELD_HOVER,
                  'w-full min-w-0 sm:w-44 justify-between px-3 font-normal',
                  promo === 'none' && 'text-muted-foreground'
                )}
              >
                <span className="truncate">
                  {promoLoading
                    ? 'Loading promo codes...'
                    : promoOptions.find(option => option.value === promo)?.label || 'Select promo code'}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] min-w-[8rem] touch-pan-y p-1"
              sideOffset={4}
              onCloseAutoFocus={handlePromoCloseAutoFocus}
            >
              <CalendarScrollSelectList
                isOpen={isPromoOpen}
                value={promo === 'none' ? '' : promo}
                options={promoOptions}
                onSelect={(value) => {
                  handlePromoChange(value)
                  setIsPromoOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              ref={passesInputRef}
              type='number'
              min={0}
              value={passes}
              onChange={event =>
                onPassesChange(Math.max(0, Number(event.target.value) || 0))
              }
              onFocus={selectNumericInput}
              onKeyDown={handlePassesInputKeyDown}
              className={COMPACT_NUMBER}
              aria-label='Passes'
            />
          </TooltipTrigger>
          <TooltipContent side='top'>
            Number of promo passes to apply with the selected code
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function formatShowDate(dateValue: string) {
  const parsed = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return reservationShowMeta.showDate
  }

  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function parseShowDateValue(dateValue: string) {
  const parsed = new Date(`${dateValue}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getStartOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function InlineRadioGroup({
  value,
  onChange,
  options,
  name
}: {
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string; title?: string }[]
  name: string
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className='flex w-auto flex-row items-center gap-x-4'
    >
      {options.map(option => (
        <label
          key={option.id}
          title={option.title}
          className='flex cursor-pointer items-center gap-2.5 text-sm whitespace-nowrap'
        >
          <RadioGroupItem
            value={option.id}
            id={`${name}-${option.id}`}
            tabIndex={-1}
          />
          <span className='text-foreground'>{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  )
}

function OriginSegmentedControl({
  value,
  onChange,
  disabled = false
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        'inline-flex overflow-hidden rounded-full border border-border/60 text-sm',
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      {ORIGIN_OPTIONS.map((option, index) => (
        <button
          key={option.id}
          type='button'
          tabIndex={-1}
          disabled={disabled}
          onClick={() => onChange(option.id)}
          className={cn(
            'px-3 py-1 transition-colors',
            value === option.id
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-foreground hover:text-foreground',
            index > 0 && 'border-l border-border/60'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function BookingOptionsBar({
  shows,
  showTime,
  onShowTimeChange,
  showTimeButtonRef,
  onShowTimeKeyDown,
  onShowTimeFocus,
  dinner,
  onDinnerChange,
  dinnerDisabled,
  showsLoading
}: {
  shows: typeof showOptions
  showTime: string
  onShowTimeChange: (value: string) => void
  showTimeButtonRef: RefObject<HTMLButtonElement | null>
  onShowTimeKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    show: (typeof showOptions)[number]
  ) => void
  onShowTimeFocus: () => void
  dinner: boolean
  onDinnerChange: (value: boolean) => void
  dinnerDisabled: boolean
  showsLoading: boolean
}) {
  return (
    <div className='min-w-0'>
      <span className={INLINE_LABEL}>Show / Time</span>
      <div
        className='flex min-w-0 items-center gap-2 overflow-hidden'
        onFocusCapture={onShowTimeFocus}
      >
        {shows.length > 0 ? (
          <ShowTimePicker
            shows={shows}
            showTime={showTime}
            onShowTimeChange={onShowTimeChange}
            selectedButtonRef={showTimeButtonRef}
            onShowTimeKeyDown={onShowTimeKeyDown}
          />
        ) : showsLoading ? (
          <span className='text-xs text-muted-foreground'>Loading shows...</span>
        ) : (
          <span className='text-xs text-muted-foreground'>
            No shows for this date
          </span>
        )}

        <label className={cn('flex shrink-0 items-center gap-2 text-sm whitespace-nowrap', dinnerDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
          <Checkbox
            id='dinner'
            tabIndex={-1}
            checked={dinner}
            onCheckedChange={checked => onDinnerChange(Boolean(checked))}
            disabled={dinnerDisabled}
          />
          Dinner
        </label>
      </div>
    </div>
  )
}

function CustomerDetailsFields({
  lastName,
  firstName,
  onEditCustomer,
  canEditCustomer = false
}: {
  lastName: string
  firstName: string
  onEditCustomer?: () => void
  canEditCustomer?: boolean
}) {
  return (
    <div className='space-y-1.5'>
      <h3 className='text-sm font-semibold text-foreground'>Customer Details</h3>
      <div className='flex items-end gap-2'>
        <FormField
          label='Last Name'
          htmlFor='edit-customer-last-name'
          className='min-w-0 flex-1'
        >
          <Input
            id='edit-customer-last-name'
            value={lastName}
            readOnly
            className={COMPACT_INPUT}
          />
        </FormField>
        <FormField
          label='First Name'
          htmlFor='edit-customer-first-name'
          className='min-w-0 flex-1'
        >
          <Input
            id='edit-customer-first-name'
            value={firstName}
            readOnly
            className={COMPACT_INPUT}
          />
        </FormField>
        {canEditCustomer ? (
          <IconActionButton
            label='Edit Customer'
            icon={Pencil}
            tabIndex={-1}
            onClick={onEditCustomer}
          />
        ) : null}
      </div>
    </div>
  )
}

function TableAssignmentRow({
  tableNums,
  onAssignSeat,
  isAssigning,
  error
}: {
  tableNums: string
  onAssignSeat: () => void
  isAssigning: boolean
  error: string | null
}) {
  return (
    <div className='space-y-1'>
      <div className='flex items-end gap-2'>
        <div className='min-w-0 flex-1 space-y-1'>
          <span className={INLINE_LABEL}>Table Nums</span>
          <Input
            value={tableNums}
            readOnly
            disabled
            className={COMPACT_INPUT}
            placeholder=''
          />
        </div>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={onAssignSeat}
          disabled={isAssigning}
        >
          {isAssigning ? (
            <>
              <LoaderCircle className='size-3.5 animate-spin' />
              Assigning...
            </>
          ) : (
            'Assign Seat'
          )}
        </Button>
      </div>
      {error ? <p className='text-xs text-destructive'>{error}</p> : null}
    </div>
  )
}

function PaymentMetadataField({
  label,
  value,
  className
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <span className='text-xs font-medium text-muted-foreground'>
        {label}
      </span>
      {/* Desktop TextBoxes show the full Auth/PNREF GUID — do not truncate. */}
      <p
        className='break-all font-mono text-xs leading-snug text-foreground'
        title={value || undefined}
      >
        {value || '—'}
      </p>
    </div>
  )
}

const HOLD_WITH_CARD_PAYMENT_CODE = 'PYMT01'

/**
 * Desktop rule (ReservationVM.SetPayment): a Hold with Credit Card payment
 * collapses the entire payment-history panel, including metadata and actions.
 * Match on the ClubMan LookUpCode, falling back to the display name for the
 * print-properties path which carries no code.
 */
function isHoldWithCardTransaction(
  transaction: ReservationTransactionRow | null
): boolean {
  if (!transaction) {
    return false
  }

  if (transaction.paymentTypeCode?.trim().toUpperCase() === HOLD_WITH_CARD_PAYMENT_CODE) {
    return true
  }

  return transaction.payment?.trim().toLowerCase() === 'hold with credit card'
}

function PaymentMetadataBlock({
  createdBy,
  status,
  createDate,
  authorization,
  pnref,
  busyAction,
  onRefund,
  onVoid,
  onClear
}: {
  createdBy: string
  status: string
  createDate: string
  authorization: string
  pnref: string
  busyAction: 'refund' | 'void' | 'clear' | 'cash-drawer' | 'split' | null
  onRefund: () => void
  onVoid: () => void
  onClear: () => void
}) {
  return (
    <div className='space-y-2 rounded-lg border border-border/60 p-2.5'>
      {/* Desktop PaymentHistoryPanel WrapPanel layout */}
      <div className='grid gap-3 sm:grid-cols-[minmax(7rem,9rem)_minmax(7rem,9rem)_minmax(0,1fr)]'>
        <PaymentMetadataField label='Created By' value={createdBy} />
        <PaymentMetadataField label='Status' value={status} />
        <PaymentMetadataField label='PNREF' value={pnref} />
      </div>
      <div className='grid gap-3 sm:grid-cols-[minmax(9rem,11rem)_minmax(0,1fr)]'>
        <PaymentMetadataField label='Create Date' value={createDate} />
        <PaymentMetadataField label='Authorization' value={authorization} />
      </div>
      <div className='flex flex-wrap items-center gap-2 border-t border-border/50 pt-2'>
        <Button
          type='button'
          size='sm'
          onClick={onRefund}
          disabled={busyAction === 'refund'}
          className='min-w-[96px] bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500/40'
        >
          {busyAction === 'refund' ? 'Refunding…' : 'Refund'}
        </Button>
        <Button
          type='button'
          size='sm'
          onClick={onVoid}
          disabled={busyAction === 'void'}
          className='min-w-[96px] bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/40'
        >
          {busyAction === 'void' ? 'Voiding…' : 'Void'}
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={onClear}
          disabled={busyAction === 'clear'}
          className='min-w-[96px] border-slate-300 text-foreground shadow-sm hover:bg-slate-100'
        >
          Clear
        </Button>
      </div>
    </div>
  )
}

function CustomerSearchHeader({
  searchType,
  onSearchTypeChange,
  onSearch,
  onClear,
  onAddCustomer,
  hasSelectedCustomer
}: {
  searchType: 'customer' | 'business'
  onSearchTypeChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
  onAddCustomer?: () => void
  hasSelectedCustomer?: boolean
}) {
  const isBusiness = searchType === 'business'

  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
      <div className='flex min-w-0 items-center gap-2'>
        <h3 className='text-sm font-semibold text-foreground'>
          Customer & Search
        </h3>
      </div>
      <InlineRadioGroup
        name='search-type'
        value={searchType}
        onChange={onSearchTypeChange}
        options={[
          { id: 'customer', label: 'Customer' },
          { id: 'business', label: 'Business' }
        ]}
      />

      <div className='ml-auto flex shrink-0 items-center gap-1.5'>
        <IconActionButton
          label='Search'
          icon={Search}
          variant='default'
          tabIndex={-1}
          onClick={onSearch}
        />
        <IconActionButton
          label={isBusiness ? 'Add Business' : hasSelectedCustomer ? 'Edit Customer' : 'Add Customer'}
          icon={UserPlus}
          tabIndex={-1}
          onClick={isBusiness ? undefined : onAddCustomer}
        />
        <IconActionButton
          label='Clear'
          icon={X}
          variant='outline'
          tabIndex={-1}
          onClick={onClear}
        />
      </div>
    </div>
  )
}

function CustomerSearchFields({
  searchType,
  criteria,
  onCriteriaChange,
  onFieldBlur,
  onFieldEnter,
  lastNameInputRef
}: {
  searchType: 'customer' | 'business'
  criteria: CustomerSearchCriteria
  onCriteriaChange: (criteria: CustomerSearchCriteria) => void
  onFieldBlur?: () => void
  onFieldEnter: () => void
  lastNameInputRef?: RefObject<HTMLInputElement | null>
}) {
  const inputClass = cn('w-full', COMPACT_INPUT)

  function updateField(field: keyof CustomerSearchCriteria, value: string) {
    onCriteriaChange({ ...criteria, [field]: value })
  }

  function updatePhone(parts: { area: string; prefix: string; line: string }) {
    onCriteriaChange({
      ...criteria,
      areaCode: parts.area,
      phone1: parts.prefix,
      phone2: parts.line
    })
  }

  const phoneInput = (
    <FormField label='Phone'>
      <PhoneInputGroup
        idPrefix={`reservation-search-phone-${searchType}`}
        value={{
          area: criteria.areaCode,
          prefix: criteria.phone1,
          line: criteria.phone2
        }}
        onChange={updatePhone}
        onBlur={onFieldBlur}
        onEnter={onFieldEnter}
        className='w-full'
      />
    </FormField>
  )

  const fieldProps = {
    onBlur: onFieldBlur,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        onFieldEnter()
      }
    },
    className: inputClass
  }

  if (searchType === 'business') {
    return (
      <div className='grid grid-cols-2 gap-x-2 gap-y-2'>
        <FormField label='Business Name'>
          <Input
            value={criteria.businessName}
            onChange={event => updateField('businessName', event.target.value)}
            {...fieldProps}
          />
        </FormField>
        <FormField label='Last Name'>
          <Input
            value={criteria.lastName}
            onChange={event => updateField('lastName', event.target.value)}
            ref={lastNameInputRef}
            {...fieldProps}
          />
        </FormField>
        <FormField label='First Name'>
          <Input
            value={criteria.firstName}
            onChange={event => updateField('firstName', event.target.value)}
            {...fieldProps}
          />
        </FormField>
        {phoneInput}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-x-2 gap-y-2'>
      <FormField label='Last Name'>
        <Input
          value={criteria.lastName}
          onChange={event => updateField('lastName', event.target.value)}
          ref={lastNameInputRef}
          {...fieldProps}
        />
      </FormField>
      <FormField label='First Name'>
        <Input
          value={criteria.firstName}
          onChange={event => updateField('firstName', event.target.value)}
          {...fieldProps}
        />
      </FormField>
      {phoneInput}
      <FormField label='Email'>
        <Input
          type='email'
          value={criteria.email}
          onChange={event => updateField('email', event.target.value)}
          {...fieldProps}
        />
      </FormField>
    </div>
  )
}

function MetaIconButton({
  label,
  icon: Icon,
  onClick
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          size='icon-sm'
          variant='ghost'
          tabIndex={-1}
          className='size-8 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
          aria-label={label}
          onClick={onClick}
        >
          <Icon className='size-4' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='top'>{label}</TooltipContent>
    </Tooltip>
  )
}

function ReservationShowDatePicker({
  showDate,
  onShowDateChange
}: {
  showDate: string
  onShowDateChange: (value: string) => void
}) {
  const selectedDate = parseShowDateValue(showDate)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    () => selectedDate ?? new Date()
  )

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }, [showDate])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)

    if (nextOpen && selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              tabIndex={-1}
              className='h-auto gap-1 rounded-lg px-0 py-0 text-left font-normal hover:bg-transparent'
              aria-label='Change show date'
            >
              <span className='text-sm text-muted-foreground'>
                {formatShowDate(showDate)}
              </span>
              <span className='grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover/button:bg-primary/20'>
                <Calendar className='size-4' />
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side='top'>Change show date</TooltipContent>
      </Tooltip>
      <PopoverContent align='start' className='w-auto p-0'>
        {isOpen ? (
          <DatePickerCalendarPanel
            key={`reservation-show-date-${showDate}`}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={selectedDate ?? undefined}
            onSelect={nextDate => {
              onShowDateChange(formatDateInputValue(getStartOfDay(nextDate)))
              setIsOpen(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function ShowMetaRow({
  comicName,
  showDate,
  onShowDateChange,
  shows,
  showTime,
  onShowTimeChange,
  showTimeButtonRef,
  onShowTimeKeyDown,
  onShowTimeFocus,
  origin,
  onOriginChange,
  originDisabled = false,
  onOpenComicInfo,
  dinner,
  onDinnerChange,
  dinnerDisabled,
  showsLoading
}: {
  comicName: string
  showDate: string
  onShowDateChange: (value: string) => void
  shows: typeof showOptions
  showTime: string
  onShowTimeChange: (value: string) => void
  showTimeButtonRef: RefObject<HTMLButtonElement | null>
  onShowTimeKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    show: (typeof showOptions)[number]
  ) => void
  onShowTimeFocus: () => void
  origin: string
  onOriginChange: (value: string) => void
  originDisabled?: boolean
  onOpenComicInfo: () => void
  dinner: boolean
  onDinnerChange: (value: boolean) => void
  dinnerDisabled: boolean
  showsLoading: boolean
}) {
  return (
    <div className='min-w-0 space-y-2'>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        <div className='inline-flex items-center gap-1'>
          <span className='text-sm font-medium text-foreground'>
            {comicName}
          </span>

          <MetaIconButton
            label='Comic Info'
            icon={Info}
            onClick={onOpenComicInfo}
          />
        </div>

        <ReservationShowDatePicker
          showDate={showDate}
          onShowDateChange={onShowDateChange}
        />

        <OriginSegmentedControl
          value={origin}
          onChange={onOriginChange}
          disabled={originDisabled}
        />
      </div>

      <BookingOptionsBar
        shows={shows}
        showTime={showTime}
        onShowTimeChange={onShowTimeChange}
        showTimeButtonRef={showTimeButtonRef}
        onShowTimeKeyDown={onShowTimeKeyDown}
        onShowTimeFocus={onShowTimeFocus}
        dinner={dinner}
        onDinnerChange={onDinnerChange}
        dinnerDisabled={dinnerDisabled}
        showsLoading={showsLoading}
      />
    </div>
  )
}

export function AddReservationDialog({
  open,
  onOpenChange,
  onAfterClose,
  onSaved,
  reservation = null,
  showDate: initialShowDate,
  showTime: initialShowTime,
  preferredShowTimeLabel,
  onSplitReservation,
  onSplitParty,
  onAlreadyPaidAlert,
  expressWalkupSeed = null
}: AddReservationDialogProps) {
  const isEditMode = Boolean(reservation)
  const isExpressWalkupPayment = Boolean(expressWalkupSeed) && !isEditMode
  const { connectionName, locationId, locationName, username, userRight, isReady } =
    useAppSession()
  const dialogContentRef = useRef<HTMLDivElement>(null)
  const dialogScrollRef = useRef<HTMLDivElement>(null)
  const notesInputRef = useRef<HTMLTextAreaElement>(null)
  const selectedShowTimeButtonRef = useRef<HTMLButtonElement>(null)
  const partyInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const lastNameInputRef = useRef<HTMLInputElement>(null)
  const pendingPartyFocusRef = useRef(false)
  const sectionsInitializedForShowRef = useRef('')
  const editPrefillDoneRef = useRef(false)
  const expressWalkupSeedAppliedRef = useRef(false)
  const origPartyRef = useRef(0)
  const origShowIdRef = useRef('')
  const origSectionIdRef = useRef('')
  const origPromoIdRef = useRef('none')
  const origOriginRef = useRef<'phone' | 'walkup'>('phone')
  const origPassesRef = useRef(1)
  const origDinnerRef = useRef(false)
  const sessionGenerationRef = useRef(0)
  /** True when Cash/POS already showed "Check-In Reservation?" before save. */
  const checkInPromptedBeforeSaveRef = useRef(false)
  useEffect(() => {
    if (open) {
      sessionGenerationRef.current += 1
    }
  }, [open])
  const bookingFormCacheRef = useRef<
    Map<
      string,
      {
        section: string
        partyBySection: Record<string, number>
        promo: string
        dinner: boolean
      }
    >
  >(new Map())
  const [searchType, setSearchType] = useState<'customer' | 'business'>(
    'customer'
  )
  const [specialNotesOpen, setSpecialNotesOpen] = useState(true)
  const [notes, setNotes] = useState('')
  const [dinner, setDinner] = useState(false)
  const [showDate, setShowDate] = useState(() => initialShowDate ?? todayDateValue())
  const [showTime, setShowTime] = useState(() => initialShowTime ?? '')
  const [section, setSection] = useState('')
  const [partyBySection, setPartyBySection] = useState<Record<string, number>>(
    {}
  )
  const [passes, setPasses] = useState(1)
  const [promo, setPromo] = useState('none')
  const [origin, setOrigin] =
    useState<typeof ORIGIN_OPTIONS[number]['id']>('phone')
  const [paymentAmountOverride, setPaymentAmountOverride] = useState<
    string | null
  >(null)
  const [paymentType, setPaymentType] =
    useState<ReservationPaymentType>('credit-card')
  const [paymentFields, setPaymentFields] = useState<ReservationPaymentFields>(
    () => createEmptyReservationPaymentFields()
  )
  const [isSavingReservation, setIsSavingReservation] = useState(false)
  const [checkInConfirmOpen, setCheckInConfirmOpen] = useState(false)
  const [saveReservationError, setSaveReservationError] = useState<
    string | null
  >(null)
  const [paymentValidationErrors, setPaymentValidationErrors] =
    useState<ReservationPaymentValidationErrors>({})
  const [showPartyRequiredError, setShowPartyRequiredError] = useState(false)
  const [comicInfoOpen, setComicInfoOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [addCustomerInitialValues, setAddCustomerInitialValues] =
    useState<CustomerFormValues | null>(null)
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [createCustomerError, setCreateCustomerError] = useState<string | null>(
    null
  )
  const [searchRowSelection, setSearchRowSelection] = useState<RowSelectionState>(
    {}
  )
  const [searchCriteria, setSearchCriteria] = useState<CustomerSearchCriteria>(
    EMPTY_CUSTOMER_SEARCH_CRITERIA
  )
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null)
  const [tableNums, setTableNums] = useState('')
  /** Desktop ResAssignSeatNumbers — drives Assign Seats Rem seed. */
  const [assignSeatNumbers, setAssignSeatNumbers] = useState('')
  const [assignSeatsOpen, setAssignSeatsOpen] = useState(false)
  const [assignSeatError, setAssignSeatError] = useState<string | null>(null)
  const [paymentActionBusy, setPaymentActionBusy] = useState<
    'refund' | 'void' | 'clear' | 'cash-drawer' | 'split' | null
  >(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundCards, setRefundCards] = useState<RefundCardOption[]>([])
  const [refundInitialPaymentId, setRefundInitialPaymentId] = useState('')
  const [refundBusy, setRefundBusy] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [saveNoteError, setSaveNoteError] = useState<string | null>(null)
  const [saveNoteSuccess, setSaveNoteSuccess] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<ReservationTransactionRow | null>(null)
  const [splitCheckedInAlertOpen, setSplitCheckedInAlertOpen] = useState(false)
  const [splitPromoAlertOpen, setSplitPromoAlertOpen] = useState(false)
  const [reprintOpen, setReprintOpen] = useState(false)
  const [dueAmountOpen, setDueAmountOpen] = useState(false)
  const [dueAmountOption, setDueAmountOption] =
    useState<DueAmountOption>('continue-without-payment')
  const [isDueAmountPending, setIsDueAmountPending] = useState(false)
  /** Desktop IsSaveChanges — set true when Save is clicked on the payment screen. */
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [cancelWithoutSavingOpen, setCancelWithoutSavingOpen] = useState(false)
  const [sendUpdateConfirmOpen, setSendUpdateConfirmOpen] = useState(false)
  const [sendUpdateToCustomer, setSendUpdateToCustomer] = useState(false)
  const [editNoChangeCheckInOpen, setEditNoChangeCheckInOpen] = useState(false)
  const [pendingSplitType, setPendingSplitType] = useState<'payment' | 'party' | null>(null)

  const { detail: reservationDetail } = useReservationDetail(
    connectionName,
    reservation?.id ?? '',
    open && isEditMode
  )

  const [updateSplitReservation] = useUpdateSplitReservationMutation()
  const [removeReservationPromo] = useRemoveReservationPromoMutation()

  const { data: rawSystemDefaults } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !open || !isReady || !connectionName || !locationId }
  )

  const systemDefaults = useMemo(() => {
    if (!rawSystemDefaults) return {} as Record<string, string | null | undefined>
    return rawSystemDefaults.reduce((acc, curr) => {
      if (curr.Field) {
        acc[curr.Field] = curr.DefValue
      }
      return acc
    }, {} as Record<string, string | null | undefined>)
  }, [rawSystemDefaults])

  const {
    customerResults: customerSearchResults,
    businessResults: businessSearchResults,
    hasSearched,
    loading: customerSearchLoading,
    error: customerSearchError,
    search: searchReservationCustomers,
    clear: clearReservationCustomerSearch
  } = useReservationCustomerSearch({
    connectionName,
    enabled: open && isReady
  })

  const { shows: apiShows, loading: showsLoading } = useShowDetailsByDate(
    connectionName,
    locationId,
    showDate,
    false,
    open && isReady
  )

  const { properties: printProperties } = useReservationPrintProperties(
    connectionName,
    reservation?.id ?? '',
    open && isEditMode
  )

  const transactionRows = useReservationTransactions({
    reservation,
    paymentList: reservationDetail?.PaymentList,
    printProperties
  })



  const availableShows = apiShows

  const activeShowTime =
    availableShows.find(show => show.id === showTime)?.id ??
    availableShows[0]?.id ??
    ''

  const { data: showDataPayload } = useGetShowDataQuery(
    { connectionName, showId: activeShowTime },
    { skip: !open || !isReady || !connectionName || !activeShowTime }
  )

  // Desktop ReservationVM.GetPromotions: NoPasses == "Y" → IsManager = true
  // Wait for GetShowData so we never fetch promos with the wrong IsManager.
  const showDataReady = showDataPayload != null
  const isManagerPromo = showDataPayload?.[0]?.NoPasses === 'Y'

  const {
    sections: availableSections,
    sectionsLoading,
    sectionsError,
    promoOptions,
    promoById,
    promoLoading,
    promosError
  } = useCachedReservationShowData({
    connectionName,
    locationId,
    showDate,
    showId: activeShowTime,
    enabled: open && isReady && Boolean(activeShowTime) && showDataReady,
    isManager: isManagerPromo,
    origin: origin === 'phone' ? 'phone' : 'walkup'
  })

  useEffect(() => {
    if (!open || sectionsLoading || !activeShowTime) {
      return
    }

    if (availableSections.length === 0) {
      return
    }

    if (isEditMode && !editPrefillDoneRef.current) {
      return
    }

    if (expressWalkupSeed && !expressWalkupSeedAppliedRef.current) {
      return
    }

    const cachedForm = bookingFormCacheRef.current.get(activeShowTime)

    if (cachedForm) {
      setSection(
        cachedForm.section &&
          availableSections.some(option => option.id === cachedForm.section)
          ? cachedForm.section
          : availableSections[0].id
      )
      setPartyBySection(cachedForm.partyBySection)
      setPromo(cachedForm.promo)
      setDinner(cachedForm.dinner)
      return
    }

    if (sectionsInitializedForShowRef.current === activeShowTime) {
      setSection(current =>
        availableSections.some(option => option.id === current)
          ? current
          : availableSections[0].id
      )
      return
    }

    sectionsInitializedForShowRef.current = activeShowTime
    setSection(availableSections[0].id)
    setPartyBySection(
      Object.fromEntries(
        availableSections.map(option => [option.id, 0])
      ) as Record<string, number>
    )
    setDinner(false)
  }, [expressWalkupSeed, open, activeShowTime, availableSections, isEditMode, sectionsLoading])

  useEffect(() => {
    if (!open || !reservation || editPrefillDoneRef.current) {
      return
    }

    if (initialShowDate) {
      setShowDate(initialShowDate)
    }

    if (initialShowTime) {
      setShowTime(initialShowTime)
    }

    setNotes(reservation.notes)
    setDinner(reservation.din.trim().toUpperCase() === 'Y')
    setOrigin(mapReservationSourceToOrigin(reservation.source))
    setTableNums(reservation.tables)
    setAssignSeatNumbers(reservation.seatNo || '')

    const { searchType: nextSearchType, criteria } =
      buildReservationEditSearchCriteria(reservation)
    setSearchType(nextSearchType)
    setSearchCriteria(criteria)
  }, [initialShowDate, initialShowTime, open, reservation])

  useEffect(() => {
    if (
      !open ||
      !reservation ||
      editPrefillDoneRef.current ||
      sectionsLoading ||
      promoLoading ||
      !activeShowTime
    ) {
      return
    }

    if (availableSections.length === 0) {
      return
    }

    const matchedSection = findReservationSection(
      availableSections,
      reservation.section
    )
    const sectionId = matchedSection?.id ?? availableSections[0].id
    const partySize = reservation.qty > 0 ? reservation.qty : reservationDetail?.PartyNo ?? 0
    const matchedPromoId = findReservationPromoId(promoOptions, reservation.promo)
    const mappedOrigin = mapReservationSourceToOrigin(reservation.source)
    const loadedPasses =
      reservationDetail?.NumPasses != null && reservationDetail.NumPasses > 0
        ? reservationDetail.NumPasses
        : 1
    origPartyRef.current = partySize
    origShowIdRef.current = activeShowTime
    origSectionIdRef.current = sectionId
    origPromoIdRef.current = matchedPromoId
    origOriginRef.current = mappedOrigin
    origPassesRef.current = loadedPasses
    origDinnerRef.current = reservation.din.trim().toUpperCase() === 'Y'

    sectionsInitializedForShowRef.current = activeShowTime
    setSection(sectionId)
    setPartyBySection(
      Object.fromEntries(
        availableSections.map(option => [
          option.id,
          option.id === sectionId ? partySize : 0
        ])
      ) as Record<string, number>
    )
    setPromo(matchedPromoId)
    setPasses(loadedPasses)
    editPrefillDoneRef.current = true
  }, [
    activeShowTime,
    availableSections,
    open,
    promoLoading,
    promoOptions,
    reservation,
    reservationDetail?.PartyNo,
    reservationDetail?.NumPasses,
    sectionsLoading
  ])

  // Desktop GetReservationInfo: ResPasses from detail NumPasses.
  const passesHydratedRef = useRef(false)
  useEffect(() => {
    if (!open) {
      passesHydratedRef.current = false
      return
    }
    if (!isEditMode || passesHydratedRef.current || reservationDetail == null) {
      return
    }
    const detailPasses = reservationDetail.NumPasses
    if (detailPasses != null && detailPasses > 0) {
      setPasses(detailPasses)
      origPassesRef.current = detailPasses
    }
    passesHydratedRef.current = true
  }, [open, isEditMode, reservationDetail])

  // Desktop GetReservationInfo: TableNum / SeatNumbers come from detail.
  // List rows often lack TableNums on first open after Assign Seats Save;
  // apply detail values when the refetch arrives (never clear with empty).
  useEffect(() => {
    if (!open || !isEditMode) {
      return
    }
    const detailTables = reservationDetail?.TableNum?.trim()
    if (detailTables) {
      setTableNums(detailTables)
    }
    const detailSeats = reservationDetail?.SeatNumbers?.trim()
    if (detailSeats) {
      setAssignSeatNumbers(detailSeats)
    }
  }, [
    open,
    isEditMode,
    reservationDetail?.TableNum,
    reservationDetail?.SeatNumbers
  ])

  // Desktop GetReservationInfo: single Hold with Credit Card → select Hold payment
  // type and load card fields (no new card required on Save when Amount Due is 0).
  useEffect(() => {
    if (!open || !isEditMode || selectedTransaction) {
      return
    }
    const payments = reservationDetail?.PaymentList
    if (!payments || payments.length !== 1) {
      return
    }
    const only = payments[0]
    const typeCode = (only.PaymentTypeCode ?? '').trim().toUpperCase()
    const typeLabel = (only.PymtType ?? '').trim().toLowerCase()
    const isHold =
      typeCode === HOLD_WITH_CARD_PAYMENT_CODE ||
      typeLabel === 'hold with credit card'
    if (!isHold) {
      return
    }

    setPaymentType('hold-cc')
    const expMonthIndex = Number(only.ExpMo) - 1
    const expMonthName =
      Number.isInteger(expMonthIndex) && expMonthIndex >= 0 && expMonthIndex <= 11
        ? EXPIRATION_MONTHS[expMonthIndex]
        : only.ExpMo || ''
    const expYearStr =
      only.ExpYr?.length === 2 ? `20${only.ExpYr}` : only.ExpYr || ''
    setPaymentFields({
      ...createEmptyReservationPaymentFields(),
      cardNumber: only.CardNum ? `************${only.CardNum.slice(-4)}` : '',
      cardType: only.CCType ?? '',
      authorization: only.Auth ?? '',
      pnref: only.PNREF ?? '',
      expMonth: expMonthName,
      expYear: expYearStr,
      billingAddress: only.BillAddr || '',
      zipCode: only.BillZip || ''
    })
  }, [
    open,
    isEditMode,
    reservationDetail?.PaymentList,
    selectedTransaction
  ])

  useEffect(() => {
    if (!open || !reservation || editCustomerId) {
      return
    }

    const { searchType: nextSearchType, criteria } =
      buildReservationEditSearchCriteria(reservation)

    if (!hasReservationCustomerSearchCriteria(nextSearchType, criteria)) {
      return
    }

    let cancelled = false

    void (async () => {
      const results = (await searchReservationCustomers(
        nextSearchType,
        criteria
      )) as ReservationCustomerSearchResult[]

      if (cancelled) {
        return
      }

      const customerId = resolveReservationEditCustomerId(
        reservationDetail,
        results ?? []
      )

      if (customerId) {
        setEditCustomerId(customerId)
        setSearchRowSelection({ [customerId]: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    editCustomerId,
    open,
    reservation,
    reservationDetail,
    searchReservationCustomers
  ])

  useEffect(() => {
    if (
      !open ||
      !pendingPartyFocusRef.current ||
      sectionsLoading ||
      !section ||
      availableSections.length === 0
    ) {
      return
    }

    pendingPartyFocusRef.current = false
    focusSelectedPartyInput(section)
  }, [open, section, sectionsLoading, availableSections.length])

  useEffect(() => {
    if (!open || sectionsLoading || !section) {
      return
    }

    const selectedSection = availableSections.find(option => option.id === section)
    if (selectedSection?.showDinner !== 'Y' && dinner) {
      setDinner(false)
    }
  }, [availableSections, dinner, open, section, sectionsLoading])

  useEffect(() => {
    if (!open || showsLoading) {
      return
    }

    if (availableShows.length === 0) {
      setShowTime('')
      return
    }

    if (!availableShows.some(show => show.id === showTime)) {
      if (isEditMode && initialShowTime) {
        setShowTime(initialShowTime)
        return
      }

      if (preferredShowTimeLabel) {
        const normalizedPreferred = preferredShowTimeLabel
          .replace(/\s+/g, " ")
          .trim()
          .toUpperCase()
          .replace(/^0(\d:)/, "$1")

        const matchedShow = availableShows.find(
          (show) =>
            (show.time && showTimeLabelsMatch(show.time, preferredShowTimeLabel)) ||
            show.label.toUpperCase().includes(normalizedPreferred)
        )

        if (matchedShow) {
          setShowTime(matchedShow.id)
          return
        }
      }

      setShowTime(availableShows[0].id)
    }
  }, [
    availableShows,
    initialShowTime,
    isEditMode,
    open,
    preferredShowTimeLabel,
    showTime,
    showsLoading,
  ])

  const { selectedSection, partySize } =
    useMemo(
      () =>
        resolveReservationBooking({
          sectionId: section,
          partyBySection,
          sections: availableSections
        }),
      [availableSections, partyBySection, section]
    )

  const dinnerDisabled =
    sectionsLoading ||
    !selectedSection ||
    selectedSection.showDinner !== 'Y'

  const effectivePromo =
    promo !== 'none' && promoOptions.some(option => option.value === promo)
      ? promo
      : 'none'

  const selectedPromo =
    effectivePromo === 'none' ? null : promoById.get(effectivePromo) ?? null

  const selectedShow = availableShows.find(show => show.id === activeShowTime)
  const selectedShowLabel = selectedShow?.label ?? ''
  const comicName =
    selectedShow?.headliner ?? reservationShowMeta.comicName

  const totals = useMemo(
    () => {



      const originCode = mapOriginToCode(origin)
      const isShowDataArray = Array.isArray(showDataPayload)
      const sectionKey = section.trim().toLowerCase()
      const rawSection = isShowDataArray
        ? showDataPayload.find(s => s.ShowDetID?.trim().toLowerCase() === sectionKey)
        : null
      const showData = isShowDataArray && showDataPayload.length > 0 ? showDataPayload[0] : null
      const sectionSvcFees = selectedSection
        ? {
          phoneSvcCharge: selectedSection.phoneSvcCharge,
          walkupSvcCharge: selectedSection.walkupSvcCharge,
          webSvcCharge: selectedSection.webSvcCharge,
        }
        : null

      let baseSvcAmount = calculateSvcBase({
        originCode,
        partySize,
        showDate,
        reservationCreatedDate: isEditMode ? reservationDetail?.CreatedDate ?? null : null,
        showData: showData,
        sectionData: rawSection ?? null,
        sectionSvcFees,
        excludePhoneDayOfShow: systemDefaults?.txtDayOfShow2 === 'Y',
        excludeWebDayOfShow: systemDefaults?.txtDayOfShow3 === 'Y'
      }) * (selectedSection?.priceMultiplier ?? 1)

      const { applicableTickets } = getPromoApplicableTickets({
        promo: selectedPromo,
        ticketCount: partySize * (selectedSection?.priceMultiplier ?? 1),
        passes
      })

      const promoFeeAdjustment = calculatePromoFeeAdjustment({
        promo: selectedPromo,
        applicableTickets,
        originCode,
        showDate,
        reservationCreatedDate: isEditMode ? reservationDetail?.CreatedDate ?? null : null,
        showData: showData,
        sectionData: rawSection ?? null,
        excludePhoneDayOfShow: systemDefaults?.txtDayOfShow2 === 'Y',
        excludeWebDayOfShow: systemDefaults?.txtDayOfShow3 === 'Y'
      })

      baseSvcAmount += promoFeeAdjustment


      if (
        isEditMode &&
        reservationDetail?.SVC != null &&
        origPartyRef.current > 0 &&
        section === origSectionIdRef.current &&
        origin === origOriginRef.current &&
        promo === origPromoIdRef.current
      ) {
        const oldSvcTotal = reservationDetail.SVC
        const oldParty = origPartyRef.current

        if (partySize > oldParty) {
          const addedTickets = partySize - oldParty
          const addedSvcAmount = calculateSvcBase({
            originCode,
            partySize: addedTickets,
            showDate,
            reservationCreatedDate: reservationDetail?.CreatedDate ?? null,
            showData: showData,
            sectionData: rawSection ?? null,
            sectionSvcFees,
            excludePhoneDayOfShow: systemDefaults?.txtDayOfShow2 === 'Y',
            excludeWebDayOfShow: systemDefaults?.txtDayOfShow3 === 'Y'
          }) * (selectedSection?.priceMultiplier ?? 1)

          const { applicableTickets: oldApplicableTickets } = getPromoApplicableTickets({
            promo: selectedPromo,
            ticketCount: oldParty * (selectedSection?.priceMultiplier ?? 1),
            passes
          })

          const addedPromoFeeAdjustment = calculatePromoFeeAdjustment({
            promo: selectedPromo,
            applicableTickets: Math.max(0, applicableTickets - oldApplicableTickets),
            originCode,
            showDate,
            reservationCreatedDate: reservationDetail?.CreatedDate ?? null,
            showData: showData,
            sectionData: rawSection ?? null,
            excludePhoneDayOfShow: systemDefaults?.txtDayOfShow2 === 'Y',
            excludeWebDayOfShow: systemDefaults?.txtDayOfShow3 === 'Y'
          })

          baseSvcAmount = oldSvcTotal + addedSvcAmount + addedPromoFeeAdjustment
        } else {
          const oldRate = oldSvcTotal / oldParty
          baseSvcAmount = partySize * oldRate
        }
      }

      const hasPricingTriggerChanged =
        partySize !== origPartyRef.current ||
        section !== origSectionIdRef.current ||
        promo !== origPromoIdRef.current ||
        origin !== origOriginRef.current ||
        passes !== origPassesRef.current

      return calculateReservationTotals({
        sectionPrice: selectedSection?.price ?? '$0.00',
        sectionShowPrice: selectedSection?.showPrice,
        sectionPriceMultiplier: selectedSection?.priceMultiplier ?? 1,
        party: partySize,
        passes,
        promo: selectedPromo,
        existingServiceCharge: isEditMode && !hasPricingTriggerChanged ? reservationDetail?.SVC : undefined,
        existingDiscount: isEditMode && !hasPricingTriggerChanged ? reservationDetail?.Discount : undefined,
        existingSalesTax: isEditMode && !hasPricingTriggerChanged ? reservationDetail?.SalesTax : undefined,
        systemTaxRate: Number(systemDefaults?.lblTaxes || 0),
        taxWithServiceCharge: systemDefaults?.lblTaxWithServiceCharge ?? undefined,
        baseSvcAmount,
        ccFeePercent: Number(systemDefaults?.cboCC || 0)
      })
    },
    [
      partySize,
      passes,
      selectedPromo,
      selectedSection?.price,
      isEditMode,
      reservationDetail?.SVC,
      reservationDetail?.Discount,
      reservationDetail?.SalesTax,
      reservationDetail?.CreatedDate,
      origin,
      showDate,
      showDataPayload,
      section,
      systemDefaults?.txtDayOfShow2,
      systemDefaults?.txtDayOfShow3,
      systemDefaults?.lblTaxes,
      systemDefaults?.lblTaxWithServiceCharge,
      systemDefaults?.cboCC
    ]
  )

  const alreadyPaid = useMemo(() => {
    if (!isEditMode || !reservation) return 0
    const payments = reservationDetail?.PaymentList
    if (payments && payments.length > 0) {
      const ELIGIBLE = new Set([
        PAYMENT_STATUS_PAYMENT,
        PAYMENT_STATUS_REFUND,
        PAYMENT_STATUS_PROMO
      ])
      // Desktop GetReservationInfo sums PaymentList for this reservation without
      // re-filtering ReservationID (the list is already scoped). Requiring an ID
      // match dropped Hold-CC rows with empty ReservationID → Amount Due stayed
      // full and Save incorrectly required a new card after Assign Seats.
      const fromLedger = payments
        .filter((p: (typeof payments)[number]) => {
          const status = (p.PaymentStatusCode ?? '').trim().toUpperCase()
          // When API omits status codes, still count ledger amounts (transaction
          // grid shows them). Desktop PaymentList always has PSTAT*, but web
          // detail payloads sometimes only send Amount + PymtType.
          if (status && !ELIGIBLE.has(status)) {
            return false
          }
          if (!status) {
            // Skip obvious non-payment rows only when we can detect them.
            const typeLabel = (p.PymtType ?? '').trim().toLowerCase()
            if (typeLabel.includes('void') || typeLabel.includes('cancel')) {
              return false
            }
          }
          const paymentResId = (p.ReservationID ?? '').trim()
          if (!paymentResId) {
            return true
          }
          return (
            paymentResId.toLowerCase() === reservation.id.trim().toLowerCase() ||
            paymentResId.replace(/-/g, '').toLowerCase() ===
            reservation.id.replace(/-/g, '').toLowerCase()
          )
        })
        .reduce((sum: number, p: (typeof payments)[number]) => sum + (p.Amount ?? 0), 0)

      if (fromLedger > 0) {
        return fromLedger
      }
    }
    // Fall back to detail/list ResPayments (desktop PaiedAmount source of truth).
    return (
      reservationDetail?.ResPayments ??
      reservation.paidAmount ??
      parseReservationMoney(reservation.paid ?? '$0.00')
    )
  }, [
    isEditMode,
    reservation,
    reservationDetail?.PaymentList,
    reservationDetail?.ResPayments
  ])
  const balanceDue = Math.max(0, totals.total - alreadyPaid)
  // Desktop GetReservationInfo:
  // - PaymentList empty → PaymentAmount = Total
  // - PaymentList present → PaymentAmount = Total − PaiedAmount
  // Always use balanceDue (Total − alreadyPaid) for both cases.
  const defaultPaymentAmount = formatReservationMoney(
    isEditMode
      ? balanceDue
      : totals.total > 0
        ? totals.total
        : 0
  )
  const paymentAmount = paymentAmountOverride ?? defaultPaymentAmount
  const paymentRequired = isEditMode
    ? parseReservationMoney(paymentAmount) > 0
    : totals.total > 0

  // Edit: remaining balance after recorded payments.
  // Add: nothing is paid until Save succeeds - do not subtract the intended
  // Payment Amount field (that made Amount Due $0 and blocked Due Amount on Cancel).
  const amountDueValue = isEditMode ? balanceDue : Math.max(0, totals.total)
  const amountDue = formatReservationMoney(amountDueValue)

  const selectedCustomerId = useMemo(() => {
    const selectedId = Object.keys(searchRowSelection).find(
      key => searchRowSelection[key]
    )
    return selectedId ?? null
  }, [searchRowSelection])

  const effectiveCustomerId = selectedCustomerId ?? editCustomerId

  const availableSeatsForParty =
    selectedSection != null && isEditMode
      ? selectedSection.available + (reservation?.qty ?? 0)
      : selectedSection?.available ?? 0

  const partyValidationError = selectedSection
    ? validateReservationParty(partySize, availableSeatsForParty, {
      requirePositive: showPartyRequiredError
    })
    : null

  const partyIsValid =
    partySize > 0 &&
    selectedSection != null &&
    partySize <= availableSeatsForParty

  const canSave =
    Boolean(effectiveCustomerId) &&
    Boolean(activeShowTime) &&
    Boolean(selectedSection) &&
    partyIsValid &&
    !sectionsLoading &&
    !isSavingReservation &&
    (!paymentRequired || parseReservationMoney(paymentAmount) > 0)

  const canAddNewCustomer =
    searchType === 'customer' &&
    hasCompleteNewCustomerCriteria(searchCriteria)

  const editCustomerLastName = searchCriteria.lastName.trim() || reservation?.lastName.trim() || ''
  const editCustomerFirstName = searchCriteria.firstName.trim() || reservation?.firstName.trim() || ''
  const displayLastName = selectedTransaction?.lastName ?? editCustomerLastName
  const displayFirstName = selectedTransaction?.firstName ?? editCustomerFirstName
  const isViewingTransaction = Boolean(selectedTransaction)

  // Desktop reprint popup: form Party/Total/Paid + detail CheckedIn.
  const reprintDetails = useMemo(() => {
    if (!reservation) {
      return null
    }
    const party = Math.max(1, partySize > 0 ? partySize : reservation.qty)
    const checkedInCount =
      reservationDetail?.CheckedIn ?? reservation.seated ?? 0
    // When form tax is inflated vs subtotal (bad SalesTax/rate), match desktop
    // CalcTicketTotal display of ticket total without the bad tax line.
    const totalAmount =
      totals.taxes > totals.subtotal && totals.subtotal > 0
        ? totals.subtotal + totals.serviceCharge - totals.discount
        : (reservationDetail?.Total ?? reservation.totalAmount ?? totals.total)

    return {
      lastName: displayLastName,
      firstName: displayFirstName,
      partySize: party,
      checkedInCount,
      totalAmount,
      paidAmount: reservationDetail?.ResPayments ?? reservation.paidAmount ?? 0,
    }
  }, [
    reservation,
    partySize,
    reservationDetail?.CheckedIn,
    reservationDetail?.Total,
    reservationDetail?.ResPayments,
    totals.taxes,
    totals.subtotal,
    totals.serviceCharge,
    totals.discount,
    totals.total,
    displayLastName,
    displayFirstName,
  ])

  // Desktop parity: Hold with Credit Card payments collapse the payment-history
  // panel, so Refund / Void / Clear are not offered (ReservationVM SetPayment).
  const selectedTransactionIsHoldWithCard = isHoldWithCardTransaction(selectedTransaction)
  const dialogTitle = isEditMode
    ? `Payment :- ${[editCustomerLastName, editCustomerFirstName].filter(Boolean).join(',') || 'Guest'}  ${formatShowDate(showDate)}`
    : isExpressWalkupPayment
      ? `Payment :- ${[
        expressWalkupSeed?.customer.lastName,
        expressWalkupSeed?.customer.firstName
      ]
        .filter(Boolean)
        .join(',') || 'Guest'}  ${formatShowDate(showDate)}`
      : 'Add Reservation'

  function focusSelectedPartyInput(sectionId = section) {
    const targetSectionId =
      sectionId || availableSections[0]?.id || selectedSection?.id || ''

    if (!targetSectionId) {
      return
    }

    requestAnimationFrame(() => {
      const input = partyInputRefs.current[targetSectionId]
      input?.focus({ preventScroll: true })
      input?.select()
    })
  }

  function focusLastNameInput() {
    requestAnimationFrame(() => {
      lastNameInputRef.current?.focus({ preventScroll: true })
      lastNameInputRef.current?.select()
    })
  }

  function handleShowTimeKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    show: (typeof showOptions)[number]
  ) {
    if (event.key !== 'Tab' || event.shiftKey) {
      return
    }

    const lastShowId = availableShows[availableShows.length - 1]?.id
    if (show.id !== lastShowId) {
      return
    }

    event.preventDefault()
    focusSelectedPartyInput()
  }

  function handleShowTimeFocus() {
    dialogScrollRef.current?.scrollTo({ top: 0 })
  }

  function changeSection(newSectionId: string) {
    if (section !== newSectionId) {
      setSection(newSectionId)
      const matched = availableSections.find(s => s.id === newSectionId)
      if (matched) {
        setDinner(false)
      }
    }
  }

  function handlePartyInputKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    sectionId: string
  ) {
    if (event.key !== 'Tab') {
      return
    }

    event.preventDefault()

    if (event.shiftKey) {
      selectedShowTimeButtonRef.current?.focus({ preventScroll: true })
      return
    }

    changeSection(sectionId)
    focusLastNameInput()
  }

  function openAddCustomerDialog(initialValues: CustomerFormValues | null = null) {
    setAddCustomerInitialValues(initialValues)
    setIsAddCustomerOpen(true)
  }

  function handleOpenEditCustomerDialog() {
    if (!resolvedEditCustomerId) {
      return
    }

    setAddCustomerInitialValues(null)
    setIsAddCustomerOpen(true)
  }

  /**
   * Desktop ReservationPayment.cmdAddAssignSeatResPayment → AssignSeats dialog.
   * Requires an existing reservation + show; chart save persists TableNums via API,
   * then we mirror desktop by writing TableNums back onto the payment form.
   */
  function handleAssignSeat() {
    if (!reservation?.id) {
      reportErrorMessage(
        setAssignSeatError,
        'Save the reservation before assigning seats.'
      )
      return
    }
    if (!activeShowTime) {
      reportErrorMessage(
        setAssignSeatError,
        'Select a show before assigning seats.'
      )
      return
    }
    if (!connectionName || !locationId) {
      reportErrorMessage(
        setAssignSeatError,
        'Session connection/location is required.'
      )
      return
    }

    setAssignSeatError(null)
    setAssignSeatsOpen(true)
  }

  async function handleAssignSeatsSaved(payload: {
    result: {
      tableNumsByReservation: Array<{ reservationId: string; tableNums: string }>
      seatNumbersByReservation?: Array<{
        reservationId: string
        seatNumbers: string
      }>
      assignments?: Array<{
        ReservationId: string
        TableNo: string
        SeatNo: number
      }>
    }
    reservationId: string | null
  }) {
    const targetId = payload.reservationId ?? reservation?.id ?? null
    // Only apply this reservation's tables — never fall back to other guests'
    // seats (that copied clark's 11–14 onto the payment form).
    const match = targetId
      ? payload.result.tableNumsByReservation.find(row =>
        row.reservationId.trim().toLowerCase() ===
        targetId.trim().toLowerCase() ||
        row.reservationId.replace(/-/g, '').toLowerCase() ===
        targetId.replace(/-/g, '').toLowerCase()
      )
      : undefined

    if (match?.tableNums) {
      setTableNums(match.tableNums)
    }

    const seatMatch = targetId
      ? payload.result.seatNumbersByReservation?.find(
        row =>
          row.reservationId.trim().toLowerCase() ===
          targetId.trim().toLowerCase() ||
          row.reservationId.replace(/-/g, '').toLowerCase() ===
          targetId.replace(/-/g, '').toLowerCase()
      )
      : undefined
    if (seatMatch?.seatNumbers) {
      setAssignSeatNumbers(seatMatch.seatNumbers)
    } else if (targetId && payload.result.assignments?.length) {
      const seats = payload.result.assignments
        .filter(
          row =>
            row.ReservationId.trim().toLowerCase() ===
            targetId.trim().toLowerCase() ||
            row.ReservationId.replace(/-/g, '').toLowerCase() ===
            targetId.replace(/-/g, '').toLowerCase()
        )
        .sort((a, b) =>
          a.TableNo === b.TableNo
            ? a.SeatNo - b.SeatNo
            : a.TableNo.localeCompare(b.TableNo, undefined, { numeric: true })
        )
        .map(row => `${row.TableNo}-${row.SeatNo}`)
      if (seats.length > 0) {
        setAssignSeatNumbers(seats.join(','))
      }
    }

    setAssignSeatsOpen(false)
    setAssignSeatError(null)
  }

  // Desktop RefundReservationPayment role gate: ReadOnly (SEC03) and plain User
  // (SEC02, manager-approval on desktop) cannot refund/void here.
  const canManagePaymentActions = useMemo(() => {
    const right = (userRight ?? '').trim().toUpperCase()
    return right === 'SEC01' || right === 'SEC05' || right === 'SEC09'
  }, [userRight])

  function buildRefundCards(): RefundCardOption[] {
    const payments = reservationDetail?.PaymentList ?? []
    return payments
      .filter(
        (payment: (typeof payments)[number]) =>
          (payment.PaymentStatusCode?.trim() ?? '') === PAYMENT_STATUS_PAYMENT &&
          (payment.PaymentTypeCode?.trim().toUpperCase() ?? '') !==
          HOLD_WITH_CARD_PAYMENT_CODE
      )
      .map((payment: (typeof payments)[number]) => {
        const parts = [
          payment.PymtType?.trim() || payment.CCType?.trim() || '',
          payment.CardNum?.trim() || '',
          formatReservationMoney(payment.Amount ?? 0)
        ].filter(Boolean)
        return {
          paymentId: payment.PaymentID,
          label: parts.join('  '),
          amount: payment.Amount ?? 0
        }
      })
  }

  async function handleRefundClick() {
    if (!reservation || !selectedTransaction) {
      return
    }
    if (!canManagePaymentActions) {
      toastError(
        'You do not have permission to refund. Manager approval is required.'
      )
      return
    }

    const sessionGeneration = sessionGenerationRef.current
    setPaymentActionBusy('refund')

    try {
      const payment = await getReservationPaymentById({
        connectionName,
        paymentId: selectedTransaction.id
      })

      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }

      if ((payment.PaymentStatusCode?.trim() ?? '') !== PAYMENT_STATUS_PAYMENT) {
        toastError('Invalid payment status for refunds. Cannot refund.')
        return
      }
      if (
        (payment.PaymentTypeCode?.trim().toUpperCase() ?? '') ===
        HOLD_WITH_CARD_PAYMENT_CODE
      ) {
        toastError('Invalid payment type for refunds. Cannot refund.')
        return
      }

      const cards = buildRefundCards()
      if (cards.length === 0) {
        toastError('No payment available to refund.')
        return
      }

      setRefundCards(cards)
      setRefundInitialPaymentId(selectedTransaction.id)
      setRefundDialogOpen(true)
    } catch (requestError) {
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      toastError(getErrorMessage(requestError, 'Failed to refund payment'))
    } finally {
      if (sessionGeneration === sessionGenerationRef.current) {
        setPaymentActionBusy(null)
      }
    }
  }

  async function handleConfirmRefund(paymentId: string, refundAmount: number) {
    setRefundBusy(true)

    try {
      const payment = await getReservationPaymentById({
        connectionName,
        paymentId
      })
      await refundReservationPayment({
        connectionName,
        locationId,
        lastUpdateId: username,
        refundAmount,
        payment
      })

      setRefundDialogOpen(false)
      handleClearTransactionSelection()
      toastSuccess('Refund processed successfully.')
    } catch (requestError) {
      toastError(getErrorMessage(requestError, 'Failed to refund payment'))
    } finally {
      setRefundBusy(false)
    }
  }

  async function handleVoidClick() {
    if (!reservation || !selectedTransaction) {
      return
    }
    if (!canManagePaymentActions) {
      toastError(
        'You do not have permission to void. Manager approval is required.'
      )
      return
    }

    const sessionGeneration = sessionGenerationRef.current
    setPaymentActionBusy('void')

    try {
      await voidReservationPayment({
        connectionName,
        locationId,
        lastUpdateId: username,
        paymentId: selectedTransaction.id
      })

      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      handleClearTransactionSelection()
      toastSuccess('Payment voided successfully.')
    } catch (requestError) {
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      toastError(getErrorMessage(requestError, 'Failed to void payment'))
    } finally {
      if (sessionGeneration === sessionGenerationRef.current) {
        setPaymentActionBusy(null)
      }
    }
  }

  /**
   * Desktop ReservationVM.ReprintTickets:
   * - blocks when CheckedIn == 0
   * - opens popup with buttons 1..CheckedIn
   */
  async function handleReprintClick() {
    if (!reservation) {
      return
    }

    const checkedIn = reservationDetail?.CheckedIn ?? reservation.seated ?? 0
    if (checkedIn <= 0) {
      await alertDialog({
        title: 'Error',
        description:
          'Reprint only you to re-print the lost ticket. Cannot use since number checked-in zero',
        confirmLabel: 'OK',
      })
      return
    }

    setReprintOpen(true)
  }

  function handleClearTransactionSelection() {
    setSelectedTransaction(null)
    setPaymentAmountOverride(null)
    setPaymentType('credit-card')
    setPaymentFields(createEmptyReservationPaymentFields())
    setPaymentValidationErrors({})
  }

  function handleTransactionSelect(row: ReservationTransactionRow) {

    setSelectedTransaction(row)
    setPaymentAmountOverride(formatReservationMoney(row.amount))
    setPaymentType(mapPaymentLabelToType(row.payment))
    const expMonthIndex = Number(row.expMo) - 1
    const expMonthName =
      Number.isInteger(expMonthIndex) && expMonthIndex >= 0 && expMonthIndex <= 11
        ? EXPIRATION_MONTHS[expMonthIndex]
        : row.expMo || ''

    const expYearStr = row.expYr?.length === 2 ? `20${row.expYr}` : row.expYr || ''

    setPaymentFields({
      ...createEmptyReservationPaymentFields(),
      cardNumber: row.cardNumber,
      cardType: row.cardType,
      authorization: row.authorization,
      pnref: row.pnref,
      expMonth: expMonthName,
      expYear: expYearStr,
      billingAddress: row.billAddr || '',
      zipCode: row.billZip || ''
    })
    setPaymentValidationErrors({})
  }

  async function handleSplitReservationClick(type: 'payment' | 'party') {
    if (!reservation) {
      return
    }

    const isFullyPaid = alreadyPaid >= totals.total && totals.total > 0

    if (isFullyPaid) {
      onAlreadyPaidAlert?.()
      return
    }

    if (reservationDetail?.CheckedIn != null && partySize === reservationDetail.CheckedIn && partySize > 0) {
      setSplitCheckedInAlertOpen(true)
      return
    }

    if (promo !== 'none' && promoOptions.some(option => option.value === promo)) {
      setPendingSplitType(type)
      setSplitPromoAlertOpen(true)
      return
    }

    await executeSplitReservationClick(type)
  }

  async function executeSplitReservationClick(type: 'payment' | 'party') {
    if (!reservation) return

    const sessionGeneration = sessionGenerationRef.current

    if (isEditMode) {
      setPaymentActionBusy('split')
      try {
        if (type === 'party') {
          // Desktop removes promo only when a promo is actually applied.
          const hasPromo =
            Boolean(reservationDetail?.Promo?.trim()) ||
            (promo !== 'none' &&
              promoOptions.some(option => option.value === promo))
          if (hasPromo) {
            await removeReservationPromo({
              ConnectionString: connectionName,
              ReservationId: reservation.id
            }).unwrap()
          }
        } else {
          await updateSplitReservation({
            ConnectionString: connectionName,
            ReservationId: reservation.id,
            ShowID: activeShowTime,
            ShowDetID: reservationDetail?.ShowDetID ?? '',
            ShowSec: selectedSection?.name ?? '',
            ShowPrice: parseReservationMoney(selectedSection?.price ?? '0'),
            DayOfShowFee: reservationDetail?.DayOfShowFee ?? 0,
            PhoneInFee: reservationDetail?.PhoneInFee ?? 0,
            WalkUpFee: reservationDetail?.WalkUpFee ?? 0,
            WebFee: reservationDetail?.WebFee ?? 0,
            SourceLookUpCode:
              origin === 'phone'
                ? 'SRC01'
                : origin === 'walkup'
                  ? 'SRC02'
                  : 'SRC03',
            Party: partySize,
            SubTotal: totals.subtotal,
            ServiceChage: totals.serviceCharge,
            Discount: 0,
            Taxes: totals.taxes,
            Total: totals.total,
            LastUpdateDt: formatUsDateTime(new Date()),
            LastUpdateId: username,
            TableNum: null
          }).unwrap()
        }
      } catch (error) {
        if (sessionGeneration !== sessionGenerationRef.current) {
          return
        }
        toastError(
          getErrorMessage(
            error,
            type === 'party'
              ? 'Failed to remove reservation promo.'
              : 'Failed to prepare split reservation.'
          )
        )
        setPaymentActionBusy(null)
        return
      }
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      setPaymentActionBusy(null)
    }

    setPromo('none')
    if (type === 'party') {
      onSplitParty?.(reservation)
    } else {
      onSplitReservation?.(reservation)
    }
  }

  /** Desktop ReservationPayment.cmdOpenCashDrawer */
  async function handleCashDrawerClick() {
    setPaymentActionBusy('cash-drawer')
    try {
      const result = await openCashDrawer()
      if (result.message.toLowerCase().includes('not available')) {
        toastError(result.message)
      } else {
        toastSuccess(result.message || 'Cash drawer opened')
      }
    } catch (error) {
      toastError(getErrorMessage(error, 'Failed to open cash drawer'))
    } finally {
      setPaymentActionBusy(null)
    }
  }

  async function handleSaveNoteClick() {
    if (!reservation || !isReady) {
      return
    }

    const sessionGeneration = sessionGenerationRef.current
    setIsSavingNote(true)
    setSaveNoteError(null)
    setSaveNoteSuccess(false)

    try {
      await saveReservationNote(
        buildReservationNoteRequest({
          connectionName,
          locationId,
          reservationId: reservation.id,
          lastUpdateId: username,
          reservationNote: notes
        })
      )
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      setSaveNoteSuccess(true)
      toastSuccess('Note saved')
    } catch (requestError) {
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      reportError(setSaveNoteError, requestError, 'Failed to save note')
    } finally {
      if (sessionGeneration === sessionGenerationRef.current) {
        setIsSavingNote(false)
      }
    }
  }

  async function handleAddNewCustomer() {
    if (!canAddNewCustomer || isCreatingCustomer) {
      return
    }

    const sessionGeneration = sessionGenerationRef.current
    const form = mapReservationSearchCriteriaToCustomerForm(searchCriteria)

    setIsCreatingCustomer(true)
    setCreateCustomerError(null)

    try {
      await saveCustomer({
        connectionName,
        locationId,
        lastUpdateId: username,
        form
      })
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      await applySavedCustomer(form)
      toastSuccess('Customer created')
    } catch (requestError) {
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      reportError(setCreateCustomerError, requestError, 'Failed to create customer')
    } finally {
      if (sessionGeneration === sessionGenerationRef.current) {
        setIsCreatingCustomer(false)
      }
    }
  }

  function handleFillMoreDetails() {
    openAddCustomerDialog(
      mapReservationSearchCriteriaToCustomerForm(searchCriteria)
    )
  }

  function getPrintablePaymentType(value: ReservationPaymentType) {
    switch (value) {
      case 'credit-card':
      case 'hold-cc':
      case 'pos':
        return 'Credit Card'
      case 'gift-card':
        return 'Gift Card'
      case 'gift-cert':
      case 'web-gift-cert':
        return 'Gift Certificate'
      case 'cash':
        return 'Cash'
      default:
        return (
          RESERVATION_PAYMENT_TYPES.find(option => option.id === value)?.label ??
          'Cash'
        )
    }
  }

  function handlePaymentTypeChange(value: ReservationPaymentType) {
    setPaymentType(value)
    setPaymentFields(createEmptyReservationPaymentFields())
    setPaymentValidationErrors({})
  }

  function updatePaymentField<K extends keyof ReservationPaymentFields>(
    key: K,
    value: ReservationPaymentFields[K]
  ) {
    setPaymentFields(current => ({ ...current, [key]: value }))
    setPaymentValidationErrors({})
  }

  const checkInConfirmEnabled = useMemo(
    () => readCheckInConfirmOnPaymentVisible(rawSystemDefaults ?? []),
    [rawSystemDefaults]
  )

  function getSelectedCustomerDetails(): ReservationCustomerSearchCriteria {
    return searchCriteria
  }

  async function handleSaveReservation() {
    if (!effectiveCustomerId || isSavingReservation) {
      return
    }

    // Desktop SaveReservationWithPayment sets IsSaveChanges = true at the start.
    setHasAttemptedSave(true)

    // Desktop edit: always ask "Are you want to send update to customer?" first.
    if (isEditMode && reservation) {
      setSendUpdateConfirmOpen(true)
      return
    }

    await runSaveReservationFlow(false)
  }

  async function runSaveReservationFlow(sendUpdate: boolean) {
    setSendUpdateConfirmOpen(false)
    setSendUpdateToCustomer(sendUpdate)

    if (!effectiveCustomerId || isSavingReservation) {
      return
    }

    const booking = resolveReservationBooking({
      sectionId: section,
      partyBySection,
      sections: availableSections
    })
    const saveSection = booking.selectedSection
    const saveParty = booking.partySize
    const savePromo =
      effectivePromo === 'none' ? null : promoById.get(effectivePromo) ?? null
    // Use live UI totals for new bookings so Save matches the payment screen.
    const saveTotals = isEditMode
      ? calculateReservationTotals({
        sectionPrice: saveSection?.price ?? '$0.00',
        sectionShowPrice: saveSection?.showPrice,
        sectionPriceMultiplier: saveSection?.priceMultiplier ?? 1,
        party: saveParty,
        passes,
        promo: savePromo,
        existingServiceCharge: reservationDetail?.SVC,
        existingDiscount: reservationDetail?.Discount,
        existingSalesTax: reservationDetail?.SalesTax,
        systemTaxRate: Number(systemDefaults?.lblTaxes || 0),
        taxWithServiceCharge:
          systemDefaults?.lblTaxWithServiceCharge ?? undefined,
        ccFeePercent: Number(systemDefaults?.cboCC || 0)
      })
      : totals

    const savePaymentAmount =
      paymentAmountOverride ??
      formatReservationMoney(
        isEditMode
          ? Math.max(0, saveTotals.total - alreadyPaid)
          : saveTotals.total > 0
            ? saveTotals.total
            : 0
      )
    const editPaymentAmount = parseReservationMoney(savePaymentAmount)

    if (!saveSection || !activeShowTime) {
      return
    }

    const balanceCovered =
      isEditMode &&
      saveTotals.total > 0 &&
      alreadyPaid + 0.001 >= saveTotals.total

    const reservationChanged =
      !isEditMode ||
      !reservation ||
      isReservationChanged({
        showId: activeShowTime,
        origShowId: origShowIdRef.current,
        sectionId: saveSection.id,
        origSectionId: origSectionIdRef.current,
        party: saveParty,
        origParty: origPartyRef.current,
        promoId: effectivePromo,
        origPromoId: origPromoIdRef.current,
        origin,
        origOrigin: origOriginRef.current,
        passes,
        origPasses: origPassesRef.current,
        dinner,
        origDinner: origDinnerRef.current,
        // Desktop: PaymentAmount == 0 when Hold covers Total → no reservation change
        // from payment type alone (Assign Seats does not count as a change).
        paymentAmount: balanceCovered ? 0 : editPaymentAmount,
        paymentType,
        sectionShowPrice: saveSection.showPrice
      })
    const shouldApplyPayment = isEditMode
      ? reservationChanged
      : saveTotals.total > 0

    // Desktop IsPaymentLoad && !IsReservationChange(): Assign Seats alone does
    // not change the reservation — Save closes without charging. Also skip when
    // Hold/payment already covers Total (PaymentAmount == 0).
    const needsNewPayment =
      shouldApplyPayment && editPaymentAmount > 0 && !balanceCovered

    setShowPartyRequiredError(true)
    setSaveReservationError(null)
    setPaymentValidationErrors({})

    const availableSeats = isEditMode
      ? saveSection.available + (reservation?.qty ?? 0)
      : saveSection.available
    const partyError = validateReservationParty(
      saveParty,
      availableSeats,
      { requirePositive: true }
    )

    if (partyError) {
      return
    }

    if (needsNewPayment) {
      // Desktop Hold-CC / Credit Card with empty card + amount still due →
      // Due Amount popup (Continue without payment / Cancel / Additional),
      // not hard field validation errors.
      const cardMissing =
        (paymentType === 'hold-cc' || paymentType === 'credit-card') &&
        !paymentFields.cardNumber.trim()
      if (cardMissing) {
        setHasAttemptedSave(true)
        setDueAmountOption('continue-without-payment')
        setDueAmountOpen(true)
        return
      }

      const nextPaymentErrors = validateReservationPaymentFields({
        paymentType,
        fields: paymentFields,
        paymentAmount: savePaymentAmount,
        paymentRequired: true,
        // Desktop IsPaymentValid: Cash blocked for Phone-In only when
        // !IsPaymentLoad (new booking). Edit Payment allows Cash on Phone.
        disallowCash: origin === 'phone' && !isEditMode
      })
      const paymentError = getFirstReservationPaymentError(nextPaymentErrors)

      if (paymentError) {
        setPaymentValidationErrors(nextPaymentErrors)
        return
      }
    }

    if (sectionsLoading) {
      reportErrorMessage(
        setSaveReservationError,
        'Show sections are still loading. Please wait and try again.'
      )
      return
    }

    if (saveSection.showId !== activeShowTime) {
      reportErrorMessage(
        setSaveReservationError,
        'Selected section does not match the show. Please select the show again.'
      )
      return
    }

    const isFullPayment =
      !shouldApplyPayment ||
      editPaymentAmount + 0.001 >=
      saveTotals.total - (isEditMode ? alreadyPaid : 0)
    const isCashLike = paymentType === 'cash' || paymentType === 'pos'
    const notSeated = (reservation?.seated ?? 0) <= 0

    // Desktop Cash/POS exact pay: if CheckIn/cmdCheckIn = Y and not seated,
    // show "Check-In Reservation?" BEFORE SavePaymenInfo (after send-update).
    if (
      isEditMode &&
      isCashLike &&
      isFullPayment &&
      editPaymentAmount > 0 &&
      checkInConfirmEnabled &&
      notSeated
    ) {
      checkInPromptedBeforeSaveRef.current = true
      setCheckInConfirmOpen(true)
      return
    }

    // Desktop ReservationPayment check-in popup rules (Express Walkup → Payment):
    // - Express + cash/POS full pay → auto check-in (no popup)
    // - Credit Card (and most non-cash) full pay → "Do you want to check this party in"
    // - Other + cash → popup when CheckIn/cmdCheckIn = Y
    if (isExpressWalkupPayment && isFullPayment && !isEditMode) {
      if (isCashLike && expressWalkupSeed?.isExpressRequest) {
        await executeSaveReservation(true, sendUpdate)
        return
      }

      if (!isCashLike || checkInConfirmEnabled) {
        setCheckInConfirmOpen(true)
        return
      }
    }

    await executeSaveReservation(
      isEditMode ? (reservation?.seated ?? 0) > 0 : false,
      sendUpdate
    )
  }

  async function executeSaveReservation(
    checkInAfterSave: boolean,
    sendUpdate = false
  ) {
    if (!effectiveCustomerId || isSavingReservation) {
      return
    }
    const sessionGeneration = sessionGenerationRef.current

    const booking = resolveReservationBooking({
      sectionId: section,
      partyBySection,
      sections: availableSections
    })
    const saveSection = booking.selectedSection
    const saveParty = booking.partySize
    const savePromo =
      effectivePromo === 'none' ? null : promoById.get(effectivePromo) ?? null
    const saveTotals = isEditMode
      ? calculateReservationTotals({
        sectionPrice: saveSection?.price ?? '$0.00',
        sectionShowPrice: saveSection?.showPrice,
        sectionPriceMultiplier: saveSection?.priceMultiplier ?? 1,
        party: saveParty,
        passes,
        promo: savePromo,
        existingServiceCharge: reservationDetail?.SVC,
        existingDiscount: reservationDetail?.Discount,
        existingSalesTax: reservationDetail?.SalesTax,
        systemTaxRate: Number(systemDefaults?.lblTaxes || 0),
        taxWithServiceCharge:
          systemDefaults?.lblTaxWithServiceCharge ?? undefined,
        ccFeePercent: Number(systemDefaults?.cboCC || 0)
      })
      : totals
    const savePaymentAmount =
      paymentAmountOverride ??
      formatReservationMoney(
        isEditMode
          ? Math.max(0, saveTotals.total - alreadyPaid)
          : saveTotals.total > 0
            ? saveTotals.total
            : 0
      )
    const editPaymentAmount = parseReservationMoney(savePaymentAmount)

    if (!saveSection || !activeShowTime) {
      return
    }

    const balanceCovered =
      isEditMode &&
      saveTotals.total > 0 &&
      alreadyPaid + 0.001 >= saveTotals.total
    // When Hold/payment already covers Total, treat PaymentAmount as 0 for the
    // desktop IsReservationChange check so Assign Seats-only Save early-exits.
    const reservationChanged =
      !isEditMode ||
      !reservation ||
      isReservationChanged({
        showId: activeShowTime,
        origShowId: origShowIdRef.current,
        sectionId: saveSection.id,
        origSectionId: origSectionIdRef.current,
        party: saveParty,
        origParty: origPartyRef.current,
        promoId: effectivePromo,
        origPromoId: origPromoIdRef.current,
        origin,
        origOrigin: origOriginRef.current,
        passes,
        origPasses: origPassesRef.current,
        dinner,
        origDinner: origDinnerRef.current,
        paymentAmount: balanceCovered ? 0 : editPaymentAmount,
        paymentType,
        sectionShowPrice: saveSection.showPrice
      })
    const shouldApplyPayment =
      (isEditMode ? reservationChanged : saveTotals.total > 0) &&
      editPaymentAmount > 0 &&
      !balanceCovered

    const customerDetails = getSelectedCustomerDetails()
    const reservationParams = {
      connectionName,
      locationId,
      userRights: userRight,
      lastUpdateId: username,
      searchType,
      customerId: effectiveCustomerId,
      searchCriteria: customerDetails,
      selectedSection: saveSection,
      origin,
      party: saveParty,
      origParty: isEditMode
        ? origPartyRef.current || reservation?.qty || saveParty
        : saveParty,
      passes,
      promo: savePromo,
      totals: saveTotals,
      notes,
      dinner,
      // Show-level VIP Seating (GetShowData.VIP === "Y") → SaveReservation IsVIP
      isVip: showDataPayload?.[0]?.VIP === 'Y',
      isReservationCheckedIn: checkInAfterSave
    }

    setIsSavingReservation(true)
    setSaveReservationError(null)
    setCheckInConfirmOpen(false)

    try {
      if (isEditMode && reservation) {
        if (searchType === 'customer' && effectiveCustomerId) {
          await syncReservationCustomerIfChanged({
            connectionName,
            locationId,
            lastUpdateId: username,
            customerId: effectiveCustomerId,
            reservation,
            searchCriteria: customerDetails
          })
        }

        if (!reservationChanged) {
          if (notes.trim()) {
            await saveReservationNote(
              buildReservationNoteRequest({
                connectionName,
                locationId,
                reservationId: reservation.id,
                lastUpdateId: username,
                reservationNote: notes.trim()
              })
            )
          }

          if (sessionGeneration !== sessionGenerationRef.current) {
            return
          }

          // Desktop IsPaymentLoad && !IsReservationChange after send-update:
          // - Fully paid (Amount Due $0) and not checked in → "Check-In Reservation?"
          // - Unpaid (Amount Due > 0) → no Check-In; return to reservation list
          if ((reservation.seated ?? 0) <= 0 && amountDueValue <= 0.001) {
            setIsSavingReservation(false)
            setEditNoChangeCheckInOpen(true)
            return
          }

          await onSaved?.([reservation.id])
          if (sessionGeneration !== sessionGenerationRef.current) {
            return
          }
          toastSuccess('Reservation saved')
          handleDialogOpenChange(false)
          return
        }

        await updateReservation(
          buildUpdateReservationPaymentRequest({
            ...reservationParams,
            reservationId: reservation.id,
            paymentAmount: shouldApplyPayment ? editPaymentAmount : 0,
            paymentType,
            paymentFields,
            includeCustomerModel: false,
            isPaymentLoad: true,
            isSendUpdateToCustomer: sendUpdate,
            resSelectedPromotionId:
              origPromoIdRef.current === 'none'
                ? EMPTY_GUID
                : origPromoIdRef.current
          })
        )

        if (sessionGeneration !== sessionGenerationRef.current) {
          return
        }

        // Desktop: when save leaves Amount Due at $0 and party not checked in,
        // offer Check-In — but skip if Cash/POS already asked before save
        // (Yes or No); otherwise clicking No would open the same prompt again.
        const remainingAfterSave = shouldApplyPayment
          ? Math.max(0, saveTotals.total - alreadyPaid - editPaymentAmount)
          : Math.max(0, saveTotals.total - alreadyPaid)
        const alreadyAskedCheckIn = checkInPromptedBeforeSaveRef.current
        checkInPromptedBeforeSaveRef.current = false
        if (
          !checkInAfterSave &&
          !alreadyAskedCheckIn &&
          (reservation.seated ?? 0) <= 0 &&
          remainingAfterSave <= 0.001 &&
          saveTotals.total > 0
        ) {
          setIsSavingReservation(false)
          setEditNoChangeCheckInOpen(true)
          return
        }

        await onSaved?.([reservation.id])
        if (sessionGeneration !== sessionGenerationRef.current) {
          return
        }
        toastSuccess('Reservation saved')
        handleDialogOpenChange(false)
        return
      }

      if (!isEditMode && searchType === 'customer' && effectiveCustomerId) {
        const originalResult = customerSearchResults.find(c => c.id === effectiveCustomerId)
        if (originalResult) {
          await syncReservationCustomerSearchResultIfChanged({
            connectionName,
            locationId,
            lastUpdateId: username,
            customerId: effectiveCustomerId,
            originalResult,
            searchCriteria: customerDetails
          })
        }
      }

      const reservationIds = await createNewReservation(
        shouldApplyPayment
          ? buildSaveReservationWithPaymentRequest({
            ...reservationParams,
            paymentAmount: parseReservationMoney(savePaymentAmount),
            paymentType,
            paymentFields
          })
          : buildSaveReservationOnlyRequest(reservationParams)
      )
      const reservationId = reservationIds[0]

      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }

      if (!reservationId) {
        throw new Error('Reservation was created but no reservation id was returned.')
      }

      const ticketData = createTicketPrintData({
        reservationId,
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        partySize: saveParty,
        checkedInCount: 0,
        totalAmount: saveTotals.total,
        paidAmount: shouldApplyPayment
          ? parseReservationMoney(savePaymentAmount)
          : 0,
        paymentType: getPrintablePaymentType(paymentType),
        source: origin,
        section: saveSection.name,
        promotion:
          selectedPromo?.promotionCode?.trim() ||
          selectedPromo?.promotionName?.trim() ||
          null,
        showDate,
        showLabel: selectedShowLabel,
        locationName,
        qrValue: reservationId
      })

      await onSaved?.([reservationId], ticketData)
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      toastSuccess('Reservation saved')
      handleDialogOpenChange(false)
    } catch (requestError) {
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      reportErrorMessage(
        setSaveReservationError,
        formatReservationPaymentError(
          getErrorMessage(requestError, 'Failed to save reservation')
        )
      )
    } finally {
      if (sessionGeneration === sessionGenerationRef.current) {
        setIsSavingReservation(false)
      }
    }
  }

  async function selectSavedCustomer(
    customer: CustomerFormValues,
    results: ReservationCustomerSearchResult[]
  ) {
    const normalizedEmail = customer.email.trim().toLowerCase()
    const match =
      results.find(
        result => result.email.trim().toLowerCase() === normalizedEmail
      ) ?? results[0]

    if (match) {
      setSearchRowSelection({ [match.id]: true })
    }
  }

  function handleReservationInputChange() {
    setPaymentAmountOverride(null)
  }

  function persistCurrentBookingForm(showId: string) {
    if (!showId) {
      return
    }

    bookingFormCacheRef.current.set(showId, {
      section,
      partyBySection: { ...partyBySection },
      promo,
      dinner
    })
  }

  function clearBookingFormCaches() {
    bookingFormCacheRef.current.clear()
    sectionsInitializedForShowRef.current = ''
  }

  function resetBookingForDateChange() {
    clearBookingFormCaches()
    handleReservationInputChange()
    setSection('')
    setPartyBySection({})
    setShowPartyRequiredError(false)
    setPromo('none')
  }

  function handleShowTimeChange(value: string) {
    if (value === activeShowTime) {
      // activeShowTime can resolve to the first API result one render before
      // showTime state is synchronized.
      if (value !== showTime) {
        setShowTime(value)
      }
      focusSelectedPartyInput()
      return
    }

    persistCurrentBookingForm(activeShowTime)
    handleReservationInputChange()
    pendingPartyFocusRef.current = true
    setShowTime(value)
  }

  function handlePaymentAmountChange(value: string) {
    setPaymentAmountOverride(value)
    setPaymentValidationErrors({})
  }

  function clearCustomerSearch() {
    clearReservationCustomerSearch()
    setSearchRowSelection({})
    setSearchCriteria(EMPTY_CUSTOMER_SEARCH_CRITERIA)
    setCreateCustomerError(null)
  }

  function handleCustomerSearch() {
    if (!hasCustomerSearchCriteria(searchType, searchCriteria)) {
      clearCustomerSearch()
      return
    }

    setSearchRowSelection({})
    setCreateCustomerError(null)
    void searchReservationCustomers(searchType, searchCriteria)
  }

  function handleSearchResultSelect(
    result: ReservationCustomerSearchResult | ReservationBusinessSearchResult
  ) {
    const phone =
      result.areaCode || result.phone1 || result.phone2
        ? normalizePhoneSearchParts(result)
        : parsePhoneSearchParts(result.phoneNo)

    setSearchCriteria({
      businessName: 'businessName' in result ? result.businessName : '',
      lastName: result.lastName,
      firstName: result.firstName,
      areaCode: phone.areaCode,
      phone1: phone.phone1,
      phone2: phone.phone2,
      email: 'email' in result ? result.email : ''
    })
  }

  function resetDialogSession() {
    sessionGenerationRef.current += 1
    setSpecialNotesOpen(true)
    setComicInfoOpen(false)
    setIsAddCustomerOpen(false)
    setAddCustomerInitialValues(null)
    setIsCreatingCustomer(false)
    setCreateCustomerError(null)
    setNotes('')
    setDinner(false)
    setShowDate(todayDateValue())
    setShowTime('')
    setSection('')
    setPartyBySection({})
    setPasses(1)
    setOrigin('phone')
    setPromo('none')
    setPaymentAmountOverride(null)
    setPaymentType('credit-card')
    setPaymentFields(createEmptyReservationPaymentFields())
    setIsSavingReservation(false)
    setCheckInConfirmOpen(false)
    setSaveReservationError(null)
    setPaymentValidationErrors({})
    setShowPartyRequiredError(false)
    setEditCustomerId(null)
    setTableNums('')
    setAssignSeatNumbers('')
    setAssignSeatsOpen(false)
    setAssignSeatError(null)
    setPaymentActionBusy(null)
    setIsSavingNote(false)
    setSaveNoteError(null)
    setSaveNoteSuccess(false)
    setSelectedTransaction(null)
    setDueAmountOpen(false)
    setIsDueAmountPending(false)
    setDueAmountOption('continue-without-payment')
    setHasAttemptedSave(false)
    setCancelWithoutSavingOpen(false)
    setSendUpdateConfirmOpen(false)
    setSendUpdateToCustomer(false)
    setEditNoChangeCheckInOpen(false)
    origPartyRef.current = 0
    origShowIdRef.current = ''
    origSectionIdRef.current = ''
    origPromoIdRef.current = 'none'
    origOriginRef.current = 'phone'
    origPassesRef.current = 1
    origDinnerRef.current = false
    editPrefillDoneRef.current = false
    expressWalkupSeedAppliedRef.current = false
    checkInPromptedBeforeSaveRef.current = false
    sectionsInitializedForShowRef.current = ''
    bookingFormCacheRef.current.clear()
    clearCustomerSearch()
    onAfterClose?.()
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      sessionGenerationRef.current += 1
      setDueAmountOpen(false)
      setIsDueAmountPending(false)
      setDueAmountOption('continue-without-payment')
      setHasAttemptedSave(false)
      setCancelWithoutSavingOpen(false)
      setSendUpdateConfirmOpen(false)
      setSendUpdateToCustomer(false)
      setEditNoChangeCheckInOpen(false)
    }
    onOpenChange(nextOpen)
  }

  /**
   * Desktop OpenCancelReservationPopup (Add IsCancelRequest=false):
   * - Before Save (!IsSaveChanges) → "Cancel without saving?"
   * - After Save (IsSaveChanges) → Due Amount (always; not gated on Amount Due display)
   * Edit (IsCancelRequest=true) → close immediately
   */
  function requestCloseReservationDialog() {
    if (isSavingReservation || isDueAmountPending) {
      return
    }

    if (isEditMode) {
      handleDialogOpenChange(false)
      return
    }

    if (hasAttemptedSave) {
      setDueAmountOption('continue-without-payment')
      setDueAmountOpen(true)
      return
    }

    setCancelWithoutSavingOpen(true)
  }

  /**
   * Desktop paid no-change edit save: after Check-In Yes/No, always close and
   * return to the reservation list.
   */
  async function finishEditNoChangeAndClose(shouldCheckIn: boolean) {
    if (!reservation) {
      setEditNoChangeCheckInOpen(false)
      return
    }

    const sessionGeneration = sessionGenerationRef.current
    setEditNoChangeCheckInOpen(false)
    setIsSavingReservation(true)

    try {
      if (shouldCheckIn) {
        await reservationCheckIn(
          buildReservationCheckInRequest({
            connectionName,
            reservationId: reservation.id,
            lastUpdateId: username
          })
        )
      }

      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }

      await onSaved?.([reservation.id])
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      toastSuccess('Reservation saved')
      handleDialogOpenChange(false)
    } catch (error) {
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      toastError(getErrorMessage(error, 'Failed to save reservation'))
    } finally {
      if (sessionGeneration === sessionGenerationRef.current) {
        setIsSavingReservation(false)
      }
    }
  }

  async function handleDueAmountConfirm() {
    if (dueAmountOption === 'additional-payment') {
      setDueAmountOpen(false)
      return
    }

    const booking = resolveReservationBooking({
      sectionId: section,
      partyBySection,
      sections: availableSections
    })
    const saveSection = booking.selectedSection
    const saveParty = booking.partySize

    if (!effectiveCustomerId) {
      toastError('Please select a customer before continuing.')
      return
    }
    if (!saveSection || !activeShowTime) {
      toastError('Please select a show section before continuing.')
      return
    }

    const savePromo =
      effectivePromo === 'none' ? null : promoById.get(effectivePromo) ?? null
    const saveTotals = isEditMode
      ? calculateReservationTotals({
        sectionPrice: saveSection.price ?? '$0.00',
        sectionShowPrice: saveSection.showPrice,
        sectionPriceMultiplier: saveSection.priceMultiplier ?? 1,
        party: saveParty,
        passes,
        promo: savePromo,
        existingServiceCharge: reservationDetail?.SVC,
        existingDiscount: reservationDetail?.Discount,
        existingSalesTax: reservationDetail?.SalesTax,
        systemTaxRate: Number(systemDefaults?.lblTaxes || 0),
        taxWithServiceCharge:
          systemDefaults?.lblTaxWithServiceCharge ?? undefined,
        ccFeePercent: Number(systemDefaults?.cboCC || 0)
      })
      : totals

    const customerDetails = getSelectedCustomerDetails()
    const reservationParams = {
      connectionName,
      locationId,
      userRights: userRight,
      lastUpdateId: username,
      searchType,
      customerId: effectiveCustomerId,
      searchCriteria: customerDetails,
      selectedSection: saveSection,
      origin,
      party: saveParty,
      origParty: isEditMode
        ? origPartyRef.current || reservation?.qty || saveParty
        : saveParty,
      passes,
      promo: savePromo,
      totals: saveTotals,
      notes,
      dinner,
      isVip: showDataPayload?.[0]?.VIP === 'Y',
      isReservationCheckedIn: false
    }

    const sessionGeneration = sessionGenerationRef.current
    setIsDueAmountPending(true)

    try {
      if (dueAmountOption === 'cancel-reservation') {
        if (isEditMode && reservation) {
          await cancelReservation(
            buildCancelReservationRequest({
              connectionName,
              locationId,
              reservationId: reservation.id,
              lastUpdateId: username,
              reservationNote: notes
            })
          )
          if (sessionGeneration !== sessionGenerationRef.current) {
            return
          }
          await onSaved?.([reservation.id])
          toastSuccess('Reservation cancelled')
        } else {
          const reservationIds = await createNewReservation(
            buildSaveReservationOnlyRequest({
              ...reservationParams,
              reservationStatus: RESERVATION_STATUS_CANCELLED
            })
          )
          if (sessionGeneration !== sessionGenerationRef.current) {
            return
          }
          const reservationId = reservationIds[0]
          if (reservationId) {
            await onSaved?.([reservationId])
          }
          toastSuccess('Reservation cancelled')
        }
      } else {
        // Continue without payment — desktop SaveReservation(Active) / UpdateConfirmation Active
        if (isEditMode && reservation) {
          await updateReservation(
            buildSaveReservationOnlyRequest({
              ...reservationParams,
              reservationId: reservation.id,
              isSendUpdateToCustomer: sendUpdateToCustomer
            })
          )
          if (sessionGeneration !== sessionGenerationRef.current) {
            return
          }
          await onSaved?.([reservation.id])
          toastSuccess('Reservation saved')
        } else {
          const reservationIds = await createNewReservation(
            buildSaveReservationOnlyRequest(reservationParams)
          )
          if (sessionGeneration !== sessionGenerationRef.current) {
            return
          }
          const reservationId = reservationIds[0]
          if (!reservationId) {
            throw new Error(
              'Reservation was created but no reservation id was returned.'
            )
          }
          await onSaved?.([reservationId])
          toastSuccess('Reservation saved')
        }
      }

      setDueAmountOpen(false)
      handleDialogOpenChange(false)
    } catch (error) {
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      toastError(
        getErrorMessage(
          error,
          dueAmountOption === 'cancel-reservation'
            ? 'Failed to cancel reservation'
            : 'Failed to save reservation'
        )
      )
    } finally {
      if (sessionGeneration === sessionGenerationRef.current) {
        setIsDueAmountPending(false)
      }
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    pendingPartyFocusRef.current = true

    if (!reservation) {
      setShowDate(initialShowDate ?? todayDateValue())
      setShowTime(
        expressWalkupSeed?.showTimeId || initialShowTime || ''
      )
    }
  }, [
    expressWalkupSeed?.showTimeId,
    initialShowDate,
    initialShowTime,
    open,
    reservation
  ])

  useEffect(() => {
    if (
      !open ||
      !expressWalkupSeed ||
      isEditMode ||
      expressWalkupSeedAppliedRef.current ||
      sectionsLoading ||
      availableSections.length === 0
    ) {
      return
    }

    const sectionId =
      availableSections.find(
        (option) => option.id === expressWalkupSeed.sectionId
      )?.id ?? availableSections[0]?.id

    if (!sectionId) {
      return
    }

    const partySize = Math.max(1, expressWalkupSeed.party)
    const promoId =
      expressWalkupSeed.promoId !== 'none' &&
        promoOptions.some((option) => option.value === expressWalkupSeed.promoId)
        ? expressWalkupSeed.promoId
        : 'none'

    setOrigin('walkup')
    setPasses(Math.max(0, expressWalkupSeed.passes) || partySize)
    setDinner(
      expressWalkupSeed.dinner &&
      availableSections.find((option) => option.id === sectionId)
        ?.showDinner === 'Y'
    )
    setSection(sectionId)
    setPartyBySection(
      Object.fromEntries(
        availableSections.map((option) => [
          option.id,
          option.id === sectionId ? partySize : 0
        ])
      ) as Record<string, number>
    )
    setPromo(promoId)
    setEditCustomerId(expressWalkupSeed.customer.id)
    setSearchRowSelection({ [expressWalkupSeed.customer.id]: true })
    setSearchCriteria({
      ...EMPTY_CUSTOMER_SEARCH_CRITERIA,
      lastName: expressWalkupSeed.customer.lastName,
      firstName: expressWalkupSeed.customer.firstName,
      email: expressWalkupSeed.customer.email ?? ''
    })
    setShowTime(expressWalkupSeed.showTimeId || initialShowTime || '')
    expressWalkupSeedAppliedRef.current = true
    sectionsInitializedForShowRef.current = activeShowTime || expressWalkupSeed.showTimeId
  }, [
    activeShowTime,
    availableSections,
    expressWalkupSeed,
    initialShowTime,
    isEditMode,
    open,
    promoOptions,
    sectionsLoading
  ])

  useEffect(() => {
    clearCustomerSearch()
  }, [searchType])

  function setSectionParty(sectionId: string, value: number) {
    handleReservationInputChange()
    setShowPartyRequiredError(false)

    if (value > 0) {
      changeSection(sectionId)
    }

    setPartyBySection(current => ({
      ...current,
      [sectionId]: Math.max(0, value)
    }))
  }

  async function applySavedCustomer(customer: CustomerFormValues) {
    const sessionGeneration = sessionGenerationRef.current
    const { area, prefix, line } = customer.phone
    const nextCriteria: ReservationCustomerSearchCriteria = {
      lastName: customer.lastName,
      firstName: customer.firstName,
      areaCode: area,
      phone1: prefix,
      phone2: line,
      email: customer.email,
      businessName: ''
    }
    setSearchType('customer')
    setSearchCriteria(nextCriteria)
    setIsAddCustomerOpen(false)
    setSearchRowSelection({})

    // The backend may not have committed the new customer record to the search
    // index by the time we immediately query, causing ReservationSearchCustomer
    // to return empty. Retry once after a short delay if the first attempt finds
    // no results (race condition between SaveCustomer and the search endpoint).
    let results = (await searchReservationCustomers(
      'customer',
      nextCriteria
    )) as ReservationCustomerSearchResult[]

    if (sessionGeneration !== sessionGenerationRef.current) {
      return
    }

    if (!results || results.length === 0) {
      await new Promise<void>(resolve => setTimeout(resolve, 800))
      if (sessionGeneration !== sessionGenerationRef.current) {
        return
      }
      results = (await searchReservationCustomers(
        'customer',
        nextCriteria
      )) as ReservationCustomerSearchResult[]
    }

    if (sessionGeneration !== sessionGenerationRef.current) {
      return
    }
    await selectSavedCustomer(customer, results ?? [])
  }

  const selectedCustomerSearchId = Object.keys(searchRowSelection).find(
    id => searchRowSelection[id]
  )
  const selectedCustomerSearchResult =
    searchType === 'customer' && selectedCustomerSearchId
      ? customerSearchResults.find(c => c.id === selectedCustomerSearchId)
      : null

  const customerToEdit = selectedCustomerSearchResult
    ? ({
      id: selectedCustomerSearchResult.id,
      lastName: selectedCustomerSearchResult.lastName,
      firstName: selectedCustomerSearchResult.firstName,
      email: selectedCustomerSearchResult.email,
      phoneNo: selectedCustomerSearchResult.phoneNo,
      password: '',
      address: '',
      city: '',
      status: '',
      banned: false
    } satisfies Customer)
    : null

  const resolvedEditCustomerId =
    editCustomerId?.trim() ||
    reservationDetail?.CustomerID?.trim() ||
    null

  const customerForEditDialog = useMemo((): Customer | null => {
    if (customerToEdit) {
      return customerToEdit
    }

    if (!isEditMode || !resolvedEditCustomerId || !reservation) {
      return null
    }

    return {
      id: resolvedEditCustomerId,
      lastName: reservation.lastName,
      firstName: reservation.firstName,
      email: reservation.email,
      phoneNo: reservation.phoneNo,
      password: '',
      address: '',
      city: '',
      status: '',
      banned: false
    }
  }, [customerToEdit, isEditMode, reservation, resolvedEditCustomerId])

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (
            !nextOpen &&
            (comicInfoOpen ||
              isAddCustomerOpen ||
              assignSeatsOpen ||
              dueAmountOpen ||
              cancelWithoutSavingOpen ||
              sendUpdateConfirmOpen ||
              editNoChangeCheckInOpen)
          ) {
            return
          }
          if (!nextOpen) {
            requestCloseReservationDialog()
            return
          }
          handleDialogOpenChange(nextOpen)
        }}
      >
        <TooltipProvider delayDuration={200}>
          <DialogContent
            ref={dialogContentRef}
            disableOutsideDismiss
            showCloseButton
            onAfterClose={resetDialogSession}
            suppressPresentation={comicInfoOpen || isAddCustomerOpen || assignSeatsOpen}
            className='flex max-h-[82vh] w-full max-w-[min(calc(100vw-2rem),84rem)] flex-col overflow-hidden sm:max-w-[84rem]'
            onOpenAutoFocus={event => {
              event.preventDefault()
            }}
          >
            <DialogHeader className='shrink-0 border-b px-4 py-3'>
              <DialogTitle className='truncate text-base font-semibold text-foreground'>
                {dialogTitle}
              </DialogTitle>
            </DialogHeader>

            <div
              ref={dialogScrollRef}
              className='min-h-0 flex-1 overflow-y-auto px-4 py-2 pb-3'
            >
              <div className='grid gap-3 lg:grid-cols-2 lg:gap-4'>
                <div className='min-w-0 space-y-2.5 lg:pr-1'>
                  <ShowMetaRow
                    comicName={comicName}
                    showDate={showDate}
                    onShowDateChange={value => {
                      resetBookingForDateChange()
                      setShowDate(value)
                    }}
                    shows={availableShows}
                    showTime={activeShowTime}
                    onShowTimeChange={handleShowTimeChange}
                    showTimeButtonRef={selectedShowTimeButtonRef}
                    onShowTimeKeyDown={handleShowTimeKeyDown}
                    onShowTimeFocus={handleShowTimeFocus}
                    origin={origin}
                    onOriginChange={id => {
                      handleReservationInputChange()
                      setOrigin(id as (typeof ORIGIN_OPTIONS)[number]['id'])
                      setPromo('none')
                      setPasses(1)
                    }}
                    originDisabled={Boolean(expressWalkupSeed?.lockOrigin)}
                    onOpenComicInfo={() => setComicInfoOpen(true)}
                    dinner={dinner}
                    onDinnerChange={setDinner}
                    dinnerDisabled={dinnerDisabled}
                    showsLoading={showsLoading}
                  />

                  <SectionPicker
                    sections={availableSections}
                    sectionsLoading={sectionsLoading}
                    section={section}
                    onSectionChange={value => {
                      handleReservationInputChange()
                      changeSection(value)
                    }}
                    partyBySection={partyBySection}
                    onPartyChange={setSectionParty}
                    partyInputRefs={partyInputRefs}
                    onPartyInputKeyDown={handlePartyInputKeyDown}
                    partyError={partyValidationError}
                    promo={effectivePromo}
                    onPromoChange={value => {
                      handleReservationInputChange()
                      setPromo(value)
                    }}
                    promoOptions={promoOptions}
                    promoLoading={promoLoading}
                    passes={passes}
                    onPassesChange={value => {
                      handleReservationInputChange()
                      setPasses(value)
                    }}
                    onPassesTabForward={focusLastNameInput}
                  />

                  <div className='rounded-lg border border-border/60 p-2.5'>
                    {sectionsError || promosError ? (
                      <p className='mb-2 text-xs text-destructive'>
                        {sectionsError ?? promosError}
                      </p>
                    ) : null}
                    <ReservationTotalsCard
                      selectedSection={selectedSection}
                      partySize={partySize}
                      totals={totals}
                      amountDue={amountDue}
                    />
                  </div>

                  {isEditMode ? (
                    <>
                      <div className='shrink-0'>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={() => handleSplitReservationClick('payment')}
                          disabled={
                            !onSplitReservation || paymentActionBusy === 'split'
                          }
                        >
                          Split Payment
                        </Button>
                      </div>
                      <div className='mt-3 border-t border-border/50 pt-3'>
                        <ReservationTransactionsTable
                          data={transactionRows}
                          selectedTransactionId={selectedTransaction?.id}
                          onTransactionSelect={handleTransactionSelect}
                        />
                      </div>
                    </>
                  ) : null}
                </div>

                <div className='flex min-w-0 flex-col gap-3 border-t border-border/50 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4'>
                  <div className='flex flex-col gap-2.5'>
                    {isEditMode ? (
                      <>
                        <div className='shrink-0'>
                          <CustomerDetailsFields
                            lastName={displayLastName}
                            firstName={displayFirstName}
                            canEditCustomer={Boolean(resolvedEditCustomerId)}
                            onEditCustomer={handleOpenEditCustomerDialog}
                          />
                        </div>

                        <div className='shrink-0'>
                          <TableAssignmentRow
                            tableNums={tableNums}
                            onAssignSeat={handleAssignSeat}
                            isAssigning={assignSeatsOpen}
                            error={assignSeatError}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='shrink-0'>
                          <CustomerSearchHeader
                            searchType={searchType}
                            onSearchTypeChange={value =>
                              setSearchType(value as 'customer' | 'business')
                            }
                            onSearch={handleCustomerSearch}
                            onClear={clearCustomerSearch}
                            hasSelectedCustomer={!!customerToEdit}
                            onAddCustomer={() =>
                              openAddCustomerDialog(
                                mapReservationSearchCriteriaToCustomerForm(searchCriteria)
                              )
                            }
                          />
                        </div>

                        <div className='shrink-0'>
                          <CustomerSearchFields
                            searchType={searchType}
                            criteria={searchCriteria}
                            onCriteriaChange={setSearchCriteria}
                            // onFieldBlur={handleCustomerSearch}
                            onFieldEnter={handleCustomerSearch}
                            lastNameInputRef={lastNameInputRef}
                          />
                        </div>

                        {customerSearchError || createCustomerError ? (
                          <p className='text-xs text-destructive'>
                            {customerSearchError ?? createCustomerError}
                          </p>
                        ) : null}

                        {hasSearched ? (
                          <div className='shrink-0'>
                            <ReservationSearchResultsTable
                              searchType={searchType}
                              customerResults={customerSearchResults}
                              businessResults={businessSearchResults}
                              hasSearched={hasSearched}
                              loading={customerSearchLoading}
                              canAddNewCustomer={canAddNewCustomer}
                              creatingCustomer={isCreatingCustomer}
                              onAddNewCustomer={() => void handleAddNewCustomer()}
                              onFillMoreDetails={handleFillMoreDetails}
                              rowSelection={searchRowSelection}
                              onRowSelectionChange={setSearchRowSelection}
                              onResultSelect={handleSearchResultSelect}
                            />
                          </div>
                        ) : null}
                      </>
                    )}

                    <div className='w-full shrink-0 space-y-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <Button
                          type='button'
                          variant='link'
                          size='sm'
                          tabIndex={-1}
                          className='h-auto px-0 pt-0 text-sm font-normal underline'
                          onClick={() => setSpecialNotesOpen(current => !current)}
                          aria-expanded={specialNotesOpen}
                        >
                          Special Notes
                        </Button>

                        {isEditMode && specialNotesOpen ? (
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() => void handleSaveNoteClick()}
                            disabled={isSavingNote}
                          >
                            {isSavingNote ? 'Saving...' : 'Save Note'}
                          </Button>
                        ) : null}
                      </div>

                      {specialNotesOpen ? (
                        <Textarea
                          ref={notesInputRef}
                          value={notes}
                          onChange={event => {
                            setNotes(event.target.value)
                            setSaveNoteSuccess(false)
                          }}
                          placeholder='Enter notes or special requests...'
                          className='min-h-20 w-full resize-y text-sm shadow-xs'
                        />
                      ) : null}

                      {saveNoteError ? (
                        <p className='text-xs text-destructive'>{saveNoteError}</p>
                      ) : null}
                      {saveNoteSuccess ? (
                        <p className='text-xs text-emerald-600'>Note saved.</p>
                      ) : null}
                    </div>

                    <div className='shrink-0'>
                      <ReservationPaymentPanel
                        paymentType={paymentType}
                        onPaymentTypeChange={handlePaymentTypeChange}
                        paymentAmount={paymentAmount}
                        onPaymentAmountChange={handlePaymentAmountChange}
                        fields={paymentFields}
                        onFieldChange={updatePaymentField}
                        paymentDisabled={
                          isViewingTransaction &&
                          !selectedTransactionIsHoldWithCard
                        }
                        showAuthFields={
                          isViewingTransaction &&
                          !selectedTransactionIsHoldWithCard
                        }
                        validationErrors={paymentValidationErrors}
                      />
                      {saveReservationError ? (
                        <p className='text-xs text-destructive'>
                          {saveReservationError}
                        </p>
                      ) : null}
                    </div>

                    {isEditMode && selectedTransaction && !selectedTransactionIsHoldWithCard ? (
                      <div className='shrink-0'>
                        <PaymentMetadataBlock
                          createdBy={reservation?.createdBy ?? ''}
                          status={reservation?.resStatus ?? ''}
                          createDate={reservation?.createdDt ?? ''}
                          authorization={selectedTransaction.authorization}
                          pnref={selectedTransaction.pnref}
                          busyAction={paymentActionBusy}
                          onRefund={handleRefundClick}
                          onVoid={handleVoidClick}
                          onClear={handleClearTransactionSelection}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className='shrink-0 border-t border-border/50 pt-3 pb-1'>
                    <ReservationPaymentActions
                      onCancel={requestCloseReservationDialog}
                      onSave={() => void handleSaveReservation()}
                      saveDisabled={!canSave}
                      saving={isSavingReservation}
                      extraActions={
                        isEditMode ? (
                          <>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={() => handleSplitReservationClick('party')}
                              disabled={!onSplitParty || paymentActionBusy === 'split'}
                            >
                              Split Party
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={() => void handleReprintClick()}
                              disabled={!reservation}
                            >
                              Re Print Ticket
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={() => void handleCashDrawerClick()}
                              disabled={paymentActionBusy === 'cash-drawer'}
                            >
                              Cash Drawer
                            </Button>
                          </>
                        ) : undefined
                      }
                    />
                  </div>
                </div>
              </div>


            </div>
          </DialogContent>
        </TooltipProvider>
      </Dialog>

      <ComicInfoDialog
        open={comicInfoOpen}
        onOpenChange={setComicInfoOpen}
        stageName={comicName}
        nested
      />

      <AddCustomerDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onAfterClose={() => setAddCustomerInitialValues(null)}
        nested
        onBack={() => {
          setIsAddCustomerOpen(false)
        }}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        customer={customerForEditDialog}
        initialValues={addCustomerInitialValues}
        onSaved={applySavedCustomer}
      />

      {/* Desktop ReservationPayment → AssignSeats (Quick Play / edit reservation) */}
      <AssignSeatsDialog
        open={assignSeatsOpen}
        onOpenChange={openState => {
          setAssignSeatsOpen(openState)
          if (!openState) {
            setAssignSeatError(null)
          }
        }}
        connectionName={connectionName}
        locationId={locationId}
        showId={activeShowTime}
        username={username}
        reservation={reservation}
        paymentSeed={
          reservation
            ? {
              qty: partySize > 0 ? partySize : reservation.qty,
              // Desktop ResAssignSeatNumbers — seat labels, NOT TableNums.
              // Prefer local state updated after Assign Seats Save, then list.
              seatNumbers:
                assignSeatNumbers || reservation.seatNo || '',
              section:
                selectedSection?.name ||
                selectedSection?.label ||
                reservation.section,
              source: reservation.source,
              promo:
                selectedPromo?.promotionName ||
                (effectivePromo !== 'none' ? effectivePromo : '') ||
                reservation.promo,
              notes,
              dinner
            }
            : null
        }
        checkInAfterSave={false}
        nested
        error={assignSeatError}
        onSaved={async payload => {
          await handleAssignSeatsSaved(payload)
        }}
      />

      <RefundPaymentDialog
        key={`${refundDialogOpen}-${refundInitialPaymentId}`}
        open={refundDialogOpen}
        onOpenChange={openState => {
          setRefundDialogOpen(openState)
        }}
        cards={refundCards}
        initialPaymentId={refundInitialPaymentId}
        serviceCharge={totals.serviceCharge}
        paidAmount={alreadyPaid}
        details={{
          party: String(partySize),
          promo: reservationDetail?.Promo ?? '',
          subTotal: totals.subtotal,
          serviceCharge: totals.serviceCharge,
          discount: totals.discount,
          total: totals.total,
          pricePerTicket: parseReservationMoney(selectedSection?.price ?? '0'),
          totalPayment: alreadyPaid
        }}
        busy={refundBusy}
        onConfirm={(paymentId, amount) => {
          void handleConfirmRefund(paymentId, amount)
        }}
      />

      <ConfirmDialog
        open={checkInConfirmOpen}
        onOpenChange={setCheckInConfirmOpen}
        title="CheckIn"
        description="Check-In Reservation?"
        confirmLabel="Yes"
        cancelLabel="No"
        nested
        isPending={isSavingReservation}
        onConfirm={() => executeSaveReservation(true, sendUpdateToCustomer)}
        onCancel={() => {
          void executeSaveReservation(false, sendUpdateToCustomer)
        }}
      />
      <ConfirmDialog
        open={sendUpdateConfirmOpen}
        onOpenChange={openState => {
          if (!isSavingReservation) {
            setSendUpdateConfirmOpen(openState)
          }
        }}
        title="Alert"
        description="Are you want to send update to customer?"
        confirmLabel="Yes"
        cancelLabel="No"
        nested
        isPending={isSavingReservation}
        onConfirm={() => {
          void runSaveReservationFlow(true)
        }}
        onCancel={() => {
          void runSaveReservationFlow(false)
        }}
      />
      <ConfirmDialog
        open={editNoChangeCheckInOpen}
        onOpenChange={openState => {
          if (!isSavingReservation) {
            setEditNoChangeCheckInOpen(openState)
          }
        }}
        title="CheckIn"
        description="Check-In Reservation?"
        confirmLabel="Yes"
        cancelLabel="No"
        nested
        isPending={isSavingReservation}
        onConfirm={() => {
          void finishEditNoChangeAndClose(true)
        }}
        onCancel={() => {
          void finishEditNoChangeAndClose(false)
        }}
      />
      <DueAmountDialog
        open={dueAmountOpen}
        onOpenChange={openState => {
          if (!isDueAmountPending) {
            setDueAmountOpen(openState)
          }
        }}
        option={dueAmountOption}
        onOptionChange={setDueAmountOption}
        isPending={isDueAmountPending}
        onConfirm={handleDueAmountConfirm}
      />
      <ConfirmDialog
        open={cancelWithoutSavingOpen}
        onOpenChange={setCancelWithoutSavingOpen}
        title="Cancel"
        description="Are you sure you want to Cancel without saving?"
        confirmLabel="Yes"
        cancelLabel="No"
        nested
        onConfirm={() => {
          setCancelWithoutSavingOpen(false)
          handleDialogOpenChange(false)
        }}
        onCancel={() => setCancelWithoutSavingOpen(false)}
      />
      <ConfirmDialog
        open={splitCheckedInAlertOpen}
        onOpenChange={setSplitCheckedInAlertOpen}
        title="Cannot Split Reservation"
        description="All guests are already checked in."
        confirmLabel="OK"
        hideCancel
        nested
        onConfirm={() => setSplitCheckedInAlertOpen(false)}
      />
      <SplitPromoAlertDialog
        open={splitPromoAlertOpen}
        onOpenChange={setSplitPromoAlertOpen}
        onConfirm={() => {
          if (pendingSplitType) {
            void executeSplitReservationClick(pendingSplitType)
          }
        }}
        nested
      />

      {/* Desktop Re-Print Ticket popup: pick how many tickets to print, then print. */}
      <ReprintTicketDialog
        open={reprintOpen}
        onOpenChange={setReprintOpen}
        reservation={reservation}
        showDate={showDate}
        showLabel={selectedShowLabel}
        locationName={locationName}
        connectionName={connectionName}
        details={reprintDetails}
        nested
      />
    </>
  )
}






