import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useGenerateReportMutation } from "@/store/api/clubmanApi"
import type { ReportRequestModel } from "@/types/api/report-request"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type DrillColumn = { key: string; label: string; right?: boolean }

type Props = {
  title: string
  endpoint: string
  body: ReportRequestModel
  columns: DrillColumn[]
  onClose: () => void
}

function fmt(v: unknown): string {
  if (v == null) return "—"
  return String(v).trim() || "—"
}

function fmtCurrency(v: unknown): string {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""))
  if (isNaN(n)) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
}

export function ReportDrillDialog({ title, endpoint, body, columns, onClose }: Props) {
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] max-w-5xl flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
            Loading…
          </div>
        )}

        {error && (
          <div className="py-6 text-center text-sm text-destructive">{error}</div>
        )}

        {!isLoading && !error && rows && (
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "border border-border bg-muted/50 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap",
                        col.right && "text-right"
                      )}
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
                          className={cn(
                            "border border-border px-2 py-1 text-xs whitespace-nowrap",
                            col.right && "text-right tabular-nums"
                          )}
                        >
                          {col.right
                            ? fmtCurrency(row[col.key])
                            : fmt(row[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && rows && rows.length > 0 && (
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {rows.length} record{rows.length !== 1 ? "s" : ""}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
