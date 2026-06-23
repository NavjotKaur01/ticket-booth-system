import {
  Calendar,
  CreditCard,
  Info,
  Search,
  UserPlus,
  X
} from 'lucide-react'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import { useRef, useState } from 'react'

import {
  FormSection,
  IconActionButton
} from '@/components/forms/form-fields'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  showOptions
} from '@/data/reservation'
import { ComicInfoDialog } from '@/features/reservations/comic-info-dialog'
import { cn } from '@/lib/utils'
import type { SectionOption } from '@/types/reservation'

type AddReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PANEL_CLASS = 'space-y-3'
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
  { id: 'phone', label: 'Phone-In' },
  { id: 'walkup', label: 'Walk-up' }
] as const

const SECTION_CARD_TONES = {
  regular: {
    selected: {
      card: 'border-emerald-500 bg-emerald-50/70',
      title: 'text-emerald-800',
      meta: 'text-emerald-700/90'
    },
    unselected: {
      card: 'border-emerald-200 bg-background hover:border-emerald-300',
      title: 'text-emerald-800',
      meta: 'text-muted-foreground'
    }
  },
  vip: {
    selected: {
      card: 'border-amber-500 bg-amber-50/70',
      title: 'text-amber-900',
      meta: 'text-amber-800/90'
    },
    unselected: {
      card: 'border-amber-200 bg-background hover:border-amber-300',
      title: 'text-amber-900',
      meta: 'text-muted-foreground'
    }
  }
} as const

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

function FormPanel ({
  title,
  children
}: {
  title?: string
  children: ReactNode
}) {
  if (!title) {
    return <div className={PANEL_CLASS}>{children}</div>
  }

  return (
    <FormSection title={title} className='space-y-2'>
      <div className={PANEL_CLASS}>{children}</div>
    </FormSection>
  )
}

function TotalsBreakdown ({
  sections,
  partyBySection,
  total
}: {
  sections: string[]
  partyBySection: Record<string, number>
  total: string
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

      <div className='border-t border-border/50 pt-2.5'>
        <div className='flex items-center justify-between gap-6'>
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

function RadioOptionBox ({ children }: { children: ReactNode }) {
  return (
    <div className='rounded-lg border border-border/60 bg-background px-3 py-2'>
      {children}
    </div>
  )
}

function BookingOptionsBar ({
  showTime,
  onShowTimeChange,
  origin,
  onOriginChange
}: {
  showTime: string
  onShowTimeChange: (value: string) => void
  origin: string
  onOriginChange: (value: string) => void
}) {
  return (
    <div className='inline-flex flex-wrap items-center gap-3'>
      <RadioOptionBox>
        <InlineRadioGroup
          name='show-time'
          value={showTime}
          onChange={onShowTimeChange}
          options={showOptions.map(show => ({
            id: show.id,
            label: show.time ?? show.label,
            title: show.label
          }))}
        />
      </RadioOptionBox>

      <RadioOptionBox>
        <InlineRadioGroup
          name='origin'
          value={origin}
          onChange={onOriginChange}
          options={ORIGIN_OPTIONS.map(option => ({
            id: option.id,
            label: option.label
          }))}
        />
      </RadioOptionBox>
    </div>
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
    <div className='border-b border-border/50 pb-4'>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
      <div className='inline-flex items-center'>
        <span className='text-sm font-medium text-foreground'>
          {reservationShowMeta.comicName}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='size-7 shrink-0 text-muted-foreground hover:text-foreground'
              aria-label='Comic Info'
              onClick={onOpenComicInfo}
            >
              <Info className='size-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top'>Comic Info</TooltipContent>
        </Tooltip>
      </div>

      <div className='inline-flex items-center gap-1'>
        <span className='text-sm text-muted-foreground'>
          {formatShowDate(showDate)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='size-7 shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              aria-label='Change show date'
              onClick={onOpenDatePicker}
            >
              <Calendar className='size-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top'>Change show date</TooltipContent>
        </Tooltip>
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

      <BookingOptionsBar
        showTime={showTime}
        onShowTimeChange={onShowTimeChange}
        origin={origin}
        onOriginChange={onOriginChange}
      />

      <label className='flex cursor-pointer items-center gap-2 text-sm whitespace-nowrap'>
        <Checkbox id='dinner' />
        Dinner
      </label>
      </div>
    </div>
  )
}

function SectionCard ({
  option,
  selected,
  onToggle
}: {
  option: SectionOption
  selected: boolean
  onToggle: () => void
}) {
  function handleKeyDown (event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggle()
    }
  }

  const tone = SECTION_CARD_TONES[option.tone]
  const styles = selected ? tone.selected : tone.unselected

  return (
    <div
      role='checkbox'
      tabIndex={0}
      aria-checked={selected}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex min-w-[6.5rem] cursor-pointer flex-col items-start rounded-md border px-2.5 py-1.5 text-left transition-colors',
        styles.card
      )}
    >
      <span className={cn('text-xs font-semibold', styles.title)}>
        {option.name}
      </span>
      <span className='mt-0.5 flex items-center gap-1 text-[11px]'>
        <span className={styles.meta}>{option.price}</span>
        <span className='text-muted-foreground'>·</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'tabular-nums',
                selected ? tone.selected.meta : tone.unselected.meta
              )}
              onClick={event => event.stopPropagation()}
              onPointerDown={event => event.stopPropagation()}
            >
              {option.available}
            </span>
          </TooltipTrigger>
          <TooltipContent side='top'>Available</TooltipContent>
        </Tooltip>
      </span>
    </div>
  )
}

function InlineField ({
  label,
  children,
  className
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className={INLINE_LABEL}>{label}</span>
      {children}
    </div>
  )
}

export function AddReservationDialog ({
  open,
  onOpenChange
}: AddReservationDialogProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [searchType, setSearchType] = useState('customer')
  const [showDate, setShowDate] = useState(reservationShowMeta.showDateInput)
  const [showTime, setShowTime] = useState(showOptions[0]?.id ?? '')
  const [sections, setSections] = useState<string[]>([
    sectionOptions[0]?.id ?? 'regular'
  ])
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

  function toggleSection (sectionId: string) {
    setSections(current =>
      current.includes(sectionId)
        ? current.filter(id => id !== sectionId)
        : [...current, sectionId]
    )
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
            showCloseButton
            className='flex max-h-[92vh] w-[min(96vw,72rem)] max-w-none flex-col overflow-hidden sm:max-w-none'
          >
            <DialogHeader className='shrink-0 border-b px-5 py-4'>
              <DialogTitle className='text-base font-semibold text-foreground'>
                Add Reservation
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-5 overflow-y-auto px-5 py-3'>
              <FormPanel>
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

                <InlineField label='Section'>
                  <div className='flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2'>
                    {sectionOptions.map(option => (
                      <div
                        key={option.id}
                        className='flex items-center gap-2'
                      >
                        <SectionCard
                          option={option}
                          selected={sections.includes(option.id)}
                          onToggle={() => toggleSection(option.id)}
                        />

                        <Input
                          type='number'
                          min={1}
                          value={partyBySection[option.id] ?? 2}
                          onChange={event =>
                            setSectionParty(
                              option.id,
                              Number(event.target.value) || 1
                            )
                          }
                          className={COMPACT_NUMBER}
                          aria-label={`${option.name} party size`}
                        />
                      </div>
                    ))}

                    <div className='shrink-0'>
                      <span className='sr-only'>Promo Code (Optional)</span>
                      <Select value={promo} onValueChange={setPromo}>
                        <SelectTrigger className={COMPACT_SELECT}>
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

                    <Input
                      type='number'
                      min={0}
                      value={passes}
                      onChange={event =>
                        setPasses(Math.max(0, Number(event.target.value) || 0))
                      }
                      className={COMPACT_NUMBER}
                      aria-label='Passes'
                    />
                  </div>
                </InlineField>

                <div className='border-t border-border/50 pt-4'>
                  <div className='grid gap-4 md:grid-cols-[2fr_3fr]'>
                  <div className='rounded-lg border border-border/60 p-3'>
                    <TotalsBreakdown
                      sections={sections}
                      partyBySection={partyBySection}
                      total='$0.00'
                    />
                  </div>

                  <div className='min-w-0 space-y-3'>
                    <h3 className='text-sm font-semibold text-foreground'>
                      Customer & Search
                    </h3>

                    <div className='grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4'>
                      <Input
                        placeholder='Last Name'
                        className={cn('w-full', COMPACT_INPUT)}
                      />
                      <Input
                        placeholder='First Name'
                        className={cn('w-full', COMPACT_INPUT)}
                      />
                      <Input
                        type='tel'
                        placeholder='Phone No.'
                        className={cn('w-full', COMPACT_INPUT)}
                      />
                      <Input
                        type='email'
                        placeholder='Email'
                        className={cn('w-full', COMPACT_INPUT)}
                      />
                    </div>

                    <div className='flex items-center gap-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/15 px-3 py-2'>
                      <InlineRadioGroup
                        name='search-type'
                        value={searchType}
                        onChange={setSearchType}
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
                        />
                        <IconActionButton
                          label='Add Customer'
                          icon={UserPlus}
                        />
                        <IconActionButton
                          label='Swipe Card'
                          icon={CreditCard}
                        />
                        <IconActionButton
                          label='Clear'
                          icon={X}
                          variant='outline'
                        />
                      </div>
                    </div>

                    <Textarea
                      placeholder='Enter notes or special requests...'
                      className='min-h-20 w-full resize-y text-sm'
                    />
                  </div>
                  </div>
                </div>
              </FormPanel>
            </div>

            <DialogFooter className='shrink-0 gap-2 border-t px-5 py-4 sm:justify-end'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button type='button' size='sm'>
                Continue
              </Button>
            </DialogFooter>
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
