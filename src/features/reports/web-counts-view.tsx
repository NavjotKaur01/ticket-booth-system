import { useState } from "react"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"
import type { ReportDrillContext } from "@/features/reports/reports.service"
import {
  ReportCard,
  ReportEmpty,
  ReportHeader,
  ReportRecordCount,
  ReportTable,
  ReportTableScroll,
  ReportTd,
  ReportTh,
  ReportViewShell,
  reportRowClass,
} from "@/features/reports/report-ui"

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
  { key: "ShowTm", label: "ShowTm", format: "time", keys: ["ShowTm", "ShowTime", "showTm"] },
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
    return <ReportEmpty />
  }

  function handleRowDoubleClick(row: WebCountRow) {
    if (drillContext) setDrillRow(row)
  }

  return (
    <ReportViewShell>
      <ReportHeader title="Web Counts" subtitle={subtitle} generatedAt={generatedAt} />

      <ReportCard padded>
        <h3 className="mb-4 text-center text-base font-semibold text-foreground">
          Daily Web Counts Report
        </h3>

        <ReportTableScroll>
          <ReportTable className="min-w-[720px]">
            <thead>
              <tr>
                <ReportTh />
                <ReportTh colSpan={2} className="font-bold text-foreground">Today</ReportTh>
                <ReportTh colSpan={2} className="font-bold text-foreground">Defferred</ReportTh>
                <ReportTh colSpan={2} className="font-bold text-foreground">Total</ReportTh>
              </tr>
              <tr>
                <ReportTh>Date</ReportTh>
                <ReportTh right>Count</ReportTh>
                <ReportTh right>Amount</ReportTh>
                <ReportTh right>Count</ReportTh>
                <ReportTh right>Amount</ReportTh>
                <ReportTh right>Count</ReportTh>
                <ReportTh right>Amount</ReportTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    reportRowClass(i),
                    drillContext && "cursor-pointer hover:bg-muted/30"
                  )}
                  onDoubleClick={() => handleRowDoubleClick(row)}
                  title={drillContext ? "Double-click for drill-down details" : undefined}
                >
                  <ReportTd>{fmtResDate(row.resDate)}</ReportTd>
                  <ReportTd right>{row.todayCount}</ReportTd>
                  <ReportTd right>{fmtMoneyCell(row.todayAmount)}</ReportTd>
                  <ReportTd right>{row.deferredCount}</ReportTd>
                  <ReportTd right>{fmtMoneyCell(row.deferredAmount)}</ReportTd>
                  <ReportTd right blue>{row.totalCount}</ReportTd>
                  <ReportTd right blue>{fmtMoneyCell(row.totalAmount)}</ReportTd>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <ReportTd bold>Total:</ReportTd>
                <ReportTd bold right>{totTodayCount}</ReportTd>
                <ReportTd bold right>$ {fmtMoney(totTodayAmt)}</ReportTd>
                <ReportTd bold right>{totDefCount}</ReportTd>
                <ReportTd bold right>$ {fmtMoney(totDefAmt)}</ReportTd>
                <ReportTd bold right>{totAllCount}</ReportTd>
                <ReportTd bold right>$ {fmtMoney(totAllAmt)}</ReportTd>
              </tr>
            </tbody>
          </ReportTable>
        </ReportTableScroll>

        {drillContext && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Double-click a row to open drill-down details
          </p>
        )}
      </ReportCard>

      <ReportRecordCount count={rows.length} />

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
    </ReportViewShell>
  )
}
