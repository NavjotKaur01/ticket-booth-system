import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format-currency"
import {
  PAYMENT_COLUMNS,
  type CheckedInRow,
  type FinancialRow,
  type ManagerCheckoutShow,
  type OriginRow,
  type PaymentColumnKey,
  type ShowSectionRow,
} from "@/types/manager-checkout-report"

function ReportTable({
  caption,
  children,
  className,
}: {
  caption: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto rounded-md border", className)}>
      <table className="w-full min-w-[720px] border-collapse text-xs">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  )
}

function TableHeadCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        "border-b bg-muted/60 px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
    >
      {children}
    </th>
  )
}

function TableCell({
  children,
  className,
  colSpan,
}: {
  children: ReactNode
  className?: string
  colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn("border-b px-2 py-1.5 tabular-nums text-foreground", className)}
    >
      {children}
    </td>
  )
}

function formatPaymentCell(
  row: FinancialRow,
  key: PaymentColumnKey | "subTotal" | "total",
  value: number
) {
  if (row.summaryOnly && key !== "total") {
    return "\u00A0"
  }

  const formatted = formatCurrency(value)
  const isHighlight = !row.isRefund && !row.summaryOnly && value > 0

  return (
    <span
      className={cn(
        row.isRefund && "text-destructive",
        isHighlight && "font-medium text-primary"
      )}
    >
      {formatted}
    </span>
  )
}

function FinancialSummaryTable({ rows }: { rows: FinancialRow[] }) {
  return (
    <ReportTable caption="Financial summary">
      <thead>
        <tr>
          <TableHeadCell>Type</TableHeadCell>
          {PAYMENT_COLUMNS.map((column) => (
            <TableHeadCell key={column.key} className="text-right">
              {column.label}
            </TableHeadCell>
          ))}
          <TableHeadCell className="text-right">SubTotal</TableHeadCell>
          <TableHeadCell className="text-right">Total</TableHeadCell>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={cn(
              "even:bg-muted/20",
              row.label === "Totals" && "bg-muted/40 font-semibold",
              row.summaryOnly && "bg-muted/10"
            )}
          >
            <TableCell className="font-medium">{row.label}</TableCell>
            {PAYMENT_COLUMNS.map((column) => (
              <TableCell key={column.key} className="text-right">
                {formatPaymentCell(row, column.key, row.amounts[column.key])}
              </TableCell>
            ))}
            <TableCell className="text-right">
              {formatPaymentCell(row, "subTotal", row.amounts.subTotal)}
            </TableCell>
            <TableCell className="text-right">
              {formatPaymentCell(row, "total", row.amounts.total)}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </ReportTable>
  )
}

function CheckedInTable({ rows }: { rows: CheckedInRow[] }) {
  const totals = rows.reduce(
    (acc, row) => ({
      party: acc.party + row.party,
      seated: acc.seated + row.seated,
      paid: acc.paid + row.paid,
      comp: acc.comp + row.comp,
      disc: acc.disc + row.disc,
      scanned: acc.scanned + row.scanned,
      scanPaid: acc.scanPaid + row.scanPaid,
      scanComp: acc.scanComp + row.scanComp,
      scanDisc: acc.scanDisc + row.scanDisc,
    }),
    {
      party: 0,
      seated: 0,
      paid: 0,
      comp: 0,
      disc: 0,
      scanned: 0,
      scanPaid: 0,
      scanComp: 0,
      scanDisc: 0,
    }
  )

  return (
    <ReportTable caption="Checked-in summary">
      <thead>
        <tr>
          <TableHeadCell>Promotion</TableHeadCell>
          <TableHeadCell className="text-right">Party</TableHeadCell>
          <TableHeadCell className="text-right">Seated</TableHeadCell>
          <TableHeadCell className="text-right">Paid</TableHeadCell>
          <TableHeadCell className="text-right">Comp</TableHeadCell>
          <TableHeadCell className="text-right">Disc</TableHeadCell>
          <TableHeadCell className="text-right">Scanned</TableHeadCell>
          <TableHeadCell className="text-right">ScanPaid</TableHeadCell>
          <TableHeadCell className="text-right">ScanComp</TableHeadCell>
          <TableHeadCell className="text-right">ScanDisc</TableHeadCell>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <TableCell colSpan={10} className="py-4 text-center text-muted-foreground">
              No checked-in records for this show.
            </TableCell>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="even:bg-muted/20">
              <TableCell className="font-medium">{row.promotion}</TableCell>
              <TableCell className="text-right">{row.party}</TableCell>
              <TableCell className="text-right">{row.seated}</TableCell>
              <TableCell className="text-right">{row.paid}</TableCell>
              <TableCell className="text-right">{row.comp}</TableCell>
              <TableCell className="text-right">{row.disc}</TableCell>
              <TableCell className="text-right">{row.scanned}</TableCell>
              <TableCell className="text-right">{row.scanPaid}</TableCell>
              <TableCell className="text-right">{row.scanComp}</TableCell>
              <TableCell className="text-right">{row.scanDisc}</TableCell>
            </tr>
          ))
        )}
        <tr className="bg-muted/40 font-semibold">
          <TableCell>Total</TableCell>
          <TableCell className="text-right">{totals.party}</TableCell>
          <TableCell className="text-right">{totals.seated}</TableCell>
          <TableCell className="text-right">{totals.paid}</TableCell>
          <TableCell className="text-right">{totals.comp}</TableCell>
          <TableCell className="text-right">{totals.disc}</TableCell>
          <TableCell className="text-right">{totals.scanned}</TableCell>
          <TableCell className="text-right">{totals.scanPaid}</TableCell>
          <TableCell className="text-right">{totals.scanComp}</TableCell>
          <TableCell className="text-right">{totals.scanDisc}</TableCell>
        </tr>
      </tbody>
    </ReportTable>
  )
}

function BookingSourceTable({
  phoneIn,
  walkup,
  web,
}: {
  phoneIn: number
  walkup: number
  web: number
}) {
  const hasRecords = phoneIn + walkup + web > 0

  return (
    <ReportTable caption="Booking source counts">
      <thead>
        <tr>
          <TableHeadCell className="text-center">Phone-In</TableHeadCell>
          <TableHeadCell className="text-center">Walkup</TableHeadCell>
          <TableHeadCell className="text-center">Web</TableHeadCell>
        </tr>
      </thead>
      <tbody>
        {!hasRecords ? (
          <tr>
            <TableCell colSpan={3} className="py-3 text-center text-muted-foreground">
              No record found
            </TableCell>
          </tr>
        ) : null}
        <tr className="font-semibold">
          <TableCell className="text-center">{phoneIn}</TableCell>
          <TableCell className="text-center">{walkup}</TableCell>
          <TableCell className="text-center">{web}</TableCell>
        </tr>
      </tbody>
    </ReportTable>
  )
}

function OriginTable({ rows }: { rows: OriginRow[] }) {
  return (
    <ReportTable caption="Origin summary">
      <thead>
        <tr>
          <TableHeadCell>Origin</TableHeadCell>
          <TableHeadCell className="text-right">Party</TableHeadCell>
          <TableHeadCell className="text-right">(Pre)Seated</TableHeadCell>
          <TableHeadCell className="text-right">Paid</TableHeadCell>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <TableCell colSpan={4} className="py-3 text-center text-muted-foreground">
              No record found
            </TableCell>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="even:bg-muted/20">
              <TableCell className="font-medium">{row.origin}</TableCell>
              <TableCell className="text-right">{row.party}</TableCell>
              <TableCell className="text-right">{row.preSeated}</TableCell>
              <TableCell className="text-right">{row.paid}</TableCell>
            </tr>
          ))
        )}
      </tbody>
    </ReportTable>
  )
}

function ShowSectionTable({ rows }: { rows: ShowSectionRow[] }) {
  return (
    <ReportTable caption="Show section summary">
      <thead>
        <tr>
          <TableHeadCell>Show Section</TableHeadCell>
          <TableHeadCell className="text-right">Party</TableHeadCell>
          <TableHeadCell className="text-right">Total Amount</TableHeadCell>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <TableCell colSpan={3} className="py-3 text-center text-muted-foreground">
              No record found
            </TableCell>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="even:bg-muted/20">
              <TableCell className="font-medium">{row.section}</TableCell>
              <TableCell className="text-right">{row.party}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.totalAmount)}
              </TableCell>
            </tr>
          ))
        )}
      </tbody>
    </ReportTable>
  )
}

type ManagerCheckoutShowReportProps = {
  clubName: string
  show: ManagerCheckoutShow
}

export function ManagerCheckoutShowReport({
  clubName,
  show,
}: ManagerCheckoutShowReportProps) {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          CLUB NAME : {clubName}
        </div>

        <div className="grid gap-3 border-b bg-muted/20 p-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-1 rounded-md border bg-background p-3">
            <p className="text-sm font-semibold text-foreground">Manager Checkout</p>
            <dl className="grid gap-1 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Show Date</dt>
                <dd className="font-medium tabular-nums">{show.showDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Show Time</dt>
                <dd className="font-medium">{show.showTime}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Comic Name</dt>
                <dd className="font-medium">{show.comicName}</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-x-auto rounded-md border bg-background">
            <table className="min-w-[18rem] border-collapse text-xs">
              <thead>
                <tr>
                  <TableHeadCell>Booked</TableHeadCell>
                  <TableHeadCell>(Pre) Seat</TableHeadCell>
                  <TableHeadCell>Ticket Price</TableHeadCell>
                  <TableHeadCell>Total Receipts</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TableCell className="text-center font-semibold">
                    {show.booked}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {show.preSeat}
                  </TableCell>
                  <TableCell className="text-center">{show.ticketPrices}</TableCell>
                  <TableCell className="text-center">{show.totalReceipts}</TableCell>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Financial Summary</h3>
        <FinancialSummaryTable rows={show.financialRows} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Checked-In</h3>
        <CheckedInTable rows={show.checkedInRows} />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Booking Source</h3>
          <BookingSourceTable
            phoneIn={show.phoneIn}
            walkup={show.walkup}
            web={show.web}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Origin</h3>
          <OriginTable rows={show.originRows} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Show Section</h3>
          <ShowSectionTable rows={show.showSectionRows} />
        </div>
      </div>
    </section>
  )
}
