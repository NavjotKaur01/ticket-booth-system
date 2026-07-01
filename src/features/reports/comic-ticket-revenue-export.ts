import {
  buildComicTicketRevenueDesktopHtml,
  buildComicTicketRevenueDocument,
  buildComicTicketRevenueExcelBlob,
} from "@/features/reports/comic-ticket-revenue-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveDocument(result: ReportViewerResult) {
  return buildComicTicketRevenueDocument(result.rawData ?? result.rows)
}

export function buildComicTicketRevenuePrintHtml(result: ReportViewerResult): string {
  return buildComicTicketRevenueDesktopHtml(resolveDocument(result))
}

export async function createComicTicketRevenuePdfBlob(
  result: ReportViewerResult
): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildComicTicketRevenuePrintHtml(result),
    "data-comic-ticket-revenue-pdf-capture"
  )
}

export function buildComicTicketRevenueExportBlob(result: ReportViewerResult): Blob {
  return buildComicTicketRevenueExcelBlob(resolveDocument(result))
}
