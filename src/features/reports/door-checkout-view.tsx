import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useGenerateReportMutation } from "@/store/api/clubmanApi"
import type { ReportDrillContext } from "@/features/reports/reports.service"
import { formatUsApiDate } from "@/features/reports/reports.service"
import dayjs from "dayjs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  buildPaymentSummary,
  buildShowDetails,
  fmtAmount,
  groupDoorCheckoutByDate,
  normalizeDoorCheckoutRows,
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
  ccType?: string
  label: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Map payment display names to API lookup codes (PAYTYPE / CCTYPE)
// The main report returns display names; the drill-down API expects these codes.
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

function fmtDatetime(v: string | Date | undefined): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("M/D/YYYY h:mm A") : String(v)
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

  // Fetch on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const codes = target.pymtType ? resolvePaymentCodes(target.pymtType) : { PymtType: "", CCType: "" }
        const data = await generateReport({
          endpoint: "GetDoorCheckOutTotalData",
          body: {
            Connection: drillContext.connectionName,
            StartDate: formatUsApiDate(drillContext.startDate),
            EndDate: formatUsApiDate(drillContext.endDate),
            LocaltionId: drillContext.locationId,
            ShowId: target.showId || undefined,
            ShowDateStr: dayjs(target.showdt).isValid()
              ? dayjs(target.showdt).toDate().toLocaleDateString("en-US")
              : target.showdt || undefined,
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
      <DialogContent className={REPORT_DRILL_DIALOG_CLASS}>
        <DialogHeader className={REPORT_DRILL_HEADER_CLASS}>
          <DialogTitle className="text-base">
            Door CheckOut Drill Down Report
            {target.label && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">— {target.label}</span>
            )}
          </DialogTitle>
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
          <div className={REPORT_DRILL_BODY_CLASS}>
            <ReportTable>
              <thead className="sticky top-0 z-10">
                <tr>
                  <ReportTh>Show</ReportTh>
                  <ReportTh>Status</ReportTh>
                  <ReportTh>Payment Type</ReportTh>
                  <ReportTh>CC Type</ReportTh>
                  <ReportTh>Source</ReportTh>
                  <ReportTh>Promo</ReportTh>
                  <ReportTh right>Amount</ReportTh>
                  <ReportTh>Cust LName</ReportTh>
                  <ReportTh>Cust FName</ReportTh>
                  <ReportTh>Pymt LName</ReportTh>
                  <ReportTh>Pymt FName</ReportTh>
                  <ReportTh>CreatedBy</ReportTh>
                  <ReportTh>CreateDt</ReportTh>
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
                      <ReportTd blue>{row.PymtType ?? "—"}</ReportTd>
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
          </div>
        )}

        {!isLoading && drillRows && drillRows.length > 0 && (
          <div className={cn(REPORT_DRILL_FOOTER_CLASS, "flex items-center justify-between text-left")}>
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

  const paymentSummary = buildPaymentSummary(rows)
  const showDetails = buildShowDetails(rows)

  const grandPayments = paymentSummary.reduce((s, r) => s + r.payments, 0)
  const grandRefunds = paymentSummary.reduce((s, r) => s + r.refunds, 0)
  const grandTotal = grandPayments + grandRefunds

  function openDrill(showId: string, showdt: string, label: string, pymtType?: string, ccType?: string) {
    if (!drillContext) return
    setDrillTarget({ showId, showdt, pymtType, ccType, label })
  }

  return (
    <>
      <ReportCard>
        <ReportSectionBar>Checkout Date: {date}</ReportSectionBar>

        <div className="space-y-4 p-3">
          {/* 1 — Payment type summary */}
          <ReportTableScroll>
            <ReportTable>
              <thead>
                <tr>
                  <ReportTh className="min-w-32">Payment Type</ReportTh>
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
                    <ReportTd right blue={row.total !== 0}>{fmt(row.total)}</ReportTd>
                  </tr>
                ))}
                <tr className="bg-muted/10">
                  <ReportTd />
                  <ReportTd right>{fmt(grandPayments)}</ReportTd>
                  <ReportTd right>{fmt(grandRefunds)}</ReportTd>
                  <ReportTd right blue={grandTotal !== 0}>{fmt(grandTotal)}</ReportTd>
                </tr>
              </tbody>
            </ReportTable>
          </ReportTableScroll>

          {/* 2 — Show details: Payment Type and Total are both clickable */}
          <ReportTableScroll>
            <ReportTable>
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
                {showDetails.map((show, si) => (
                  <>
                    {show.paymentLines.map((line, li) => {
                      const drillLabel = `${show.showdt}${show.comicName !== "—" ? ` – ${show.comicName}` : ""} (${line.type})`
                      const canDrill = !!drillContext
                      return (
                        <tr key={`${si}-${li}`} className={reportRowClass(si)}>
                          {li === 0 ? (
                            <ReportTd className="font-medium" rowSpan={show.paymentLines.length}>
                              {show.showdt}{show.comicName !== "—" ? ` – ${show.comicName}` : ""}
                            </ReportTd>
                          ) : null}
                          <td
                            className={cn(
                              "border border-border px-3 py-2 text-xs whitespace-nowrap text-blue-600 font-medium",
                              canDrill && "cursor-pointer underline hover:text-blue-800 transition-colors"
                            )}
                            onClick={() => canDrill && openDrill(show.showId, show.showdt, drillLabel, line.type)}
                          >
                            {line.type}
                          </td>
                          <ReportTd right>{fmt(line.payments)}</ReportTd>
                          <ReportTd right>{fmt(line.refunds)}</ReportTd>
                          <td
                            className={cn(
                              "border border-border px-3 py-2 text-xs whitespace-nowrap text-right tabular-nums",
                              line.total !== 0 && "text-blue-600",
                              canDrill && line.total !== 0 && "cursor-pointer font-medium underline hover:text-blue-800 transition-colors"
                            )}
                            onClick={() => canDrill && line.total !== 0 && openDrill(show.showId, show.showdt, drillLabel, line.type)}
                          >
                            {fmt(line.total)}
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-muted/20">
                      <ReportTd />
                      <ReportTd />
                      <ReportTd right>{fmt(show.totalPayments)}</ReportTd>
                      <ReportTd right>{fmt(show.totalRefunds)}</ReportTd>
                      <ReportTd right blue>{fmt(show.total)}</ReportTd>
                    </tr>
                  </>
                ))}
              </tbody>
            </ReportTable>
          </ReportTableScroll>

          {/* 3 — Grand Total */}
          <div className="flex justify-end">
            <ReportTable>
              <tbody>
                <tr className="bg-muted/40">
                  <ReportTd bold>Total</ReportTd>
                  <ReportTd bold right>{fmt(grandPayments)}</ReportTd>
                  <ReportTd bold right>{fmt(grandRefunds)}</ReportTd>
                  <ReportTd bold right blue>{fmt(grandTotal)}</ReportTd>
                </tr>
              </tbody>
            </ReportTable>
          </div>
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

export function DoorCheckoutView({ rawData, subtitle, generatedAt, drillContext }: DoorCheckoutViewProps) {
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

      {isSeparateByUsers && summaryRows.length > 0 && (
        groupDoorCheckoutByDate(summaryRows).map(([date, dateRows]) => (
          <DateSection key={`summary-${date}`} date={date} rows={dateRows} drillContext={drillContext} />
        ))
      )}

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
                <DateSection key={`${userName}-${date}`} date={date} rows={dateRows} drillContext={drillContext} />
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
