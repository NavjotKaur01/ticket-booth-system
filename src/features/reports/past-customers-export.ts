import {
  buildPastCustomersDesktopHtml,
  buildPastCustomersExcelBlob,
  mapPastCustomerRows,
} from "@/features/reports/past-customers-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildPastCustomersPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  return buildPastCustomersDesktopHtml({
    rows: mapPastCustomerRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}

export async function createPastCustomersPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildPastCustomersPrintHtml(result),
    "data-past-customers-pdf-capture"
  )
}

export function buildPastCustomersExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  return buildPastCustomersExcelBlob({
    rows: mapPastCustomerRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}
