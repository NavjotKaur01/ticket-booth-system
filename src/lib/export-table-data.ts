import * as XLSX from "xlsx"

export type ExportColumn<T> = {
  header: string
  value: (row: T) => string | number
}

export type ExportFormat = "clipboard" | "excel" | "html"

export function buildExportMatrix<T>(
  rows: T[],
  columns: ExportColumn<T>[]
): { headers: string[]; rows: string[][] } {
  return {
    headers: columns.map((column) => column.header),
    rows: rows.map((row) =>
      columns.map((column) => String(column.value(row) ?? ""))
    ),
  }
}

function padCenter(text: string, maxLength: number) {
  const diff = maxLength - text.length
  const left = Math.floor(diff / 2)
  return `${" ".repeat(left)}${text}${" ".repeat(diff - left)}`
}

/** Matches desktop PrintExport.ConvertDataTableToString formatting. */
export function convertToClipboardText(headers: string[], rows: string[][]) {
  const columnWidths = headers.map((header, index) => {
    let width = header.length

    for (const row of rows) {
      width = Math.max(width, (row[index] ?? "").length)
    }

    return width
  })

  let output = ""

  for (let index = 0; index < headers.length; index += 1) {
    output += `|${padCenter(headers[index], columnWidths[index] + 2)}`
  }
  output += "|\n"
  output += `${"=".repeat(output.length - 1)}\n`

  for (const row of rows) {
    for (let index = 0; index < headers.length; index += 1) {
      output += `|${padCenter(row[index] ?? "", columnWidths[index] + 2)}`
    }
    output += "|\n"
  }

  return output.trimEnd()
}

/** Matches desktop PrintExport.ConvertDatatableToHtml formatting. */
export function convertToHtmlTable(headers: string[], rows: string[][]) {
  const headerCells = headers
    .map((header) => `<td>${escapeHtml(header)}</td>`)
    .join("")
  const bodyRows = rows
    .map((row) => {
      const cells = row
        .map((value) => `<td>${escapeHtml(value)}</td>`)
        .join("")
      return `<tr>${cells}</tr>`
    })
    .join("")

  return `<html><head></head><body><table border='1px' cellpadding='1' cellspacing='1' bgcolor='lightyellow' style='font-family:Garamond; font-size:smaller'><tr>${headerCells}</tr>${bodyRows}</table></body></html>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function downloadFile(content: BlobPart, filename: string, mimeType: string) {
  let blob: Blob
  if (typeof content === "string" && (mimeType.startsWith("text/csv") || mimeType.startsWith("text/html"))) {
    // Add BOM for UTF-8 compatibility with Excel/etc.
    blob = new Blob(["\ufeff", content], { type: mimeType })
  } else {
    blob = new Blob([content], { type: mimeType })
  }

  if (typeof (navigator as any).msSaveOrOpenBlob === "function") {
    ;(navigator as any).msSaveOrOpenBlob(blob, filename)
    return
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename

  // Append to body is required for Firefox and Safari
  document.body.appendChild(link)
  link.click()
  link.remove()

  // Delay revoking URL to ensure browser has started the download
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (err) {
      console.warn("Failed to copy using navigator.clipboard, trying fallback:", err)
    }
  }

  // Fallback for older browsers / non-secure contexts
  const textArea = document.createElement("textarea")
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = "0"
  textArea.style.left = "0"
  textArea.style.position = "fixed"
  textArea.style.opacity = "0"

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand("copy")
    if (!successful) {
      throw new Error("copy command was unsuccessful")
    }
  } catch (err) {
    console.error("Fallback copy failed:", err)
    throw new Error("Unable to copy to clipboard.")
  } finally {
    document.body.removeChild(textArea)
  }
}

export async function exportTableData(
  headers: string[],
  rows: string[][],
  format: ExportFormat,
  filename: string
) {
  if (rows.length === 0) {
    return false
  }

  switch (format) {
    case "clipboard":
      await copyTextToClipboard(convertToClipboardText(headers, rows))
      return true
    case "excel": {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
      const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      downloadFile(
        output,
        `${filename}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      return true
    }
    case "html":
      downloadFile(
        convertToHtmlTable(headers, rows),
        `${filename}.html`,
        "text/html;charset=utf-8;"
      )
      return true
    case "csv": {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
      const csvContent = XLSX.utils.sheet_to_csv(worksheet)
      downloadFile(
        csvContent,
        `${filename}.csv`,
        "text/csv;charset=utf-8;"
      )
      return true
    }
    default:
      return false
  }
}
