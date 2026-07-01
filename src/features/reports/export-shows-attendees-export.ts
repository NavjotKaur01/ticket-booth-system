import {
  buildShowsAttendeesDesktopHtml,
  buildShowsAttendeesExcelBlob,
  mapShowsAttendeesRows,
} from "@/features/reports/export-shows-attendees-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildExportShowsAttendeesPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  return buildShowsAttendeesDesktopHtml({
    rows: mapShowsAttendeesRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}

export async function createExportShowsAttendeesPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildExportShowsAttendeesPrintHtml(result),
    "data-shows-attendees-pdf-capture"
  )
}

export function buildExportShowsAttendeesExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  return buildShowsAttendeesExcelBlob({
    rows: mapShowsAttendeesRows(result.rawData ?? result.rows),
    startDate,
    endDate,
  })
}
