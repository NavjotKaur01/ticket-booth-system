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
  REPORT_DRILL_FOOTER_CLASS,
  REPORT_DRILL_HEADER_CLASS,
  ReportTable,
  ReportTd,
  ReportTh,
  reportRowClass,
} from "@/features/reports/report-ui"

export type DrillColumn = {
  key: string
  label: string
  right?: boolean
  format?: "text" | "number" | "currency" | "datetime" | "date"
  keys?: string[]
}

type Props = {
  title: string
  endpoint: string
  body: ReportRequestModel
  columns: DrillColumn[]
  footerTotals?: boolean
  onClose: () => void
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

  if (col.format === "currency" || (col.right && col.format !== "number")) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(toNum(v))
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
}: Props) {
  const [generateReport] = useGenerateReportMutation()
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [colWidths, setColWidths] = useState<number[]>([])
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && rows && rows.length > 0 && tableRef.current) {
      const observer = new ResizeObserver(() => {
        const headers = tableRef.current?.querySelectorAll("th")
        if (headers) {
          const widths = Array.from(headers).map((h) => h.getBoundingClientRect().width)
          setColWidths(widths)
        }
      })
      const tableEl = tableRef.current.querySelector("table")
      if (tableEl) {
        observer.observe(tableEl)
      }
      return () => observer.disconnect()
    }
  }, [isLoading, rows])

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await generateReport({ endpoint, body }).unwrap()
        setRows(Array.isArray(data) ? (data as Record<string, unknown>[]) : [])
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
          <div className="flex items-center justify-center px-5 py-12 text-sm text-muted-foreground">
            Loading…
          </div>
        )}

        {error && (
          <div className="px-5 py-6 text-center text-sm text-destructive">{error}</div>
        )}

        {!isLoading && !error && rows && (
          <div ref={tableRef} className={REPORT_DRILL_BODY_CLASS}>
            <ReportTable>
              <thead className="sticky top-0 z-10">
                <tr>
                  {columns.map((col) => (
                    <ReportTh key={col.key} right={col.right}>
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
            </ReportTable>
          </div>
        )}

        {!isLoading && rows && rows.length > 0 && (() => {
          const firstRightIdx = columns.findIndex((c) => c.right)
          return (
            <div className={REPORT_DRILL_FOOTER_CLASS}>
              {footerTotals && firstRightIdx !== -1 && colWidths.length > 0 && (
                <div className="border-border text-foreground font-semibold">
                  <table className="w-full border-collapse text-xs table-fixed">
                    <colgroup>
                      {colWidths.map((w, idx) => (
                        <col key={idx} style={{ width: w }} />
                      ))}
                    </colgroup>
                    <tbody>
                      <tr>
                        <td colSpan={firstRightIdx} className="text-left px-3 py-1 font-semibold">
                          Total:
                        </td>
                        {columns.slice(firstRightIdx).map((col) => {
                          if (col.right) {
                            return (
                              <td key={col.key} className="text-right px-3 py-1 font-bold">
                                {fmtCell(col, sumColumn(rows, col))}
                              </td>
                            )
                          }
                          return <td key={col.key} className="px-3 py-1" />
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
            </div>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}
