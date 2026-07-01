import {
  buildWebGiftCertificatesDesktopHtml,
  buildWebGiftCertificatesExcelBlob,
  mapWebGiftCertificatesData,
} from "@/features/reports/web-gift-certificates-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

export function buildWebGiftCertificatesPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapWebGiftCertificatesData(result.rawData ?? result.rows)
  return buildWebGiftCertificatesDesktopHtml({ rows, totals, startDate, endDate })
}

export async function createWebGiftCertificatesPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildWebGiftCertificatesPrintHtml(result),
    "data-web-gift-certificates-pdf-capture"
  )
}

export function buildWebGiftCertificatesExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  const { rows, totals } = mapWebGiftCertificatesData(result.rawData ?? result.rows)
  return buildWebGiftCertificatesExcelBlob({ rows, totals, startDate, endDate })
}
