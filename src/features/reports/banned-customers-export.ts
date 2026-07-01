import {
  buildBannedCustomersDesktopHtml,
  buildBannedCustomersExcelBlob,
  mapBannedCustomerRows,
} from "@/features/reports/banned-customers-document"
import type { ReportViewerResult } from "@/features/reports/reports.service"

function resolveExportDates(result: ReportViewerResult) {
  return {
    startDate: result.exportMeta?.dateFrom ?? "",
    endDate: result.exportMeta?.dateTo ?? "",
  }
}

function resolveRows(result: ReportViewerResult) {
  return mapBannedCustomerRows(result.rawData ?? result.rows)
}

async function waitForLayout() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => setTimeout(resolve, 150))
}

function createIsolatedFrame(html: string) {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("data-banned-customers-pdf-capture", "true")
  iframe.style.cssText =
    "position:fixed;left:-20000px;top:0;width:1200px;height:3200px;border:0;opacity:1;"
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) {
    iframe.remove()
    throw new Error("Failed to create an isolated frame for PDF export.")
  }

  doc.open()
  doc.write(html)
  doc.close()

  return {
    body: doc.body,
    cleanup: () => iframe.remove(),
  }
}

async function canvasToJpegBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), "image/jpeg", 0.92)
  })
  if (!blob || blob.size === 0) {
    throw new Error("Failed to encode report image for PDF export.")
  }
  return new Uint8Array(await blob.arrayBuffer())
}

async function buildPdfFromHtml(html: string) {
  const frame = createIsolatedFrame(html)

  try {
    await waitForLayout()

    const width = Math.max(frame.body.scrollWidth, 1100)
    const height = Math.max(frame.body.scrollHeight, 200)
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ])

    const canvas = await html2canvas(frame.body, {
      scale: 1.5,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
    })

    if (!canvas.width || !canvas.height) {
      throw new Error("Failed to capture report layout for PDF export.")
    }

    const imageBytes = await canvasToJpegBytes(canvas)
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 24
    const contentWidth = pageWidth - margin * 2
    const contentHeight = pageHeight - margin * 2
    const imageWidth = contentWidth
    const imageHeight = (canvas.height * imageWidth) / canvas.width

    let offsetY = 0
    let pageIndex = 0
    while (offsetY < imageHeight) {
      if (pageIndex > 0) pdf.addPage()
      pdf.addImage(imageBytes, "JPEG", margin, margin - offsetY, imageWidth, imageHeight)
      offsetY += contentHeight
      pageIndex += 1
    }

    return pdf.output("blob")
  } finally {
    frame.cleanup()
  }
}

export function buildBannedCustomersPrintHtml(result: ReportViewerResult): string {
  const { startDate, endDate } = resolveExportDates(result)
  return buildBannedCustomersDesktopHtml({
    rows: resolveRows(result),
    startDate,
    endDate,
  })
}

export async function createBannedCustomersPdfBlob(result: ReportViewerResult): Promise<Blob> {
  return buildPdfFromHtml(buildBannedCustomersPrintHtml(result))
}

export function buildBannedCustomersExportBlob(result: ReportViewerResult): Blob {
  const { startDate, endDate } = resolveExportDates(result)
  return buildBannedCustomersExcelBlob({
    rows: resolveRows(result),
    startDate,
    endDate,
  })
}
