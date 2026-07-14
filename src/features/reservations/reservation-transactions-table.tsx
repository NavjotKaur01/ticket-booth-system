import type { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/data-table/data-table'
import { formatReservationMoney } from '@/lib/calculate-reservation-totals'
import { cn } from '@/lib/utils'
import type { ReservationTransactionRow } from '@/types/reservation-transaction'

const COMPACT_TABLE_CLASS = cn(
  '[&_[data-slot=table-head]]:h-8 [&_[data-slot=table-head]]:px-2.5 [&_[data-slot=table-head]]:text-[9px]',
  '[&_[data-slot=table-cell]]:px-2.5 [&_[data-slot=table-cell]]:py-1.5 [&_[data-slot=table-cell]]:text-xs'
)

const columns: ColumnDef<ReservationTransactionRow>[] = [
  { accessorKey: 'transaction', header: 'Transaction' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'payment', header: 'Payment' },
  { accessorKey: 'cardType', header: 'Card Type' },
  { accessorKey: 'cardNumber', header: 'Card Number' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatReservationMoney(row.original.amount)}
      </span>
    )
  },
  { accessorKey: 'authorization', header: 'Authorization' },
  { accessorKey: 'pnref', header: 'PNREF' },
  {
    id: 'split',
    header: 'Split',
    cell: ({ row }) => (row.original.isSplit ? 'Y' : 'N')
  }
]

/** Read-only payment/transaction ledger for a reservation. */
export function ReservationTransactionsTable({
  data,
  selectedTransactionId,
  onTransactionSelect
}: {
  data: ReservationTransactionRow[]
  selectedTransactionId?: string | null
  /** Fired on row double-click — loads payment details into the form. */
  onTransactionSelect?: (row: ReservationTransactionRow) => void
}) {
  return (
    <div>
      <h3 className='mb-1.5 text-sm font-semibold text-foreground'>
        Transactions
      </h3>
      <DataTable
        columns={columns}
        data={data}
        emptyMessage='No transactions yet.'
        enablePagination={false}
        entityLabel='transactions'
        getRowId={row => row.id}
        onRowDoubleClick={row => onTransactionSelect?.(row.original)}
        getRowClassName={row =>
          row.id === selectedTransactionId ? 'bg-primary/10' : undefined
        }
        className={cn('rounded-lg border border-border/60', COMPACT_TABLE_CLASS)}
      />
    </div>
  )
}
