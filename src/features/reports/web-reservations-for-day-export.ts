import {
  buildWebReservationsForDayDesktopHtml,
  buildWebReservationsForDayExcelBlob,
  mapWebReservationsForDayGroups,
} from "@/features/reports/web-reservations-for-day-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

function resolveClubName(result: ReportViewerResult, clubName = "") {
  if (clubName) return clubName
  return result.subtitle.split(" · ")[0] || result.subtitle
}

export function buildWebReservationsForDayPrintHtml(
  result: ReportViewerResult,
  clubName = ""
): string {
  const { startDate, endDate } = resolveExportDates(result)
  const groups = mapWebReservationsForDayGroups(result.rawData)
  return buildWebReservationsForDayDesktopHtml({
    groups,
    clubName: resolveClubName(result, clubName),
    startDate,
    endDate,
  })
}

export async function createWebReservationsForDayPdfBlob(
  result: ReportViewerResult,
  clubName = ""
): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildWebReservationsForDayPrintHtml(result, clubName),
    "data-web-reservations-for-day-pdf-capture"
  )
}

export function buildWebReservationsForDayExportBlob(
  result: ReportViewerResult,
  clubName = ""
): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const groups = mapWebReservationsForDayGroups(result.rawData)
  return buildWebReservationsForDayExcelBlob({
    groups,
    clubName: resolveClubName(result, clubName),
    startDate,
    endDate,
  })
}
