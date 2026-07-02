import {
  buildDesktopManagerCheckoutHtml,
  buildManagerCheckoutExcelBlob,
  resolveManagerCheckoutDocuments,
} from "@/features/reports/manager-checkout-document"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import type { ManagerCheckoutGiftCertApiRow } from "@/features/reports/manager-checkout-data"
import type { ReportViewerResult } from "@/features/reports/reports.service"

export type ManagerCheckoutExportContext = {
  giftCertificateList?: ManagerCheckoutGiftCertApiRow[]
  giftCertificatePayments?: ManagerCheckoutGiftCertApiRow[]
}

function resolveDocuments(result: ReportViewerResult, clubName: string) {
  const extras = result.managerCheckoutExtras
  return resolveManagerCheckoutDocuments({
    result,
    clubName,
    giftCertificateList: extras?.giftCertificateList,
    giftCertificatePayments: extras?.giftCertificatePayments,
  })
}

function buildDesktopHtml(result: ReportViewerResult, clubName: string) {
  const documents = resolveDocuments(result, clubName)
  return buildDesktopManagerCheckoutHtml({ documents, clubName })
}

export function buildManagerCheckoutPrintHtml({
  result,
  clubName,
}: {
  result: ReportViewerResult
  clubName: string
}): string {
  return buildDesktopHtml(result, clubName)
}

export async function createManagerCheckoutPdfBlob({
  result,
  clubName,
}: {
  result: ReportViewerResult
  clubName: string
}): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildDesktopHtml(result, clubName),
    "data-manager-checkout-pdf-capture"
  )
}

export function buildManagerCheckoutExportBlob({
  result,
  clubName,
}: {
  result: ReportViewerResult
  clubName: string
}): Blob {
  const documents = resolveDocuments(result, clubName)
  return buildManagerCheckoutExcelBlob(documents)
}
