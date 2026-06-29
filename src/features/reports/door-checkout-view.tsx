import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useGenerateReportMutation } from "@/store/api/clubmanApi"
import type { ReportDrillContext } from "@/features/reports/reports.service"
import dayjs from "dayjs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ─── API shape ────────────────────────────────────────────────────────────────

export type DoorCheckoutApiRow = {
  ShowId?: string
  Showdt?: string
  CreatedDate?: string
  ComicName?: string
  PymtType?: string
  CCType?: string
  PymtStatus?: string
  Total?: number
  /** Set by the React app when "Separate by users" is active */
  _userLabel?: string
}

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

function isRefund(row: DoorCheckoutApiRow): boolean {
  return (row.PymtStatus ?? "").trim() === "PSTAT21" && (row.Total ?? 0) < 0
}

function fmt(v: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

function fmtDatetime(v: string | Date | undefined): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("M/D/YYYY h:mm A") : String(v)
}

function buildPaymentSummary(rows: DoorCheckoutApiRow[]) {
  const map = new Map<string, { payments: number; refunds: number }>()
  for (const row of rows) {
    const key = row.PymtType || "Unknown"
    if (!map.has(key)) map.set(key, { payments: 0, refunds: 0 })
    const entry = map.get(key)!
    if (isRefund(row)) entry.refunds += row.Total ?? 0
    else entry.payments += row.Total ?? 0
  }
  return Array.from(map.entries()).map(([type, { payments, refunds }]) => ({
    type,
    payments,
    refunds,
    total: payments + refunds,
  }))
}

function buildShowDetails(rows: DoorCheckoutApiRow[]) {
  const map = new Map<
    string,
    { showId: string; showdt: string; comicName: string; payments: Map<string, { payments: number; refunds: number }> }
  >()
  for (const row of rows) {
    const key = row.ShowId ?? row.Showdt ?? "unknown"
    if (!map.has(key)) {
      map.set(key, {
        showId: row.ShowId ?? "",
        showdt: row.Showdt ?? "—",
        comicName: row.ComicName ?? "—",
        payments: new Map(),
      })
    }
    const show = map.get(key)!
    const pymtKey = row.PymtType || "Unknown"
    if (!show.payments.has(pymtKey)) show.payments.set(pymtKey, { payments: 0, refunds: 0 })
    const p = show.payments.get(pymtKey)!
    if (isRefund(row)) p.refunds += row.Total ?? 0
    else p.payments += row.Total ?? 0
  }
  return Array.from(map.values()).map((show) => ({
    showId: show.showId,
    showdt: show.showdt,
    comicName: show.comicName,
    paymentLines: Array.from(show.payments.entries()).map(([type, { payments, refunds }]) => ({
      type,
      payments,
      refunds,
      total: payments + refunds,
    })),
    totalPayments: Array.from(show.payments.values()).reduce((s, v) => s + v.payments, 0),
    totalRefunds: Array.from(show.payments.values()).reduce((s, v) => s + v.refunds, 0),
    total: Array.from(show.payments.values()).reduce((s, v) => s + v.payments + v.refunds, 0),
  }))
}

// ─── Table primitives ──────────────────────────────────────────────────────────

function Th({ children, right, className }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return (
    <th
      className={cn(
        "border border-border bg-muted/50 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap",
        right && "text-right",
        className
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, right, bold, blue, className }: {
  children: React.ReactNode; right?: boolean; bold?: boolean; blue?: boolean; className?: string
}) {
  return (
    <td className={cn(
      "border border-border px-2 py-1 text-xs whitespace-nowrap",
      right && "text-right tabular-nums",
      bold && "font-semibold",
      blue && "text-blue-600",
      className
    )}>
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
            StartDate: dayjs(drillContext.startDate).format("MM/DD/YYYY"),
            EndDate: dayjs(drillContext.endDate).format("MM/DD/YYYY"),
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
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">
            Door CheckOut Drill Down Report
            {target.label && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">— {target.label}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
            Loading drill-down data…
          </div>
        )}

        {error && (
          <div className="py-6 text-center text-sm text-destructive">{error}</div>
        )}

        {!isLoading && !error && drillRows && (
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr>
                  <Th>Show</Th>
                  <Th>Status</Th>
                  <Th>Payment Type</Th>
                  <Th>CC Type</Th>
                  <Th>Source</Th>
                  <Th>Promo</Th>
                  <Th right>Amount</Th>
                  <Th>Cust LName</Th>
                  <Th>Cust FName</Th>
                  <Th>Pymt LName</Th>
                  <Th>Pymt FName</Th>
                  <Th>CreatedBy</Th>
                  <Th>CreateDt</Th>
                </tr>
              </thead>
              <tbody>
                {drillRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-6 text-center text-xs text-muted-foreground">
                      No records found
                    </td>
                  </tr>
                ) : (
                  drillRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <Td>{fmtDatetime(row.Showdt)}</Td>
                      <Td>{row.PymtStatus ?? "—"}</Td>
                      <Td blue>{row.PymtType ?? "—"}</Td>
                      <Td>{row.CCType ?? "—"}</Td>
                      <Td>{row.Source ?? "—"}</Td>
                      <Td>{row.Promo ?? "—"}</Td>
                      <Td right>${fmt(row.Amount ?? 0)}</Td>
                      <Td>{row.CustLName ?? "—"}</Td>
                      <Td>{row.CustFName ?? "—"}</Td>
                      <Td>{row.PymtLName ?? "—"}</Td>
                      <Td>{row.PymtFName ?? "—"}</Td>
                      <Td>{row.CreatedBy ?? "—"}</Td>
                      <Td>{fmtDatetime(row.CreatedDate)}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && drillRows && drillRows.length > 0 && (
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">{drillRows.length} record{drillRows.length !== 1 ? "s" : ""}</span>
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
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground border-b border-border/70">
          Checkout Date: {date}
        </div>

        <div className="space-y-4 p-3">
          {/* 1 — Payment type summary */}
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <Th className="min-w-32">Payment Type</Th>
                  <Th right>Payments</Th>
                  <Th right>Refunds</Th>
                  <Th right>Totals</Th>
                </tr>
              </thead>
              <tbody>
                {paymentSummary.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <Td>{row.type}</Td>
                    <Td right>{fmt(row.payments)}</Td>
                    <Td right>{fmt(row.refunds)}</Td>
                    <Td right blue={row.total !== 0}>{fmt(row.total)}</Td>
                  </tr>
                ))}
                <tr className="bg-muted/10">
                  <Td />
                  <Td right>{fmt(grandPayments)}</Td>
                  <Td right>{fmt(grandRefunds)}</Td>
                  <Td right blue={grandTotal !== 0}>{fmt(grandTotal)}</Td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2 — Show details: Payment Type and Total are both clickable */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <Th>Show</Th>
                  <Th>Payment Type</Th>
                  <Th right>Payments</Th>
                  <Th right>Refunds</Th>
                  <Th right>Totals</Th>
                </tr>
              </thead>
              <tbody>
                {showDetails.map((show, si) => (
                  <>
                    {show.paymentLines.map((line, li) => {
                      const drillLabel = `${show.showdt}${show.comicName !== "—" ? ` – ${show.comicName}` : ""} (${line.type})`
                      const canDrill = !!drillContext
                      return (
                        <tr key={`${si}-${li}`} className={cn(si % 2 === 0 ? "bg-background" : "bg-muted/10")}>
                          {li === 0 ? (
                            <Td
                              className="font-medium"
                              rowSpan={show.paymentLines.length}
                            >
                              {show.showdt}{show.comicName !== "—" ? ` – ${show.comicName}` : ""}
                            </Td>
                          ) : null}
                          {/* Payment Type cell — clickable blue link */}
                          <td
                            className={cn(
                              "border border-border px-2 py-1 text-xs whitespace-nowrap text-blue-600 font-medium",
                              canDrill && "cursor-pointer underline hover:text-blue-800 transition-colors"
                            )}
                            onClick={() => canDrill && openDrill(show.showId, show.showdt, drillLabel, line.type)}
                          >
                            {line.type}
                          </td>
                          <Td right>{fmt(line.payments)}</Td>
                          <Td right>{fmt(line.refunds)}</Td>
                          {/* Total cell — also clickable */}
                          <td
                            className={cn(
                              "border border-border px-2 py-1 text-xs whitespace-nowrap text-right tabular-nums",
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
                      <Td />
                      <Td />
                      <Td right>{fmt(show.totalPayments)}</Td>
                      <Td right>{fmt(show.totalRefunds)}</Td>
                      <Td right blue>{fmt(show.total)}</Td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3 — Grand Total */}
          <div className="flex justify-end">
            <table className="border-collapse text-xs">
              <tbody>
                <tr className="bg-muted/40">
                  <td className="border border-border px-4 py-1 text-xs font-semibold">Total</td>
                  <td className="border border-border px-4 py-1 text-right text-xs tabular-nums font-semibold">{fmt(grandPayments)}</td>
                  <td className="border border-border px-4 py-1 text-right text-xs tabular-nums font-semibold">{fmt(grandRefunds)}</td>
                  <td className="border border-border px-4 py-1 text-right text-xs tabular-nums font-bold text-blue-600">{fmt(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

/** Group rows by CreatedDate, preserving insertion order. */
function groupByDate(rows: DoorCheckoutApiRow[]): [string, DoorCheckoutApiRow[]][] {
  const map = new Map<string, DoorCheckoutApiRow[]>()
  for (const row of rows) {
    const key = row.CreatedDate ?? "Unknown"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  return Array.from(map.entries())
}

export function DoorCheckoutView({ rawData, subtitle, generatedAt, drillContext }: DoorCheckoutViewProps) {
  const rows = Array.isArray(rawData) ? (rawData as DoorCheckoutApiRow[]) : []

  if (!rows.length) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  // Detect separate-by-user mode: any row has a _userLabel set
  const isSeparateByUsers = rows.some((r) => r._userLabel !== undefined)

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Door Checkout</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      {isSeparateByUsers ? (
        // ── Grouped by user ───────────────────────────────────────────────
        (() => {
          const userMap = new Map<string, DoorCheckoutApiRow[]>()
          for (const row of rows) {
            const key = row._userLabel ?? ""
            if (!userMap.has(key)) userMap.set(key, [])
            userMap.get(key)!.push(row)
          }
          return Array.from(userMap.entries()).map(([userName, userRows]) => (
            <div key={userName} className="space-y-2">
              {/* Cyan "User:" bar matching desktop app */}
              <div className="rounded-md bg-cyan-100 dark:bg-cyan-900/40 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700">
                User: {userName || "(unknown)"}
              </div>
              {groupByDate(userRows).map(([date, dateRows]) => (
                <DateSection key={date} date={date} rows={dateRows} drillContext={drillContext} />
              ))}
            </div>
          ))
        })()
      ) : (
        // ── Normal mode: grouped by date only ─────────────────────────────
        groupByDate(rows).map(([date, dateRows]) => (
          <DateSection key={date} date={date} rows={dateRows} drillContext={drillContext} />
        ))
      )}

      <p className="text-right text-xs text-muted-foreground">
        {rows.length} row{rows.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
