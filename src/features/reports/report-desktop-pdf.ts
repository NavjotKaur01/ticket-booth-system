async function waitForLayout() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => setTimeout(resolve, 150))
}

function createIsolatedFrame(html: string, captureId: string) {
  const iframe = document.createElement("iframe")
  iframe.setAttribute(captureId, "true")
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

export async function buildPdfFromDesktopHtml(
  html: string,
  captureId = "data-report-desktop-pdf-capture"
) {
  const frame = createIsolatedFrame(html, captureId)

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
