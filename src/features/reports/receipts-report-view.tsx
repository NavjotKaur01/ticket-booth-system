import { useState } from "react"
import dayjs from "dayjs"
import type { ReportViewerResult, ReportDrillContext } from "@/features/reports/reports.service"
import {
  ReportCard,
  ReportHeader,
  ReportRecordCount,
  ReportTable,
  ReportTableScroll,
  ReportTd,
  ReportTh,
  ReportViewShell,
  reportRowClass,
} from "@/features/reports/report-ui"
import { ReportDrillDialog, type DrillColumn } from "@/features/reports/report-drill-dialog"

type ReceiptsReportViewProps = {
  result: ReportViewerResult
  drillContext?: ReportDrillContext
}

const RECEIPT_DRILL_COLUMNS: DrillColumn[] = [
  { key: "ComicName", label: "Comic", keys: ["ComicName", "comicName"] },
  { key: "ShowDate", label: "Show Date", keys: ["ShowDate", "showDate"] },
  { key: "ShowTime", label: "Show Time", keys: ["ShowTime", "showTime"] },
  { key: "CustomerLastName", label: "Customer Last Name", keys: ["CustomerLastName", "lastName"] },
  { key: "CustomerFirstName", label: "Customer First Name", keys: ["CustomerFirstName", "firstName"] },
  { key: "Amount", format: "decimal", right: true, label: "Amount", keys: ["Amount", "amount"] },
]

export function ReceiptsReportView({ result, drillContext }: ReceiptsReportViewProps) {
  const [drillConfig, setDrillConfig] = useState<{
    title: string
    body: {
      Connection: string
      LocaltionId: string
      StartDate: string
      EndDate: string
      DrillType: string
    }
    isZero: boolean
  } | null>(null)

  function handleDrillClick(row: Record<string, string | number>, key: string) {
    if (!drillContext) return

    const isDeferred = key === "deferedPaid"
    const drillType = isDeferred ? "Deffered" : "Refund"
    const title = isDeferred ? "Deffered drill down details" : "Refund drill down details"
    const rawDateVal = String(row.rawDate ?? "")
    const formattedDate = rawDateVal
      ? dayjs(rawDateVal).format("M/D/YYYY 12:00:00 [AM]")
      : dayjs().format("M/D/YYYY 12:00:00 [AM]")

    const val = String(row[key] ?? "")
    const isZeroVal = val === "$0.00" || val === "$0" || val === "0" || val === "0.00" || val === ""

    setDrillConfig({
      title,
      body: {
        Connection: drillContext.connectionName,
        LocaltionId: drillContext.locationId,
        StartDate: formattedDate,
        EndDate: formattedDate,
        DrillType: drillType,
      },
      isZero: isZeroVal,
    })
  }

  return (
    <ReportViewShell>
      <ReportHeader
        title={result.title}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
      />

      <ReportCard>
        <ReportTableScroll>
          <ReportTable>
            <thead>
              <tr>
                {result.columns.map((column) => (
                  <ReportTh
                    key={column.key}
                    right={column.align === "right"}
                  >
                    {column.label}
                  </ReportTh>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, index) => (
                <tr key={`${result.reportType}-${index}`} className={reportRowClass(index)}>
                  {result.columns.map((column) => {
                    const val = String(row[column.key] ?? "")
                    const isDrillable =
                      !!drillContext &&
                      (column.key === "deferedPaid" || column.key === "refund") &&
                      val !== "" &&
                      val !== "—"

                    return (
                      <ReportTd
                        key={column.key}
                        right={column.align === "right"}
                        blue={isDrillable}
                      >
                        {isDrillable ? (
                          <button
                            onClick={() => handleDrillClick(row, column.key)}
                            className="font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition-colors focus:outline-none"
                          >
                            {val}
                          </button>
                        ) : (
                          val
                        )}
                      </ReportTd>
                    )
                  })}
                </tr>
              ))}
              {result.footerRow && (
                <tr className="bg-muted/30 font-semibold">
                  {result.columns.map((column) => (
                    <ReportTd
                      key={column.key}
                      bold
                      right={column.align === "right"}
                    >
                      {String(result.footerRow?.[column.key] ?? "")}
                    </ReportTd>
                  ))}
                </tr>
              )}
            </tbody>
          </ReportTable>
        </ReportTableScroll>
      </ReportCard>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {drillContext ? (
          <p className="text-left text-xs text-muted-foreground">
            Click a blue amount in the Deferred or Refund column to open drill-down details.
          </p>
        ) : (
          <div />
        )}
        <ReportRecordCount count={result.rows.length} />
      </div>

      {drillConfig && (
        <ReportDrillDialog
          title={drillConfig.title}
          endpoint="GetReceiptReportDrillDown"
          body={drillConfig.body}
          columns={RECEIPT_DRILL_COLUMNS}
          footerTotals
          isZero={drillConfig.isZero}
          onClose={() => setDrillConfig(null)}
        />
      )}
    </ReportViewShell>
  )
}
