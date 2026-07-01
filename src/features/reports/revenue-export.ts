import {
  buildRevenueDesktopHtml,
  buildRevenueExcelBlob,
  mapRevenueData,
} from "@/features/reports/revenue-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildRevenuePrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapRevenueData(result.rawData ?? result.rows)
  return buildRevenueDesktopHtml({ rows, totals, startDate, endDate })
}

export async function createRevenuePdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildRevenuePrintHtml(result),
    "data-revenue-pdf-capture"
  )
}

export function buildRevenueExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapRevenueData(result.rawData ?? result.rows)
  return buildRevenueExcelBlob({ rows, totals, startDate, endDate })
}
