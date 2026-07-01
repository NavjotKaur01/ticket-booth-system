import {
  buildSalesByShowDesktopHtml,
  buildSalesByShowExcelBlob,
  mapSalesByShowDocumentGroups,
} from "@/features/reports/sales-by-show-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

export function buildSalesByShowPrintHtml(result: ReportViewerResult): string {
  const groups = mapSalesByShowDocumentGroups(result.rawData)
  return buildSalesByShowDesktopHtml(groups)
}

export async function createSalesByShowPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildSalesByShowPrintHtml(result),
    "data-sales-by-show-pdf-capture"
  )
}

export function buildSalesByShowExportBlob(result: ReportViewerResult): Blob {
  const groups = mapSalesByShowDocumentGroups(result.rawData)
  return buildSalesByShowExcelBlob(groups)
}
