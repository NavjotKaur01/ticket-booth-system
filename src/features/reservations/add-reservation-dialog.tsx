import {
  Calendar,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  reservationShowMeta,
  showOptions,
  formatSectionDesktopPrice,
} from '@/data/reservation'
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
import { ReservationSearchResultsTable } from '@/features/reservations/reservation-search-results-table'
import { ReservationTransactionsTable } from '@/features/reservations/reservation-transactions-table'
import { useCachedReservationShowData } from '@/hooks/use-cached-reservation-show-data'
import { useReservationCustomerSearch } from '@/hooks/use-reservation-customer-search'
import { useReservationDetail } from '@/hooks/use-reservation-detail'
import { useReservationPrintProperties } from '@/hooks/use-reservation-print-properties'
import { useReservationTransactions } from '@/hooks/use-reservation-transactions'
import { useShowDetailsByDate } from '@/hooks/use-show-details-by-date'
import {
  calculateReservationTotals,
  formatReservationMoney,
  getReservationAmountDue,
  parseReservationMoney
} from '@/lib/calculate-reservation-totals'
import { showTimeLabelsMatch } from '@/lib/parse-admin-event-show-time'
import {
  EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA,
  hasCompleteNewCustomerCriteria,
  hasReservationCustomerSearchCriteria,
  type ReservationCustomerSearchCriteria
} from '@/lib/reservation-customer-search-criteria'
import { saveCustomer } from '@/lib/api/customers'
import {
  assignReservationSeat,
  openCashDrawer,
  refundReservationPayment,
  voidReservationPayment
} from '@/lib/api/reservation-pos-actions'
import {
  createNewReservation,
  saveReservationNote,
  updateReservation
} from '@/lib/api/reservations'
import { buildReservationNoteRequest } from '@/lib/build-reservation-note-request'
import {
  buildSaveReservationOnlyRequest,
  buildSaveReservationWithPaymentRequest,
  buildUpdateReservationPaymentRequest
} from '@/lib/build-save-reservation-request'
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
import { EMPTY_GUID } from '@/lib/reservation-lookup-codes'
import { syncReservationCustomerIfChanged, syncReservationCustomerSearchResultIfChanged } from '@/lib/sync-reservation-customer'
import { validateReservationParty } from '@/lib/validate-reservation-party'
import {
  getFirstReservationPaymentError,
  validateReservationPaymentFields,
  type ReservationPaymentValidationErrors
} from '@/lib/validate-reservation-payment'
import { todayDateValue } from '@/lib/today-date-value'
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
  /** Edit mode only — the reservation is already fully paid, so splitting isn't possible. */
  onAlreadyPaidAlert?: () => void
  /** Edit mode only — reprints the reservation ticket using the existing print pipeline. */
  onReprintTicket?: (reservation: Reservation) => void
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

function SectionSeatDisplay({ option }: { option: SectionOption }) {
  return (
    <div className='flex min-w-max items-center justify-end gap-x-1.5 whitespace-nowrap text-sm tabular-nums'>
      <span className='shrink-0 tabular-nums text-foreground'>
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
              className='grid min-w-[36rem] grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-2 px-2.5 py-1.5'
            >
              <label
                htmlFor={`section-${option.id}`}
                className='grid min-w-0 cursor-pointer grid-cols-[auto_minmax(7rem,11rem)_minmax(0,1fr)] items-center gap-x-2'
              >
                <RadioGroupItem
                  value={option.id}
                  id={`section-${option.id}`}
                  className='shrink-0'
                />
                <span className='min-w-0 truncate text-sm font-semibold leading-tight text-foreground'>
                  {option.name}
                </span>
                <SectionSeatDisplay option={option} />
              </label>
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
                    className={cn(COMPACT_NUMBER, 'shrink-0 self-start sm:self-center')}
                    aria-label={`${option.name} party size`}
                  />
                </TooltipTrigger>
                <TooltipContent side='top'>
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
          <Select
            value={promo}
            onValueChange={handlePromoChange}
            disabled={promoLoading}
          >
            <SelectTrigger
              ref={promoTriggerRef}
              className={cn(COMPACT_SELECT, COMPACT_FIELD_HOVER, 'w-full min-w-0 sm:w-44')}
            >
              <SelectValue
                placeholder={
                  promoLoading ? 'Loading promo codes...' : 'Select promo code'
                }
              />
            </SelectTrigger>
            <SelectContent onCloseAutoFocus={handlePromoCloseAutoFocus}>
              {promoOptions.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className='inline-flex overflow-hidden rounded-full border border-border/60 text-sm'>
      {ORIGIN_OPTIONS.map((option, index) => (
        <button
          key={option.id}
          type='button'
          tabIndex={-1}
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
            placeholder='e.g. 12, 13'
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
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className='min-w-0 space-y-1'>
      <span className='text-xs font-medium text-muted-foreground'>
        {label}
      </span>
      <p className='truncate text-sm font-medium text-foreground'>
        {value || '—'}
      </p>
    </div>
  )
}

function PaymentMetadataBlock({
  createdBy,
  status,
  createDate,
  authorization,
  pnref,
  busyAction,
  error,
  onRefund,
  onVoid,
  onClear
}: {
  createdBy: string
  status: string
  createDate: string
  authorization: string
  pnref: string
  busyAction: 'refund' | 'void' | 'clear' | 'cash-drawer' | null
  error: string | null
  onRefund: () => void
  onVoid: () => void
  onClear: () => void
}) {
  return (
    <div className='space-y-2 rounded-lg border border-border/60 p-2.5'>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <PaymentMetadataField label='Created By' value={createdBy} />
        <PaymentMetadataField label='Status' value={status} />
        <PaymentMetadataField label='Create Date' value={createDate} />
        <PaymentMetadataField label='Authorization' value={authorization} />
        <PaymentMetadataField label='PNREF' value={pnref} />
      </div>
      <div className='flex flex-wrap items-center gap-2 border-t border-border/50 pt-2'>
        <Button type='button' size='sm' variant='outline' onClick={onRefund} disabled={busyAction === 'refund'}>
          Refund
        </Button>
        <Button type='button' size='sm' variant='outline' onClick={onVoid} disabled={busyAction === 'void'}>
          Void
        </Button>
        <Button type='button' size='sm' variant='outline' onClick={onClear} disabled={busyAction === 'clear'}>
          Clear
        </Button>
      </div>
      {error ? <p className='text-xs text-destructive'>{error}</p> : null}
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
  onSaved,
  reservation = null,
  showDate: initialShowDate,
  showTime: initialShowTime,
  preferredShowTimeLabel,
  onSplitReservation,
  onAlreadyPaidAlert,
  onReprintTicket
}: AddReservationDialogProps) {
  const isEditMode = Boolean(reservation)
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
  const origPartyRef = useRef(0)
  const origShowIdRef = useRef('')
  const origSectionIdRef = useRef('')
  const origPromoIdRef = useRef('none')
  const origOriginRef = useRef<'phone' | 'walkup'>('phone')
  const origPassesRef = useRef(1)
  const origDinnerRef = useRef(false)
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
  const [isAssigningSeat, setIsAssigningSeat] = useState(false)
  const [assignSeatError, setAssignSeatError] = useState<string | null>(null)
  const [paymentActionBusy, setPaymentActionBusy] = useState<
    'refund' | 'void' | 'clear' | 'cash-drawer' | null
  >(null)
  const [paymentActionError, setPaymentActionError] = useState<string | null>(
    null
  )
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [saveNoteError, setSaveNoteError] = useState<string | null>(null)
  const [saveNoteSuccess, setSaveNoteSuccess] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<ReservationTransactionRow | null>(null)

  const { detail: reservationDetail } = useReservationDetail(
    connectionName,
    reservation?.id ?? '',
    open && isEditMode
  )

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
    enabled: open && isReady && Boolean(activeShowTime)
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
  }, [open, activeShowTime, availableSections, isEditMode, sectionsLoading])

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
    origPartyRef.current = partySize
    origShowIdRef.current = activeShowTime
    origSectionIdRef.current = sectionId
    origPromoIdRef.current = matchedPromoId
    origOriginRef.current = mappedOrigin
    origPassesRef.current = passes
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
    editPrefillDoneRef.current = true
  }, [
    activeShowTime,
    availableSections,
    open,
    promoLoading,
    promoOptions,
    reservation,
    reservationDetail?.PartyNo,
    sectionsLoading
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
    promo !== 'none' && promoOptions.some(option => option.id === promo)
      ? promo
      : 'none'

  const selectedPromo =
    effectivePromo === 'none' ? null : promoById.get(effectivePromo) ?? null

  const selectedShow = availableShows.find(show => show.id === activeShowTime)
  const selectedShowLabel = selectedShow?.label ?? ''
  const comicName =
    selectedShow?.headliner ?? reservationShowMeta.comicName

  const totals = useMemo(
    () =>
      calculateReservationTotals({
        sectionPrice: selectedSection?.price ?? '$0.00',
        party: partySize,
        passes,
        promo: selectedPromo
      }),
    [partySize, passes, selectedPromo, selectedSection?.price]
  )

  const alreadyPaid = isEditMode
    ? parseReservationMoney(reservation?.paid ?? '$0.00')
    : 0
  const balanceDue = Math.max(0, totals.total - alreadyPaid)
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

  const amountDueValue = isEditMode
    ? balanceDue
    : getReservationAmountDue(totals.total, parseReservationMoney(paymentAmount))
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
  const dialogTitle = isEditMode
    ? `Payment :- ${[editCustomerLastName, editCustomerFirstName].filter(Boolean).join(',') || 'Guest'}  ${formatShowDate(showDate)}`
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

  async function handleAssignSeat() {
    if (!reservation) {
      return
    }

    setIsAssigningSeat(true)
    setAssignSeatError(null)

    try {
      await assignReservationSeat({
        connectionName,
        locationId,
        reservationId: reservation.id,
        tableNums,
        lastUpdateId: username
      })
    } catch (requestError) {
      setAssignSeatError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to assign seat'
      )
    } finally {
      setIsAssigningSeat(false)
    }
  }

  async function runPaymentAction(
    action: 'refund' | 'void' | 'clear',
    handler: (params: {
      connectionName: string
      locationId: string
      reservationId: string
      lastUpdateId: string
    }) => Promise<never>
  ) {
    if (!reservation) {
      return
    }

    setPaymentActionBusy(action)
    setPaymentActionError(null)

    try {
      await handler({
        connectionName,
        locationId,
        reservationId: reservation.id,
        lastUpdateId: username
      })
    } catch (requestError) {
      setPaymentActionError(
        requestError instanceof Error
          ? requestError.message
          : `Failed to ${action} payment`
      )
    } finally {
      setPaymentActionBusy(null)
    }
  }

  function handleRefundClick() {
    void runPaymentAction('refund', refundReservationPayment)
  }

  function handleVoidClick() {
    void runPaymentAction('void', voidReservationPayment)
  }

  function handleClearTransactionSelection() {
    setSelectedTransaction(null)
    setPaymentAmountOverride(null)
    setPaymentType('credit-card')
    setPaymentFields(createEmptyReservationPaymentFields())
    setPaymentValidationErrors({})
    setPaymentActionError(null)
  }

  function handleTransactionSelect(row: ReservationTransactionRow) {
    setSelectedTransaction(row)
    setPaymentAmountOverride(formatReservationMoney(row.amount))
    setPaymentType(mapPaymentLabelToType(row.payment))
    setPaymentFields({
      ...createEmptyReservationPaymentFields(),
      cardNumber: row.cardNumber,
      authorization: row.authorization,
      pnref: row.pnref
    })
    setPaymentValidationErrors({})
    setPaymentActionError(null)
  }

  async function handleCashDrawerClick() {
    setPaymentActionBusy('cash-drawer')
    setPaymentActionError(null)

    try {
      await openCashDrawer()
    } catch (requestError) {
      setPaymentActionError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to open cash drawer'
      )
    } finally {
      setPaymentActionBusy(null)
    }
  }

  function handleSplitReservationClick() {
    if (!reservation) {
      return
    }

    const isFullyPaid = alreadyPaid >= totals.total && totals.total > 0

    if (isFullyPaid) {
      onAlreadyPaidAlert?.()
      return
    }

    onSplitReservation?.(reservation)
  }

  async function handleSaveNoteClick() {
    if (!reservation || !isReady) {
      return
    }

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
      setSaveNoteSuccess(true)
    } catch (requestError) {
      setSaveNoteError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to save note'
      )
    } finally {
      setIsSavingNote(false)
    }
  }

  async function handleAddNewCustomer() {
    if (!canAddNewCustomer || isCreatingCustomer) {
      return
    }

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
      await applySavedCustomer(form)
    } catch (requestError) {
      setCreateCustomerError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to create customer'
      )
    } finally {
      setIsCreatingCustomer(false)
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

  function getSelectedCustomerDetails(): ReservationCustomerSearchCriteria {
    return searchCriteria
  }

  async function handleSaveReservation() {
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
    const saveTotals = calculateReservationTotals({
      sectionPrice: saveSection?.price ?? '$0.00',
      party: saveParty,
      passes,
      promo: savePromo
    })
    const savePaymentAmount =
      paymentAmountOverride ??
      formatReservationMoney(
        isEditMode
          ? Math.max(
            0,
            saveTotals.total -
            parseReservationMoney(reservation?.paid ?? '$0.00')
          )
          : saveTotals.total > 0
            ? saveTotals.total
            : 0
      )
    const editPaymentAmount = parseReservationMoney(savePaymentAmount)

    if (!saveSection || !activeShowTime) {
      return
    }

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
        paymentAmount: editPaymentAmount,
        paymentType,
        sectionShowPrice: saveSection.showPrice
      })
    const shouldApplyPayment = isEditMode
      ? reservationChanged
      : saveTotals.total > 0

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

    if (shouldApplyPayment && editPaymentAmount > 0) {
      const nextPaymentErrors = validateReservationPaymentFields({
        paymentType,
        fields: paymentFields,
        paymentAmount: savePaymentAmount,
        paymentRequired: true,
        disallowCash: origin === 'phone'
      })
      const paymentError = getFirstReservationPaymentError(nextPaymentErrors)

      if (paymentError) {
        setPaymentValidationErrors(nextPaymentErrors)
        return
      }
    }

    if (sectionsLoading) {
      setSaveReservationError(
        'Show sections are still loading. Please wait and try again.'
      )
      return
    }

    if (saveSection.showId !== activeShowTime) {
      setSaveReservationError(
        'Selected section does not match the show. Please select the show again.'
      )
      return
    }

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
      isReservationCheckedIn: isEditMode
        ? (reservation?.seated ?? 0) > 0
        : false
    }

    setIsSavingReservation(true)
    setSaveReservationError(null)

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

          await onSaved?.([reservation.id])
          onOpenChange(false)
          return
        }

        await updateReservation(
          buildUpdateReservationPaymentRequest({
            ...reservationParams,
            reservationId: reservation.id,
            paymentAmount: editPaymentAmount,
            paymentType,
            paymentFields,
            includeCustomerModel: false,
            isPaymentLoad: true,
            resSelectedPromotionId:
              origPromoIdRef.current === 'none'
                ? EMPTY_GUID
                : origPromoIdRef.current
          })
        )

        await onSaved?.([reservation.id])
        onOpenChange(false)
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
        showDate,
        showLabel: selectedShowLabel,
        locationName,
        qrValue: reservationId
      })

      await onSaved?.([reservationId], ticketData)
      onOpenChange(false)
    } catch (requestError) {
      const rawMessage =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to save reservation'
      setSaveReservationError(formatReservationPaymentError(rawMessage))
    } finally {
      setIsSavingReservation(false)
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

  useEffect(() => {
    if (!open) {
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
      setSaveReservationError(null)
      setPaymentValidationErrors({})
      setShowPartyRequiredError(false)
      setEditCustomerId(null)
      setTableNums('')
      setIsAssigningSeat(false)
      setAssignSeatError(null)
      setPaymentActionBusy(null)
      setPaymentActionError(null)
      setIsSavingNote(false)
      setSaveNoteError(null)
      setSaveNoteSuccess(false)
      setSelectedTransaction(null)
      origPartyRef.current = 0
      origShowIdRef.current = ''
      origSectionIdRef.current = ''
      origPromoIdRef.current = 'none'
      origOriginRef.current = 'phone'
      origPassesRef.current = 1
      origDinnerRef.current = false
      editPrefillDoneRef.current = false
      sectionsInitializedForShowRef.current = ''
      bookingFormCacheRef.current.clear()
      clearCustomerSearch()
      return
    }

    pendingPartyFocusRef.current = true

    if (!reservation) {
      setShowDate(initialShowDate ?? todayDateValue())
      setShowTime(initialShowTime ?? '')
    }
  }, [initialShowDate, initialShowTime, open, reservation])

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
    setAddCustomerInitialValues(null)
    setSearchRowSelection({})

    // The backend may not have committed the new customer record to the search
    // index by the time we immediately query, causing ReservationSearchCustomer
    // to return empty. Retry once after a short delay if the first attempt finds
    // no results (race condition between SaveCustomer and the search endpoint).
    let results = (await searchReservationCustomers(
      'customer',
      nextCriteria
    )) as ReservationCustomerSearchResult[]

    if (!results || results.length === 0) {
      await new Promise<void>(resolve => setTimeout(resolve, 800))
      results = (await searchReservationCustomers(
        'customer',
        nextCriteria
      )) as ReservationCustomerSearchResult[]
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
      status: ''
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
      status: ''
    }
  }, [customerToEdit, isEditMode, reservation, resolvedEditCustomerId])

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && (comicInfoOpen || isAddCustomerOpen)) {
            return
          }
          onOpenChange(nextOpen)
        }}
      >
        <TooltipProvider delayDuration={200}>
          <DialogContent
            ref={dialogContentRef}
            disableOutsideDismiss
            showCloseButton
            className='flex max-h-[82vh] w-[min(calc(100vw-2rem),84rem)] max-w-[84rem] flex-col overflow-hidden sm:max-w-[84rem]'
            onOpenAutoFocus={event => {
              event.preventDefault()
            }}
          >
            <DialogHeader className='shrink-0 border-b px-4 py-3'>
              <DialogTitle className='text-base font-semibold text-foreground'>
                Add Reservation
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
                    }}
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
                          onClick={handleSplitReservationClick}
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
                            onAssignSeat={() => void handleAssignSeat()}
                            isAssigning={isAssigningSeat}
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
                        paymentDisabled={isViewingTransaction}
                        showAuthFields={isViewingTransaction}
                        validationErrors={paymentValidationErrors}
                      />
                      {saveReservationError ? (
                        <p className='text-xs text-destructive'>
                          {saveReservationError}
                        </p>
                      ) : null}
                    </div>

                    {isEditMode && selectedTransaction ? (
                      <div className='shrink-0'>
                        <PaymentMetadataBlock
                          createdBy={reservation?.createdBy ?? ''}
                          status={reservation?.resStatus ?? ''}
                          createDate={reservation?.createdDt ?? ''}
                          authorization={selectedTransaction.authorization}
                          pnref={selectedTransaction.pnref}
                          busyAction={paymentActionBusy}
                          error={paymentActionError}
                          onRefund={handleRefundClick}
                          onVoid={handleVoidClick}
                          onClear={handleClearTransactionSelection}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className='shrink-0 border-t border-border/50 pt-3 pb-1'>
                    <ReservationPaymentActions
                      onCancel={() => onOpenChange(false)}
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
                              onClick={handleSplitReservationClick}
                            >
                              Split Party
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                reservation ? onReprintTicket?.(reservation) : undefined
                              }
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
        onOpenChange={open => {
          setIsAddCustomerOpen(open)
          if (!open) {
            setAddCustomerInitialValues(null)
          }
        }}
        nested
        onBack={() => {
          setIsAddCustomerOpen(false)
          setAddCustomerInitialValues(null)
        }}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        customer={customerForEditDialog}
        initialValues={addCustomerInitialValues}
        onSaved={applySavedCustomer}
      />
    </>
  )
}






