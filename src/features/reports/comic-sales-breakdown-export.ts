import {
  buildComicSalesBreakdownDesktopHtml,
  buildComicSalesBreakdownExcelBlob,
  mapComicSalesBreakdownRows,
} from "@/features/reports/comic-sales-breakdown-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildComicSalesBreakdownPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapComicSalesBreakdownRows(result.rawData ?? result.rows)
  return buildComicSalesBreakdownDesktopHtml({ rows, totals, startDate, endDate })
}

export async function createComicSalesBreakdownPdfBlob(
  result: ReportViewerResult
): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildComicSalesBreakdownPrintHtml(result),
    "data-comic-sales-breakdown-pdf-capture"
  )
}

export function buildComicSalesBreakdownExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapComicSalesBreakdownRows(result.rawData ?? result.rows)
  return buildComicSalesBreakdownExcelBlob({ rows, totals, startDate, endDate })
}
