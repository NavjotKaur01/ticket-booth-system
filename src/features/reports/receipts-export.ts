import {
  buildReceiptsDesktopHtml,
  buildReceiptsExcelBlob,
  mapReceiptsData,
} from "@/features/reports/receipts-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildReceiptsPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapReceiptsData(result.rawData ?? result.rows)
  return buildReceiptsDesktopHtml({ rows, totals, startDate, endDate })
}

export async function createReceiptsPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildReceiptsPrintHtml(result),
    "data-receipts-pdf-capture"
  )
}

export function buildReceiptsExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapReceiptsData(result.rawData ?? result.rows)
  return buildReceiptsExcelBlob({ rows, totals, startDate, endDate })
}
