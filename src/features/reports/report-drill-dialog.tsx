import { useState, useEffect } from "react"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"
import { useGenerateReportMutation } from "@/store/api/clubmanApi"
import type { ReportRequestModel } from "@/types/api/report-request"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type DrillColumn = {
  key: string
  label: string
  right?: boolean
  format?: "text" | "number" | "currency" | "datetime"
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

const thClass =
  "border border-border bg-muted/50 px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap"
const tdClass = "border border-border px-3 py-2 text-left text-xs whitespace-nowrap"

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

  const textCols = columns.filter((c) => !c.right)
  const numCols = columns.filter((c) => c.right)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] flex-col overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12">
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
          <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(thClass, col.right && "text-right")}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-6 text-center text-xs text-muted-foreground"
                    >
                      No records found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(tdClass, col.right && "text-right tabular-nums")}
                        >
                          {fmtCell(col, cellValue(row, col))}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {footerTotals && rows.length > 0 && (
                  <tr className="bg-muted/30 font-semibold">
                    <td colSpan={textCols.length} className={tdClass}>
                      Total:
                    </td>
                    {numCols.map((col) => (
                      <td
                        key={col.key}
                        className={cn(tdClass, "text-right tabular-nums")}
                      >
                        {fmtCell(col, sumColumn(rows, col))}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && rows && rows.length > 0 && (
          <div className="shrink-0 border-t px-5 py-3 text-right text-xs text-muted-foreground">
            {rows.length} record{rows.length !== 1 ? "s" : ""}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
