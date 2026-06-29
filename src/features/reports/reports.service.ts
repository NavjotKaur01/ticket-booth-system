import dayjs from "dayjs"

import type { AppLocation } from "@/types/api/locations"
import type { ReportRequestModel } from "@/types/api/report-request"

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

export type ReportConfig = {
  endpoint: string
  title: string
  showCustomerFilters: boolean
  showDateRange: boolean
}

export const REPORT_CONFIGS: Record<string, ReportConfig> = {
  "audit-report": { endpoint: "GetAduitReport", title: "Audit Report", showCustomerFilters: false, showDateRange: true },
  "banned-inactive-customers": { endpoint: "GetBannedCustomerReport", title: "Banned\\Inactive Customers", showCustomerFilters: true, showDateRange: true },
  "comic-sales-breakdown": { endpoint: "ComicSaleBreakDownReport", title: "Comic Sales Breakdown", showCustomerFilters: false, showDateRange: true },
  "comic-ticket-revenue": { endpoint: "GetComicTicketRevenueReport", title: "Comic Ticket Revenue", showCustomerFilters: false, showDateRange: true },
  "door-checkout": { endpoint: "GetDoorCheckOutReport", title: "Door Checkout", showCustomerFilters: false, showDateRange: true },
  "export-shows-attendees": { endpoint: "GetExportShowsAttendeesReport", title: "Export Shows Attendees", showCustomerFilters: false, showDateRange: true },
  "manager-checkout": { endpoint: "GetManagerCheckOutReport", title: "Manager Checkout", showCustomerFilters: false, showDateRange: true },
  "new-customers": { endpoint: "GetNewCustomerReport", title: "New Customers", showCustomerFilters: true, showDateRange: true },
  "past-customers": { endpoint: "GetOldCustomerReport", title: "Past Customers", showCustomerFilters: true, showDateRange: true },
  "projected-sales": { endpoint: "GetProjectedReport", title: "Projected Sales", showCustomerFilters: false, showDateRange: true },
  "promo-report": { endpoint: "GetPromoReport", title: "Promo Report", showCustomerFilters: false, showDateRange: true },
  "quick-view-sales": { endpoint: "GetQuickViewSaleReport", title: "Quick View Sales", showCustomerFilters: false, showDateRange: true },
  "receipts": { endpoint: "GetReceiptReport", title: "Receipts", showCustomerFilters: false, showDateRange: true },
  "reconcile-report": { endpoint: "GetReconcileReport", title: "Reconcile Report", showCustomerFilters: false, showDateRange: true },
  "revenue": { endpoint: "GetRevenueReport", title: "Revenue", showCustomerFilters: false, showDateRange: true },
  "sales-by-day": { endpoint: "GetSaleByDayReport", title: "Sales By Day", showCustomerFilters: false, showDateRange: true },
  "sales-by-show": { endpoint: "GetSaleByShowReport", title: "Sales By Show", showCustomerFilters: false, showDateRange: true },
  "ticket-price-breakdown": { endpoint: "GetTicketPriceBreakDownReport", title: "Ticket Price Breakdown", showCustomerFilters: false, showDateRange: true },
  "today-sales": { endpoint: "GetQuickViewSaleReport", title: "Today Sales", showCustomerFilters: false, showDateRange: true },
  "web-counts": { endpoint: "GetWebCountReport", title: "Web Counts", showCustomerFilters: false, showDateRange: true },
  "web-gift-certificates": { endpoint: "GetWebGiftCertificatesReport", title: "Web Gift Certificates", showCustomerFilters: false, showDateRange: true },
  "web-reservations-for-day": { endpoint: "GetWebReservationForDayReport", title: "Web Reservations for Day", showCustomerFilters: false, showDateRange: true },
  "zipcode-breakdown": { endpoint: "GetZipCodeBreakDownReport", title: "ZipCode Breakdown", showCustomerFilters: false, showDateRange: false },
}

export function getReportConfig(reportType: string): ReportConfig {
  return REPORT_CONFIGS[reportType] ?? {
    endpoint: reportType,
    title: reportType,
    showCustomerFilters: false,
    showDateRange: true,
  }
}

export const reportViewerOptions: ReportViewerOption[] = [
  { id: "audit-report", label: "Audit Report" },
  { id: "banned-inactive-customers", label: "Banned\\Inactive Customers" },
  { id: "comic-sales-breakdown", label: "Comic Sales Breakdown" },
  { id: "comic-ticket-revenue", label: "Comic Ticket Revenue" },
  { id: "door-checkout", label: "Door Checkout" },
  { id: "export-shows-attendees", label: "Export Shows Attendees" },
  { id: "manager-checkout", label: "Manager Checkout" },
  { id: "new-customers", label: "New Customers" },
  { id: "past-customers", label: "Past Customers" },
  { id: "projected-sales", label: "Projected Sales" },
  { id: "promo-report", label: "Promo Report" },
  { id: "quick-view-sales", label: "Quick View Sales" },
  { id: "receipts", label: "Receipts" },
  { id: "reconcile-report", label: "Reconcile Report" },
  { id: "revenue", label: "Revenue" },
  { id: "sales-by-day", label: "Sales By Day" },
  { id: "sales-by-show", label: "Sales By Show" },
  { id: "ticket-price-breakdown", label: "Ticket Price Breakdown" },
  { id: "today-sales", label: "Today Sales" },
  { id: "web-counts", label: "Web Counts" },
  { id: "web-gift-certificates", label: "Web Gift Certificates" },
  { id: "web-reservations-for-day", label: "Web Reservations for Day" },
  { id: "zipcode-breakdown", label: "ZipCode Breakdown" },
]

function formatCurrency(value: string | number | null | undefined) {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return "-"
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : value
}

function formatDisplayDateTime(value: string | null | undefined) {
  if (!value) return "-"
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : value
}

function safeStr(value: unknown): string {
  if (value == null) return "-"
  return String(value).trim() || "-"
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

function buildSubtitle(
  filters: ReportViewerFilters,
  locationOptions: ReportViewerLocationOption[]
): string {
  const config = getReportConfig(filters.reportType)
  const locationLabel = resolveLocationLabel(filters.locationId, locationOptions)
  if (!config.showDateRange) {
    return locationLabel
  }
  return `${locationLabel} · ${formatDisplayDate(filters.dateFrom)} - ${formatDisplayDate(filters.dateTo)}`
}

function buildEmptyResult(
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  return {
    reportType,
    title,
    subtitle,
    columns: [],
    rows: [],
    emptyMessage: "No records found",
    generatedAt,
  }
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

export function buildReportRequest(
  filters: ReportViewerFilters,
  connectionName: string
): ReportRequestModel {
  return {
    Connection: connectionName,
    StartDate: dayjs(filters.dateFrom).format("MM/DD/YYYY"),
    EndDate: dayjs(filters.dateTo).format("MM/DD/YYYY"),
    LocaltionId: filters.locationId,
    IsAddress: filters.withAddress,
    IsEmail: filters.withEmailAddress,
  }
}

// --- Report-specific transformers ---

type ApiRow = Record<string, unknown>

function toRows(data: unknown): ApiRow[] {
  return Array.isArray(data) ? (data as ApiRow[]) : []
}

function transformBannedCustomers(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "lastName", label: "Last Name" },
    { key: "firstName", label: "First Name" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "status", label: "Status" },
    { key: "createdOn", label: "Created On" },
  ]
  const rows = toRows(data).map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email),
    address: safeStr(row.Address),
    city: [row.City, row.State].filter(Boolean).join(", ") || "-",
    status: safeStr(row.Status),
    createdOn: formatDisplayDate(String(row.DateCreated ?? "")),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformNewCustomers(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "createdOn", label: "Created On" },
    { key: "lastName", label: "Last Name" },
    { key: "firstName", label: "First Name" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "phone", label: "Phone" },
  ]
  const rows = toRows(data).map((row) => ({
    createdOn: formatDisplayDate(String(row.DateCreated ?? "")),
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email1 ?? row.Email),
    address: [row.Addr1, row.Addr2].filter(Boolean).join(", ") || "-",
    city: [row.City, row.State].filter(Boolean).join(", ") || "-",
    phone: safeStr(row.Phone),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformPastCustomers(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "lastName", label: "Last Name" },
    { key: "firstName", label: "First Name" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "phone", label: "Phone" },
    { key: "createdOn", label: "Created On" },
  ]
  const rows = toRows(data).map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email1 ?? row.Email),
    address: [row.Addr1, row.Addr2].filter(Boolean).join(", ") || "-",
    city: [row.City, row.State].filter(Boolean).join(", ") || "-",
    phone: safeStr(row.Phone),
    createdOn: formatDisplayDate(String(row.DateCreated ?? "")),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformQuickViewSales(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "day", label: "Day" },
    { key: "showDt", label: "Show Date/Time" },
    { key: "comicName", label: "Comic" },
    { key: "seats", label: "Seats", align: "right" },
    { key: "booked", label: "Booked", align: "right" },
    { key: "nPaid", label: "Paid", align: "right" },
    { key: "nComp", label: "Comp", align: "right" },
    { key: "nDisc", label: "Disc", align: "right" },
    { key: "netTotal", label: "Net Total", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    day: safeStr(row.Day),
    showDt: formatDisplayDateTime(String(row.ShowDt ?? "")),
    comicName: safeStr(row.ComicName),
    seats: safeStr(row.Seats),
    booked: safeStr(row.Booked),
    nPaid: safeStr(row.NPaid),
    nComp: safeStr(row.NComp),
    nDisc: safeStr(row.NDisc),
    netTotal: formatCurrency(row.NetTotal as number),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformRevenue(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "day", label: "Day" },
    { key: "time", label: "Time" },
    { key: "performer", label: "Performer" },
    { key: "ticketPurchased", label: "Tickets", align: "right" },
    { key: "prepaidRedeemed", label: "Prepaid Redeemed", align: "right" },
    { key: "totalEarned", label: "Total Earned", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    day: safeStr(row.Day),
    time: safeStr(row.Time),
    performer: safeStr(row.Performer),
    ticketPurchased: safeStr(row.TicketPurchased),
    prepaidRedeemed: safeStr(row.PerpaidRedeemed ?? row.PrepaidRedeemed),
    totalEarned: formatCurrency(row.TotalEarned as number),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformSalesByDay(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "showDate", label: "Show Date" },
    { key: "showTime", label: "Show Time" },
    { key: "comicName", label: "Comic" },
    { key: "phoneIn", label: "Phone In", align: "right" },
    { key: "walkup", label: "Walk Up", align: "right" },
    { key: "web", label: "Web", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    showDate: formatDisplayDate(String(row.ShowDate ?? "")),
    showTime: safeStr(row.ShowTime),
    comicName: safeStr(row.ComicName),
    phoneIn: safeStr(row.PhoneIn),
    walkup: safeStr(row.Walkup),
    web: safeStr(row.Web),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformSalesByShow(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "location", label: "Location" },
    { key: "showDate", label: "Show Date" },
    { key: "comicName", label: "Comic" },
    { key: "partyNo", label: "Party", align: "right" },
    { key: "tixPaid", label: "Paid", align: "right" },
    { key: "tixComp", label: "Comp", align: "right" },
    { key: "tixDisc", label: "Disc", align: "right" },
    { key: "dailyPaid", label: "Daily Paid", align: "right" },
  ]
  const raw = toRows(data)
  const rows: ReportViewerRow[] = []

  for (const loc of raw) {
    const showList = Array.isArray(loc.ShowList) ? (loc.ShowList as ApiRow[]) : []
    for (const show of showList) {
      const promoList = Array.isArray(show.PromoList) ? (show.PromoList as ApiRow[]) : [show]
      for (const promo of promoList) {
        rows.push({
          location: safeStr(loc.Location ?? loc.LocationName),
          showDate: formatDisplayDate(String(show.ShowDate ?? show.ShowDt ?? "")),
          comicName: safeStr(show.ComicName ?? show.Comic),
          partyNo: safeStr(promo.PartyNo ?? promo.partyno),
          tixPaid: safeStr(promo.TixPaid ?? promo.tixpaid),
          tixComp: safeStr(promo.TixComp ?? promo.tixcomp),
          tixDisc: safeStr(promo.TixDisc ?? promo.tixdisc),
          dailyPaid: formatCurrency(promo.DailyPaid as number),
        })
      }
    }

    if (!showList.length) {
      rows.push({
        location: safeStr(loc.Location),
        showDate: formatDisplayDate(String(loc.ShowDate ?? loc.ShowDt ?? "")),
        comicName: safeStr(loc.ComicName ?? loc.Comic),
        partyNo: safeStr(loc.PartyNo),
        tixPaid: safeStr(loc.TixPaid),
        tixComp: safeStr(loc.TixComp),
        tixDisc: safeStr(loc.TixDisc),
        dailyPaid: formatCurrency(loc.DailyPaid as number),
      })
    }
  }

  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformManagerCheckout(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "comic", label: "Comic" },
    { key: "booked", label: "Booked", align: "right" },
    { key: "preSeated", label: "Pre-Seated", align: "right" },
    { key: "subTotal", label: "Sub Total", align: "right" },
    { key: "service", label: "Service", align: "right" },
    { key: "discount", label: "Discount", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    date: safeStr(row.DateStr),
    time: safeStr(row.TimeStr),
    comic: safeStr(row.Comic),
    booked: safeStr(row.Booked),
    preSeated: safeStr(row.PreSeated),
    subTotal: safeStr(row.SubTot),
    service: safeStr(row.Service),
    discount: safeStr(row.Discount),
    total: safeStr(row.Total),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformProjectedSales(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "day", label: "Day" },
    { key: "showDate", label: "Show Date" },
    { key: "comicName", label: "Comic" },
    { key: "seats", label: "Seats", align: "right" },
    { key: "booked", label: "Booked", align: "right" },
    { key: "perc", label: "%", align: "right" },
    { key: "comp", label: "Comp", align: "right" },
    { key: "disc", label: "Disc", align: "right" },
    { key: "paid", label: "Paid", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    day: safeStr(row.Day),
    showDate: formatDisplayDate(String(row.ShowDate ?? "")),
    comicName: safeStr(row.ComicName),
    seats: safeStr(row.Seats),
    booked: safeStr(row.Booked),
    perc: safeStr(row.Perc),
    comp: safeStr(row.Comp),
    disc: safeStr(row.Disc),
    paid: safeStr(row.Paid),
    total: formatCurrency(row.Total as number),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformComicTicketRevenue(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "comicName", label: "Comic" },
    { key: "paid", label: "Paid", align: "right" },
    { key: "discounted", label: "Discounted", align: "right" },
    { key: "comped", label: "Comped", align: "right" },
    { key: "totalTickets", label: "Total Tickets", align: "right" },
    { key: "revenue", label: "Revenue", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    comicName: safeStr(row.ComicName),
    paid: safeStr(row.Paid),
    discounted: safeStr(row.Discounted),
    comped: safeStr(row.Comped),
    totalTickets: safeStr(row.TotalTickets),
    revenue: formatCurrency(row.Revenue as number),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformComicSalesBreakdown(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "comicName", label: "Comic" },
    { key: "inHouse", label: "In-House", align: "right" },
    { key: "web", label: "Web", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    comicName: safeStr(row.ComicName),
    inHouse: safeStr(row.InHouseReservation),
    web: safeStr(row.WebReservations),
    total: safeStr(row.TotalReservationsCount),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformZipCodeBreakdown(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "zipCode", label: "Zip Code" },
    { key: "count", label: "Count", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    zipCode: safeStr(row.ZipCode),
    count: safeStr(row.Count),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformWebReservationsForDay(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "showDate", label: "Show Date" },
    { key: "showTime", label: "Show Time" },
    { key: "comicName", label: "Comic" },
    { key: "customer", label: "Customer" },
    { key: "promotion", label: "Promotion" },
    { key: "inParty", label: "Party", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ]

  const flatRows: ApiRow[] = []
  for (const item of toRows(data)) {
    const children = Array.isArray(item.WebReservationChildList)
      ? (item.WebReservationChildList as ApiRow[])
      : []
    if (children.length) {
      for (const child of children) {
        if (!child.FooterVisibilty) {
          flatRows.push({
            ShowDate: item.ShowDate,
            ShowTime: item.ShowTime,
            ComicName: item.ComicName,
            ...child,
          })
        }
      }
    } else if (!item.FooterVisibilty) {
      flatRows.push(item)
    }
  }

  const rows = flatRows.map((row) => ({
    showDate: formatDisplayDate(String(row.ShowDate ?? "")),
    showTime: safeStr(row.ShowTime),
    comicName: safeStr(row.ComicName),
    customer: safeStr(row.CustomerName ?? `${row.LastName ?? ""} ${row.FirstName ?? ""}`.trim()),
    promotion: safeStr(row.Promotion),
    inParty: safeStr(row.InParty),
    total: formatCurrency(row.Total as number),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformWebGiftCertificates(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "createDate", label: "Create Date" },
    { key: "lastName", label: "Last Name" },
    { key: "firstName", label: "First Name" },
    { key: "recLastName", label: "Recipient Last" },
    { key: "recFirstName", label: "Recipient First" },
    { key: "originalAmount", label: "Original Amt", align: "right" },
    { key: "amount", label: "Amount", align: "right" },
    { key: "paidAmount", label: "Paid Amt", align: "right" },
  ]

  const rawList = Array.isArray(data)
    ? (data as ApiRow[])
    : (((data as ApiRow)?.WebGiftCertificatesReportList as ApiRow[]) ?? [])

  const rows = rawList.map((row) => ({
    createDate: formatDisplayDate(String(row.CreateDt ?? row.Createdate ?? "")),
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    recLastName: safeStr(row.RecLastName),
    recFirstName: safeStr(row.RecFirstName),
    originalAmount: formatCurrency(row.OrginalAmount as number),
    amount: formatCurrency(row.Amount as number),
    paidAmount: formatCurrency(row.PaidAmount as number),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformExportShowsAttendees(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "showDateTime", label: "Show Date/Time" },
    { key: "comicName", label: "Comic" },
    { key: "lastName", label: "Last Name" },
    { key: "firstName", label: "First Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "source", label: "Source" },
  ]
  const rows = toRows(data).map((row) => ({
    showDateTime: formatDisplayDateTime(String(row.ShowDateTime ?? "")),
    comicName: safeStr(row.ComicName),
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    phone: safeStr(row.Phone),
    email: safeStr(row.Email),
    source: safeStr(row.ReservationSource),
  }))
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

function transformGeneric(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const raw = toRows(data)
  if (!raw.length) {
    return buildEmptyResult(reportType, title, subtitle, generatedAt)
  }

  const firstRow = raw[0]
  const columns: ReportViewerColumn[] = Object.keys(firstRow).map((key) => ({
    key,
    label: key.replace(/([A-Z])/g, " $1").trim(),
  }))

  const rows = raw.map((row) => {
    const resultRow: ReportViewerRow = {}
    columns.forEach((col) => {
      const val = row[col.key]
      resultRow[col.key] = val == null ? "-" : String(val)
    })
    return resultRow
  })

  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt }
}

export function transformReportApiResponse({
  reportType,
  data,
  filters,
  locationOptions,
}: {
  reportType: string
  data: unknown
  filters: ReportViewerFilters
  locationOptions: ReportViewerLocationOption[]
}): ReportViewerResult {
  const config = getReportConfig(reportType)
  const subtitle = buildSubtitle(filters, locationOptions)
  const generatedAt = dayjs().format("DD/MM/YYYY HH:mm")

  switch (reportType) {
    case "banned-inactive-customers":
      return transformBannedCustomers(data, reportType, config.title, subtitle, generatedAt)
    case "new-customers":
      return transformNewCustomers(data, reportType, config.title, subtitle, generatedAt)
    case "past-customers":
      return transformPastCustomers(data, reportType, config.title, subtitle, generatedAt)
    case "quick-view-sales":
    case "today-sales":
      return transformQuickViewSales(data, reportType, config.title, subtitle, generatedAt)
    case "revenue":
      return transformRevenue(data, reportType, config.title, subtitle, generatedAt)
    case "sales-by-day":
      return transformSalesByDay(data, reportType, config.title, subtitle, generatedAt)
    case "sales-by-show":
      return transformSalesByShow(data, reportType, config.title, subtitle, generatedAt)
    case "manager-checkout":
      return transformManagerCheckout(data, reportType, config.title, subtitle, generatedAt)
    case "projected-sales":
      return transformProjectedSales(data, reportType, config.title, subtitle, generatedAt)
    case "comic-ticket-revenue":
      return transformComicTicketRevenue(data, reportType, config.title, subtitle, generatedAt)
    case "comic-sales-breakdown":
      return transformComicSalesBreakdown(data, reportType, config.title, subtitle, generatedAt)
    case "zipcode-breakdown":
      return transformZipCodeBreakdown(data, reportType, config.title, subtitle, generatedAt)
    case "web-reservations-for-day":
      return transformWebReservationsForDay(data, reportType, config.title, subtitle, generatedAt)
    case "web-gift-certificates":
      return transformWebGiftCertificates(data, reportType, config.title, subtitle, generatedAt)
    case "export-shows-attendees":
      return transformExportShowsAttendees(data, reportType, config.title, subtitle, generatedAt)
    default:
      return transformGeneric(data, reportType, config.title, subtitle, generatedAt)
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


