import { useState } from "react"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"
import type { ReportDrillContext } from "@/features/reports/reports.service"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReconcileReportRow = {
  reportdate: string
  startdate: string
  enddate: string
  dailypaid: number
  priorrefunds: number
  futurerefunds: number
  mcpaid: number
  discpaid: number
  amexpaid: number
  cashpaid: number
  mcrefunded: number
  discrefunded: number
  amexrefunded: number
  cashrefunded: number
  giftcardpaid: number
  webgiftcert: number
  webgiftcertpaid: number
  defbalance: number
  defpurch: number
  defrev: number
  defrefunds: number
  grossale: number
  subtotal1: number
  controltotal1: number
  subtotal2: number
  subtotal3: number
  subtotal4: number
  subtotal5: number
  subtotal6: number
  controltotal2: number
  controltotaldifference: number
  Deferredrevenueamountasofreportdate: number
}

type DrillTarget = { drillType: string; label: string }

// ─── Drill labels (must match WPF ReconcileConverter / API) ───────────────────

const DRILL_TYPE: Record<string, string> = {
  dailypaid:       "Daily Paid",
  giftcardpaid:    "Gift Card/Cert",
  webgiftcert:     "Gift Card/Cert",
  futurerefunds:   "Refunds Deferred",
  priorrefunds:    "Refunds Prior",
  grossale:        "Gross Sales",
  mcpaid:          "MC/Visa Purchases",
  mcrefunded:      "MC/Visa Refunds",
  discpaid:        "Discover Purchases",
  discrefunded:    "Discover Refunds",
  amexpaid:        "AMEX Purchases",
  amexrefunded:    "AMEX Refunds",
  cashpaid:        "Cash Purchases",
  cashrefunded:    "Cash Refunds",
  webgiftcertpaid: "Gift Card/Cert",
  defrev:          "Deferred Revenue Used",
  defbalance:      "Beginning Balance",
  defpurch:        "Purchased Deferred Revenue as of report date",
  defrevProof:     "Deferred Revenue as of report date",
  defrefunds:      "Deferred refunds processed",
}

const DRILL_COLUMNS: DrillColumn[] = [
  { key: "ShowDate",      label: "Show Date" },
  { key: "ShowTm",        label: "Show Time" },
  { key: "ComicName",     label: "Comic" },
  { key: "LastName",      label: "Last Name" },
  { key: "FirstName",     label: "First Name" },
  { key: "Business",      label: "Business" },
  { key: "PymtLastName",  label: "Pymt Last" },
  { key: "PymtFirstName", label: "Pymt First" },
  { key: "Status",        label: "Status" },
  { key: "PymtType",      label: "Pymt Type" },
  { key: "CCType",        label: "CC Type" },
  { key: "Amount",        label: "Amount", right: true },
  { key: "PymtDate",      label: "Pymt Date" },
]

// ─── Data normalization + computed totals (mirrors ReportVM.GetReconcileData) ─

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0"))
  return Number.isFinite(n) ? n : 0
}

function fmtFilterDate(v: string): string {
  const d = dayjs(v)
  return d.isValid() ? d.format("MM/DD/YYYY") : v
}

function fmtReportDate(v: unknown): string {
  if (!v) return "—"
  const d = dayjs(String(v))
  return d.isValid() ? d.format("M/D/YYYY h:mm:ss A") : String(v)
}

/** Map API PascalCase fields → lowercase + compute subtotals like WPF. */
export function buildReconcileReportData(
  raw: unknown,
  filterStart: string,
  filterEnd: string
): ReconcileReportRow[] {
  if (!Array.isArray(raw)) return []

  const startdate = fmtFilterDate(filterStart)
  const enddate = fmtFilterDate(filterEnd)
  const dPrior = 0

  return (raw as Record<string, unknown>[]).map((row) => {
    const dailypaid       = toNum(row.DailyPaid ?? row.dailypaid)
    const priorrefunds      = toNum(row.PriorRefunds ?? row.priorrefunds)
    const futurerefunds     = toNum(row.FutureRefunds ?? row.futurerefunds)
    const mcpaid            = toNum(row.McPaid ?? row.mcpaid)
    const discpaid          = toNum(row.DiscPaid ?? row.discpaid)
    const amexpaid          = toNum(row.AmexPaid ?? row.amexpaid)
    const cashpaid          = toNum(row.CashPaid ?? row.cashpaid)
    const mcrefunded        = toNum(row.McRefunded ?? row.mcrefunded)
    const discrefunded      = toNum(row.DiscRefunded ?? row.discrefunded)
    const amexrefunded      = toNum(row.AmexRefunded ?? row.amexrefunded)
    const cashrefunded      = toNum(row.CashRefunded ?? row.cashrefunded)
    const giftcardpaid      = toNum(row.GiftCardPaid ?? row.giftcardpaid)
    const webgiftcert       = toNum(row.WebGiftCert ?? row.webgiftcert)
    const webgiftcertpaid   = toNum(row.WebGiftCertPaid ?? row.webgiftcertpaid)
    const defbalance        = toNum(row.DefBalance ?? row.defbalance)
    const defpurch          = toNum(row.DefPurch ?? row.defpurch)
    const defrev            = toNum(row.DefRev ?? row.defrev)
    const defrefunds        = toNum(row.DefRefunds ?? row.defrefunds)
    const grossale          = toNum(row.GrosSale ?? row.grossale)

    const subtotal1 = dailypaid + giftcardpaid + webgiftcert + futurerefunds + priorrefunds
    const controltotal1 = subtotal1 + grossale
    const subtotal2 = mcpaid + mcrefunded
    const subtotal3 = discpaid + discrefunded
    const subtotal4 = amexpaid + amexrefunded
    const subtotal5 = cashpaid + cashrefunded
    const subtotal6 = mcpaid + mcrefunded + discpaid + discrefunded + amexpaid + amexrefunded
      + cashpaid + cashrefunded + giftcardpaid + webgiftcertpaid + dPrior
    const controltotal2 = subtotal6 + defrev
    const controltotaldifference = subtotal1 - (mcpaid + mcrefunded + discpaid + discrefunded
      + amexpaid + amexrefunded + cashpaid + cashrefunded + giftcardpaid + webgiftcertpaid + dPrior)
    const Deferredrevenueamountasofreportdate = defbalance + defpurch - defrev + defrefunds

    return {
      reportdate: fmtReportDate(row.ReportDate ?? row.reportdate),
      startdate,
      enddate,
      dailypaid,
      priorrefunds,
      futurerefunds,
      mcpaid,
      discpaid,
      amexpaid,
      cashpaid,
      mcrefunded,
      discrefunded,
      amexrefunded,
      cashrefunded,
      giftcardpaid,
      webgiftcert,
      webgiftcertpaid,
      defbalance,
      defpurch,
      defrev,
      defrefunds,
      grossale,
      subtotal1,
      controltotal1,
      subtotal2,
      subtotal3,
      subtotal4,
      subtotal5,
      subtotal6,
      controltotal2,
      controltotaldifference,
      Deferredrevenueamountasofreportdate,
    }
  })
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function fmtAmount(v: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

type AmountCellProps = {
  value: number
  drillKey?: keyof typeof DRILL_TYPE
  canDrill: boolean
  onDrill: (key: keyof typeof DRILL_TYPE) => void
  bold?: boolean
}

function AmountCell({ value, drillKey, canDrill, onDrill, bold }: AmountCellProps) {
  const clickable = canDrill && drillKey && value !== 0
  return (
    <td
      className={cn(
        "border border-border px-2 py-1 text-right text-xs tabular-nums whitespace-nowrap",
        bold && "font-semibold",
        clickable && "cursor-pointer text-blue-600 underline hover:text-blue-800"
      )}
      onClick={() => clickable && drillKey && onDrill(drillKey)}
    >
      {fmtAmount(value)}
    </td>
  )
}

function TypeCell({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <td className={cn(
      "border border-border px-2 py-1 text-xs whitespace-nowrap align-top",
      bold && "font-semibold"
    )}>
      {children}
    </td>
  )
}

function DescCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border border-border px-2 py-1 text-xs text-muted-foreground align-top">
      {children}
    </td>
  )
}

function SubtotalCell({ value, bold }: { value: number; bold?: boolean }) {
  return (
    <td className={cn(
      "border border-border px-2 py-1 text-right text-xs tabular-nums whitespace-nowrap",
      bold && "font-semibold"
    )}>
      {fmtAmount(value)}
    </td>
  )
}

function EmptyCell() {
  return <td className="border border-border px-2 py-1" />
}

// ─── Per-date document ────────────────────────────────────────────────────────

type ReportDocumentProps = {
  row: ReconcileReportRow
  canDrill: boolean
  onDrill: (key: keyof typeof DRILL_TYPE) => void
}

function ReportDocument({ row, canDrill, onDrill }: ReportDocumentProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-foreground">
            End of Day Report for {row.reportdate}
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{row.startdate}</span>
            <span>{row.enddate}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[52rem] border-collapse text-xs">
          <colgroup>
            <col className="w-36" />
            <col />
            <col className="w-24" />
            <col className="w-24" />
          </colgroup>

          {/* ── Purchase ── */}
          <thead>
            <tr>
              <th colSpan={4} className="pb-2 text-left text-sm font-bold text-foreground">
                Purchase
              </th>
            </tr>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-2 py-1 text-left font-semibold">Type</th>
              <th className="px-2 py-1 text-left font-semibold">Description</th>
              <th className="px-2 py-1" />
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <TypeCell>Daily Paid</TypeCell>
              <DescCell>All door revenue for report date (all reservations for any show date)</DescCell>
              <AmountCell value={row.dailypaid} drillKey="dailypaid" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Gift Card</TypeCell>
              <DescCell>Gift Card Purchased for report date</DescCell>
              <AmountCell value={row.giftcardpaid} drillKey="giftcardpaid" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Web Gift Cert</TypeCell>
              <DescCell>Web Gift Cert Purchased for report date</DescCell>
              <AmountCell value={row.webgiftcert} drillKey="webgiftcert" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Refunds Deferred</TypeCell>
              <DescCell>Refunds processed for report date - current</DescCell>
              <AmountCell value={row.futurerefunds} drillKey="futurerefunds" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Refunds Prior</TypeCell>
              <DescCell>Refunds processed for report date - prior shows</DescCell>
              <AmountCell value={row.priorrefunds} drillKey="priorrefunds" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell bold>Total Purchases</TypeCell>
              <DescCell>Subtotal</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.subtotal1} />
            </tr>
            <tr>
              <TypeCell>Gross Sales</TypeCell>
              <DescCell>Daily sales for report date (includes past and current deferred revenue)</DescCell>
              <AmountCell value={row.grossale} drillKey="grossale" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell bold>Total</TypeCell>
              <DescCell>Control Total</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.controltotal1} bold />
            </tr>
          </tbody>

          {/* ── Settlement ── */}
          <thead>
            <tr>
              <th colSpan={4} className="pt-6 pb-2 text-left text-sm font-bold text-foreground">
                Settlement
              </th>
            </tr>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-2 py-1 text-left font-semibold">Type</th>
              <th className="px-2 py-1 text-left font-semibold">Description</th>
              <th className="px-2 py-1" />
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <TypeCell>MC/Visa Purchases</TypeCell>
              <DescCell>Purchases processed for report date</DescCell>
              <AmountCell value={row.mcpaid} drillKey="mcpaid" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>MC/Visa Refunds</TypeCell>
              <DescCell>Refunds processed for report date</DescCell>
              <AmountCell value={row.mcrefunded} drillKey="mcrefunded" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Total MC/Visa</TypeCell>
              <DescCell>Subtotal</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.subtotal2} />
            </tr>
            <tr>
              <TypeCell>Discover Purchases</TypeCell>
              <DescCell>Purchases processed for report date</DescCell>
              <AmountCell value={row.discpaid} drillKey="discpaid" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Discover Refunds</TypeCell>
              <DescCell>Refunds processed for report date</DescCell>
              <AmountCell value={row.discrefunded} drillKey="discrefunded" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Total Discover</TypeCell>
              <DescCell>Subtotal</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.subtotal3} />
            </tr>
            <tr>
              <TypeCell>AMEX Purchases</TypeCell>
              <DescCell>Purchases processed for report date</DescCell>
              <AmountCell value={row.amexpaid} drillKey="amexpaid" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>AMEX Refunds</TypeCell>
              <DescCell>Refunds processed for report date</DescCell>
              <AmountCell value={row.amexrefunded} drillKey="amexrefunded" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Total AMEX</TypeCell>
              <DescCell>Subtotal</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.subtotal4} />
            </tr>
            <tr>
              <TypeCell>Cash Purchases</TypeCell>
              <DescCell>Cash and check received for report date (make a separate bank deposit)</DescCell>
              <AmountCell value={row.cashpaid} drillKey="cashpaid" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Cash Refunds</TypeCell>
              <DescCell>Cash and check refunded for report date</DescCell>
              <AmountCell value={row.cashrefunded} drillKey="cashrefunded" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Total Cash</TypeCell>
              <DescCell>Subtotal</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.subtotal5} />
            </tr>
            <tr>
              <TypeCell>Gift Card/Cert</TypeCell>
              <DescCell>Gift Card and Certificates redeemed for report date</DescCell>
              <AmountCell value={0} canDrill={false} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Web Gift Cert</TypeCell>
              <DescCell>Web Gift Certificate redeemed for report date</DescCell>
              <AmountCell value={row.webgiftcertpaid} drillKey="webgiftcertpaid" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Prior System Trans</TypeCell>
              <DescCell>Deferred Revenue transferred from prior system for report date</DescCell>
              <AmountCell value={0} canDrill={false} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell>Total Settlement</TypeCell>
              <DescCell>Subtotal</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.subtotal6} />
            </tr>
            <tr>
              <TypeCell>Deferred Revenue Used</TypeCell>
              <DescCell>Deferred Revenue used for report date</DescCell>
              <AmountCell value={row.defrev} drillKey="defrev" canDrill={canDrill} onDrill={onDrill} />
              <EmptyCell />
            </tr>
            <tr>
              <TypeCell bold>Total</TypeCell>
              <DescCell>Control Total</DescCell>
              <EmptyCell />
              <SubtotalCell value={row.controltotal2} bold />
            </tr>
          </tbody>
        </table>

        {/* Control Total Difference */}
        <div className="mt-4 flex items-center justify-between gap-4 text-xs">
          <span>Control Total Difference</span>
          <span className="font-semibold tabular-nums">{fmtAmount(row.controltotaldifference)}</span>
        </div>

        {/* Deferred Revenue summary */}
        <div className="mt-4 grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1 text-xs">
          <span className="col-span-3 pt-2 font-bold">Deferred Revenue</span>
          <span>Deferred Revenue</span>
          <span className="text-muted-foreground">Deferred revenue amount as of report date</span>
          <span className="text-right tabular-nums font-medium">
            {fmtAmount(row.Deferredrevenueamountasofreportdate)}
          </span>
        </div>

        {/* Proof for Deferred Revenue */}
        <div className="mt-4 overflow-hidden rounded border border-border bg-neutral-400/20">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td colSpan={2} className="px-3 py-1.5 font-bold">Proof for Deferred Revenue</td>
              </tr>
              <tr>
                <td className="px-3 py-1">Beginning Balance</td>
                <td className="px-3 py-1 text-right">
                  <span
                    className={cn(
                      "tabular-nums",
                      canDrill && row.defbalance !== 0 && "cursor-pointer text-blue-600 underline"
                    )}
                    onClick={() => canDrill && row.defbalance !== 0 && onDrill("defbalance")}
                  >
                    {fmtAmount(row.defbalance)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1">Purchased Deferred Revenue as of report date</td>
                <td className="px-3 py-1 text-right">
                  <span
                    className={cn(
                      "tabular-nums",
                      canDrill && row.defpurch !== 0 && "cursor-pointer text-blue-600 underline"
                    )}
                    onClick={() => canDrill && row.defpurch !== 0 && onDrill("defpurch")}
                  >
                    {fmtAmount(row.defpurch)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1">Deferred Revenue as of report date</td>
                <td className="px-3 py-1 text-right">
                  <span
                    className={cn(
                      "tabular-nums",
                      canDrill && row.defrev !== 0 && "cursor-pointer text-blue-600 underline"
                    )}
                    onClick={() => canDrill && row.defrev !== 0 && onDrill("defrevProof")}
                  >
                    {fmtAmount(row.defrev)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1">Deferred refunds processed</td>
                <td className="px-3 py-1 text-right">
                  <span
                    className={cn(
                      "tabular-nums",
                      canDrill && row.defrefunds !== 0 && "cursor-pointer text-blue-600 underline"
                    )}
                    onClick={() => canDrill && row.defrefunds !== 0 && onDrill("defrefunds")}
                  >
                    {fmtAmount(row.defrefunds)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 font-semibold">Ending Balance of Deferred Revenue</td>
                <td className="px-3 py-1 text-right font-semibold tabular-nums">
                  {fmtAmount(row.Deferredrevenueamountasofreportdate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function ReconcileReportView({ rawData, subtitle, generatedAt, drillContext }: Props) {
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null)

  const rows = buildReconcileReportData(
    rawData,
    drillContext?.startDate ?? "",
    drillContext?.endDate ?? ""
  )

  if (!rows.length) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  function handleDrill(key: keyof typeof DRILL_TYPE) {
    const drillType = DRILL_TYPE[key]
    if (!drillType) return
    setDrillTarget({ drillType, label: drillType })
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Reconcile Report</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      {rows.map((row, i) => (
        <ReportDocument
          key={i}
          row={row}
          canDrill={!!drillContext}
          onDrill={handleDrill}
        />
      ))}

      {drillContext && (
        <p className="text-xs text-muted-foreground">
          Click any blue amount to drill into individual transactions.
        </p>
      )}

      {drillTarget && drillContext && (
        <ReportDrillDialog
          title={`Reconcile Drill Down — ${drillTarget.label}`}
          endpoint="GetReconcileDrillDown"
          body={{
            Connection: drillContext.connectionName,
            StartDate: dayjs(drillContext.startDate).format("MM/DD/YYYY"),
            EndDate: dayjs(drillContext.endDate).format("MM/DD/YYYY"),
            LocaltionId: drillContext.locationId,
            DrillType: drillTarget.drillType,
          }}
          columns={DRILL_COLUMNS}
          onClose={() => setDrillTarget(null)}
        />
      )}
    </div>
  )
}
