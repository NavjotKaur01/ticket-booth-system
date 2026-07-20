import { useState, useEffect, useRef } from "react"
import dayjs from "dayjs"
import { useGenerateReportMutation } from "@/store/api/clubmanApi"
import type { ReportRequestModel } from "@/types/api/report-request"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  REPORT_DRILL_BODY_CLASS,
  REPORT_DRILL_DIALOG_CLASS,
  REPORT_DRILL_HEADER_CLASS,
  ReportTable,
  ReportTd,
  ReportTh,
  reportRowClass,
} from "@/features/reports/report-ui"
import ShowHistoryTableSkeleton from "@/components/calendar/dialogs/ShowHistoryTableSkeleton"

export type DrillColumn = {
  key: string
  label: string
  right?: boolean
  format?: "text" | "number" | "currency" | "datetime" | "date" | "time" | "decimal"
  keys?: string[]
}

type Props = {
  title: string
  endpoint: string
  body: ReportRequestModel
  columns: DrillColumn[]
  footerTotals?: boolean
  onClose: () => void
  isZero?: boolean
  filterRows?: (row: Record<string, unknown>) => boolean
}

function cellValue(row: Record<string, unknown>, col: DrillColumn): unknown {
  for (const k of col.keys ?? [col.key]) {
    const v = row[k]
    if (v != null && v !== "") return v
  }
  return null
}

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""))
  return Number.isFinite(n) ? n : 0
}

function fmtCell(col: DrillColumn, v: unknown): string {
  if (v == null || v === "") return "—"

  if (col.format === "datetime") {
    const d = dayjs(String(v))
    return d.isValid() ? d.format("M/D/YYYY h:mm:ss A") : String(v)
  }

  if (col.format === "date") {
    const d = dayjs(String(v))
    return d.isValid() ? d.format("M/D/YYYY") : String(v)
  }

  if (col.format === "time") {
    const str = String(v).trim()
    // Already US-style (e.g. "7:35PM" / "7:35 PM")
    if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(str)) {
      const match = str.match(/^(\d{1,2}:\d{2})\s?(AM|PM)$/i)
      return match ? `${match[1]} ${match[2].toUpperCase()}` : str
    }
    // 24-hour time-only from API (e.g. "19:00:00" / "19:00")
    const timeOnly = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    if (timeOnly) {
      const hours = Number(timeOnly[1])
      const minutes = Number(timeOnly[2])
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const parsed = dayjs().hour(hours).minute(minutes).second(0)
        return parsed.format("h:mm A")
      }
    }
    const d = dayjs(str)
    if (d.isValid() && d.year() > 1) {
      return d.format("h:mm A")
    }
    return str || "—"
  }

  if (col.format === "currency" || (col.right && col.format !== "number" && col.format !== "decimal")) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(toNum(v))
  }

  if (col.format === "decimal") {
    return toNum(v).toFixed(2)
  }

  if (col.format === "number") {
    return String(toNum(v))
  }

  return String(v).trim() || "—"
}

function sumColumn(rows: Record<string, unknown>[], col: DrillColumn): number {
  return rows.reduce((s, row) => s + toNum(cellValue(row, col)), 0)
}

export function ReportDrillDialog({
  title,
  endpoint,
  body,
  columns,
  footerTotals = false,
  onClose,
  isZero = false,
  filterRows,
}: Props) {
  const [generateReport] = useGenerateReportMutation()
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (isZero) {
        setRows([])
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const data = await generateReport({ endpoint, body }).unwrap()
        let parsed = Array.isArray(data) ? (data as Record<string, unknown>[]) : []
        if (filterRows) {
          parsed = parsed.filter(filterRows)
        }
        setRows(parsed)
      } catch {
        setError("Failed to load drill-down data.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={REPORT_DRILL_DIALOG_CLASS}>
        <DialogHeader className={REPORT_DRILL_HEADER_CLASS}>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <ShowHistoryTableSkeleton
                        columnCount={columns.length}
                        minWidthClassName="min-w-[72rem]"
                        aria-label="Loading show detail history"
                      />
        )}

        {error && (
          <div className="px-5 py-6 text-center text-sm text-destructive">{error}</div>
        )}

        {!isLoading && !error && rows && (
          <div ref={tableRef} className={`${REPORT_DRILL_BODY_CLASS} flex overflow-hidden p-0`}>
            <div className="mx-1 my-1 min-h-0 flex-1 overflow-auto">
              <ReportTable className="min-w-max border-separate border-spacing-0">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <ReportTh
                        key={col.key}
                        right={col.right}
                        className="sticky top-0 z-20 bg-muted"
                      >
                        {col.label}
                      </ReportTh>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <ReportTd colSpan={columns.length} center className="py-6 text-muted-foreground">
                        No records found
                      </ReportTd>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={i} className={reportRowClass(i)}>
                        {columns.map((col) => (
                          <ReportTd key={col.key} right={col.right}>
                            {fmtCell(col, cellValue(row, col))}
                          </ReportTd>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
                {footerTotals && rows.length > 0 ? (
                  <tfoot>
                    <tr className="bg-muted/30 font-bold">
                      {columns.map((col, index) => {
                        const isNumeric =
                          col.format === "number" ||
                          col.format === "currency" ||
                          col.format === "decimal" ||
                          Boolean(col.right)
                        if (index === 0) {
                          return (
                            <ReportTd key={col.key} bold>
                              Total:
                            </ReportTd>
                          )
                        }
                        if (!isNumeric) {
                          return <ReportTd key={col.key} />
                        }
                        return (
                          <ReportTd key={col.key} right bold>
                            {fmtCell(col, sumColumn(rows, col))}
                          </ReportTd>
                        )
                      })}
                    </tr>
                  </tfoot>
                ) : null}
              </ReportTable>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
