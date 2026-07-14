import { useState, useEffect } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGenerateReportMutation } from "@/store/api/clubmanApi"
import type { ReportDrillContext } from "@/features/reports/reports.service"
import { formatUsApiDate } from "@/features/reports/reports.service"
import {
  formatUsDateFromValue,
  formatUsDateTimeFromValue,
  parseToDate,
} from "@/lib/format-us-datetime"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  buildPaymentSummary,
  fmtAmount,
  groupDoorCheckoutByDate,
  isRefund,
  normalizeDoorCheckoutRows,
  resolvePaymentDisplayName,
  type DoorCheckoutApiRow,
} from "@/features/reports/door-checkout-data"
import {
  REPORT_DRILL_BODY_CLASS,
  REPORT_DRILL_DIALOG_CLASS,
  REPORT_DRILL_FOOTER_CLASS,
  REPORT_DRILL_HEADER_CLASS,
  ReportCard,
  ReportEmpty,
  ReportHeader,
  ReportSectionBar,
  ReportTable,
  ReportTableScroll,
  ReportTd,
  ReportTh,
  ReportViewShell,
  reportRowClass,
} from "@/features/reports/report-ui"

export type { DoorCheckoutApiRow }
export { normalizeDoorCheckoutRows }

type DrillRow = {
  Showdt?: string | Date
  PymtStatus?: string
  PymtType?: string
  CCType?: string
  Source?: string
  Promo?: string
  Amount?: number
  CustLName?: string
  CustFName?: string
  PymtLName?: string
  PymtFName?: string
  CreatedBy?: string
  CreatedDate?: string | Date
}

type DrillTarget = {
  showId: string
  showdt: string
  pymtType?: string
  label: string
}

// One line per raw API row within a payment-type block
type ShowLineInGroup = {
  showId: string
  showdt: string
  comicName: string
  payments: number   // positive, or 0 if refund
  refunds: number    // negative, or 0 if payment
  total: number      // row.Total (negative for refunds)
}

type PaymentTypeGroup = {
  type: string
  lines: ShowLineInGroup[]
  totalPayments: number
  totalRefunds: number
  total: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PYMT_CODE_MAP: Record<string, { PymtType: string; CCType: string }> = {
  "Cash":               { PymtType: "PYMT05", CCType: "" },
  "Gift Card":          { PymtType: "PYMT03", CCType: "" },
  "Gift Certificate":   { PymtType: "PYMT04", CCType: "" },
  "Gift Cert":          { PymtType: "PYMT04", CCType: "" },
  "Visa":               { PymtType: "",        CCType: "CCTYPE04" },
  "MasterCard":         { PymtType: "",        CCType: "CCTYPE03" },
  "Master Card":        { PymtType: "",        CCType: "CCTYPE03" },
  "Discover":           { PymtType: "",        CCType: "CCTYPE02" },
  "American Express":   { PymtType: "",        CCType: "CCTYPE01" },
  "AmEx":               { PymtType: "",        CCType: "CCTYPE01" },
  "Amex":               { PymtType: "",        CCType: "CCTYPE01" },
}

function resolvePaymentCodes(displayName: string): { PymtType: string; CCType: string } {
  return PYMT_CODE_MAP[displayName] ?? { PymtType: displayName, CCType: "" }
}

const fmt = fmtAmount
const DRILL_STICKY_HEADER_CLASS = "sticky top-0 z-20 bg-muted"

function fmtDatetime(v: string | Date | undefined): string {
  return formatUsDateTimeFromValue(v, "—")
}

function fmtShowLabel(showdt: string, comicName: string): string {
  const formattedShow = fmtDatetime(showdt)
  return comicName !== "—" ? `${formattedShow} – ${comicName}` : formattedShow
}

/**
 * Groups raw API rows by resolved payment display name.
 * Each API row becomes its own line — nothing is collapsed.
 * This means a show with both a Cash payment and a Cash refund
 * will produce TWO separate Cash lines (3 Cash rows instead of 2).
 */
function buildPaymentTypeGroupsFromRows(rows: DoorCheckoutApiRow[]): PaymentTypeGroup[] {
  const map = new Map<string, ShowLineInGroup[]>()

  for (const row of rows) {
    const type = resolvePaymentDisplayName(row)
    const total = row.Total ?? 0
    const ref = isRefund(row)

    const line: ShowLineInGroup = {
      showId: row.ShowId ?? "",
      showdt: row.Showdt ?? "",
      comicName: row.ComicName ?? "",
      payments: ref ? 0 : total,
      refunds: ref ? total : 0,
      total,
    }

    if (!map.has(type)) map.set(type, [])
    map.get(type)!.push(line)
  }

  return Array.from(map.entries()).map(([type, lines]) => ({
    type,
    lines,
    totalPayments: lines.reduce((s, l) => s + l.payments, 0),
    totalRefunds: lines.reduce((s, l) => s + l.refunds, 0),
    total: lines.reduce((s, l) => s + l.total, 0),
  }))
}

// ─── Clickable blue drill cell (show details only) ────────────────────────────

function DrillCell({
  children,
  onClick,
  right,
  canDrill,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  right?: boolean
  canDrill: boolean
  className?: string
}) {
  return (
    <td
      onClick={canDrill ? onClick : undefined}
      className={cn(
        "border border-border px-3 py-2 text-xs whitespace-nowrap font-medium text-blue-600",
        right && "text-right tabular-nums",
        canDrill && "cursor-pointer hover:text-blue-800 transition-colors",
        className
      )}
    >
      {children}
    </td>
  )
}

// ─── Drill-down Dialog ─────────────────────────────────────────────────────────

function DrillDownDialog({
  target,
  drillContext,
  onClose,
}: {
  target: DrillTarget
  drillContext: ReportDrillContext
  onClose: () => void
}) {
  const [generateReport] = useGenerateReportMutation()
  const [drillRows, setDrillRows] = useState<DrillRow[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const codes = target.pymtType
          ? resolvePaymentCodes(target.pymtType)
          : { PymtType: "", CCType: "" }
        const data = await generateReport({
          endpoint: "GetDoorCheckOutTotalData",
          body: {
            Connection: drillContext.connectionName,
            StartDate: formatUsApiDate(drillContext.startDate),
            EndDate: formatUsApiDate(drillContext.endDate),
            LocaltionId: drillContext.locationId,
            ShowId: target.showId || undefined,
            ShowDateStr: (() => {
              const parsed = parseToDate(target.showdt)
              return parsed ? formatUsDateFromValue(parsed) : target.showdt || undefined
            })(),
            PymtType: codes.PymtType,
            CCType: codes.CCType,
            CreatedBy: "",
          },
        }).unwrap()
        setDrillRows(Array.isArray(data) ? (data as DrillRow[]) : [])
      } catch {
        setError("Failed to load drill-down data.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = (drillRows ?? []).reduce((s, r) => s + (r.Amount ?? 0), 0)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={cn(
          REPORT_DRILL_DIALOG_CLASS,
          isExpanded &&
            "h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)]"
        )}
      >
        <DialogHeader className={cn(REPORT_DRILL_HEADER_CLASS, "relative")}>
          <DialogTitle className="text-base flex flex-col lg:flex-row">
            Door CheckOut Drill Down Report :
          </DialogTitle>
          <button
            type="button"
            className="absolute top-1/2 right-14 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            aria-label={isExpanded ? "Restore dialog size" : "Expand dialog"}
            title={isExpanded ? "Restore" : "Expand"}
            onClick={() => setIsExpanded((v) => !v)}
          >
            {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center px-5 py-12 text-sm text-muted-foreground">
            Loading drill-down data…
          </div>
        )}

        {error && (
          <div className="px-5 py-6 text-center text-sm text-destructive">{error}</div>
        )}

        {!isLoading && !error && drillRows && (
          <div className={cn(REPORT_DRILL_BODY_CLASS, "flex overflow-hidden p-0")}>
            <ReportTableScroll className="mx-5 my-4 min-h-0 flex-1 overflow-auto">
              <ReportTable className="min-w-max border-separate border-spacing-0">
                <thead>
                  <tr>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Show</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Status</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Payment Type</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>CC Type</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Source</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Promo</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS} right>Amount</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Cust LName</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Cust FName</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Pymt LName</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>Pymt FName</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>CreatedBy</ReportTh>
                    <ReportTh className={DRILL_STICKY_HEADER_CLASS}>CreateDt</ReportTh>
                  </tr>
                </thead>
                <tbody>
                  {drillRows.length === 0 ? (
                    <tr>
                      <ReportTd colSpan={13} center className="py-6 text-muted-foreground">
                        No records found
                      </ReportTd>
                    </tr>
                  ) : (
                    drillRows.map((row, i) => (
                      <tr key={i} className={reportRowClass(i)}>
                        <ReportTd>{fmtDatetime(row.Showdt)}</ReportTd>
                        <ReportTd>{row.PymtStatus ?? "—"}</ReportTd>
                        <ReportTd>{row.PymtType ?? "—"}</ReportTd>
                        <ReportTd>{row.CCType ?? "—"}</ReportTd>
                        <ReportTd>{row.Source ?? "—"}</ReportTd>
                        <ReportTd>{row.Promo ?? "—"}</ReportTd>
                        <ReportTd right>${fmt(row.Amount ?? 0)}</ReportTd>
                        <ReportTd>{row.CustLName ?? "—"}</ReportTd>
                        <ReportTd>{row.CustFName ?? "—"}</ReportTd>
                        <ReportTd>{row.PymtLName ?? "—"}</ReportTd>
                        <ReportTd>{row.PymtFName ?? "—"}</ReportTd>
                        <ReportTd>{row.CreatedBy ?? "—"}</ReportTd>
                        <ReportTd>{fmtDatetime(row.CreatedDate)}</ReportTd>
                      </tr>
                    ))
                  )}
                </tbody>
              </ReportTable>
            </ReportTableScroll>
          </div>
        )}

        {!isLoading && drillRows && drillRows.length > 0 && (
          <div
            className={cn(
              REPORT_DRILL_FOOTER_CLASS,
              "flex items-center justify-between text-left"
            )}
          >
            <span className="text-xs text-muted-foreground">
              {drillRows.length} record{drillRows.length !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-semibold">
              Total : <span className="text-primary">$ {fmt(total)}</span>
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Date section ─────────────────────────────────────────────────────────────

function DateSection({
  date,
  rows,
  drillContext,
}: {
  date: string
  rows: DoorCheckoutApiRow[]
  drillContext?: ReportDrillContext
}) {
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null)

  // Payment summary (top table) — aggregated by payment type
  const paymentSummary = buildPaymentSummary(rows)

  // Show details (bottom table) — one row per raw API row, grouped by payment type
  const paymentTypeGroups = buildPaymentTypeGroupsFromRows(rows)

  const grandPayments = paymentSummary.reduce((s, r) => s + r.payments, 0)
  const grandRefunds = paymentSummary.reduce((s, r) => s + r.refunds, 0)
  const grandTotal = grandPayments + grandRefunds

  const canDrill = !!drillContext

  function openDrill(showId: string, showdt: string, label: string, pymtType?: string) {
    if (!drillContext) return
    setDrillTarget({ showId, showdt, pymtType, label })
  }

  // Fixed-width numeric columns wide enough for "1,143.92"
  const numColCls = "w-32 min-w-[7.5rem]"

  return (
    <>
      <ReportCard>
        <ReportSectionBar>Checkout Date: {formatUsDateFromValue(date, date)}</ReportSectionBar>

        <div className="p-3 space-y-4">

          {/* ── Table 1: Payment Type Summary (no blue, no dialog) ── */}
          <ReportTableScroll>
            <table className="w-full border-collapse text-xs">
              <colgroup>
                <col className="w-auto" />
                <col className={numColCls} />
                <col className={numColCls} />
                <col className={numColCls} />
              </colgroup>
              <thead>
                <tr>
                  <ReportTh>Payment Type</ReportTh>
                  <ReportTh right>Payments</ReportTh>
                  <ReportTh right>Refunds</ReportTh>
                  <ReportTh right>Totals</ReportTh>
                </tr>
              </thead>
              <tbody>
                {paymentSummary.map((row, i) => (
                  <tr key={i} className={reportRowClass(i)}>
                    <ReportTd>{row.type}</ReportTd>
                    <ReportTd right>{fmt(row.payments)}</ReportTd>
                    <ReportTd right>{fmt(row.refunds)}</ReportTd>
                    {/* Plain totals — no blue, no dialog */}
                    <ReportTd right>{fmt(row.total)}</ReportTd>
                  </tr>
                ))}
                {/* Summary subtotal row */}
                <tr className="bg-muted/10">
                  <ReportTd />
                  <ReportTd right>{fmt(grandPayments)}</ReportTd>
                  <ReportTd right>{fmt(grandRefunds)}</ReportTd>
                  <ReportTd right>{fmt(grandTotal)}</ReportTd>
                </tr>
              </tbody>
            </table>
          </ReportTableScroll>

          {/* ── Table 2: Show details grouped by payment type ── */}
          {/* Each raw API row = one table row; Cash rows first, then Visa rows, etc. */}
          <ReportTableScroll>
            <table className="w-full border-collapse text-xs">
              <colgroup>
                {/* Show column stretches */}
                <col className="w-auto" />
                {/* Payment Type column stretches */}
                <col className="w-auto" />
                <col className={numColCls} />
                <col className={numColCls} />
                <col className={numColCls} />
              </colgroup>
              <thead>
                <tr>
                  <ReportTh>Show</ReportTh>
                  <ReportTh>Payment Type</ReportTh>
                  <ReportTh right>Payments</ReportTh>
                  <ReportTh right>Refunds</ReportTh>
                  <ReportTh right>Totals</ReportTh>
                </tr>
              </thead>
              <tbody>
                {paymentTypeGroups.map((group, gi) => (
                  <>
                    {group.lines.map((line, li) => {
                      const drillLabel = `${fmtShowLabel(line.showdt, line.comicName)} (${group.type})`
                      return (
                        <tr key={`${gi}-${li}`} className={reportRowClass(gi)}>
                          {/* Show label */}
                          <ReportTd className="font-medium">
                            {fmtShowLabel(line.showdt, line.comicName)}
                          </ReportTd>
                          {/* Payment Type — blue/clickable → drill for this specific show + type */}
                          <DrillCell
                            canDrill={canDrill}
                            onClick={() =>
                              openDrill(line.showId, line.showdt, drillLabel, group.type)
                            }
                          >
                            {group.type}
                          </DrillCell>
                          <ReportTd right>
                            {line.payments !== 0 ? fmt(line.payments) : ""}
                          </ReportTd>
                          <ReportTd right>
                            {fmt(line.refunds)}
                          </ReportTd>
                          {/* Totals — plain, no blue, no dialog */}
                          <ReportTd right>{fmt(line.total)}</ReportTd>
                        </tr>
                      )
                    })}

                    {/* Payment type subtotal — total is blue/clickable for all shows of this type */}
                    <tr className="bg-muted/20">
                      <ReportTd />
                      <ReportTd />
                      <ReportTd right>{fmt(group.totalPayments)}</ReportTd>
                      <ReportTd right>{fmt(group.totalRefunds)}</ReportTd>
                      <DrillCell
                        right
                        canDrill={canDrill}
                        onClick={() =>
                          openDrill("", date, `${group.type} — All Shows`, group.type)
                        }
                      >
                        {fmt(group.total)}
                      </DrillCell>
                    </tr>
                  </>
                ))}
              </tbody>
              {/* Grand Total — plain, no yellow */}
              <tfoot>
                <tr className="bg-muted/40">
                  <ReportTd bold className="text-right">Total</ReportTd>
                  <ReportTd />
                  <ReportTd bold right>{fmt(grandPayments)}</ReportTd>
                  <ReportTd bold right>{fmt(grandRefunds)}</ReportTd>
                  <ReportTd bold right>{fmt(grandTotal)}</ReportTd>
                </tr>
              </tfoot>
            </table>
          </ReportTableScroll>

        </div>
      </ReportCard>

      {drillTarget && drillContext && (
        <DrillDownDialog
          target={drillTarget}
          drillContext={drillContext}
          onClose={() => setDrillTarget(null)}
        />
      )}
    </>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

type DoorCheckoutViewProps = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function DoorCheckoutView({
  rawData,
  subtitle,
  generatedAt,
  drillContext,
}: DoorCheckoutViewProps) {
  const rows = normalizeDoorCheckoutRows(rawData)

  if (!rows.length) {
    return <ReportEmpty />
  }

  const summaryRows = rows.filter((r) => !r._userLabel)
  const userRows = rows.filter((r) => r._userLabel)
  const isSeparateByUsers = userRows.length > 0

  return (
    <ReportViewShell>
      <ReportHeader title="Door Checkout" subtitle={subtitle} generatedAt={generatedAt} />

      {isSeparateByUsers && summaryRows.length > 0 &&
        groupDoorCheckoutByDate(summaryRows).map(([date, dateRows]) => (
          <DateSection
            key={`summary-${date}`}
            date={date}
            rows={dateRows}
            drillContext={drillContext}
          />
        ))}

      {isSeparateByUsers ? (
        (() => {
          const userMap = new Map<string, DoorCheckoutApiRow[]>()
          for (const row of userRows) {
            const key = row._userLabel ?? ""
            if (!userMap.has(key)) userMap.set(key, [])
            userMap.get(key)!.push(row)
          }
          return Array.from(userMap.entries()).map(([userName, perUserRows]) => (
            <div key={userName} className="space-y-2">
              <div className="rounded-md bg-cyan-100 dark:bg-cyan-900/40 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700">
                User: {userName || "(unknown)"}
              </div>
              {groupDoorCheckoutByDate(perUserRows).map(([date, dateRows]) => (
                <DateSection
                  key={`${userName}-${date}`}
                  date={date}
                  rows={dateRows}
                  drillContext={drillContext}
                />
              ))}
            </div>
          ))
        })()
      ) : (
        groupDoorCheckoutByDate(rows).map(([date, dateRows]) => (
          <DateSection key={date} date={date} rows={dateRows} drillContext={drillContext} />
        ))
      )}

      <p className="text-right text-xs text-muted-foreground">
        {rows.length} row{rows.length !== 1 ? "s" : ""}
      </p>
    </ReportViewShell>
  )
}
