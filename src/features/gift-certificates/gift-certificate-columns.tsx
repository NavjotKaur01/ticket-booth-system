import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatCurrency } from "@/lib/format-currency"
import type { GiftCertificate } from "@/types/gift-certificate"

function emptyCell(value: string) {
  return value || "\u00A0"
}

function currencyCell(value: number) {
  return (
    <span className="whitespace-nowrap tabular-nums">
      {formatCurrency(value)}
    </span>
  )
}

export const giftCertificateColumns: ColumnDef<GiftCertificate>[] = [
  {
    accessorKey: "giftType",
    header: ({ column }) => (
      <DataTableColumnHeader label="Gift Type" column={column} />
    ),
  },
  {
    accessorKey: "certificateNo",
    header: ({ column }) => (
      <DataTableColumnHeader label="Certificate No." column={column} />
    ),
    cell: ({ row }) => (
      <span
        className="block max-w-[9rem] truncate font-mono text-xs"
        title={row.original.certificateNo}
      >
        {row.original.certificateNo}
      </span>
    ),
  },
  {
    accessorKey: "senderLastName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Sender's Last Name" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.senderLastName),
  },
  {
    accessorKey: "senderFirstName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Sender's First Name" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.senderFirstName),
  },
  {
    accessorKey: "senderEmail",
    header: ({ column }) => (
      <DataTableColumnHeader label="Sender's Email" column={column} />
    ),
    cell: ({ row }) => (
      <span
        className="block max-w-[8rem] truncate"
        title={row.original.senderEmail}
      >
        {emptyCell(row.original.senderEmail)}
      </span>
    ),
  },
  {
    accessorKey: "receiverLastName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Receiver's Last Name" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.receiverLastName),
  },
  {
    accessorKey: "receiverFirstName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Receiver's First Name" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.receiverFirstName),
  },
  {
    accessorKey: "receiverAddress",
    header: ({ column }) => (
      <DataTableColumnHeader label="Receiver's Address" column={column} />
    ),
    cell: ({ row }) => (
      <span
        className="block max-w-[10rem] truncate"
        title={row.original.receiverAddress}
      >
        {emptyCell(row.original.receiverAddress)}
      </span>
    ),
  },
  {
    accessorKey: "receiverEmail",
    header: ({ column }) => (
      <DataTableColumnHeader label="Receiver's Email" column={column} />
    ),
    cell: ({ row }) => (
      <span
        className="block max-w-[8rem] truncate"
        title={row.original.receiverEmail}
      >
        {emptyCell(row.original.receiverEmail)}
      </span>
    ),
  },
  {
    accessorKey: "shippedBy",
    header: ({ column }) => (
      <DataTableColumnHeader label="Shipped By" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.shippedBy),
  },
  {
    accessorKey: "orgAmount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="Org Amount" column={column} />
      </div>
    ),
    cell: ({ row }) => currencyCell(row.original.orgAmount),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="Amount" column={column} />
      </div>
    ),
    cell: ({ row }) => currencyCell(row.original.amount),
  },
  {
    accessorKey: "giftCardRef",
    header: ({ column }) => (
      <DataTableColumnHeader label="Gift Card Ref" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.giftCardRef),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader label="Created By" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.createdBy),
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <DataTableColumnHeader label="Created Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.createdDate}
      </span>
    ),
  },
  {
    accessorKey: "pnref",
    header: ({ column }) => (
      <DataTableColumnHeader label="PNREF" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.pnref),
  },
  {
    accessorKey: "cashOutId",
    header: ({ column }) => (
      <DataTableColumnHeader label="Cash Out ID" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.cashOutId),
  },
  {
    accessorKey: "cashOutDt",
    header: ({ column }) => (
      <DataTableColumnHeader label="Cash Out Dt" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {emptyCell(row.original.cashOutDt)}
      </span>
    ),
  },
  {
    accessorKey: "lastUpdateId",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Update ID" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.lastUpdateId),
  },
  {
    accessorKey: "lastUpdateDt",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Update Dt" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.lastUpdateDt}
      </span>
    ),
  },
]
