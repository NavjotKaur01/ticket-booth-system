import {
  buildBannedCustomersDesktopHtml,
  buildBannedCustomersExcelBlob,
  mapBannedCustomerRows,
} from "@/features/reports/banned-customers-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildBannedCustomersPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  return buildBannedCustomersDesktopHtml({
    rows: mapBannedCustomerRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}

export async function createBannedCustomersPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildBannedCustomersPrintHtml(result),
    "data-banned-customers-pdf-capture"
  )
}

export function buildBannedCustomersExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  return buildBannedCustomersExcelBlob({
    rows: mapBannedCustomerRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}
