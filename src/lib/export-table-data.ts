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

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function copyTextToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
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
      XLSX.writeFile(workbook, `${filename}.xlsx`, { compression: true })
      return true
    }
    case "html":
      downloadFile(
        convertToHtmlTable(headers, rows),
        `${filename}.html`,
        "text/html;charset=utf-8;"
      )
      return true
    default:
      return false
  }
}
