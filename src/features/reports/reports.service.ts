import dayjs from "dayjs"

import type { AppLocation } from "@/types/api/locations"

export type ReportViewerOption = {
  id: string
  label: string
}

export type ReportViewerLocationOption = {
  id: string
  label: string
}

export type ReportViewerFilters = {
  reportType: string
  locationId: string
  dateFrom: string
  dateTo: string
  withEmailAddress: boolean
  withAddress: boolean
}

export type ReportViewerColumn = {
  key: string
  label: string
  align?: "left" | "right"
}

export type ReportViewerRow = Record<string, string | number>

export type ReportViewerResult = {
  reportType: string
  title: string
  subtitle: string
  columns: ReportViewerColumn[]
  rows: ReportViewerRow[]
  emptyMessage: string
  generatedAt: string
}

type MockCustomerRow = {
  id: string
  locationId: string
  createdOn: string
  lastName: string
  firstName: string
  email: string
  address: string
  city: string
  status: string
}

type MockSalesRow = {
  id: string
  locationId: string
  showDate: string
  showTime: string
  comicName: string
  sold: number
  comps: number
  revenue: number
  cash: number
  cards: number
}

export const reportViewerOptions: ReportViewerOption[] = [
  { id: "banned-inactive-customers", label: "Banned\\Inactive Customers" },
  { id: "past-customers", label: "Past Customers" },
  { id: "today-sales", label: "Today Sales" },
  { id: "manager-checkout", label: "Manager Checkout" },
  { id: "door-checkout", label: "Door Checkout" },
  { id: "quick-view-sales", label: "Quick View Sales" },
  { id: "revenue", label: "Revenue" },
  { id: "sales-by-show", label: "Sales By Show" },
  { id: "sales-by-day", label: "Sales By Day" },
]

const CUSTOMER_COLUMNS: ReportViewerColumn[] = [
  { key: "lastName", label: "Last Name" },
  { key: "firstName", label: "First Name" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "status", label: "Status" },
  { key: "createdOn", label: "Created On" },
]

const SALES_COLUMNS: ReportViewerColumn[] = [
  { key: "showDate", label: "Show Date" },
  { key: "showTime", label: "Show Time" },
  { key: "comicName", label: "Comic" },
  { key: "sold", label: "Sold", align: "right" },
  { key: "comps", label: "Comp", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
]

const CHECKOUT_COLUMNS: ReportViewerColumn[] = [
  { key: "showDate", label: "Show Date" },
  { key: "showTime", label: "Show Time" },
  { key: "comicName", label: "Comic" },
  { key: "cash", label: "Cash", align: "right" },
  { key: "cards", label: "Cards", align: "right" },
  { key: "revenue", label: "Total", align: "right" },
]

const mockCustomerRows: MockCustomerRow[] = [
  {
    id: "cust-1",
    locationId: "standupmedia",
    createdOn: "2026-06-26",
    lastName: "Rider",
    firstName: "Max",
    email: "max.rider@email.com",
    address: "12 Beacon St",
    city: "Boston, MA",
    status: "Banned",
  },
  {
    id: "cust-2",
    locationId: "standupmedia",
    createdOn: "2026-06-26",
    lastName: "Johnson",
    firstName: "Sarah",
    email: "",
    address: "44 Hanover Ave",
    city: "Cambridge, MA",
    status: "Inactive",
  },
  {
    id: "cust-3",
    locationId: "standupmedia",
    createdOn: "2026-06-26",
    lastName: "Chen",
    firstName: "Emily",
    email: "emily.chen@email.com",
    address: "",
    city: "Somerville, MA",
    status: "Past Customer",
  },
  {
    id: "cust-4",
    locationId: "venue-b",
    createdOn: "2026-06-25",
    lastName: "Patel",
    firstName: "Priya",
    email: "priya.patel@email.com",
    address: "89 River Rd",
    city: "Quincy, MA",
    status: "Banned",
  },
  {
    id: "cust-5",
    locationId: "standupmedia",
    createdOn: "2026-06-24",
    lastName: "Martinez",
    firstName: "Carlos",
    email: "carlos.m@email.com",
    address: "305 Center Plaza",
    city: "Boston, MA",
    status: "Past Customer",
  },
]

const mockSalesRows: MockSalesRow[] = [
  {
    id: "sale-1",
    locationId: "standupmedia",
    showDate: "2026-06-26",
    showTime: "7:30 PM",
    comicName: "Doug Benson",
    sold: 86,
    comps: 5,
    revenue: 1125,
    cash: 225,
    cards: 900,
  },
  {
    id: "sale-2",
    locationId: "standupmedia",
    showDate: "2026-06-26",
    showTime: "10:00 PM",
    comicName: "Doug Benson",
    sold: 54,
    comps: 2,
    revenue: 760,
    cash: 160,
    cards: 600,
  },
  {
    id: "sale-3",
    locationId: "standupmedia",
    showDate: "2026-06-25",
    showTime: "7:00 PM",
    comicName: "Midweek Madness",
    sold: 33,
    comps: 1,
    revenue: 495,
    cash: 95,
    cards: 400,
  },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function formatDisplayDate(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : value
}

function resolveLocationLabel(
  locationId: string,
  locationOptions: ReportViewerLocationOption[]
) {
  return (
    locationOptions.find((location) => location.id === locationId)?.label ??
    "All Locations"
  )
}

export function resolveReportType(reportType?: string | null) {
  if (!reportType) {
    return "banned-inactive-customers"
  }

  return reportViewerOptions.some((option) => option.id === reportType)
    ? reportType
    : "banned-inactive-customers"
}

export function createDefaultReportFilters({
  locationId,
  reportType,
  today = dayjs().format("YYYY-MM-DD"),
}: {
  locationId: string
  reportType?: string | null
  today?: string
}): ReportViewerFilters {
  return {
    reportType: resolveReportType(reportType),
    locationId,
    dateFrom: today,
    dateTo: today,
    withEmailAddress: false,
    withAddress: false,
  }
}

export function createReportViewerLocationOptions(
  locations: AppLocation[],
  activeLocationId: string,
  activeLocationName: string
): ReportViewerLocationOption[] {
  if (locations.length > 0) {
    return locations.map((location) => ({
      id: location.id,
      label: location.shortName || location.label || location.name || location.id,
    }))
  }

  if (activeLocationId || activeLocationName) {
    return [
      {
        id: activeLocationId || "default-location",
        label: activeLocationName || activeLocationId,
      },
    ]
  }

  return [{ id: "standupmedia", label: "Standupmedia" }]
}

function isWithinDateRange(value: string, fromDate: string, toDate: string) {
  const target = dayjs(value)
  const from = dayjs(fromDate)
  const to = dayjs(toDate)

  if (!target.isValid()) {
    return false
  }

  if (from.isValid() && target.isBefore(from, "day")) {
    return false
  }

  if (to.isValid() && target.isAfter(to, "day")) {
    return false
  }

  return true
}

function shouldFilterByLocation(selectedLocationId: string, rowLocationIds: string[]) {
  if (!selectedLocationId) {
    return false
  }

  return rowLocationIds.some((locationId) => locationId === selectedLocationId)
}

function filterCustomerRows(
  filters: ReportViewerFilters,
  statuses: string[]
): MockCustomerRow[] {
  const enforceLocation = shouldFilterByLocation(
    filters.locationId,
    mockCustomerRows.map((row) => row.locationId)
  )

  return mockCustomerRows.filter((row) => {
    if (enforceLocation && row.locationId !== filters.locationId) {
      return false
    }

    if (!statuses.includes(row.status)) {
      return false
    }

    if (!isWithinDateRange(row.createdOn, filters.dateFrom, filters.dateTo)) {
      return false
    }

    if (filters.withEmailAddress && !row.email.trim()) {
      return false
    }

    if (filters.withAddress && !row.address.trim()) {
      return false
    }

    return true
  })
}

function filterSalesRows(filters: ReportViewerFilters) {
  const enforceLocation = shouldFilterByLocation(
    filters.locationId,
    mockSalesRows.map((row) => row.locationId)
  )

  return mockSalesRows.filter((row) => {
    if (enforceLocation && row.locationId !== filters.locationId) {
      return false
    }

    return isWithinDateRange(row.showDate, filters.dateFrom, filters.dateTo)
  })
}

function buildCustomerResult(
  filters: ReportViewerFilters,
  locationOptions: ReportViewerLocationOption[],
  statuses: string[],
  title: string
): ReportViewerResult {
  const rows = filterCustomerRows(filters, statuses).map((row) => ({
    lastName: row.lastName,
    firstName: row.firstName,
    email: row.email || "-",
    address: row.address || "-",
    city: row.city,
    status: row.status,
    createdOn: formatDisplayDate(row.createdOn),
  }))

  return {
    reportType: filters.reportType,
    title,
    subtitle: `${resolveLocationLabel(filters.locationId, locationOptions)} · ${formatDisplayDate(filters.dateFrom)} - ${formatDisplayDate(filters.dateTo)}`,
    columns: CUSTOMER_COLUMNS,
    rows,
    emptyMessage: "No record found",
    generatedAt: dayjs().format("DD/MM/YYYY HH:mm"),
  }
}

function buildSalesResult(
  filters: ReportViewerFilters,
  locationOptions: ReportViewerLocationOption[],
  title: string,
  columns: ReportViewerColumn[]
): ReportViewerResult {
  const rows = filterSalesRows(filters).map((row) => ({
    showDate: formatDisplayDate(row.showDate),
    showTime: row.showTime,
    comicName: row.comicName,
    sold: row.sold,
    comps: row.comps,
    cash: formatCurrency(row.cash),
    cards: formatCurrency(row.cards),
    revenue: formatCurrency(row.revenue),
  }))

  return {
    reportType: filters.reportType,
    title,
    subtitle: `${resolveLocationLabel(filters.locationId, locationOptions)} · ${formatDisplayDate(filters.dateFrom)} - ${formatDisplayDate(filters.dateTo)}`,
    columns,
    rows,
    emptyMessage: "No record found",
    generatedAt: dayjs().format("DD/MM/YYYY HH:mm"),
  }
}

export async function generateReportViewerResult({
  filters,
  locationOptions,
}: {
  filters: ReportViewerFilters
  locationOptions: ReportViewerLocationOption[]
}): Promise<ReportViewerResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 140))

  switch (filters.reportType) {
    case "banned-inactive-customers":
      return buildCustomerResult(
        filters,
        locationOptions,
        ["Banned", "Inactive"],
        "Banned\\Inactive Customers"
      )
    case "past-customers":
      return buildCustomerResult(
        filters,
        locationOptions,
        ["Past Customer"],
        "Past Customers"
      )
    case "today-sales":
      return buildSalesResult(filters, locationOptions, "Today Sales", SALES_COLUMNS)
    case "manager-checkout":
      return buildSalesResult(filters, locationOptions, "Manager Checkout", CHECKOUT_COLUMNS)
    default:
      return {
        reportType: filters.reportType,
        title:
          reportViewerOptions.find((option) => option.id === filters.reportType)?.label ??
          "Report Viewer",
        subtitle: `${resolveLocationLabel(filters.locationId, locationOptions)} · ${formatDisplayDate(filters.dateFrom)} - ${formatDisplayDate(filters.dateTo)}`,
        columns: [],
        rows: [],
        emptyMessage: "No record found",
        generatedAt: dayjs().format("DD/MM/YYYY HH:mm"),
      }
  }
}

function csvEscape(value: string | number) {
  const text = String(value)
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function createReportCsv(result: ReportViewerResult) {
  const headers = result.columns.map((column) => csvEscape(column.label)).join(",")
  const rows = result.rows.map((row) =>
    result.columns.map((column) => csvEscape(row[column.key] ?? "")).join(",")
  )

  return [headers, ...rows].join("\n")
}

function pdfEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
}

const PDF_PAGE_WIDTH = 612
const PDF_PAGE_HEIGHT = 792
const PDF_MARGIN = 36
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2

type PdfColor = [number, number, number]
type PdfPageState = {
  commands: string[]
  pageNumber: number
  cursorTop: number
}

function normalizePdfText(value: string) {
  return value
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, "?")
}

function formatPdfNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "")
}

function estimatePdfTextWidth(value: string, fontSize: number, isBold = false) {
  const normalized = normalizePdfText(value)
  const averageWidth = isBold ? 0.57 : 0.52
  return normalized.length * fontSize * averageWidth
}

function wrapPdfText(value: string, maxWidth: number, fontSize: number, isBold = false) {
  const normalized = normalizePdfText(String(value).trim() || "-")
  if (!normalized) {
    return [""]
  }

  if (estimatePdfTextWidth(normalized, fontSize, isBold) <= maxWidth) {
    return [normalized]
  }

  const words = normalized.split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word

    if (estimatePdfTextWidth(candidate, fontSize, isBold) <= maxWidth) {
      current = candidate
      continue
    }

    if (current) {
      lines.push(current)
      current = ""
    }

    if (estimatePdfTextWidth(word, fontSize, isBold) <= maxWidth) {
      current = word
      continue
    }

    let segment = ""
    for (const char of word) {
      const nextSegment = `${segment}${char}`
      if (estimatePdfTextWidth(nextSegment, fontSize, isBold) > maxWidth && segment) {
        lines.push(segment)
        segment = char
      } else {
        segment = nextSegment
      }
    }
    current = segment
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

function pdfFillColor(commands: string[], [r, g, b]: PdfColor) {
  commands.push(`${formatPdfNumber(r)} ${formatPdfNumber(g)} ${formatPdfNumber(b)} rg`)
}

function pdfStrokeColor(commands: string[], [r, g, b]: PdfColor) {
  commands.push(`${formatPdfNumber(r)} ${formatPdfNumber(g)} ${formatPdfNumber(b)} RG`)
}

function pdfRect(
  commands: string[],
  x: number,
  top: number,
  width: number,
  height: number,
  options: {
    fill?: PdfColor
    stroke?: PdfColor
    lineWidth?: number
  } = {}
) {
  const y = PDF_PAGE_HEIGHT - top - height

  if (options.lineWidth) {
    commands.push(`${formatPdfNumber(options.lineWidth)} w`)
  }
  if (options.fill) {
    pdfFillColor(commands, options.fill)
  }
  if (options.stroke) {
    pdfStrokeColor(commands, options.stroke)
  }

  const mode =
    options.fill && options.stroke ? "B" : options.fill ? "f" : options.stroke ? "S" : "n"

  commands.push(
    `${formatPdfNumber(x)} ${formatPdfNumber(y)} ${formatPdfNumber(width)} ${formatPdfNumber(height)} re ${mode}`
  )
}

function pdfText(
  commands: string[],
  text: string,
  x: number,
  top: number,
  options: {
    font?: "F1" | "F2"
    size?: number
    color?: PdfColor
    align?: "left" | "right" | "center"
    width?: number
  } = {}
) {
  const normalized = normalizePdfText(text)
  const font = options.font ?? "F1"
  const size = options.size ?? 11
  const color = options.color ?? [0.12, 0.16, 0.24]
  const align = options.align ?? "left"
  const width = options.width ?? 0
  const isBold = font === "F2"
  const textWidth = estimatePdfTextWidth(normalized, size, isBold)

  let drawX = x
  if (align === "right" && width > 0) {
    drawX = x + Math.max(0, width - textWidth)
  } else if (align === "center" && width > 0) {
    drawX = x + Math.max(0, (width - textWidth) / 2)
  }

  const y = PDF_PAGE_HEIGHT - top - size
  commands.push("BT")
  commands.push(`/${font} ${formatPdfNumber(size)} Tf`)
  pdfFillColor(commands, color)
  commands.push(`${formatPdfNumber(drawX)} ${formatPdfNumber(y)} Td`)
  commands.push(`(${pdfEscape(normalized)}) Tj`)
  commands.push("ET")
}

function createPdfPage(pageNumber: number): PdfPageState {
  return {
    commands: [],
    pageNumber,
    cursorTop: 0,
  }
}

function drawPdfPageHeader(page: PdfPageState, result: ReportViewerResult) {
  const headerHeight = 84

  pdfRect(page.commands, 0, 0, PDF_PAGE_WIDTH, headerHeight, {
    fill: [0.12, 0.22, 0.44],
  })

  pdfText(page.commands, result.title, PDF_MARGIN, 22, {
    font: "F2",
    size: 22,
    color: [1, 1, 1],
  })
  pdfText(page.commands, result.subtitle, PDF_MARGIN, 50, {
    size: 11,
    color: [0.87, 0.92, 1],
  })
  pdfText(page.commands, `Page ${page.pageNumber}`, PDF_PAGE_WIDTH - PDF_MARGIN - 72, 24, {
    font: "F2",
    size: 11,
    color: [1, 1, 1],
    align: "right",
    width: 72,
  })

  page.cursorTop = headerHeight + 20
}

function drawPdfSummary(page: PdfPageState, result: ReportViewerResult) {
  const cardHeight = 74
  const gap = 12
  const cardWidth = (PDF_CONTENT_WIDTH - gap * 2) / 3
  const top = page.cursorTop

  const cards = [
    {
      label: "Generated",
      value: result.generatedAt,
    },
    {
      label: "Records",
      value: String(result.rows.length),
    },
    {
      label: "Report Type",
      value: result.title,
    },
  ]

  cards.forEach((card, index) => {
    const x = PDF_MARGIN + index * (cardWidth + gap)
    pdfRect(page.commands, x, top, cardWidth, cardHeight, {
      fill: [0.98, 0.99, 1],
      stroke: [0.86, 0.89, 0.96],
      lineWidth: 1,
    })
    pdfText(page.commands, card.label, x + 14, top + 14, {
      font: "F2",
      size: 9,
      color: [0.38, 0.45, 0.58],
    })

    const valueLines = wrapPdfText(card.value, cardWidth - 28, 13, true).slice(0, 2)
    valueLines.forEach((line, lineIndex) => {
      pdfText(page.commands, line, x + 14, top + 32 + lineIndex * 16, {
        font: "F2",
        size: 13,
        color: [0.14, 0.18, 0.26],
      })
    })
  })

  page.cursorTop += cardHeight + 22
}

function getPdfColumnWidths(result: ReportViewerResult) {
  const usableWidth = PDF_CONTENT_WIDTH

  const weights = result.columns.map((column) => {
    const headerLength = column.label.length
    const valueLength = result.rows.reduce((max, row) => {
      const current = String(row[column.key] ?? "").length
      return Math.max(max, current)
    }, 0)

    if (column.align === "right") {
      return Math.max(10, Math.min(14, Math.max(headerLength, valueLength)))
    }

    return Math.max(12, Math.min(24, Math.max(headerLength, valueLength)))
  })

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

  return weights.map((weight) => (usableWidth * weight) / totalWeight)
}

function drawPdfTableHeader(
  page: PdfPageState,
  result: ReportViewerResult,
  columnWidths: number[]
) {
  const headerTop = page.cursorTop
  const headerHeight = 28
  let x = PDF_MARGIN

  result.columns.forEach((column, index) => {
    const width = columnWidths[index]
    pdfRect(page.commands, x, headerTop, width, headerHeight, {
      fill: [0.92, 0.95, 0.99],
      stroke: [0.82, 0.86, 0.94],
      lineWidth: 1,
    })
    pdfText(page.commands, column.label.toUpperCase(), x + 8, headerTop + 9, {
      font: "F2",
      size: 8.5,
      color: [0.29, 0.36, 0.48],
      align: column.align === "right" ? "right" : "left",
      width: width - 16,
    })
    x += width
  })

  page.cursorTop += headerHeight
}

function drawPdfEmptyState(page: PdfPageState, result: ReportViewerResult) {
  const top = page.cursorTop
  pdfRect(page.commands, PDF_MARGIN, top, PDF_CONTENT_WIDTH, 140, {
    fill: [0.99, 0.99, 1],
    stroke: [0.88, 0.9, 0.95],
    lineWidth: 1,
  })
  pdfText(page.commands, result.emptyMessage, PDF_MARGIN, top + 46, {
    font: "F2",
    size: 18,
    color: [0.16, 0.2, 0.28],
    align: "center",
    width: PDF_CONTENT_WIDTH,
  })
  pdfText(
    page.commands,
    "Try another report, location, or date range and generate again.",
    PDF_MARGIN,
    top + 76,
    {
      size: 11,
      color: [0.45, 0.5, 0.6],
      align: "center",
      width: PDF_CONTENT_WIDTH,
    }
  )
}

function buildPdfPages(result: ReportViewerResult) {
  const pages: PdfPageState[] = []
  const columnWidths = getPdfColumnWidths(result)

  const startNewPage = () => {
    const page = createPdfPage(pages.length + 1)
    drawPdfPageHeader(page, result)
    drawPdfSummary(page, result)
    drawPdfTableHeader(page, result, columnWidths)
    pages.push(page)
    return page
  }

  if (!result.rows.length || !result.columns.length) {
    const page = createPdfPage(1)
    drawPdfPageHeader(page, result)
    drawPdfSummary(page, result)
    drawPdfEmptyState(page, result)
    pages.push(page)
    return pages
  }

  let page = startNewPage()
  const bottomLimit = PDF_PAGE_HEIGHT - PDF_MARGIN - 24
  const bodyFontSize = 10
  const lineHeight = 13
  const cellPaddingX = 8
  const cellPaddingY = 7

  result.rows.forEach((row, rowIndex) => {
    const wrappedRow = result.columns.map((column, columnIndex) =>
      wrapPdfText(
        String(row[column.key] ?? "-"),
        columnWidths[columnIndex] - cellPaddingX * 2,
        bodyFontSize,
        false
      )
    )

    const lineCount = wrappedRow.reduce((max, lines) => Math.max(max, lines.length), 1)
    const rowHeight = cellPaddingY * 2 + lineCount * lineHeight

    if (page.cursorTop + rowHeight > bottomLimit) {
      page = startNewPage()
    }

    let x = PDF_MARGIN
    result.columns.forEach((column, columnIndex) => {
      const width = columnWidths[columnIndex]
      pdfRect(page.commands, x, page.cursorTop, width, rowHeight, {
        fill: rowIndex % 2 === 0 ? [1, 1, 1] : [0.985, 0.989, 0.997],
        stroke: [0.9, 0.92, 0.96],
        lineWidth: 1,
      })

      wrappedRow[columnIndex].forEach((line, lineIndex) => {
        pdfText(
          page.commands,
          line,
          x + cellPaddingX,
          page.cursorTop + cellPaddingY + lineIndex * lineHeight,
          {
            size: bodyFontSize,
            color: [0.16, 0.2, 0.28],
            align: column.align === "right" ? "right" : "left",
            width: width - cellPaddingX * 2,
          }
        )
      })

      x += width
    })

    page.cursorTop += rowHeight
  })

  return pages
}

export function createReportPdfBlob(result: ReportViewerResult) {
  const encoder = new TextEncoder()
  const pageStreams = buildPdfPages(result).map((page) => page.commands.join("\n"))

  const pageObjectNumbers: number[] = []
  const contentObjectNumbers: number[] = []
  let nextObjectNumber = 3

  pageStreams.forEach(() => {
    pageObjectNumbers.push(nextObjectNumber++)
    contentObjectNumbers.push(nextObjectNumber++)
  })

  const regularFontObject = nextObjectNumber++
  const boldFontObject = nextObjectNumber++

  const objects: string[] = []
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjectNumbers
      .map((pageNumber) => `${pageNumber} 0 R`)
      .join(" ")}] /Count ${pageObjectNumbers.length} >>\nendobj\n`
  )

  pageStreams.forEach((stream, index) => {
    const pageObjectNumber = pageObjectNumbers[index]
    const contentObjectNumber = contentObjectNumbers[index]

    objects.push(
      `${pageObjectNumber} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Contents ${contentObjectNumber} 0 R /Resources << /Font << /F1 ${regularFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> >>\nendobj\n`
    )
    objects.push(
      `${contentObjectNumber} 0 obj\n<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream\nendobj\n`
    )
  })

  objects.push(
    `${regularFontObject} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  )
  objects.push(
    `${boldFontObject} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`
  )

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = []

  for (const object of objects) {
    offsets.push(encoder.encode(pdf).length)
    pdf += object
  }

  const xrefStart = encoder.encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([pdf], { type: "application/pdf" })
}
export function buildReportPrintHtml(result: ReportViewerResult) {
  const headCells = result.columns
    .map(
      (column) =>
        `<th style="padding:8px 10px;border:1px solid #d4d4d8;background:#f4f4f5;text-align:left;font-size:12px;">${column.label}</th>`
    )
    .join("")

  const bodyRows = result.rows.length
    ? result.rows
        .map(
          (row) =>
            `<tr>${result.columns
              .map(
                (column) =>
                  `<td style="padding:8px 10px;border:1px solid #e4e4e7;font-size:12px;">${row[column.key] ?? ""}</td>`
              )
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${Math.max(1, result.columns.length)}" style="padding:32px 10px;border:1px solid #e4e4e7;text-align:center;font-size:14px;color:#71717a;">${result.emptyMessage}</td></tr>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${result.title}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #18181b; }
      h1 { margin: 0 0 4px; font-size: 24px; }
      p { margin: 0 0 18px; color: #52525b; }
      table { width: 100%; border-collapse: collapse; }
    </style>
  </head>
  <body>
    <h1>${result.title}</h1>
    <p>${result.subtitle}</p>
    <table>
      <thead><tr>${headCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function openReportPrintWindow(result: ReportViewerResult) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1080,height=780")
  if (!printWindow) {
    return
  }

  printWindow.document.open()
  printWindow.document.write(buildReportPrintHtml(result))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}


