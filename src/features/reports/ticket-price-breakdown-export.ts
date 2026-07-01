import {
  buildTicketPriceBreakdownDesktopHtml,
  buildTicketPriceBreakdownExcelBlob,
  mapTicketPriceBreakdownShows,
} from "@/features/reports/ticket-price-breakdown-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildTicketPriceBreakdownPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const shows = mapTicketPriceBreakdownShows(result.rawData)
  return buildTicketPriceBreakdownDesktopHtml({ shows, startDate, endDate })
}

export async function createTicketPriceBreakdownPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildTicketPriceBreakdownPrintHtml(result),
    "data-ticket-price-breakdown-pdf-capture"
  )
}

export function buildTicketPriceBreakdownExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const shows = mapTicketPriceBreakdownShows(result.rawData)
  return buildTicketPriceBreakdownExcelBlob({ shows, startDate, endDate })
}
