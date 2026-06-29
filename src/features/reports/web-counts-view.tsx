import { useState } from "react"
import dayjs from "dayjs"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"
import type { ReportDrillContext } from "@/features/reports/reports.service"

type WebCountRow = {
  ResDate?: string
  CurrentCount?: number
  CurrAmtAmount?: number
  DefaultCount?: number
  DefaultAmount?: number
  TotalCount?: number
  TotalAmount?: number
}

function fmt(v: number | undefined | null): string {
  return v != null ? String(v) : "—"
}

function fmtCurrency(v: number | undefined | null): string {
  if (v == null) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)
}

function fmtDate(v: string | undefined): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("MM/DD/YYYY") : v
}

const DRILL_COLUMNS: DrillColumn[] = [
  { key: "ShowDate", label: "Show Date" },
  { key: "ShowTm", label: "Show Time" },
  { key: "ComicName", label: "Comic" },
  { key: "LastName", label: "Last Name" },
  { key: "FirstName", label: "First Name" },
  { key: "Business", label: "Business" },
  { key: "Source", label: "Source" },
  { key: "PartyNo", label: "Party", right: true },
  { key: "CheckedIn", label: "Checked In", right: true },
  { key: "Total", label: "Total", right: true },
  { key: "Paid", label: "Paid", right: true },
]

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function WebCountsView({ rawData, subtitle, generatedAt, drillContext }: Props) {
  const rows = Array.isArray(rawData) ? (rawData as WebCountRow[]) : []
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const totCurCount = rows.reduce((s, r) => s + (r.CurrentCount ?? 0), 0)
  const totCurAmt = rows.reduce((s, r) => s + (r.CurrAmtAmount ?? 0), 0)
  const totDefCount = rows.reduce((s, r) => s + (r.DefaultCount ?? 0), 0)
  const totDefAmt = rows.reduce((s, r) => s + (r.DefaultAmount ?? 0), 0)
  const totAllCount = rows.reduce((s, r) => s + (r.TotalCount ?? 0), 0)
  const totAllAmt = rows.reduce((s, r) => s + (r.TotalAmount ?? 0), 0)

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
          <h2 className="text-base font-semibold text-foreground">Web Counts</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {["Res Date", "Current Count", "Current Amt", "Default Count", "Default Amt", "Total Count", "Total Amt"].map((h, i) => (
                  <th key={i} className={`border border-border bg-muted/50 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap ${i > 0 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
                {drillContext && <th className="border border-border bg-muted/50 px-2 py-2" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="border border-border px-3 py-2 text-xs">{fmtDate(row.ResDate)}</td>
                  <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmt(row.CurrentCount)}</td>
                  <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(row.CurrAmtAmount)}</td>
                  <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmt(row.DefaultCount)}</td>
                  <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(row.DefaultAmount)}</td>
                  <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmt(row.TotalCount)}</td>
                  <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(row.TotalAmount)}</td>
                  {drillContext && (
                    <td className="border border-border px-2 py-1 text-center">
                      <button
                        onClick={() => setSelectedDate(row.ResDate ?? "")}
                        className="rounded px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-muted/40 font-semibold">
                <td className="border border-border px-3 py-2 text-xs">Totals</td>
                <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmt(totCurCount)}</td>
                <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(totCurAmt)}</td>
                <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmt(totDefCount)}</td>
                <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(totDefAmt)}</td>
                <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmt(totAllCount)}</td>
                <td className="border border-border px-3 py-2 text-right text-xs tabular-nums">{fmtCurrency(totAllAmt)}</td>
                {drillContext && <td className="border border-border" />}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {rows.length} record{rows.length !== 1 ? "s" : ""}
      </p>

      {selectedDate && drillContext && (
        <ReportDrillDialog
          title={`Web Count Drill Down — ${fmtDate(selectedDate)}`}
          endpoint="WebCountDrillDown"
          body={{
            Connection: drillContext.connectionName,
            StartDate: dayjs(selectedDate).format("MM/DD/YYYY"),
            LocaltionId: drillContext.locationId,
          }}
          columns={DRILL_COLUMNS}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
