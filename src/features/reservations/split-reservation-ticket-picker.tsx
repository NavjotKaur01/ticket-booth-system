import { formatReservationMoney } from '@/lib/calculate-reservation-totals'
import { cn } from '@/lib/utils'

/** One selectable chip per remaining ticket, e.g. "1 - $11.50". */
export function SplitReservationTicketPicker ({
  remainingTickets,
  unitPrice,
  selectedCount,
  onSelect
}: {
  remainingTickets: number
  unitPrice: number
  selectedCount: number
  onSelect: (count: number) => void
}) {
  if (remainingTickets <= 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        No remaining tickets available to split.
      </p>
    )
  }

  const tickets = Array.from({ length: remainingTickets }, (_, index) => index + 1)

  return (
    <div className='flex flex-wrap gap-2'>
      {tickets.map(count => (
        <button
          key={count}
          type='button'
          onClick={() => onSelect(count)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
            count === selectedCount
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-muted/60'
          )}
        >
          {count} - {formatReservationMoney(unitPrice * count)}
        </button>
      ))}
    </div>
  )
}
