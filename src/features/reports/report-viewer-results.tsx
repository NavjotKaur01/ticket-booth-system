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
import { ManagerCheckoutView } from "@/features/reports/manager-checkout-view"
import { DoorCheckoutView } from "@/features/reports/door-checkout-view"
import { AuditReportView } from "@/features/reports/audit-report-view"
import { WebCountsView } from "@/features/reports/web-counts-view"
import { ReconcileReportView } from "@/features/reports/reconcile-report-view"
import { TicketPriceBreakdownView } from "@/features/reports/ticket-price-breakdown-view"
import { PromoReportView } from "@/features/reports/promo-report-view"

type ReportViewerResultsProps = {
  result: ReportViewerResult | null
  isLoading?: boolean
  errorMessage?: string | null
}

export function ReportViewerResults({
  result,
  isLoading = false,
  errorMessage = null,
}: ReportViewerResultsProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground">
        Generating report...
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-[32rem] flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-medium text-destructive">
          Failed to generate report
        </p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {errorMessage}
        </p>
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

  if (result.reportType === "manager-checkout") {
    return (
      <ManagerCheckoutView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
      />
    )
  }

  if (result.reportType === "door-checkout") {
    return (
      <DoorCheckoutView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
        drillContext={result.drillContext}
      />
    )
  }

  if (result.reportType === "audit-report") {
    return (
      <AuditReportView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
        drillContext={result.drillContext}
      />
    )
  }

  if (result.reportType === "web-counts") {
    return (
      <WebCountsView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
        drillContext={result.drillContext}
      />
    )
  }

  if (result.reportType === "reconcile-report") {
    return (
      <ReconcileReportView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
        drillContext={result.drillContext}
      />
    )
  }

  if (result.reportType === "ticket-price-breakdown") {
    return (
      <TicketPriceBreakdownView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
      />
    )
  }

  if (result.reportType === "promo-report") {
    return (
      <PromoReportView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
      />
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {result.columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "h-10 bg-muted/45 px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase whitespace-nowrap",
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
              {result.footerRow && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  {result.columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "px-3 py-2.5 text-sm font-semibold text-foreground",
                        column.align === "right" && "text-right tabular-nums",
                        column.key === "comicName" && "text-center",
                        column.key === "performer" && "text-center",
                        column.key === "paymentDate" && "text-center",
                        column.key === "recLastName" && "text-center",
                        column.key === "zipCode" && "text-center",
                        column.key === "customer" && "text-center"
                      )}
                    >
                      {String(result.footerRow?.[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {result.rows.length} record{result.rows.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
