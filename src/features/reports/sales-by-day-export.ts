import {
  buildSalesByDayDesktopHtml,
  buildSalesByDayExcelBlob,
  mapSalesByDayData,
} from "@/features/reports/sales-by-day-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildSalesByDayPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapSalesByDayData(result.rawData ?? result.rows)
  return buildSalesByDayDesktopHtml({ rows, totals, startDate, endDate })
}

export async function createSalesByDayPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildSalesByDayPrintHtml(result),
    "data-sales-by-day-pdf-capture"
  )
}

export function buildSalesByDayExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapSalesByDayData(result.rawData ?? result.rows)
  return buildSalesByDayExcelBlob({ rows, totals, startDate, endDate })
}
