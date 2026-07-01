import {
  buildDoorCheckoutDesktopHtml,
  buildDoorCheckoutExcelBlob,
} from "@/features/reports/door-checkout-document"
import { buildDoorCheckoutExportSections } from "@/features/reports/door-checkout-data"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildDoorCheckoutPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const sections = buildDoorCheckoutExportSections(result.rawData)
  return buildDoorCheckoutDesktopHtml({ sections, startDate, endDate })
}

export async function createDoorCheckoutPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildDoorCheckoutPrintHtml(result),
    "data-door-checkout-pdf-capture"
  )
}

export function buildDoorCheckoutExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  return buildDoorCheckoutExcelBlob({
    sections: buildDoorCheckoutExportSections(result.rawData),
    startDate,
    endDate,
  })
}
