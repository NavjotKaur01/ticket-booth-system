import { useState } from "react"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
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
    return <ReportEmpty />
  }

  return (
    <ReportViewShell>
      <ReportHeader title="Audit Report" subtitle={subtitle} generatedAt={generatedAt} />

      <ReportCard>
        <ReportTableScroll>
          <ReportTable>
            <thead>
              <tr>
                <ReportTh>Create Date</ReportTh>
                <ReportTh>Adjusted Date</ReportTh>
                <ReportTh>Moved By</ReportTh>
                <ReportTh>Created By</ReportTh>
                <ReportTh>Comic</ReportTh>
                <ReportTh>Type</ReportTh>
                {drillContext && <ReportTh />}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const type = row.IsComp === true || row.IsComp === 1 || row.IsComp === "true"
                  ? "Comp"
                  : "Move Reservation"
                return (
                  <tr key={i} className={reportRowClass(i)}>
                    <ReportTd>{fmtDt(row.CreateDt)}</ReportTd>
                    <ReportTd>{fmtDt(row.AdjustedDt)}</ReportTd>
                    <ReportTd>{row.MovedBy ?? "—"}</ReportTd>
                    <ReportTd>{row.CreatedBy ?? "—"}</ReportTd>
                    <ReportTd>{row.ComicName ?? "—"}</ReportTd>
                    <ReportTd className={cn(type === "Comp" && "text-blue-600")}>{type}</ReportTd>
                    {drillContext && row.ReservationID && (
                      <ReportTd center>
                        <button
                          onClick={() => setSelectedId(row.ReservationID!)}
                          className="rounded px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          Details
                        </button>
                      </ReportTd>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </ReportTable>
        </ReportTableScroll>
      </ReportCard>

      <ReportRecordCount count={rows.length} />

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
    </ReportViewShell>
  )
}
