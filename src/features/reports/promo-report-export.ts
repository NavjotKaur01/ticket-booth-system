import {
  buildPromoReportDesktopHtml,
  buildPromoReportExcelBlob,
} from "@/features/reports/promo-report-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

export function buildPromoReportPrintHtml(result: ReportViewerResult): string {
  return buildPromoReportDesktopHtml(result.rawData)
}

export async function createPromoReportPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildPromoReportPrintHtml(result),
    "data-promo-report-pdf-capture"
  )
}

export function buildPromoReportExportBlob(result: ReportViewerResult): Blob {
  return buildPromoReportExcelBlob(result.rawData)
}
