import {
  Calendar,
  Info,
  Search,
  UserPlus,
  X,
  type LucideIcon
} from 'lucide-react'
import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'

import {
  IconActionButton
} from '@/components/forms/form-fields'
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
  promoOptions,
  sectionOptions,
  showOptions,
  formatSectionDesktopPrice,
} from '@/data/reservation'
import {
  reservationBusinessSearchResults,
  reservationCustomerSearchResults,
  type ReservationBusinessSearchResult,
  type ReservationCustomerSearchResult
} from '@/data/reservation-search-results'
import { ComicInfoDialog } from '@/features/reservations/comic-info-dialog'
import {
  ReservationPaymentActions,
  ReservationPaymentPanel,
} from '@/features/reservations/reservation-payment-panel'
import { ReservationSearchResultsTable } from '@/features/reservations/reservation-search-results-table'
import { cn } from '@/lib/utils'
import type { SectionOption } from '@/types/reservation'

type AddReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COMPACT_INPUT = 'h-9 text-sm'
const COMPACT_NUMBER = 'h-9 w-14 px-1 text-center text-sm tabular-nums'
const COMPACT_SELECT = 'h-9 w-44 min-w-0 text-sm'
const INLINE_LABEL = 'mb-1.5 block text-xs font-medium text-muted-foreground'

const RESERVATION_LINES = [
  { key: 'sub', label: 'Subtotal', value: '$0.00', info: null },
  { key: 'svc', label: 'Service Charge', value: '$0.00', info: 'Service charge applied per ticket' },
  { key: 'disc', label: 'Discount', value: '$0.00', info: null },
  { key: 'tax', label: 'Tax', value: '$0.00', info: 'Sales tax on this reservation' }
] as const

const ORIGIN_OPTIONS = [
  { id: 'walkup', label: 'Walk-in' },
  { id: 'phone', label: 'Phone-in' }
] as const

type CustomerSearchCriteria = {
  lastName: string
  firstName: string
  phoneNo: string
  email: string
  businessName: string
}

const EMPTY_CUSTOMER_SEARCH_CRITERIA: CustomerSearchCriteria = {
  lastName: '',
  firstName: '',
  phoneNo: '',
  email: '',
  businessName: ''
}

function hasCustomerSearchCriteria (
  searchType: 'customer' | 'business',
  criteria: CustomerSearchCriteria
) {
  if (searchType === 'business') {
    return [
      criteria.businessName,
      criteria.lastName,
      criteria.firstName,
      criteria.phoneNo
    ].some(value => value.trim().length > 0)
  }

  return [
    criteria.lastName,
    criteria.firstName,
    criteria.phoneNo,
    criteria.email
  ].some(value => value.trim().length > 0)
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

function SectionPicker ({
  section,
  onSectionChange,
  partyBySection,
  onPartyChange,
  promo,
  onPromoChange,
  passes,
  onPassesChange
}: {
  section: string
  onSectionChange: (value: string) => void
  partyBySection: Record<string, number>
  onPartyChange: (sectionId: string, value: number) => void
  promo: string
  onPromoChange: (value: string) => void
  passes: number
  onPassesChange: (value: number) => void
}) {
  return (
    <div>
      <span className={INLINE_LABEL}>Section</span>
      <RadioGroup
        value={section}
        onValueChange={onSectionChange}
        className='gap-0'
      >
        <div className='overflow-hidden rounded-lg border border-border/60 divide-y divide-border/50'>
          {sectionOptions.map(option => (
            <div
              key={option.id}
              className='flex items-center gap-2 px-2.5 py-1.5'
            >
              <label
                htmlFor={`section-${option.id}`}
                className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 max-sm:grid max-sm:grid-cols-[auto_minmax(0,1fr)] max-sm:items-center max-sm:gap-x-2 max-sm:gap-y-1'
              >
                <RadioGroupItem
                  value={option.id}
                  id={`section-${option.id}`}
                  className='shrink-0 max-sm:row-span-2 max-sm:self-center'
                />
                <span className='shrink-0 text-sm font-semibold text-foreground max-sm:col-start-2 max-sm:row-start-1 sm:w-14'>
                  {option.name}
                </span>
                <SectionSeatDisplay option={option} />
              </label>
              <Input
                type='number'
                min={1}
                value={partyBySection[option.id] ?? 2}
                onChange={event =>
                  onPartyChange(option.id, Number(event.target.value) || 1)
                }
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
                className={cn(COMPACT_NUMBER, 'shrink-0 self-center')}
                aria-label={`${option.name} party size`}
              />
            </div>
          ))}
        </div>
      </RadioGroup>

      <div className='mt-2 flex flex-wrap items-center gap-2'>
        <div className='min-w-0 flex-1 sm:flex-initial sm:shrink-0'>
          <span className='sr-only'>Promo Code (Optional)</span>
          <Select value={promo} onValueChange={onPromoChange}>
            <SelectTrigger className={cn(COMPACT_SELECT, 'w-full min-w-0 sm:w-44')}>
              <SelectValue placeholder='Select promo code' />
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
  sections,
  partyBySection,
  total,
  amountDue
}: {
  sections: string[]
  partyBySection: Record<string, number>
  total: string
  amountDue: string
}) {
  const selectedSections = sectionOptions.filter(option =>
    sections.includes(option.id)
  )

  return (
    <div className='space-y-2.5 text-sm'>
      {selectedSections.length > 0 ? (
        selectedSections.map(option => (
          <div
            key={option.id}
            className='flex items-center justify-between gap-6'
          >
            <span className='text-muted-foreground'>
              Tickets ({option.name} x {partyBySection[option.id] ?? 1})
            </span>
            <span className='shrink-0 font-medium tabular-nums'>$0.00</span>
          </div>
        ))
      ) : (
        <div className='flex items-center justify-between gap-6'>
          <span className='text-muted-foreground'>Tickets</span>
          <span className='shrink-0 font-medium tabular-nums'>$0.00</span>
        </div>
      )}

      {RESERVATION_LINES.slice(1).map(line => (
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
          <span className='shrink-0 font-medium tabular-nums'>{line.value}</span>
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
            {total}
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

function ShowTimePicker ({
  showTime,
  onShowTimeChange
}: {
  showTime: string
  onShowTimeChange: (value: string) => void
}) {
  return (
    <div className='flex w-auto shrink-0 items-stretch gap-1.5'>
      {showOptions.map(show => {
        const isSelected = showTime === show.id

        return (
          <button
            key={show.id}
            type='button'
            title={show.label}
            onClick={() => onShowTimeChange(show.id)}
            className={cn(
              'flex w-[6.75rem] shrink-0 flex-col rounded-lg px-2.5 py-2 text-left transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'border border-border/60 bg-background text-foreground hover:bg-muted/30'
            )}
          >
            <span className='truncate text-sm font-semibold'>
              {show.time ?? show.label}
            </span>
            <span
              className={cn(
                'truncate text-xs',
                isSelected
                  ? 'text-primary-foreground/85'
                  : 'text-muted-foreground'
              )}
            >
              {show.subtitle ?? 'Main Theater'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function BookingOptionsBar ({
  showTime,
  onShowTimeChange
}: {
  showTime: string
  onShowTimeChange: (value: string) => void
}) {
  return (
    <div className='min-w-0'>
      <span className={INLINE_LABEL}>Show / Time</span>
      <div className='flex min-w-0 items-center gap-2 overflow-hidden'>
        <ShowTimePicker
          showTime={showTime}
          onShowTimeChange={onShowTimeChange}
        />

        <label className='flex shrink-0 cursor-pointer items-center gap-2 text-sm whitespace-nowrap'>
          <Checkbox id='dinner' />
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
  onClear
}: {
  searchType: 'customer' | 'business'
  onSearchTypeChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
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
        />
        <IconActionButton label='Clear' icon={X} variant='outline' onClick={onClear} />
      </div>
    </div>
  )
}

function CustomerSearchFields ({
  searchType,
  criteria,
  onCriteriaChange
}: {
  searchType: 'customer' | 'business'
  criteria: CustomerSearchCriteria
  onCriteriaChange: (criteria: CustomerSearchCriteria) => void
}) {
  const inputClass = cn('w-full', COMPACT_INPUT)

  function updateField (field: keyof CustomerSearchCriteria, value: string) {
    onCriteriaChange({ ...criteria, [field]: value })
  }

  if (searchType === 'business') {
    return (
      <div className='grid grid-cols-2 gap-x-2 gap-y-2'>
        <Input
          placeholder='Business Name'
          value={criteria.businessName}
          onChange={event => updateField('businessName', event.target.value)}
          className={inputClass}
        />
        <Input
          placeholder='Last Name'
          value={criteria.lastName}
          onChange={event => updateField('lastName', event.target.value)}
          className={inputClass}
        />
        <Input
          placeholder='First Name'
          value={criteria.firstName}
          onChange={event => updateField('firstName', event.target.value)}
          className={inputClass}
        />
        <Input
          type='tel'
          placeholder='Phone No.'
          value={criteria.phoneNo}
          onChange={event => updateField('phoneNo', event.target.value)}
          className={inputClass}
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
        className={inputClass}
      />
      <Input
        placeholder='First Name'
        value={criteria.firstName}
        onChange={event => updateField('firstName', event.target.value)}
        className={inputClass}
      />
      <Input
        type='tel'
        placeholder='Phone No.'
        value={criteria.phoneNo}
        onChange={event => updateField('phoneNo', event.target.value)}
        className={inputClass}
      />
      <Input
        type='email'
        placeholder='Email'
        value={criteria.email}
        onChange={event => updateField('email', event.target.value)}
        className={inputClass}
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
  showDate,
  onShowDateChange,
  showTime,
  onShowTimeChange,
  origin,
  onOriginChange,
  onOpenComicInfo,
  dateInputRef,
  onOpenDatePicker
}: {
  showDate: string
  onShowDateChange: (value: string) => void
  showTime: string
  onShowTimeChange: (value: string) => void
  origin: string
  onOriginChange: (value: string) => void
  onOpenComicInfo: () => void
  dateInputRef: RefObject<HTMLInputElement | null>
  onOpenDatePicker: () => void
}) {
  return (
    <div className='min-w-0 space-y-2'>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        <div className='inline-flex items-center gap-1'>
          <span className='text-sm font-medium text-foreground'>
            {reservationShowMeta.comicName}
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
        showTime={showTime}
        onShowTimeChange={onShowTimeChange}
      />
    </div>
  )
}

export function AddReservationDialog ({
  open,
  onOpenChange
}: AddReservationDialogProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const notesInputRef = useRef<HTMLTextAreaElement>(null)
  const [searchType, setSearchType] = useState<'customer' | 'business'>(
    'customer'
  )
  const [specialNotesOpen, setSpecialNotesOpen] = useState(true)
  const [showDate, setShowDate] = useState(reservationShowMeta.showDateInput)
  const [showTime, setShowTime] = useState(showOptions[0]?.id ?? '')
  const [section, setSection] = useState(
    sectionOptions[0]?.id ?? 'regular'
  )
  const [partyBySection, setPartyBySection] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        sectionOptions.map(option => [option.id, 2])
      ) as Record<string, number>
  )
  const [passes, setPasses] = useState(1)
  const [promo, setPromo] = useState('none')
  const [origin, setOrigin] =
    useState<typeof ORIGIN_OPTIONS[number]['id']>('phone')
  const [comicInfoOpen, setComicInfoOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [customerSearchResults, setCustomerSearchResults] = useState<
    ReservationCustomerSearchResult[]
  >([])
  const [businessSearchResults, setBusinessSearchResults] = useState<
    ReservationBusinessSearchResult[]
  >([])
  const [searchRowSelection, setSearchRowSelection] = useState<RowSelectionState>(
    {}
  )
  const [searchCriteria, setSearchCriteria] = useState<CustomerSearchCriteria>(
    EMPTY_CUSTOMER_SEARCH_CRITERIA
  )

  function clearCustomerSearch () {
    setHasSearched(false)
    setCustomerSearchResults([])
    setBusinessSearchResults([])
    setSearchRowSelection({})
    setSearchCriteria(EMPTY_CUSTOMER_SEARCH_CRITERIA)
  }

  function handleCustomerSearch () {
    if (!hasCustomerSearchCriteria(searchType, searchCriteria)) {
      return
    }

    setHasSearched(true)
    setSearchRowSelection({})
    setCustomerSearchResults(reservationCustomerSearchResults)
    setBusinessSearchResults(reservationBusinessSearchResults)
  }

  useEffect(() => {
    if (!open) {
      setSpecialNotesOpen(true)
      clearCustomerSearch()
    }
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
    setPartyBySection(current => ({
      ...current,
      [sectionId]: Math.max(1, value)
    }))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <TooltipProvider delayDuration={200}>
          <DialogContent
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
                      showDate={showDate}
                      onShowDateChange={setShowDate}
                      showTime={showTime}
                      onShowTimeChange={setShowTime}
                      origin={origin}
                      onOriginChange={id =>
                        setOrigin(id as (typeof ORIGIN_OPTIONS)[number]['id'])
                      }
                      onOpenComicInfo={() => setComicInfoOpen(true)}
                      dateInputRef={dateInputRef}
                      onOpenDatePicker={openDatePicker}
                    />

                    <SectionPicker
                      section={section}
                      onSectionChange={setSection}
                      partyBySection={partyBySection}
                      onPartyChange={setSectionParty}
                      promo={promo}
                      onPromoChange={setPromo}
                      passes={passes}
                      onPassesChange={setPasses}
                    />

                    <div className='rounded-lg border border-border/60 p-2.5'>
                      <TotalsBreakdown
                        sections={[section]}
                        partyBySection={partyBySection}
                        total='$0.00'
                        amountDue='$0.00'
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
                        />
                      </div>

                      <div className='shrink-0'>
                        <CustomerSearchFields
                          searchType={searchType}
                          criteria={searchCriteria}
                          onCriteriaChange={setSearchCriteria}
                        />
                      </div>

                      {hasSearched ? (
                        <div className='shrink-0'>
                          <ReservationSearchResultsTable
                            searchType={searchType}
                            customerResults={customerSearchResults}
                            businessResults={businessSearchResults}
                            hasSearched={hasSearched}
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
                            placeholder='Enter notes or special requests...'
                            className='min-h-20 w-full resize-y text-sm shadow-xs'
                          />
                        ) : null}
                      </div>

                      <div className='shrink-0'>
                        <ReservationPaymentPanel amountDue='$0.00' />
                      </div>
                    </div>

                    <div className='shrink-0 border-t border-border/50 pt-3 pb-1'>
                      <ReservationPaymentActions
                        onCancel={() => onOpenChange(false)}
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
        stageName={reservationShowMeta.comicName}
      />
    </>
  )
}
