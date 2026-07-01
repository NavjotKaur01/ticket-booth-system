import {
  buildZipCodeBreakdownDesktopHtml,
  buildZipCodeBreakdownExcelBlob,
  mapZipCodeBreakdownData,
} from "@/features/reports/zipcode-breakdown-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

export function buildZipCodeBreakdownPrintHtml(result: ReportViewerResult): string {
  const { rows, totals } = mapZipCodeBreakdownData(result.rawData ?? result.rows)
  return buildZipCodeBreakdownDesktopHtml({ rows, totals })
}

export async function createZipCodeBreakdownPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildZipCodeBreakdownPrintHtml(result),
    "data-zipcode-breakdown-pdf-capture"
  )
}

export function buildZipCodeBreakdownExportBlob(result: ReportViewerResult): Blob {
  const { rows, totals } = mapZipCodeBreakdownData(result.rawData ?? result.rows)
  return buildZipCodeBreakdownExcelBlob({ rows, totals })
}
