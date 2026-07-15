import type { ReportViewerResult } from "@/features/reports/reports.service"
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
import { ManagerCheckoutView } from "@/features/reports/manager-checkout-view"
import { DoorCheckoutView } from "@/features/reports/door-checkout-view"
import { AuditReportView } from "@/features/reports/audit-report-view"
import { WebCountsView } from "@/features/reports/web-counts-view"
import { ReconcileReportView } from "@/features/reports/reconcile-report-view"
import { TicketPriceBreakdownView } from "@/features/reports/ticket-price-breakdown-view"
import { PromoReportView } from "@/features/reports/promo-report-view"
import { SalesByShowView } from "@/features/reports/sales-by-show-view"
import { WebReservationsForDayView } from "@/features/reports/web-reservations-for-day-view"
import { ComicTicketRevenueView } from "@/features/reports/comic-ticket-revenue-view"

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
          Today and Yesterday update the date range and generate immediately.
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
        drillContext={result.drillContext}
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

  if (result.reportType === "sales-by-show") {
    return (
      <SalesByShowView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
      />
    )
  }

  if (result.reportType === "web-reservations-for-day") {
    return (
      <WebReservationsForDayView
        rawData={result.rawData}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
      />
    )
  }

  if (result.reportType === "comic-ticket-revenue") {
    return (
      <ComicTicketRevenueView
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
    <ReportViewShell>
      <ReportHeader
        title={result.title}
        subtitle={result.subtitle}
        generatedAt={result.generatedAt}
      />

      {result.reportType === "projected-sales" && (
        <div className=" font-semibold text-xs px-2 my-2 md:my-4 ">
          This is report is not meant to be used as sales or post sales report-it is show how you stand for future reservations ONLY.
        </div>
      )}

      {result.reportType === "export-shows-attendees" && (
        <div className=" text-sm font-semibold px-2">
          Total Count:&nbsp;&nbsp;&nbsp;&nbsp;{result.rows.length}
        </div>
      )}

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
                  {result.columns.map((column) => (
                    <ReportTd
                      key={column.key}
                      right={column.align === "right"}
                    >
                      {String(row[column.key] ?? "")}
                    </ReportTd>
                  ))}
                </tr>
              ))}
              {result.footerRow && (
                <tr className="bg-muted/30 font-semibold">
                  {result.columns.map((column) => (
                    <ReportTd
                      key={column.key}
                      bold
                      right={column.align === "right"}
                      center={
                        column.key === "comicName" ||
                        column.key === "performer" ||
                        column.key === "paymentDate" ||
                        column.key === "recLastName" ||
                        column.key === "zipCode" ||
                        column.key === "customer"
                      }
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

      {result.reportType !== "export-shows-attendees" && (
        <ReportRecordCount count={result.rows.length} />
      )}
    </ReportViewShell>
  )
}
