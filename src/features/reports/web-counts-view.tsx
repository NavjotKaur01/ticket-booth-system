import { useState } from "react"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"
import type { ReportDrillContext } from "@/features/reports/reports.service"

// ─── Types ────────────────────────────────────────────────────────────────────

type WebCountRow = {
  resDate: string
  todayCount: number
  todayAmount: number
  deferredCount: number
  deferredAmount: number
  totalCount: number
  totalAmount: number
}

type ApiRow = Record<string, unknown>

const WEB_COUNT_DRILL_COLUMNS: DrillColumn[] = [
  { key: "ShowDate", label: "ShowDate", format: "datetime", keys: ["ShowDate", "showDate"] },
  { key: "ShowTm", label: "ShowTm", keys: ["ShowTm", "ShowTime", "showTm"] },
  { key: "ComicName", label: "ComicName", keys: ["ComicName", "comicName"] },
  { key: "LastName", label: "LastName", keys: ["LastName", "lastName"] },
  { key: "FirstName", label: "FirstName", keys: ["FirstName", "firstName"] },
  { key: "Business", label: "Business", keys: ["Business", "business"] },
  { key: "Source", label: "Source", keys: ["Source", "source"] },
  { key: "PartyNo", label: "PartyNo", right: true, format: "number", keys: ["PartyNo", "partyNo"] },
  { key: "CheckedIn", label: "CheckedIn", right: true, format: "number", keys: ["CheckedIn", "checkedIn"] },
  { key: "Total", label: "Total", right: true, format: "currency", keys: ["Total", "total"] },
  { key: "Paid", label: "Paid", right: true, format: "currency", keys: ["Paid", "paid"] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0"))
  return Number.isFinite(n) ? n : 0
}

function fmtMoney(v: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

function fmtMoneyCell(v: number): string {
  return `$ ${fmtMoney(v)}`
}

/** Desktop binds resdate as full datetime, e.g. 6/1/2026 12:00:00 AM */
function fmtResDate(v: string): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("M/D/YYYY h:mm:ss A") : v
}

function fmtShortDate(v: string): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("M/D/YYYY") : v
}

/** WPF drill uses Convert.ToString(resdate.Value) for StartDate */
function drillStartDateParam(resDate: string): string {
  const d = dayjs(resDate)
  return d.isValid() ? d.format("M/D/YYYY h:mm:ss A") : resDate
}

export function mapWebCountRows(raw: unknown): WebCountRow[] {
  if (!Array.isArray(raw)) return []
  return (raw as ApiRow[]).map((row) => ({
    resDate: String(row.ResDate ?? row.resdate ?? ""),
    todayCount: toNum(row.CurrentCount ?? row.curcount),
    todayAmount: toNum(row.CurramtAmount ?? row.CurrAmtAmount ?? row.curamt),
    deferredCount: toNum(row.DefaultCount ?? row.defcount),
    deferredAmount: toNum(row.DefaultAmount ?? row.defamt),
    totalCount: toNum(row.TotalCount ?? row.totcount),
    totalAmount: toNum(row.TotalAmount ?? row.totamt),
  }))
}

// ─── Table primitives ─────────────────────────────────────────────────────────

function Th({ children, right, className, colSpan }: {
  children?: React.ReactNode; right?: boolean; className?: string; colSpan?: number
}) {
  return (
    <th
      colSpan={colSpan}
      className={cn(
        "border border-border bg-muted/50 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap",
        right ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, right, blue, bold, className, colSpan }: {
  children?: React.ReactNode; right?: boolean; blue?: boolean; bold?: boolean; className?: string; colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "border border-border px-2 py-1 text-xs whitespace-nowrap",
        right ? "text-right tabular-nums" : "text-left",
        blue && "text-blue-600",
        bold && "font-semibold",
        className
      )}
    >
      {children}
    </td>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function WebCountsView({ rawData, subtitle, generatedAt, drillContext }: Props) {
  const rows = mapWebCountRows(rawData)
  const [drillRow, setDrillRow] = useState<WebCountRow | null>(null)

  const totTodayCount = rows.reduce((s, r) => s + r.todayCount, 0)
  const totTodayAmt = rows.reduce((s, r) => s + r.todayAmount, 0)
  const totDefCount = rows.reduce((s, r) => s + r.deferredCount, 0)
  const totDefAmt = rows.reduce((s, r) => s + r.deferredAmount, 0)
  const totAllCount = totTodayCount + totDefCount
  const totAllAmt = totTodayAmt + totDefAmt

  if (!rows.length) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        No records found
      </div>
    )
  }

  function handleRowDoubleClick(row: WebCountRow) {
    if (drillContext) setDrillRow(row)
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Web Counts</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm px-4 py-4">
        <h3 className="mb-4 text-center text-xl font-bold text-foreground">
          Daily Web Counts Report
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-xs">
            <thead>
              <tr>
                <Th />
                <Th colSpan={2} className="font-bold text-foreground">Today</Th>
                <Th colSpan={2} className="font-bold text-foreground">Defferred</Th>
                <Th colSpan={2} className="font-bold text-foreground">Total</Th>
              </tr>
              <tr>
                <Th>Date</Th>
                <Th right>Count</Th>
                <Th right>Amount</Th>
                <Th right>Count</Th>
                <Th right>Amount</Th>
                <Th right>Count</Th>
                <Th right>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    i % 2 === 1 && "bg-muted/15",
                    drillContext && "cursor-pointer hover:bg-muted/30"
                  )}
                  onDoubleClick={() => handleRowDoubleClick(row)}
                  title={drillContext ? "Double-click for drill-down details" : undefined}
                >
                  <Td>{fmtResDate(row.resDate)}</Td>
                  <Td right>{row.todayCount}</Td>
                  <Td right>{fmtMoneyCell(row.todayAmount)}</Td>
                  <Td right>{row.deferredCount}</Td>
                  <Td right>{fmtMoneyCell(row.deferredAmount)}</Td>
                  <Td right blue>{row.totalCount}</Td>
                  <Td right blue>{fmtMoneyCell(row.totalAmount)}</Td>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <Td bold>Total:</Td>
                <Td bold right>{totTodayCount}</Td>
                <Td bold right>$ {fmtMoney(totTodayAmt)}</Td>
                <Td bold right>{totDefCount}</Td>
                <Td bold right>$ {fmtMoney(totDefAmt)}</Td>
                <Td bold right>{totAllCount}</Td>
                <Td bold right>$ {fmtMoney(totAllAmt)}</Td>
              </tr>
            </tbody>
          </table>
        </div>

        {drillContext && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Double-click a row to open drill-down details
          </p>
        )}
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {rows.length} record{rows.length !== 1 ? "s" : ""}
      </p>

      {drillRow && drillContext && (
        <ReportDrillDialog
          title={`Drill Down Report : Web Reservations Created on ${fmtShortDate(drillRow.resDate)}`}
          endpoint="WebCountDrillDown"
          body={{
            Connection: drillContext.connectionName,
            StartDate: drillStartDateParam(drillRow.resDate),
            LocaltionId: drillContext.locationId,
          }}
          columns={WEB_COUNT_DRILL_COLUMNS}
          footerTotals
          onClose={() => setDrillRow(null)}
        />
      )}
    </div>
  )
}
