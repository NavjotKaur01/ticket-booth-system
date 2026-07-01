import {
  buildProjectedSalesDesktopHtml,
  buildProjectedSalesExcelBlob,
  mapProjectedSalesRows,
} from "@/features/reports/projected-sales-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildProjectedSalesPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  return buildProjectedSalesDesktopHtml({
    rows: mapProjectedSalesRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}

export async function createProjectedSalesPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildProjectedSalesPrintHtml(result),
    "data-projected-sales-pdf-capture"
  )
}

export function buildProjectedSalesExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  return buildProjectedSalesExcelBlob({
    rows: mapProjectedSalesRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}
