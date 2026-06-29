import { useState } from "react"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"
import type { ReportDrillContext } from "@/features/reports/reports.service"

type AuditRow = {
  ReservationID?: string
  CreateDt?: string
  AdjustedDt?: string
  MovedBy?: string
  CreatedBy?: string
  ComicName?: string
  IsComp?: boolean | number | string
}

function fmtDt(v: string | undefined): string {
  if (!v) return "—"
  const d = dayjs(v)
  return d.isValid() ? d.format("MM/DD/YYYY HH:mm") : v
}

const DRILL_COLUMNS: DrillColumn[] = [
  { key: "ShowDate", label: "Show Date" },
  { key: "ShowTym", label: "Show Time" },
  { key: "Headliner", label: "Headliner" },
  { key: "FirstName", label: "First Name" },
  { key: "LastName", label: "Last Name" },
  { key: "Amount", label: "Amount", right: true },
  { key: "PaymentType", label: "Payment Type" },
]

type Props = {
  rawData: unknown
  subtitle: string
  generatedAt: string
  drillContext?: ReportDrillContext
}

export function AuditReportView({ rawData, subtitle, generatedAt, drillContext }: Props) {
  const rows = Array.isArray(rawData) ? (rawData as AuditRow[]) : []
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
          <h2 className="text-base font-semibold text-foreground">Audit Report</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground">Create Date</th>
                <th className="border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground">Adjusted Date</th>
                <th className="border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground">Moved By</th>
                <th className="border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground">Created By</th>
                <th className="border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground">Comic</th>
                <th className="border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground">Type</th>
                {drillContext && (
                  <th className="border border-border bg-muted/50 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground" />
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const type = row.IsComp === true || row.IsComp === 1 || row.IsComp === "true"
                  ? "Comp"
                  : "Move Reservation"
                return (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="border border-border px-3 py-2 text-xs">{fmtDt(row.CreateDt)}</td>
                    <td className="border border-border px-3 py-2 text-xs">{fmtDt(row.AdjustedDt)}</td>
                    <td className="border border-border px-3 py-2 text-xs">{row.MovedBy ?? "—"}</td>
                    <td className="border border-border px-3 py-2 text-xs">{row.CreatedBy ?? "—"}</td>
                    <td className="border border-border px-3 py-2 text-xs">{row.ComicName ?? "—"}</td>
                    <td className={cn("border border-border px-3 py-2 text-xs", type === "Comp" && "text-blue-600")}>
                      {type}
                    </td>
                    {drillContext && row.ReservationID && (
                      <td className="border border-border px-2 py-1 text-center">
                        <button
                          onClick={() => setSelectedId(row.ReservationID!)}
                          className="rounded px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {rows.length} record{rows.length !== 1 ? "s" : ""}
      </p>

      {selectedId && drillContext && (
        <ReportDrillDialog
          title="Audit Drill Down"
          endpoint="GetAduitReportDrillDown"
          body={{
            Connection: drillContext.connectionName,
            StartDate: dayjs(drillContext.startDate).format("MM/DD/YYYY"),
            EndDate: dayjs(drillContext.endDate).format("MM/DD/YYYY"),
            LocaltionId: drillContext.locationId,
            ShowId: selectedId,
          }}
          columns={DRILL_COLUMNS}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
