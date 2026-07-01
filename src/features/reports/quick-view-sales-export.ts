import {
  buildQuickViewSalesDesktopHtml,
  buildQuickViewSalesExcelBlob,
  mapQuickViewSalesData,
} from "@/features/reports/quick-view-sales-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildQuickViewSalesPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapQuickViewSalesData(result.rawData ?? result.rows)
  return buildQuickViewSalesDesktopHtml({ rows, totals, startDate, endDate })
}

export async function createQuickViewSalesPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildQuickViewSalesPrintHtml(result),
    "data-quick-view-sales-pdf-capture"
  )
}

export function buildQuickViewSalesExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapQuickViewSalesData(result.rawData ?? result.rows)
  return buildQuickViewSalesExcelBlob({ rows, totals, startDate, endDate })
}
