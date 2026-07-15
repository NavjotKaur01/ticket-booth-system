import { RefreshCw } from 'lucide-react'

import { PanelCard } from '@/components/common/panel-card'
import { ShowDateField } from '@/components/common/show-date-field'
import { ShowTimeField } from '@/components/common/show-time-picker'
import { Button } from '@/components/ui/button'
import { CheckInStatsGrid } from '@/features/check-in/check-in-stats-grid'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sanitizeRefreshSecondsInput } from '@/lib/parse-refresh-interval'
import type { ShowOption } from '@/types/reservation'

type StatItem = {
  label: string
  value: string | number
  highlight?: boolean
}

type CheckInToolbarProps = {
  showDate: string
  onShowDateChange: (value: string) => void
  showTime: string
  onShowTimeChange: (value: string) => void
  refreshValue: string
  onRefreshValueChange: (value: string) => void
  cancelled: boolean
  onCancelledChange: (value: boolean) => void
  displayCheckedIn: boolean
  onDisplayCheckedInChange: (value: boolean) => void
  cancelledShow: boolean
  onCancelledShowChange: (value: boolean) => void
  shows?: ShowOption[]
  disableShowDateChange?: boolean
  headliner?: string
  stats?: readonly StatItem[]
  onRefresh?: () => void
  isRefreshing?: boolean
  assignSeatsVisible?: boolean
  onAssignSeats?: () => void
}

function formatShowDayOfWeek(showDate: string) {
  const parsed = new Date(`${showDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toLocaleDateString('en-US', { weekday: 'long' })
}

function ToolbarEventInfo ({
  showDate,
  onShowDateChange,
  disableShowDateChange = false,
  headliner = '',
}: {
  showDate: string
  onShowDateChange: (value: string) => void
  disableShowDateChange?: boolean
  headliner?: string
}) {
  const dayOfWeek = formatShowDayOfWeek(showDate)

  return (
    <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:flex-nowrap'>
      <div className='flex shrink-0 items-center gap-2'>
        <span className='text-sm font-medium text-foreground'>Show Date</span>
        <ShowDateField
          showDate={showDate}
          onShowDateChange={onShowDateChange}
          className='shrink-0'
          disabled={disableShowDateChange}
          appearance='plain'
        />
        {dayOfWeek ? (
          <span className='text-sm leading-none text-muted-foreground'>
            {dayOfWeek}
          </span>
        ) : null}
      </div>
      {headliner ? (
        <span className='min-w-0 truncate text-sm font-medium leading-none text-foreground'>
          {headliner}
        </span>
      ) : null}
    </div>
  )
}

function ToolbarControls ({
  refreshValue,
  onRefreshValueChange,
  onRefresh,
  isRefreshing = false,
  cancelled,
  onCancelledChange,
  displayCheckedIn,
  onDisplayCheckedInChange,
  cancelledShow,
  onCancelledShowChange
}: Pick<
  CheckInToolbarProps,
  | 'refreshValue'
  | 'onRefreshValueChange'
  | 'onRefresh'
  | 'isRefreshing'
  | 'cancelled'
  | 'onCancelledChange'
  | 'displayCheckedIn'
  | 'onDisplayCheckedInChange'
  | 'cancelledShow'
  | 'onCancelledShowChange'
>) {
  return (
    <div className='flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 lg:ml-auto lg:w-auto lg:shrink-0'>
      <div className='flex w-fit shrink-0 items-center gap-2'>
        <Label htmlFor='check-in-refresh' className='shrink-0 text-xs font-medium'>
          Refresh
        </Label>
        <div className='flex items-center gap-1.5'>
          <Input
            id='check-in-refresh'
            value={refreshValue}
            onChange={event =>
              onRefreshValueChange(
                sanitizeRefreshSecondsInput(event.target.value)
              )
            }
            inputMode='numeric'
            className='h-8 w-14 text-center text-xs tabular-nums'
          />
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-8 shrink-0 shadow-xs'
            aria-label='Refresh now'
            onClick={onRefresh}
            disabled={!onRefresh || isRefreshing}
          >
            <RefreshCw
              className={isRefreshing ? 'size-3.5 animate-spin' : 'size-3.5'}
            />
          </Button>
        </div>
      </div>
      <div className='flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5 lg:w-auto'>
        <label className='flex cursor-pointer items-center gap-2 text-xs leading-snug'>
          <Checkbox
            id='check-in-cancelled'
            checked={cancelled}
            onCheckedChange={value => onCancelledChange(value === true)}
            className='size-3.5 shrink-0'
          />
          <span className='whitespace-nowrap'>Cancelled</span>
        </label>
        <label className='flex cursor-pointer items-center gap-2 text-xs leading-snug'>
          <Checkbox
            id='check-in-display-checked-in'
            checked={displayCheckedIn}
            onCheckedChange={value => onDisplayCheckedInChange(value === true)}
            className='size-3.5 shrink-0'
          />
          <span className='whitespace-nowrap'>
            Display Checked-In Reservation
          </span>
        </label>
        <label className='flex cursor-pointer items-center gap-2 text-xs leading-snug'>
          <Checkbox
            id='check-in-cancelled-show'
            checked={cancelledShow}
            onCheckedChange={value => onCancelledShowChange(value === true)}
            className='size-3.5 shrink-0'
          />
          <span className='whitespace-nowrap'>Cancelled Show</span>
        </label>
      </div>
    </div>
  )
}

export function CheckInToolbar ({
  showDate,
  onShowDateChange,
  showTime,
  onShowTimeChange,
  refreshValue,
  onRefreshValueChange,
  cancelled,
  onCancelledChange,
  displayCheckedIn,
  onDisplayCheckedInChange,
  cancelledShow,
  onCancelledShowChange,
  shows = [],
  disableShowDateChange = false,
  headliner = '',
  stats = [
    { label: 'Seats', value: 0 },
    { label: 'Reservation', value: 0 },
    { label: 'Available', value: 0, highlight: true },
    { label: 'Seated', value: 0 },
    { label: 'Scanned', value: 0 },
  ],
  onRefresh,
  isRefreshing = false,
  assignSeatsVisible = false,
  onAssignSeats,
}: CheckInToolbarProps) {
  return (
    <PanelCard className='overflow-hidden'>
      <div className='flex flex-col gap-4 border-b px-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-3'>
        <div className='min-w-0 lg:flex-1 lg:pr-3'>
          <ToolbarEventInfo
            showDate={showDate}
            onShowDateChange={onShowDateChange}
            disableShowDateChange={disableShowDateChange}
            headliner={headliner}
          />
        </div>
        <div className='flex w-full min-w-0 flex-col gap-3 lg:ml-auto lg:w-auto lg:shrink-0 lg:flex-row lg:items-center lg:gap-3'>
          {assignSeatsVisible && onAssignSeats ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 shrink-0 text-xs'
              onClick={onAssignSeats}
            >
              Assign Seats
            </Button>
          ) : null}
          <ToolbarControls
            refreshValue={refreshValue}
            onRefreshValueChange={onRefreshValueChange}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            cancelled={cancelled}
            onCancelledChange={onCancelledChange}
            displayCheckedIn={displayCheckedIn}
            onDisplayCheckedInChange={onDisplayCheckedInChange}
            cancelledShow={cancelledShow}
            onCancelledShowChange={onCancelledShowChange}
          />
        </div>
      </div>

      <div className='flex flex-col gap-3 px-3 py-2.5 md:flex-row md:items-end md:justify-between md:gap-4'>
        <ShowTimeField
          shows={shows}
          showTime={showTime}
          onShowTimeChange={onShowTimeChange}
          className='min-w-0'
        />

        <CheckInStatsGrid
          items={stats}
          className='justify-start md:shrink-0 md:justify-end'
        />
      </div>
    </PanelCard>
  )
}
