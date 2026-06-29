import {
  Calendar,
  Info,
  Search,
  UserPlus,
  X,
  type LucideIcon
} from 'lucide-react'
import type { FocusEvent, RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'

import {
  IconActionButton
} from '@/components/forms/form-fields'
import { ShowTimePicker } from '@/components/common/show-time-picker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import type { ReservationCustomerSearchResult } from '@/data/reservation-search-results'
import { AddCustomerDialog } from '@/features/customers/add-customer-dialog'
import {
  ReservationPaymentActions,
  ReservationPaymentPanel,
} from '@/features/reservations/reservation-payment-panel'
import { ReservationSearchResultsTable } from '@/features/reservations/reservation-search-results-table'
import { useCachedReservationShowData } from '@/hooks/use-cached-reservation-show-data'
import { useReservationCustomerSearch } from '@/hooks/use-reservation-customer-search'
import { useShowDetailsByDate } from '@/hooks/use-show-details-by-date'
import {
  calculateReservationTotals,
  formatReservationMoney,
  getReservationAmountDue,
  parseReservationMoney
} from '@/lib/calculate-reservation-totals'
import {
  EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA,
  hasCompleteNewCustomerCriteria,
  hasReservationCustomerSearchCriteria,
  type ReservationCustomerSearchCriteria
} from '@/lib/reservation-customer-search-criteria'
import { saveCustomer } from '@/lib/api/customers'
import { saveReservation, updateReservation } from '@/lib/api/reservations'
import {
  buildSaveReservationOnlyRequest,
  buildUpdateReservationPaymentRequest
} from '@/lib/build-save-reservation-request'
import { mapReservationSearchCriteriaToCustomerForm } from '@/lib/map-reservation-search-to-customer-form'
import { resolveReservationBooking } from '@/lib/resolve-reservation-booking'
import { validateReservationParty } from '@/lib/validate-reservation-party'
import { validateReservationPayment } from '@/lib/validate-reservation-payment'
import { todayDateValue } from '@/lib/today-date-value'
import { cn } from '@/lib/utils'
import { useAppSession } from '@/hooks/use-app-session'
import { createTicketPrintData } from '@/services/ticket-print.service'
import type { CustomerFormValues } from '@/types/customer-form'
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
import type { TicketPrintData } from '@/types/ticket-print'

type AddReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (
    reservationIds: string[],
    ticketData?: TicketPrintData
  ) => void | Promise<void>
}

const COMPACT_INPUT = 'h-9 text-sm'
const COMPACT_FIELD_HOVER = 'hover:border-ring/60 hover:bg-accent/15'
const COMPACT_NUMBER = `h-9 w-14 px-1 text-center text-sm tabular-nums ${COMPACT_FIELD_HOVER} focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40`
const COMPACT_SELECT = 'h-9 w-44 min-w-0 text-sm'
const INLINE_LABEL = 'mb-1.5 block text-xs font-medium text-muted-foreground'

const RESERVATION_LINE_META = [
  { key: 'sub', label: 'Subtotal', info: null },
  { key: 'svc', label: 'Service Charge', info: 'Service charge applied per ticket' },
  { key: 'disc', label: 'Discount', info: null },
  { key: 'tax', label: 'Tax', info: 'Sales tax on this reservation' }
] as const

const ORIGIN_OPTIONS = [
  { id: 'walkup', label: 'Walk-in' },
  { id: 'phone', label: 'Phone-in' }
] as const

type CustomerSearchCriteria = ReservationCustomerSearchCriteria

const EMPTY_CUSTOMER_SEARCH_CRITERIA = EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA

function hasCustomerSearchCriteria (
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

function SectionSeatDisplay ({ option }: { option: SectionOption }) {
  return (
    <div className='flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm tabular-nums max-sm:col-start-2 max-sm:row-start-2 sm:ml-auto sm:shrink-0'>
      <span className='shrink-0 tabular-nums text-foreground'>
        {formatSectionDesktopPrice(option.price)}
      </span>

      <span className='inline-flex items-center gap-x-0.5 whitespace-nowrap sm:min-w-[4.25rem]'>
        <span className={SECTION_SEAT_STYLES.seatsLabel}>Seats:</span>
        <span className={SECTION_SEAT_STYLES.seatsValue}>{option.seats}</span>
      </span>

      <span className='text-border'>|</span>

      <span className='inline-flex items-center gap-x-0.5 whitespace-nowrap sm:min-w-[5.5rem]'>
        <span className={SECTION_SEAT_STYLES.availableLabel}>Available:</span>
        <span className={SECTION_SEAT_STYLES.availableValue}>
          {option.available}
        </span>
      </span>
    </div>
  )
}

function selectNumericInput (event: FocusEvent<HTMLInputElement>) {
  event.target.select()
}

function SectionPicker ({
  sections,
  sectionsLoading,
  section,
  onSectionChange,
  partyBySection,
  onPartyChange,
  partyError,
  promo,
  onPromoChange,
  promoOptions,
  promoLoading,
  passes,
  onPassesChange
}: {
  sections: ReservationSectionOption[]
  sectionsLoading?: boolean
  section: string
  onSectionChange: (value: string) => void
  partyBySection: Record<string, number>
  onPartyChange: (sectionId: string, value: number) => void
  partyError?: string | null
  promo: string
  onPromoChange: (value: string) => void
  promoOptions: ReservationPromoOption[]
  promoLoading?: boolean
  passes: number
  onPassesChange: (value: number) => void
}) {
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

  return (
    <div>
      <span className={INLINE_LABEL}>Section</span>
      <RadioGroup
        value={section}
        onValueChange={onSectionChange}
        className='gap-0'
      >
        <div className='overflow-hidden rounded-lg border border-border/60 divide-y divide-border/50'>
          {sections.map(option => (
            <div
              key={option.id}
              className='flex items-start gap-2 px-2.5 py-1.5'
            >
              <label
                htmlFor={`section-${option.id}`}
                className='flex min-w-0 flex-1 cursor-pointer items-start gap-2 max-sm:grid max-sm:grid-cols-[auto_minmax(0,1fr)] max-sm:items-center max-sm:gap-x-2 max-sm:gap-y-1'
              >
                <RadioGroupItem
                  value={option.id}
                  id={`section-${option.id}`}
                  className='shrink-0 max-sm:row-span-2 max-sm:self-center'
                />
                <span className='min-w-0 text-sm font-semibold leading-tight text-foreground whitespace-normal max-sm:col-start-2 max-sm:row-start-1 sm:min-w-[10rem] sm:max-w-[11rem]'>
                  {option.name}
                </span>
                <SectionSeatDisplay option={option} />
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type='number'
                    min={0}
                    value={partyBySection[option.id] ?? 0}
                    onChange={event =>
                      onPartyChange(option.id, Number(event.target.value) || 0)
                    }
                    onFocus={selectNumericInput}
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
            onValueChange={onPromoChange}
            disabled={promoLoading}
          >
            <SelectTrigger className={cn(COMPACT_SELECT, COMPACT_FIELD_HOVER, 'w-full min-w-0 sm:w-44')}>
              <SelectValue
                placeholder={
                  promoLoading ? 'Loading promo codes...' : 'Select promo code'
                }
              />
            </SelectTrigger>
            <SelectContent>
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
              type='number'
              min={0}
              value={passes}
              onChange={event =>
                onPassesChange(Math.max(0, Number(event.target.value) || 0))
              }
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

function formatShowDate (dateValue: string) {
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

function TotalsBreakdown ({
  selectedSection,
  partySize,
  totals,
  amountDue
}: {
  selectedSection: ReservationSectionOption | null
  partySize: number
  totals: ReturnType<typeof calculateReservationTotals>
  amountDue: string
}) {
  const lineValues: Record<
    (typeof RESERVATION_LINE_META)[number]['key'],
    string
  > = {
    sub: formatReservationMoney(totals.subtotal),
    svc: formatReservationMoney(totals.serviceCharge),
    disc: formatReservationMoney(totals.discount),
    tax: formatReservationMoney(totals.taxes)
  }

  return (
    <div className='space-y-2.5 text-sm'>
      {selectedSection ? (
        <div className='flex items-center justify-between gap-6'>
          <span className='text-muted-foreground'>
            Tickets ({selectedSection.name} x {partySize})
          </span>
          <span className='shrink-0 font-medium tabular-nums'>
            {formatReservationMoney(
              parseReservationMoney(selectedSection.price) * partySize
            )}
          </span>
        </div>
      ) : (
        <div className='flex items-center justify-between gap-6'>
          <span className='text-muted-foreground'>Tickets</span>
          <span className='shrink-0 font-medium tabular-nums'>$0.00</span>
        </div>
      )}

      {RESERVATION_LINE_META.slice(1).map(line => (
        <div
          key={line.key}
          className='flex items-center justify-between gap-6'
        >
          <span className='inline-flex items-center gap-1 text-muted-foreground'>
            {line.label}
            {line.info ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    className='text-muted-foreground/60 hover:text-foreground'
                    aria-label={`About ${line.label}`}
                  >
                    <Info className='size-3.5' />
                  </button>
                </TooltipTrigger>
                <TooltipContent side='top'>{line.info}</TooltipContent>
              </Tooltip>
            ) : null}
          </span>
          <span className='shrink-0 font-medium tabular-nums'>
            {lineValues[line.key]}
          </span>
        </div>
      ))}

      <div className='space-y-2 border-t border-border/50 pt-2'>
        <div className='flex items-center justify-between gap-4'>
          <span className='text-sm font-medium text-red-600'>Amount Due</span>
          <span className='shrink-0 text-sm font-bold tabular-nums text-red-600'>
            {amountDue}
          </span>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='font-semibold'>Total</span>
          <span className='shrink-0 text-base font-bold tabular-nums'>
            {formatReservationMoney(totals.total)}
          </span>
        </div>
      </div>
    </div>
  )
}

function InlineRadioGroup ({
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
          <RadioGroupItem value={option.id} id={`${name}-${option.id}`} />
          <span className='text-foreground'>{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  )
}

function OriginSegmentedControl ({
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

function BookingOptionsBar ({
  shows,
  showTime,
  onShowTimeChange,
  dinner,
  onDinnerChange,
  showsLoading
}: {
  shows: typeof showOptions
  showTime: string
  onShowTimeChange: (value: string) => void
  dinner: boolean
  onDinnerChange: (value: boolean) => void
  showsLoading: boolean
}) {
  return (
    <div className='min-w-0'>
      <span className={INLINE_LABEL}>Show / Time</span>
      <div className='flex min-w-0 items-center gap-2 overflow-hidden'>
        {showsLoading ? (
          <span className='text-xs text-muted-foreground'>Loading shows...</span>
        ) : shows.length > 0 ? (
          <ShowTimePicker
            shows={shows}
            showTime={showTime}
            onShowTimeChange={onShowTimeChange}
          />
        ) : (
          <span className='text-xs text-muted-foreground'>
            No shows for this date
          </span>
        )}

        <label className='flex shrink-0 cursor-pointer items-center gap-2 text-sm whitespace-nowrap'>
          <Checkbox
            id='dinner'
            checked={dinner}
            onCheckedChange={checked => onDinnerChange(Boolean(checked))}
          />
          Dinner
        </label>
      </div>
    </div>
  )
}

function CustomerSearchHeader ({
  searchType,
  onSearchTypeChange,
  onSearch,
  onClear,
  onAddCustomer
}: {
  searchType: 'customer' | 'business'
  onSearchTypeChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
  onAddCustomer: () => void
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
          onClick={onSearch}
        />
        <IconActionButton
          label={isBusiness ? 'Add Business' : 'Add Customer'}
          icon={UserPlus}
          onClick={isBusiness ? undefined : onAddCustomer}
        />
        <IconActionButton label='Clear' icon={X} variant='outline' onClick={onClear} />
      </div>
    </div>
  )
}

function CustomerSearchFields ({
  searchType,
  criteria,
  onCriteriaChange,
  onFieldBlur
}: {
  searchType: 'customer' | 'business'
  criteria: CustomerSearchCriteria
  onCriteriaChange: (criteria: CustomerSearchCriteria) => void
  onFieldBlur: () => void
}) {
  const inputClass = cn('w-full', COMPACT_INPUT)

  function updateField (field: keyof CustomerSearchCriteria, value: string) {
    onCriteriaChange({ ...criteria, [field]: value })
  }

  const fieldProps = {
    onBlur: onFieldBlur,
    className: inputClass
  }

  if (searchType === 'business') {
    return (
      <div className='grid grid-cols-2 gap-x-2 gap-y-2'>
        <Input
          placeholder='Business Name'
          value={criteria.businessName}
          onChange={event => updateField('businessName', event.target.value)}
          {...fieldProps}
        />
        <Input
          placeholder='Last Name'
          value={criteria.lastName}
          onChange={event => updateField('lastName', event.target.value)}
          {...fieldProps}
        />
        <Input
          placeholder='First Name'
          value={criteria.firstName}
          onChange={event => updateField('firstName', event.target.value)}
          {...fieldProps}
        />
        <Input
          type='tel'
          placeholder='Phone No.'
          value={criteria.phoneNo}
          onChange={event => updateField('phoneNo', event.target.value)}
          {...fieldProps}
        />
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-x-2 gap-y-2'>
      <Input
        placeholder='Last Name'
        value={criteria.lastName}
        onChange={event => updateField('lastName', event.target.value)}
        {...fieldProps}
      />
      <Input
        placeholder='First Name'
        value={criteria.firstName}
        onChange={event => updateField('firstName', event.target.value)}
        {...fieldProps}
      />
      <Input
        type='tel'
        placeholder='Phone No.'
        value={criteria.phoneNo}
        onChange={event => updateField('phoneNo', event.target.value)}
        {...fieldProps}
      />
      <Input
        type='email'
        placeholder='Email'
        value={criteria.email}
        onChange={event => updateField('email', event.target.value)}
        {...fieldProps}
      />
    </div>
  )
}

function MetaIconButton ({
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

function ShowMetaRow ({
  comicName,
  showDate,
  onShowDateChange,
  shows,
  showTime,
  onShowTimeChange,
  origin,
  onOriginChange,
  onOpenComicInfo,
  dateInputRef,
  onOpenDatePicker,
  dinner,
  onDinnerChange,
  showsLoading
}: {
  comicName: string
  showDate: string
  onShowDateChange: (value: string) => void
  shows: typeof showOptions
  showTime: string
  onShowTimeChange: (value: string) => void
  origin: string
  onOriginChange: (value: string) => void
  onOpenComicInfo: () => void
  dateInputRef: RefObject<HTMLInputElement | null>
  onOpenDatePicker: () => void
  dinner: boolean
  onDinnerChange: (value: boolean) => void
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

        <div className='inline-flex items-center gap-1'>
          <span className='text-sm text-muted-foreground'>
            {formatShowDate(showDate)}
          </span>
          <MetaIconButton
            label='Change show date'
            icon={Calendar}
            onClick={onOpenDatePicker}
          />
          <input
            ref={dateInputRef}
            type='date'
            value={showDate}
            onChange={event => onShowDateChange(event.target.value)}
            className='sr-only'
            tabIndex={-1}
            aria-hidden
          />
        </div>

        <OriginSegmentedControl
          value={origin}
          onChange={onOriginChange}
        />
      </div>

      <BookingOptionsBar
        shows={shows}
        showTime={showTime}
        onShowTimeChange={onShowTimeChange}
        dinner={dinner}
        onDinnerChange={onDinnerChange}
        showsLoading={showsLoading}
      />
    </div>
  )
}

export function AddReservationDialog ({
  open,
  onOpenChange,
  onSaved
}: AddReservationDialogProps) {
  const { connectionName, locationId, locationName, username, userRight, isReady } =
    useAppSession()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const notesInputRef = useRef<HTMLTextAreaElement>(null)
  const sectionsInitializedForShowRef = useRef('')
  const bookingFormCacheRef = useRef<
    Map<
      string,
      {
        section: string
        partyBySection: Record<string, number>
        promo: string
      }
    >
  >(new Map())
  const [searchType, setSearchType] = useState<'customer' | 'business'>(
    'customer'
  )
  const [specialNotesOpen, setSpecialNotesOpen] = useState(true)
  const [notes, setNotes] = useState('')
  const [dinner, setDinner] = useState(false)
  const [showDate, setShowDate] = useState(todayDateValue)
  const [showTime, setShowTime] = useState(showOptions[0]?.id ?? '')
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
  const [paymentSaveError, setPaymentSaveError] = useState<string | null>(null)
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

  const availableShows = apiShows.length > 0 ? apiShows : showOptions

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
  }, [open, activeShowTime, availableSections, sectionsLoading])

  useEffect(() => {
    if (!open || showsLoading) {
      return
    }

    if (availableShows.length === 0) {
      setShowTime('')
      return
    }

    if (!availableShows.some(show => show.id === showTime)) {
      setShowTime(availableShows[0].id)
    }
  }, [open, availableShows, showsLoading, showTime])

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

  const partyValidationError = selectedSection
    ? validateReservationParty(partySize, selectedSection.available, {
        requirePositive: showPartyRequiredError
      })
    : null

  const partyIsValid =
    partySize > 0 &&
    selectedSection != null &&
    partySize <= selectedSection.available

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

  const paymentRequired = totals.total > 0
  const defaultPaymentAmount = formatReservationMoney(
    paymentRequired ? totals.total : 0
  )
  const paymentAmount = paymentAmountOverride ?? defaultPaymentAmount

  const amountDueValue = getReservationAmountDue(
    totals.total,
    parseReservationMoney(paymentAmount)
  )
  const amountDue = formatReservationMoney(amountDueValue)

  const selectedCustomerId = useMemo(() => {
    const selectedId = Object.keys(searchRowSelection).find(
      key => searchRowSelection[key]
    )
    return selectedId ?? null
  }, [searchRowSelection])

  const canSave =
    Boolean(selectedCustomerId) &&
    Boolean(activeShowTime) &&
    Boolean(selectedSection) &&
    partyIsValid &&
    !sectionsLoading &&
    !isSavingReservation &&
    (!paymentRequired || parseReservationMoney(paymentAmount) > 0)

  const canAddNewCustomer =
    searchType === 'customer' &&
    hasCompleteNewCustomerCriteria(searchCriteria)

  function openAddCustomerDialog (initialValues: CustomerFormValues | null = null) {
    setAddCustomerInitialValues(initialValues)
    setIsAddCustomerOpen(true)
  }

  async function handleAddNewCustomer () {
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

  function handleFillMoreDetails () {
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

  function handlePaymentTypeChange (value: ReservationPaymentType) {
    setPaymentType(value)
    setPaymentFields(createEmptyReservationPaymentFields())
    setPaymentSaveError(null)
  }

  function updatePaymentField<K extends keyof ReservationPaymentFields> (
    key: K,
    value: ReservationPaymentFields[K]
  ) {
    setPaymentFields(current => ({ ...current, [key]: value }))
    setPaymentSaveError(null)
  }

  function getSelectedCustomerDetails () {
    if (searchType === 'business') {
      const match = businessSearchResults.find(
        result => result.id === selectedCustomerId
      )

      return {
        lastName: match?.lastName ?? searchCriteria.lastName,
        firstName: match?.firstName ?? searchCriteria.firstName,
        email: '',
        phoneNo: match?.phoneNo ?? searchCriteria.phoneNo,
        businessName: match?.businessName ?? searchCriteria.businessName
      }
    }

    const match = customerSearchResults.find(
      result => result.id === selectedCustomerId
    )

    return {
      lastName: match?.lastName ?? searchCriteria.lastName,
      firstName: match?.firstName ?? searchCriteria.firstName,
      email: match?.email ?? searchCriteria.email,
      phoneNo: match?.phoneNo ?? searchCriteria.phoneNo,
      businessName: ''
    }
  }

  async function handleSaveReservation () {
    if (!selectedCustomerId || isSavingReservation) {
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
      formatReservationMoney(saveTotals.total > 0 ? saveTotals.total : 0)
    const shouldApplyPayment = saveTotals.total > 0

    if (!saveSection || !activeShowTime) {
      return
    }

    setShowPartyRequiredError(true)
    setSaveReservationError(null)
    setPaymentSaveError(null)

    const partyError = validateReservationParty(
      saveParty,
      saveSection.available,
      { requirePositive: true }
    )

    if (partyError) {
      return
    }

    if (shouldApplyPayment) {
      const paymentError = validateReservationPayment({
        paymentType,
        fields: paymentFields,
        paymentAmount: savePaymentAmount,
        paymentRequired: shouldApplyPayment
      })

      if (paymentError) {
        setPaymentSaveError(paymentError)
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
      customerId: selectedCustomerId,
      searchCriteria: {
        ...searchCriteria,
        ...customerDetails
      },
      selectedSection: saveSection,
      origin,
      party: saveParty,
      passes,
      promo: savePromo,
      totals: saveTotals,
      notes,
      dinner
    }

    setIsSavingReservation(true)
    setSaveReservationError(null)

    try {
      const reservationIds = await saveReservation(
        buildSaveReservationOnlyRequest(reservationParams)
      )
      const reservationId = reservationIds[0]

      if (!reservationId) {
        throw new Error('Reservation was created but no reservation id was returned.')
      }

      if (shouldApplyPayment) {
        await updateReservation(
          buildUpdateReservationPaymentRequest({
            ...reservationParams,
            reservationId,
            paymentAmount: parseReservationMoney(savePaymentAmount),
            paymentType,
            paymentFields
          })
        )
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
      setSaveReservationError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to save reservation'
      )
    } finally {
      setIsSavingReservation(false)
    }
  }

  async function selectSavedCustomer (
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

  function handleReservationInputChange () {
    setPaymentAmountOverride(null)
  }

  function persistCurrentBookingForm (showId: string) {
    if (!showId) {
      return
    }

    bookingFormCacheRef.current.set(showId, {
      section,
      partyBySection: { ...partyBySection },
      promo
    })
  }

  function clearBookingFormCaches () {
    bookingFormCacheRef.current.clear()
    sectionsInitializedForShowRef.current = ''
  }

  function resetBookingForDateChange () {
    clearBookingFormCaches()
    handleReservationInputChange()
    setSection('')
    setPartyBySection({})
    setShowPartyRequiredError(false)
    setPromo('none')
  }

  function handleShowTimeChange (value: string) {
    if (value === activeShowTime) {
      return
    }

    persistCurrentBookingForm(activeShowTime)
    handleReservationInputChange()
    setShowTime(value)
  }

  function handlePaymentAmountChange (value: string) {
    setPaymentAmountOverride(value)
    setPaymentSaveError(null)
  }

  function clearCustomerSearch () {
    clearReservationCustomerSearch()
    setSearchRowSelection({})
    setSearchCriteria(EMPTY_CUSTOMER_SEARCH_CRITERIA)
    setCreateCustomerError(null)
  }

  function handleCustomerSearch () {
    if (!hasCustomerSearchCriteria(searchType, searchCriteria)) {
      clearCustomerSearch()
      return
    }

    setSearchRowSelection({})
    setCreateCustomerError(null)
    void searchReservationCustomers(searchType, searchCriteria)
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
      setShowTime(showOptions[0]?.id ?? '')
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
      setPaymentSaveError(null)
      setShowPartyRequiredError(false)
      sectionsInitializedForShowRef.current = ''
      bookingFormCacheRef.current.clear()
      clearCustomerSearch()
      return
    }

    setShowDate(todayDateValue())
  }, [open])

  useEffect(() => {
    clearCustomerSearch()
  }, [searchType])

  useEffect(() => {
    if (specialNotesOpen) {
      notesInputRef.current?.focus()
    }
  }, [specialNotesOpen])

  function openDatePicker () {
    const input = dateInputRef.current
    if (!input) return

    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
        return
      } catch {
        // Fall through to click() if showPicker is blocked.
      }
    }

    input.click()
  }

  function setSectionParty (sectionId: string, value: number) {
    handleReservationInputChange()
    setShowPartyRequiredError(false)

    if (value > 0) {
      setSection(sectionId)
    }

    setPartyBySection(current => ({
      ...current,
      [sectionId]: Math.max(0, value)
    }))
  }

  async function applySavedCustomer (customer: CustomerFormValues) {
    const { area, prefix, line } = customer.phone
    const nextCriteria = {
      lastName: customer.lastName,
      firstName: customer.firstName,
      phoneNo: [area, prefix, line].filter(Boolean).join(''),
      email: customer.email,
      businessName: ''
    }
    setSearchType('customer')
    setSearchCriteria(nextCriteria)
    setIsAddCustomerOpen(false)
    setAddCustomerInitialValues(null)
    setSearchRowSelection({})
    const results = (await searchReservationCustomers(
      'customer',
      nextCriteria
    )) as ReservationCustomerSearchResult[]
    await selectSavedCustomer(customer, results ?? [])
  }

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
            disableOutsideDismiss
            showCloseButton={false}
            className='flex max-h-[82vh] w-[min(96vw,72rem)] max-w-none flex-col overflow-hidden sm:max-w-none'
          >
            <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
              <DialogTitle className='text-base font-semibold text-foreground'>
                Add Reservation
              </DialogTitle>
              <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
                <X className='size-4' />
                <span className='sr-only'>Close</span>
              </DialogClose>
            </DialogHeader>

            <div className='min-h-0 flex-1 overflow-y-auto px-4 py-2 pb-3'>
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
                      origin={origin}
                      onOriginChange={id => {
                        handleReservationInputChange()
                        setOrigin(id as (typeof ORIGIN_OPTIONS)[number]['id'])
                      }}
                      onOpenComicInfo={() => setComicInfoOpen(true)}
                      dateInputRef={dateInputRef}
                      onOpenDatePicker={openDatePicker}
                      dinner={dinner}
                      onDinnerChange={setDinner}
                      showsLoading={showsLoading}
                    />

                    <SectionPicker
                      sections={availableSections}
                      sectionsLoading={sectionsLoading}
                      section={section}
                      onSectionChange={value => {
                        handleReservationInputChange()
                        setSection(value)
                      }}
                      partyBySection={partyBySection}
                      onPartyChange={setSectionParty}
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
                    />

                    <div className='rounded-lg border border-border/60 p-2.5'>
                      {sectionsError || promosError ? (
                        <p className='mb-2 text-xs text-destructive'>
                          {sectionsError ?? promosError}
                        </p>
                      ) : null}
                      <TotalsBreakdown
                        selectedSection={selectedSection}
                        partySize={partySize}
                        totals={totals}
                        amountDue={amountDue}
                      />
                    </div>
                  </div>

                  <div className='flex min-w-0 flex-col gap-3 border-t border-border/50 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4'>
                    <div className='flex flex-col gap-2.5'>
                      <div className='shrink-0'>
                        <CustomerSearchHeader
                          searchType={searchType}
                          onSearchTypeChange={value =>
                            setSearchType(value as 'customer' | 'business')
                          }
                          onSearch={handleCustomerSearch}
                          onClear={clearCustomerSearch}
                          onAddCustomer={() => openAddCustomerDialog()}
                        />
                      </div>

                      <div className='shrink-0'>
                        <CustomerSearchFields
                          searchType={searchType}
                          criteria={searchCriteria}
                          onCriteriaChange={setSearchCriteria}
                          onFieldBlur={handleCustomerSearch}
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
                          />
                        </div>
                      ) : null}

                      <div className='w-full shrink-0 space-y-2'>
                        <div className='flex justify-end'>
                          <Button
                            type='button'
                            variant='link'
                            size='sm'
                            className='h-auto px-0 pt-0 text-sm font-normal underline'
                            onClick={() => setSpecialNotesOpen(current => !current)}
                            aria-expanded={specialNotesOpen}
                          >
                            Special Notes
                          </Button>
                        </div>

                        {specialNotesOpen ? (
                          <Textarea
                            ref={notesInputRef}
                            value={notes}
                            onChange={event => setNotes(event.target.value)}
                            placeholder='Enter notes or special requests...'
                            className='min-h-20 w-full resize-y text-sm shadow-xs'
                          />
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
                          paymentDisabled={!paymentRequired}
                        />
                        {paymentSaveError || saveReservationError ? (
                          <p className='text-xs text-destructive'>
                            {paymentSaveError ?? saveReservationError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className='shrink-0 border-t border-border/50 pt-3 pb-1'>
                      <ReservationPaymentActions
                        onCancel={() => onOpenChange(false)}
                        onSave={() => void handleSaveReservation()}
                        saveDisabled={!canSave}
                        saving={isSavingReservation}
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
        initialValues={addCustomerInitialValues}
        onSaved={applySavedCustomer}
      />
    </>
  )
}






