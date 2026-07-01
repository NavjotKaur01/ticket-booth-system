import {
  buildWebCountsDesktopHtml,
  buildWebCountsExcelBlob,
  mapWebCountsDocumentData,
} from "@/features/reports/web-counts-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? result.drillContext?.startDate ?? "",
    endDate: result.exportMeta?.dateTo ?? result.drillContext?.endDate ?? "",
  }
}

export function buildWebCountsPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapWebCountsDocumentData(result.rawData)
  return buildWebCountsDesktopHtml({ rows, totals, startDate, endDate })
}

export async function createWebCountsPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildWebCountsPrintHtml(result),
    "data-web-counts-pdf-capture"
  )
}

export function buildWebCountsExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapWebCountsDocumentData(result.rawData)
  return buildWebCountsExcelBlob({ rows, totals, startDate, endDate })
}
