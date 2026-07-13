import { Info } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  formatReservationMoney,
  parseReservationMoney,
  type ReservationTotals
} from '@/lib/calculate-reservation-totals'
import type { ReservationSectionOption } from '@/types/reservation'

const RESERVATION_LINE_META = [
  { key: 'sub', label: 'Subtotal', info: null },
  { key: 'svc', label: 'Service Charge', info: 'Service charge applied per ticket' },
  { key: 'disc', label: 'Discount', info: null },
  { key: 'tax', label: 'Tax', info: 'Sales tax on this reservation' }
] as const

export type ReservationTotalsSummaryField = {
  label: string
  value: string
}

/**
 * Shared read-only totals summary used by both AddReservationDialog (edit mode)
 * and SplitReservationDialog. `summaryFields` renders an optional row of extra
 * read-only stats above the ticket line (e.g. Checked In / Remaining / Price Per Ticket).
 */
export function ReservationTotalsCard({
  selectedSection,
  partySize,
  totals,
  amountDue,
  ticketLabel,
  summaryFields
}: {
  selectedSection: ReservationSectionOption | null
  partySize: number
  totals: ReservationTotals
  amountDue?: string
  /** Overrides the default "Tickets (Section x N)" label. */
  ticketLabel?: string
  summaryFields?: ReservationTotalsSummaryField[]
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
      {summaryFields && summaryFields.length > 0 ? (
        <div className='grid grid-cols-2 gap-2 border-b border-border/50 pb-2.5 sm:grid-cols-3'>
          {summaryFields.map(field => (
            <div
              key={field.label}
              className='flex items-center justify-between gap-2 text-xs'
            >
              <span className='text-muted-foreground'>{field.label}</span>
              <span className='font-medium tabular-nums'>{field.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {selectedSection ? (
        <div className='flex items-center justify-between gap-6'>
          <span className='text-muted-foreground'>
            {ticketLabel ?? `Tickets (${selectedSection.name} x ${partySize})`}
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
        {amountDue ? (
          <div className='flex items-center justify-between gap-4'>
            <span className='text-sm font-medium text-red-600'>Amount Due</span>
            <span className='shrink-0 text-sm font-bold tabular-nums text-red-600'>
              {amountDue}
            </span>
          </div>
        ) : null}
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
