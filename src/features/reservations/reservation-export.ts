import {
  buildExportMatrix,
  exportTableData,
  type ExportColumn,
  type ExportFormat,
} from "@/lib/export-table-data"
import type { Reservation } from "@/types/reservation"

function formatReservationSource(source: Reservation["source"]) {
  if (source === "Phone") {
    return "Phone-In"
  }

  return source
}

function formatReservationTotal(total: string) {
  const numericTotal = Number(total.replace(/[$,]/g, ""))

  if (Number.isNaN(numericTotal)) {
    return total.replace(/\$/g, "")
  }

  return numericTotal.toFixed(2)
}

const EXPORT_COLUMNS: ExportColumn<Reservation>[] = [
  { header: "Last Name", value: (row) => row.lastName },
  { header: "First Name", value: (row) => row.firstName },
  { header: "Phone", value: (row) => row.phoneNo },
  { header: "Quantity", value: (row) => row.qty },
  { header: "Section", value: (row) => row.section },
  { header: "Email Address", value: (row) => row.email },
  { header: "Dinner", value: (row) => row.din },
  { header: "Source", value: (row) => formatReservationSource(row.source) },
  { header: "Total", value: (row) => formatReservationTotal(row.total) },
]

async function downloadReservationWorkbook(headers: string[], rows: string[][], filename: string) {
  const XLSX = await import("xlsx-js-style")
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1:I1")
  const headerStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "5B9BD5" } },
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "9EADCC" } },
      right: { style: "thin", color: { rgb: "9EADCC" } },
      bottom: { style: "thin", color: { rgb: "9EADCC" } },
      left: { style: "thin", color: { rgb: "9EADCC" } },
    },
  }
  const bodyStyle = {
    border: {
      top: { style: "thin", color: { rgb: "B7C9D6" } },
      right: { style: "thin", color: { rgb: "B7C9D6" } },
      bottom: { style: "thin", color: { rgb: "B7C9D6" } },
      left: { style: "thin", color: { rgb: "B7C9D6" } },
    },
  }
  const bandedBodyStyle = {
    ...bodyStyle,
    fill: { patternType: "solid", fgColor: { rgb: "DDEBF7" } },
  }

  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 10 },
    { wch: 13 },
    { wch: 20 },
    { wch: 10 },
    { wch: 13 },
    { wch: 12 },
  ]
  worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) }

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })
      const cell = worksheet[cellRef]

      if (!cell) {
        continue
      }

      cell.s =
        rowIndex === 0
          ? headerStyle
          : rowIndex % 2 === 0
            ? bandedBodyStyle
            : bodyStyle

      if (rowIndex > 0 && (columnIndex === 3 || columnIndex === 6)) {
        cell.s = {
          ...cell.s,
          alignment: { horizontal: "center", vertical: "center" },
        }
      }

      if (rowIndex > 0 && columnIndex === 8) {
        const numericTotal = Number(String(cell.v).replace(/[$,]/g, ""))
        if (Number.isNaN(numericTotal)) {
          continue
        }

        cell.v = numericTotal
        cell.t = "n"
        cell.z = "0.00"
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations")

  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 100)
}

export async function exportReservations(
  reservations: Reservation[],
  format: ExportFormat,
  {
    filename = "reservations",
  }: {
    filename?: string
  } = {}
) {
  const { headers, rows } = buildExportMatrix(reservations, EXPORT_COLUMNS)

  if (format === "excel") {
    await downloadReservationWorkbook(headers, rows, filename)
    return true
  }

  return exportTableData(headers, rows, format, filename)
}
