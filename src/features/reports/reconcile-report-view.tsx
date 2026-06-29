import { useState } from "react"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"
import type { ReportDrillContext } from "@/features/reports/reports.service"

// ─── Types ────────────────────────────────────────────────────────────────────

type ReconcileRow = {
  reportdate?: string
  cashpaid?: number
  cashrefunded?: number
  amexpaid?: number
  amexrefunded?: number
  mcpaid?: number
  mcrefunded?: number
  discpaid?: number
  discrefunded?: number
  giftcardpaid?: number
  webgiftcert?: number
  webgiftcertpaid?: number
  grossale?: number
  dailypaid?: number
  defpurch?: number
  defcollected?: number
  defrefunds?: number
  defbalance?: number
  defrev?: number
  priorrefunds?: number
  futurerefunds?: number
}

type DrillTarget = { drillType: string; label: string }

// ─── DrillType labels — must match what the API expects exactly ────────────────
// Source: ReconcileConverter in WPF XAML
const DRILL_LABEL: Record<keyof Omit<ReconcileRow, "reportdate">, string> = {
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
  webgiftcertpaid: "Deferred Revenue Used",
  defbalance:      "Beginning Balance",
  defpurch:        "Purchased Deferred Revenue as of report date",
  defrev:          "Deferred Revenue as of report date",
  defrefunds:      "Deferred refunds processed",
  defcollected:    "Deferred Revenue Used",
}

// ─── Drill response columns ────────────────────────────────────────────────────

const DRILL_COLUMNS: DrillColumn[] = [
  { key: "ShowDate",       label: "Show Date" },
  { key: "ShowTm",         label: "Show Time" },
  { key: "ComicName",      label: "Comic" },
  { key: "LastName",       label: "Last Name" },
  { key: "FirstName",      label: "First Name" },
  { key: "Business",       label: "Business" },
  { key: "PymtLastName",   label: "Pymt Last" },
  { key: "PymtFirstName",  label: "Pymt First" },
  { key: "Status",         label: "Status" },
  { key: "PymtType",       label: "Pymt Type" },
  { key: "CCType",         label: "CC Type" },
  { key: "Amount",         label: "Amount", right: true },
  { key: "PymtDate",       label: "Pymt Date" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function n(v: number | undefined | null): number { return v ?? 0 }

function fmtCurrency(v: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(v)
}

function fmtDate(v: string | undefined): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("MM/DD/YYYY") : v
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type AmountRowProps = {
  label: string
  value: number
  canDrill: boolean
  onDrill: () => void
}

function AmountRow({ label, value, canDrill, onDrill }: AmountRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-2 py-0.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums font-medium",
          canDrill && value !== 0 && "cursor-pointer text-blue-600 underline hover:text-blue-800 transition-colors"
        )}
        onClick={() => canDrill && value !== 0 && onDrill()}
      >
        {value !== 0 ? `$${fmtCurrency(value)}` : "—"}
      </span>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 border-b border-border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  )
}

function Subtotal({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/50 px-2 py-1 text-xs font-semibold">
      <span>{label}</span>
      <span className="tabular-nums">${fmtCurrency(value)}</span>
    </div>
  )
}

// ─── Per-date report card ─────────────────────────────────────────────────────

type ReportCardProps = {
  row: ReconcileRow
  drillContext?: ReportDrillContext
  onDrill: (target: DrillTarget) => void
}

function ReportCard({ row, drillContext, onDrill }: ReportCardProps) {
  const canDrill = !!drillContext

  function drill(field: keyof Omit<ReconcileRow, "reportdate">) {
    const label = DRILL_LABEL[field] ?? field
    onDrill({ drillType: label, label })
  }

  // ── Purchase section ──────────────────────────────────────────────────
  const subtotal1 = n(row.dailypaid) + n(row.giftcardpaid) + n(row.webgiftcert)
    + n(row.futurerefunds) + n(row.priorrefunds)
  const controlTotal1 = subtotal1 + n(row.grossale)

  // ── Settlement section ────────────────────────────────────────────────
  const mcNet     = n(row.mcpaid)   + n(row.mcrefunded)
  const discNet   = n(row.discpaid) + n(row.discrefunded)
  const amexNet   = n(row.amexpaid) + n(row.amexrefunded)
  const cashNet   = n(row.cashpaid) + n(row.cashrefunded)
  const subtotal2 = mcNet + discNet + amexNet + cashNet + n(row.giftcardpaid) + n(row.webgiftcertpaid)
  const controlTotal2 = subtotal2

  // ── Deferred Revenue section ──────────────────────────────────────────
  const deferredAsOf = n(row.defbalance) + n(row.defpurch) - n(row.defrev) - n(row.defrefunds)

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-[#155abb]/10 px-4 py-2">
        <h3 className="text-sm font-semibold text-foreground">
          End of Day Report — {fmtDate(row.reportdate)}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-0 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
        {/* ── Left: Purchases ───────────────────────────────────────────── */}
        <div className="p-3">
          <SectionHeader>Purchases</SectionHeader>
          <AmountRow label="Daily Paid"          value={n(row.dailypaid)}    canDrill={canDrill} onDrill={() => drill("dailypaid")} />
          <AmountRow label="Gift Card / Cert"    value={n(row.giftcardpaid)} canDrill={canDrill} onDrill={() => drill("giftcardpaid")} />
          <AmountRow label="Web Gift Certificate" value={n(row.webgiftcert)} canDrill={canDrill} onDrill={() => drill("webgiftcert")} />
          <AmountRow label="Future Refunds"      value={n(row.futurerefunds)} canDrill={canDrill} onDrill={() => drill("futurerefunds")} />
          <AmountRow label="Prior Refunds"       value={n(row.priorrefunds)} canDrill={canDrill} onDrill={() => drill("priorrefunds")} />
          <Subtotal label="Subtotal" value={subtotal1} />
          <AmountRow label="Gross Sales"         value={n(row.grossale)}     canDrill={canDrill} onDrill={() => drill("grossale")} />
          <Subtotal label="Control Total" value={controlTotal1} />
        </div>

        {/* ── Right: Settlement ─────────────────────────────────────────── */}
        <div className="p-3">
          <SectionHeader>Settlement</SectionHeader>
          <AmountRow label="MC / Visa Purchases"  value={n(row.mcpaid)}       canDrill={canDrill} onDrill={() => drill("mcpaid")} />
          <AmountRow label="MC / Visa Refunds"    value={n(row.mcrefunded)}   canDrill={canDrill} onDrill={() => drill("mcrefunded")} />
          <AmountRow label="Discover Purchases"   value={n(row.discpaid)}     canDrill={canDrill} onDrill={() => drill("discpaid")} />
          <AmountRow label="Discover Refunds"     value={n(row.discrefunded)} canDrill={canDrill} onDrill={() => drill("discrefunded")} />
          <AmountRow label="AMEX Purchases"       value={n(row.amexpaid)}     canDrill={canDrill} onDrill={() => drill("amexpaid")} />
          <AmountRow label="AMEX Refunds"         value={n(row.amexrefunded)} canDrill={canDrill} onDrill={() => drill("amexrefunded")} />
          <AmountRow label="Cash Purchases"       value={n(row.cashpaid)}     canDrill={canDrill} onDrill={() => drill("cashpaid")} />
          <AmountRow label="Cash Refunds"         value={n(row.cashrefunded)} canDrill={canDrill} onDrill={() => drill("cashrefunded")} />
          <AmountRow label="Gift Card / Cert"     value={n(row.giftcardpaid)} canDrill={canDrill} onDrill={() => drill("giftcardpaid")} />
          <AmountRow label="Web GC Paid"          value={n(row.webgiftcertpaid)} canDrill={canDrill} onDrill={() => drill("webgiftcertpaid")} />
          <Subtotal label="Subtotal" value={subtotal2} />
          <Subtotal label="Control Total" value={controlTotal2} />
          <div className={cn(
            "flex items-center justify-between gap-4 px-2 py-1 text-xs font-semibold",
            controlTotal1 !== controlTotal2 && "text-destructive"
          )}>
            <span>Difference</span>
            <span className="tabular-nums">${fmtCurrency(controlTotal1 - controlTotal2)}</span>
          </div>
        </div>
      </div>

      {/* ── Deferred Revenue ──────────────────────────────────────────────── */}
      <div className="border-t border-border p-3">
        <SectionHeader>Deferred Revenue</SectionHeader>
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
          <AmountRow label="Beginning Balance"               value={n(row.defbalance)} canDrill={canDrill} onDrill={() => drill("defbalance")} />
          <AmountRow label="Purchased Deferred Revenue"      value={n(row.defpurch)}   canDrill={canDrill} onDrill={() => drill("defpurch")} />
          <AmountRow label="Deferred Revenue Used"           value={n(row.defrev)}     canDrill={canDrill} onDrill={() => drill("defrev")} />
          <AmountRow label="Deferred Refunds Processed"      value={n(row.defrefunds)} canDrill={canDrill} onDrill={() => drill("defrefunds")} />
        </div>
        <Subtotal label={`Deferred Revenue as of ${fmtDate(row.reportdate)}`} value={deferredAsOf} />
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
  const rows = Array.isArray(rawData) ? (rawData as ReconcileRow[]) : []
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null)

  if (!rows.length) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Reconcile Report</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      {rows.map((row, i) => (
        <ReportCard
          key={i}
          row={row}
          drillContext={drillContext}
          onDrill={setDrillTarget}
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
