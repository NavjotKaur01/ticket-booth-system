import {
  buildAuditReportDesktopHtml,
  buildAuditReportExcelBlob,
  mapAuditReportRows,
} from "@/features/reports/audit-report-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

export function buildAuditReportPrintHtml(result: ReportViewerResult): string {
  return buildAuditReportDesktopHtml({
    rows: mapAuditReportRows(result.rawData),
  })
}

export async function createAuditReportPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildAuditReportPrintHtml(result),
    "data-audit-report-pdf-capture"
  )
}

export function buildAuditReportExportBlob(result: ReportViewerResult): Blob {
  return buildAuditReportExcelBlob({
    rows: mapAuditReportRows(result.rawData),
  })
}
