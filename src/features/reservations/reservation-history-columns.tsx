import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import type { ReservationHistoryRow } from '@/types/reservation-history'

function historyColumn(
  accessorKey: keyof ReservationHistoryRow,
  label: string,
  options?: { mono?: boolean }
): ColumnDef<ReservationHistoryRow> {
  return {
    accessorKey,
    header: ({ column }) => (
      <DataTableColumnHeader label={label} column={column} preserveCase />
    ),
    cell: ({ row }) => (
      <span
        className={
          options?.mono
            ? 'font-mono text-xs whitespace-nowrap'
            : 'whitespace-nowrap'
        }
      >
        {row.original[accessorKey] || '—'}
      </span>
    )
  }
}

export const reservationHistoryColumns: ColumnDef<ReservationHistoryRow>[] = [
  historyColumn('historyId', 'HistoryId', { mono: true }),
  historyColumn('historyDate', 'History Date'),
  historyColumn('historyAction', 'History Action'),
  historyColumn('reservationId', 'ReservationId', { mono: true }),
  historyColumn('customerId', 'CustomerId', { mono: true }),
  historyColumn('showId', 'ShowID', { mono: true }),
  historyColumn('showDetId', 'ShowDetID', { mono: true }),
  historyColumn('dinner', 'Dinner'),
  historyColumn('origPartyNo', 'OrigPartyNo'),
  historyColumn('partyNo', 'PartyNo'),
  historyColumn('resSec', 'ResSec'),
  historyColumn('tableNums', 'TableNums'),
  historyColumn('tixPaid', 'TixPaid'),
  historyColumn('tixComp', 'TixComp'),
  historyColumn('tixDisc', 'TixDisc'),
  historyColumn('checkedIn', 'CheckedIn'),
  historyColumn('checkInPaid', 'CheckInPaid'),
  historyColumn('checkInComp', 'CheckInComp'),
  historyColumn('checkInDisc', 'CheckInDisc'),
  historyColumn('printed', 'Printed'),
  historyColumn('vip', 'VIP'),
  historyColumn('price', 'Price'),
  historyColumn('dayOfShowCharge', 'DayOfShowCharge'),
  historyColumn('phoneCharge', 'PhoneCharge'),
  historyColumn('walkupCharge', 'WalkupCharge'),
  historyColumn('webCharge', 'WebCharge'),
  historyColumn('promo', 'Promo'),
  historyColumn('numPasses', 'NumPasses'),
  historyColumn('pendingStatus', 'PendingStatus'),
  historyColumn('subTot', 'SubTot'),
  historyColumn('svc', 'SVC'),
  historyColumn('discount', 'Discount'),
  historyColumn('salesTax', 'SalesTax'),
  historyColumn('total', 'Total'),
  historyColumn('resSource', 'ResSource'),
  historyColumn('resStatus', 'ResStatus'),
  historyColumn('resTemp', 'ResTemp'),
  historyColumn('actionForm', 'ActionForm'),
  historyColumn('action', 'Action'),
  historyColumn('createdBy', 'CreatedBy'),
  historyColumn('createDt', 'CreateDt'),
  historyColumn('cancelBy', 'CancelBy'),
  historyColumn('cancelDt', 'CancelDt'),
  historyColumn('updateCount', 'UpdateCount'),
  historyColumn('lastUpdateId', 'LastUpdateID'),
  historyColumn('lastUpdateDt', 'Update On')
]
