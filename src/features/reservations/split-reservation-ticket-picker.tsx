import { formatReservationMoney } from '@/lib/calculate-reservation-totals'
import { cn } from '@/lib/utils'

/**
 * Desktop SplitReservation PartyList buttons: "N - $Price" where
 * `Price = N * (Total / Party)` — a tax/SVC-inclusive per-ticket share of the
 * reservation total. Callers pass that per-ticket amount as `unitPrice`
 * (computed from the sanitized total so corrupt stored tax can't inflate it).
 */
export function SplitReservationTicketPicker ({
  remainingTickets,
  unitPrice,
  selectedCount,
  onSelect
}: {
  remainingTickets: number
  /** Per-ticket amount used for the button label (Total / Party). */
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
  const price = Number.isFinite(unitPrice) ? unitPrice : 0

  return (
    <div className='max-h-40 overflow-y-auto pr-1'>
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
            {count} - {formatReservationMoney(price * count)}
          </button>
        ))}
      </div>
    </div>
  )
}
