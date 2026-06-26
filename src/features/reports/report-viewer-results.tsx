import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ReportViewerResult } from "@/features/reports/reports.service"

type ReportViewerResultsProps = {
  result: ReportViewerResult | null
  isLoading?: boolean
}

export function ReportViewerResults({
  result,
  isLoading = false,
}: ReportViewerResultsProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground">
        Generating report...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex min-h-[32rem] flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-medium text-foreground/90">
          Choose filters and click Generate Report
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Today and Yesterday only update the date range until you generate.
        </p>
      </div>
    )
  }

  if (!result.rows.length || !result.columns.length) {
    return (
      <div className="flex min-h-[32rem] flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-medium text-foreground/90">
          {result.emptyMessage}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try another report, location, or date range.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{result.title}</h2>
          <p className="text-sm text-muted-foreground">{result.subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">Generated {result.generatedAt}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {result.columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "h-10 bg-muted/45 px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
                    column.align === "right" && "text-right"
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((row, index) => (
              <TableRow key={`${result.reportType}-${index}`}>
                {result.columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      "px-3 py-2.5 text-sm text-foreground",
                      column.align === "right" && "text-right tabular-nums"
                    )}
                  >
                    {String(row[column.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

