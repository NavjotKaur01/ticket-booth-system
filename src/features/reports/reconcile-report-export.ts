import {
  buildReconcileDesktopHtml,
  buildReconcileExcelBlob,
  mapReconcileDocumentRows,
} from "@/features/reports/reconcile-report-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? result.drillContext?.startDate ?? "",
    endDate: result.exportMeta?.dateTo ?? result.drillContext?.endDate ?? "",
  }
}

export function buildReconcileReportPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const rows = mapReconcileDocumentRows(result.rawData, startDate, endDate)
  return buildReconcileDesktopHtml(rows)
}

export async function createReconcileReportPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildReconcileReportPrintHtml(result),
    "data-reconcile-report-pdf-capture"
  )
}

export function buildReconcileReportExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const rows = mapReconcileDocumentRows(result.rawData, startDate, endDate)
  return buildReconcileExcelBlob(rows)
}
