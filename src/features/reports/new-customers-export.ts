import {
  buildNewCustomersDesktopHtml,
  buildNewCustomersExcelBlob,
  mapNewCustomerRows,
} from "@/features/reports/new-customers-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildNewCustomersPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  return buildNewCustomersDesktopHtml({
    rows: mapNewCustomerRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}

export async function createNewCustomersPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildNewCustomersPrintHtml(result),
    "data-new-customers-pdf-capture"
  )
}

export function buildNewCustomersExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  return buildNewCustomersExcelBlob({
    rows: mapNewCustomerRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}
