import { PanelCard } from '@/components/common/panel-card'
import { ShowDateField } from '@/components/common/show-date-field'
import { ShowTimeField } from '@/components/common/show-time-picker'
import { CheckInStatsGrid } from '@/features/check-in/check-in-stats-grid'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { checkInCounts } from '@/data/check-in'
import { reservationShowMeta, showOptions } from '@/data/reservation'
import type { ShowOption } from '@/types/reservation'

const statItems = [
  { label: 'Seats', value: checkInCounts.seats },
  { label: 'Reservation', value: checkInCounts.reservation },
  { label: 'Available', value: checkInCounts.available, highlight: true },
  { label: 'Scanned', value: checkInCounts.scanned }
] as const

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
}

function ToolbarEventInfo ({
  showDate,
  onShowDateChange
}: {
  showDate: string
  onShowDateChange: (value: string) => void
}) {
  return (
    <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:flex-nowrap'>
      <ShowDateField
        showDate={showDate}
        onShowDateChange={onShowDateChange}
        className='shrink-0'
      />
      <span className='min-w-0 truncate text-sm font-medium leading-none text-foreground'>
        {reservationShowMeta.comicName}
      </span>
    </div>
  )
}

function ToolbarControls ({
  refreshValue,
  onRefreshValueChange,
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
        <Input
          id='check-in-refresh'
          value={refreshValue}
          onChange={event => onRefreshValueChange(event.target.value)}
          className='h-8 w-14 text-center text-xs tabular-nums'
        />
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
  shows = showOptions
}: CheckInToolbarProps) {
  return (
    <PanelCard className='overflow-hidden'>
      {/* Row 1: event info (left) + refresh / checkboxes (right) */}
      <div className='flex flex-col gap-4 border-b px-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-3'>
        <div className='min-w-0 lg:flex-1 lg:pr-3'>
          <ToolbarEventInfo
            showDate={showDate}
            onShowDateChange={onShowDateChange}
          />
        </div>
        <ToolbarControls
          refreshValue={refreshValue}
          onRefreshValueChange={onRefreshValueChange}
          cancelled={cancelled}
          onCancelledChange={onCancelledChange}
          displayCheckedIn={displayCheckedIn}
          onDisplayCheckedInChange={onDisplayCheckedInChange}
          cancelledShow={cancelledShow}
          onCancelledShowChange={onCancelledShowChange}
        />
      </div>

      {/* Row 2: show / time (left) + stats (right) */}
      <div className='flex flex-col gap-3 px-3 py-2.5 md:flex-row md:items-end md:justify-between md:gap-4'>
        <ShowTimeField
          shows={shows}
          showTime={showTime}
          onShowTimeChange={onShowTimeChange}
          className='min-w-0'
        />

        <CheckInStatsGrid
          items={statItems}
          className='justify-start md:shrink-0 md:justify-end'
        />
      </div>
    </PanelCard>
  )
}
