import dayjs from "dayjs"

import {
  buildAuditReportExportBlob,
  buildAuditReportPrintHtml,
  createAuditReportPdfBlob,
} from "@/features/reports/audit-report-export"
import {
  buildBannedCustomersExportBlob,
  buildBannedCustomersPrintHtml,
  createBannedCustomersPdfBlob,
} from "@/features/reports/banned-customers-export"
import {
  buildNewCustomersExportBlob,
  buildNewCustomersPrintHtml,
  createNewCustomersPdfBlob,
} from "@/features/reports/new-customers-export"
import {
  buildPromoReportExportBlob,
  buildPromoReportPrintHtml,
  createPromoReportPdfBlob,
} from "@/features/reports/promo-report-export"
import {
  buildProjectedSalesExportBlob,
  buildProjectedSalesPrintHtml,
  createProjectedSalesPdfBlob,
} from "@/features/reports/projected-sales-export"
import {
  buildQuickViewSalesExportBlob,
  buildQuickViewSalesPrintHtml,
  createQuickViewSalesPdfBlob,
} from "@/features/reports/quick-view-sales-export"
import {
  buildReceiptsExportBlob,
  buildReceiptsPrintHtml,
  createReceiptsPdfBlob,
} from "@/features/reports/receipts-export"
import {
  buildReconcileReportExportBlob,
  buildReconcileReportPrintHtml,
  createReconcileReportPdfBlob,
} from "@/features/reports/reconcile-report-export"
import {
  buildRevenueExportBlob,
  buildRevenuePrintHtml,
  createRevenuePdfBlob,
} from "@/features/reports/revenue-export"
import {
  buildSalesByDayExportBlob,
  buildSalesByDayPrintHtml,
  createSalesByDayPdfBlob,
} from "@/features/reports/sales-by-day-export"
import {
  buildSalesByShowExportBlob,
  buildSalesByShowPrintHtml,
  createSalesByShowPdfBlob,
} from "@/features/reports/sales-by-show-export"
import {
  buildTicketPriceBreakdownExportBlob,
  buildTicketPriceBreakdownPrintHtml,
  createTicketPriceBreakdownPdfBlob,
} from "@/features/reports/ticket-price-breakdown-export"
import {
  buildWebCountsExportBlob,
  buildWebCountsPrintHtml,
  createWebCountsPdfBlob,
} from "@/features/reports/web-counts-export"
import {
  buildWebGiftCertificatesExportBlob,
  buildWebGiftCertificatesPrintHtml,
  createWebGiftCertificatesPdfBlob,
} from "@/features/reports/web-gift-certificates-export"
import {
  buildWebReservationsForDayExportBlob,
  buildWebReservationsForDayPrintHtml,
  createWebReservationsForDayPdfBlob,
} from "@/features/reports/web-reservations-for-day-export"
import {
  buildZipCodeBreakdownExportBlob,
  buildZipCodeBreakdownPrintHtml,
  createZipCodeBreakdownPdfBlob,
} from "@/features/reports/zipcode-breakdown-export"
import {
  buildPastCustomersExportBlob,
  buildPastCustomersPrintHtml,
  createPastCustomersPdfBlob,
} from "@/features/reports/past-customers-export"
import {
  buildComicSalesBreakdownExportBlob,
  buildComicSalesBreakdownPrintHtml,
  createComicSalesBreakdownPdfBlob,
} from "@/features/reports/comic-sales-breakdown-export"
import {
  buildComicTicketRevenueExportBlob,
  buildComicTicketRevenuePrintHtml,
  createComicTicketRevenuePdfBlob,
} from "@/features/reports/comic-ticket-revenue-export"
import {
  buildDoorCheckoutExportBlob,
  buildDoorCheckoutPrintHtml,
  createDoorCheckoutPdfBlob,
} from "@/features/reports/door-checkout-export"
import {
  buildExportShowsAttendeesExportBlob,
  buildExportShowsAttendeesPrintHtml,
  createExportShowsAttendeesPdfBlob,
} from "@/features/reports/export-shows-attendees-export"
import {
  buildManagerCheckoutExportBlob,
  buildManagerCheckoutPrintHtml,
  createManagerCheckoutPdfBlob,
} from "@/features/reports/manager-checkout-export"
import type { AppLocation } from "@/types/api/locations"
import type { ReportRequestModel } from "@/types/api/report-request"

import type { ManagerCheckoutGiftCertApiRow } from "@/features/reports/manager-checkout-data"

const CUSTOMER_EXCEL_REPORTS = new Set([
  "manager-checkout",
  "banned-inactive-customers",
  "new-customers",
  "past-customers",
  "comic-sales-breakdown",
  "comic-ticket-revenue",
  "door-checkout",
  "export-shows-attendees",
  "audit-report",
  "projected-sales",
  "promo-report",
  "quick-view-sales",
  "receipts",
  "reconcile-report",
  "revenue",
  "sales-by-day",
  "sales-by-show",
  "ticket-price-breakdown",
  "web-counts",
  "web-gift-certificates",
  "web-reservations-for-day",
  "zipcode-breakdown",
])

function isCustomerExcelReport(reportType: string) {
  return CUSTOMER_EXCEL_REPORTS.has(reportType)
}

export function usesExcelExport(reportType: string) {
  return isCustomerExcelReport(reportType)
}

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
  headlinerId: string
  isAllDates: boolean
  isWebReservationOnly: boolean
  isSeparateByUsers: boolean
}

export type ReportViewerColumn = {
  key: string
  label: string
  align?: "left" | "right"
}

export type ReportViewerRow = Record<string, string | number>

export type ReportDrillContext = {
  connectionName: string
  startDate: string
  endDate: string
  locationId: string
}

export type ReportExportMeta = {
  dateFrom: string
  dateTo: string
}

export type ReportViewerResult = {
  reportType: string
  title: string
  subtitle: string
  columns: ReportViewerColumn[]
  rows: ReportViewerRow[]
  footerRow?: ReportViewerRow
  emptyMessage: string
  generatedAt: string
  rawData?: unknown
  drillContext?: ReportDrillContext
  exportMeta?: ReportExportMeta
  managerCheckoutExtras?: {
    giftCertificateList?: ManagerCheckoutGiftCertApiRow[]
    giftCertificatePayments?: ManagerCheckoutGiftCertApiRow[]
  }
}

export type ReportConfig = {
  endpoint: string
  title: string
  showCustomerFilters: boolean
  showDateRange: boolean
  showComicPicker: boolean
  showAllDatesOption: boolean
  showWebReservationOnly: boolean
  showSeparateByUsers: boolean
}

const BASE: Pick<ReportConfig, "showCustomerFilters" | "showComicPicker" | "showAllDatesOption" | "showWebReservationOnly" | "showSeparateByUsers"> = {
  showCustomerFilters: false, showComicPicker: false, showAllDatesOption: false, showWebReservationOnly: false, showSeparateByUsers: false,
}

export const REPORT_CONFIGS: Record<string, ReportConfig> = {
  "audit-report": { ...BASE, endpoint: "GetAduitReport", title: "Audit Report", showDateRange: true },
  "banned-inactive-customers": { ...BASE, endpoint: "GetBannedCustomerReport", title: "Banned\\Inactive Customers", showDateRange: true, showCustomerFilters: true },
  "comic-sales-breakdown": { ...BASE, endpoint: "ComicSaleBreakDownReport", title: "Comic Sales Breakdown", showDateRange: true },
  "comic-ticket-revenue": { ...BASE, endpoint: "GetComicTicketRevenueReport", title: "Comic Ticket Revenue", showDateRange: true, showComicPicker: true, showAllDatesOption: true },
  "door-checkout": { ...BASE, endpoint: "GetDoorCheckOutReport", title: "Door Checkout", showDateRange: true, showSeparateByUsers: true },
  "export-shows-attendees": { ...BASE, endpoint: "GetExportShowsAttendeesReport", title: "Export Shows Attendees", showDateRange: true, showWebReservationOnly: true },
  "manager-checkout": { ...BASE, endpoint: "GetManagerCheckOutReport", title: "Manager Checkout", showDateRange: true },
  "new-customers": { ...BASE, endpoint: "GetNewCustomerReport", title: "New Customers", showDateRange: true, showCustomerFilters: true },
  "past-customers": { ...BASE, endpoint: "GetOldCustomerReport", title: "Past Customers", showDateRange: true, showCustomerFilters: true },
  "projected-sales": { ...BASE, endpoint: "GetProjectedReport", title: "Projected Sales", showDateRange: true },
  "promo-report": { ...BASE, endpoint: "GetPromoReport", title: "Promo Report", showDateRange: true },
  "quick-view-sales": { ...BASE, endpoint: "GetQuickViewSaleReport", title: "Quick View Sales", showDateRange: true },
  "receipts": { ...BASE, endpoint: "GetReceiptReport", title: "Receipts", showDateRange: true },
  "reconcile-report": { ...BASE, endpoint: "GetReconcileReport", title: "Reconcile Report", showDateRange: true },
  "revenue": { ...BASE, endpoint: "GetRevenueReport", title: "Revenue", showDateRange: true },
  "sales-by-day": { ...BASE, endpoint: "GetSaleByDayReport", title: "Sales By Day", showDateRange: true },
  "sales-by-show": { ...BASE, endpoint: "GetSaleByShowReport", title: "Sales By Show", showDateRange: true },
  "today-sales": { ...BASE, endpoint: "GetRecentSales", title: "Today Sales", showDateRange: false },
  "ticket-price-breakdown": { ...BASE, endpoint: "GetTicketPriceBreakDownReport", title: "Ticket Price Breakdown", showDateRange: true },
  "web-counts": { ...BASE, endpoint: "GetWebCountReport", title: "Web Counts", showDateRange: true },
  "web-gift-certificates": { ...BASE, endpoint: "GetWebGiftCertificatesReport", title: "Web Gift Certificates", showDateRange: true },
  "web-reservations-for-day": { ...BASE, endpoint: "GetWebReservationForDayReport", title: "Web Reservations for Day", showDateRange: true },
  "zipcode-breakdown": { ...BASE, endpoint: "GetZipCodeBreakDownReport", title: "ZipCode Breakdown", showDateRange: true },
}

/** Maps WPF PermDesc values to internal report ids (desktop ReportVM switch). */
const PERM_DESC_TO_REPORT_ID: Record<string, string> = {
  "Audit Report": "audit-report",
  "Banned\\Inactive Customers": "banned-inactive-customers",
  "Comic Sales Breakdown": "comic-sales-breakdown",
  "Comic Ticket Revenue": "comic-ticket-revenue",
  "Door Checkout": "door-checkout",
  "Export Shows Attendees": "export-shows-attendees",
  "Manager Checkout": "manager-checkout",
  "New Customers": "new-customers",
  "Past Customers": "past-customers",
  "Paid Customers": "past-customers",
  "Projected Sales": "projected-sales",
  "Promo Report": "promo-report",
  "Quick View Sales": "quick-view-sales",
  "Receipts": "receipts",
  "Reconcile Report": "reconcile-report",
  "Revenue": "revenue",
  "Sales By Day": "sales-by-day",
  "Sales By Show": "sales-by-show",
  "Today Sales": "today-sales",
  "Ticket Price Breakdown": "ticket-price-breakdown",
  "Web Counts": "web-counts",
  "Web Gift Certificates": "web-gift-certificates",
  "Web Reservations for Day": "web-reservations-for-day",
  "ZipCode Breakdown": "zipcode-breakdown",
}

const EXCLUDED_PERM_DESCS = new Set(["ZipCode Sales", "Ticket Price Breakdown"])

function normalizePermDesc(desc: string): string {
  return desc.trim().replace(/\//g, "\\").replace(/\s+/g, " ").toLowerCase()
}

function permDescToReportId(permDesc: string): string | null {
  const trimmed = permDesc.trim()
  if (EXCLUDED_PERM_DESCS.has(trimmed)) return null

  const direct = PERM_DESC_TO_REPORT_ID[trimmed]
  if (direct) return direct

  const slashNorm = trimmed.replace(/\//g, "\\")
  if (PERM_DESC_TO_REPORT_ID[slashNorm]) return PERM_DESC_TO_REPORT_ID[slashNorm]

  const normalized = normalizePermDesc(trimmed)
  for (const [key, id] of Object.entries(PERM_DESC_TO_REPORT_ID)) {
    if (normalizePermDesc(key) === normalized) return id
  }

  for (const [id, config] of Object.entries(REPORT_CONFIGS)) {
    if (normalizePermDesc(config.title) === normalized) return id
  }

  return null
}

/** Desktop-ordered fallback when permission API is unavailable. */
export const DEFAULT_REPORT_VIEWER_OPTIONS: ReportViewerOption[] = [
  { id: "manager-checkout", label: "Manager Checkout" },
  { id: "banned-inactive-customers", label: "Banned\\Inactive Customers" },
  { id: "comic-sales-breakdown", label: "Comic Sales Breakdown" },
  { id: "comic-ticket-revenue", label: "Comic Ticket Revenue" },
  { id: "door-checkout", label: "Door Checkout" },
  { id: "export-shows-attendees", label: "Export Shows Attendees" },
  { id: "audit-report", label: "Audit Report" },
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
  { id: "today-sales", label: "Today Sales" },
  { id: "web-counts", label: "Web Counts" },
  { id: "web-gift-certificates", label: "Web Gift Certificates" },
  { id: "web-reservations-for-day", label: "Web Reservations for Day" },
  { id: "zipcode-breakdown", label: "ZipCode Breakdown" },
]

const TODAY_SALES_OPTION: ReportViewerOption = { id: "today-sales", label: "Today Sales" }

/** Today Sales uses GetRecentSales and is always available in the viewer (WPF excludes it from permissions list). */
function ensureTodaySalesOption(options: ReportViewerOption[]): ReportViewerOption[] {
  if (options.some((option) => option.id === TODAY_SALES_OPTION.id)) {
    return options
  }

  const next = [...options]
  const insertIdx = next.findIndex((option) => option.id === "web-counts")
  if (insertIdx >= 0) {
    next.splice(insertIdx, 0, TODAY_SALES_OPTION)
  } else {
    next.push(TODAY_SALES_OPTION)
  }

  return next
}

/** Mirrors WPF ReportVM.GetReportsByRole user role resolution. */
export function resolveReportUserRole(userRight: string): { userRole: string; locationScoped: boolean } {
  const rights = userRight.trim()
  if (rights === "SEC09" || rights === "SEC01") {
    return { userRole: "SEC01", locationScoped: false }
  }
  if (rights === "SEC05") {
    return { userRole: "SEC05", locationScoped: true }
  }
  if (rights === "SEC02") {
    return { userRole: "SEC02", locationScoped: true }
  }
  return { userRole: rights || "SEC01", locationScoped: false }
}

export function buildReportPermissionRequest(
  connectionName: string,
  userRight: string,
  locationId: string
): ReportRequestModel {
  const { userRole, locationScoped } = resolveReportUserRole(userRight)
  return {
    Connection: connectionName,
    UserRole: userRole,
    LocaltionId: locationScoped ? locationId : "00000000-0000-0000-0000-000000000000",
  }
}

/** Build dropdown options from GetReportPremissionAccesses (same as desktop ReportType list). */
export function buildReportViewerOptionsFromPermissions(
  permissions: Array<{ PermDesc?: string; PermType?: string }>,
  userRight: string
): ReportViewerOption[] {
  const seen = new Set<string>()
  const options: ReportViewerOption[] = []

  for (const perm of permissions) {
    const permDesc = String(perm.PermDesc ?? "").trim()
    if (!permDesc || EXCLUDED_PERM_DESCS.has(permDesc)) continue

    const reportId = permDescToReportId(permDesc)
    if (!reportId || seen.has(reportId)) continue
    seen.add(reportId)

    options.push({ id: reportId, label: permDesc })
  }

  // WPF moves Manager Checkout to first for admin roles
  const isAdmin = userRight.trim() === "SEC01" || userRight.trim() === "SEC09"
  if (isAdmin) {
    const idx = options.findIndex((o) => o.id === "manager-checkout")
    if (idx > 0) {
      const [item] = options.splice(idx, 1)
      options.unshift(item)
    }
  }

  return options
}

/** Minimum options we expect when permissions API is working (desktop has ~19+). */
const MIN_API_REPORT_OPTIONS = 12

export function resolveReportViewerOptions(
  permissions: Array<{ PermDesc?: string }> | undefined,
  userRight: string,
  { isError = false }: { isError?: boolean } = {}
): ReportViewerOption[] {
  if (isError) return ensureTodaySalesOption(DEFAULT_REPORT_VIEWER_OPTIONS)

  const fromApi = buildReportViewerOptionsFromPermissions(permissions ?? [], userRight)

  // API returned rows but none mapped — use full desktop list
  if (!fromApi.length && (permissions?.length ?? 0) > 0) {
    return ensureTodaySalesOption(DEFAULT_REPORT_VIEWER_OPTIONS)
  }

  // API returned too few mapped reports vs raw rows — mapping miss
  if (fromApi.length > 0 && (permissions?.length ?? 0) > fromApi.length + 2) {
    return ensureTodaySalesOption(DEFAULT_REPORT_VIEWER_OPTIONS)
  }

  // API returned a partial list (e.g. only 3 role-scoped rows) — use full desktop list.
  // WPF shows all PermDesc entries from the API; when the web API returns too few,
  // fall back so the dropdown matches the desktop Report Viewer.
  if (fromApi.length > 0 && fromApi.length < MIN_API_REPORT_OPTIONS) {
    return ensureTodaySalesOption(DEFAULT_REPORT_VIEWER_OPTIONS)
  }

  if (fromApi.length > 0) return ensureTodaySalesOption(fromApi)

  return ensureTodaySalesOption(DEFAULT_REPORT_VIEWER_OPTIONS)
}

export function getReportConfig(reportType: string): ReportConfig {
  return REPORT_CONFIGS[reportType] ?? {
    endpoint: reportType,
    title: reportType,
    showCustomerFilters: false,
    showDateRange: true,
    showComicPicker: false,
    showWebReservationOnly: false,
    showSeparateByUsers: false,
    showAllDatesOption: false,
  }
}

export function resolveReportType(
  reportType?: string | null,
  availableOptions: ReportViewerOption[] = []
) {
  const normalized = reportType?.trim() || null

  if (!normalized) {
    return availableOptions[0]?.id ?? "manager-checkout"
  }

  return availableOptions.some((option) => option.id === normalized)
    ? normalized
    : (availableOptions[0]?.id ?? "manager-checkout")
}

function formatCurrency(value: string | number | null | undefined) {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return "-"
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : value
}

function formatDisplayDateTime(value: string | null | undefined) {
  if (!value) return "-"
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY HH:mm") : value
}

function formatQuickViewDate(value: unknown): string {
  if (!value) return "-"
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : String(value)
}

/** WPF ExtensionMethod.USDateTimeFormat — used for all report API StartDate/EndDate. */
export function formatUsApiDate(value: string): string {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY hh:mm:ss A") : value
}

const PAST_CUSTOMER_ALTER_LOCATION_IDS = {
  primary: "446CA112-6F79-4C7B-8A52-1B0F45315537",
  alternate: "598ADE70-E983-48DC-A984-8BD8C86291AB",
} as const

function normalizeGuid(value: string) {
  return value.trim().toLowerCase()
}

/** Mirrors WPF ReportVM GetOldCustomerReport alter-location swap. */
export function resolvePastCustomerAlterLocationId(locationId: string) {
  const normalized = normalizeGuid(locationId)
  if (normalized === normalizeGuid(PAST_CUSTOMER_ALTER_LOCATION_IDS.primary)) {
    return PAST_CUSTOMER_ALTER_LOCATION_IDS.alternate
  }
  if (normalized === normalizeGuid(PAST_CUSTOMER_ALTER_LOCATION_IDS.alternate)) {
    return PAST_CUSTOMER_ALTER_LOCATION_IDS.primary
  }
  return locationId
}

/** WPF Revenue report Time column uses StringFormat=t (short time, e.g. 7:45 PM). */
function formatRevenueTime(value: unknown): string {
  if (!value) return "-"
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("h:mm A") : String(value)
}

/** Sale-by-day / sale-by-show time — prefers ShowTimeStr from API; handles min DateTime. */
function formatShowTime(value: unknown, fallback?: unknown): string {
  const raw = value ?? fallback
  if (raw == null || raw === "") return "-"
  const str = String(raw).trim()
  // Pre-formatted from API (e.g. "7:35AM")
  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(str) || /^\d{1,2}:\d{2}(AM|PM)$/i.test(str)) {
    return str
  }
  const parsed = dayjs(str)
  if (!parsed.isValid()) return str
  if (parsed.year() <= 1) return "-"
  return parsed.format("h:mm A")
}

function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
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

export function createDefaultReportFilters({
  locationId,
  reportType,
  today = dayjs().format("YYYY-MM-DD"),
  availableOptions = [],
}: {
  locationId: string
  reportType?: string | null
  today?: string
  availableOptions?: ReportViewerOption[]
}): ReportViewerFilters {
  const resolvedType = resolveReportType(reportType, availableOptions)

  return {
    reportType: resolvedType,
    locationId,
    dateFrom: today,
    dateTo: today,
    withEmailAddress: false,
    withAddress: false,
    headlinerId: "",
    isAllDates: false,
    isWebReservationOnly: false,
    isSeparateByUsers: resolvedType === "door-checkout",
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
  const config = getReportConfig(filters.reportType)

  let startDate = formatUsApiDate(filters.dateFrom)
  let endDate = formatUsApiDate(filters.dateTo)

  if (config.showAllDatesOption && filters.isAllDates) {
    startDate = formatUsApiDate(dayjs().subtract(20, "year").format("YYYY-MM-DD"))
    endDate = formatUsApiDate(dayjs().add(20, "year").format("YYYY-MM-DD"))
  }

  // Door Checkout — WPF sends only these fields (no customer filters)
  if (filters.reportType === "door-checkout") {
    return {
      Connection: connectionName,
      StartDate: startDate,
      EndDate: endDate,
      LocaltionId: filters.locationId,
      CreatedBy: "",
    }
  }

  // Past Customers — WPF sends StartDate + AlterLocationId only (no EndDate)
  if (filters.reportType === "past-customers") {
    return {
      Connection: connectionName,
      StartDate: startDate,
      LocaltionId: filters.locationId,
      AlterLocationId: resolvePastCustomerAlterLocationId(filters.locationId),
      IsAddress: filters.withAddress,
      IsEmail: filters.withEmailAddress,
    }
  }

  // New Customers — WPF sends StartDate only (no EndDate)
  if (filters.reportType === "new-customers") {
    return {
      Connection: connectionName,
      StartDate: startDate,
      LocaltionId: filters.locationId,
      IsAddress: filters.withAddress,
      IsEmail: filters.withEmailAddress,
    }
  }

  return {
    Connection: connectionName,
    StartDate: startDate,
    EndDate: endDate,
    LocaltionId: filters.locationId,
    IsAddress: filters.withAddress,
    IsEmail: filters.withEmailAddress,
    ...(config.showComicPicker && filters.headlinerId
      ? { HeadlinerId: filters.headlinerId }
      : {}),
    ...(config.showWebReservationOnly ? { IsWebReservationOnly: filters.isWebReservationOnly } : {}),
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
    { key: "email", label: "Email Address" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "zip", label: "Zip" },
    { key: "country", label: "Country" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "createdOn", label: "Created On" },
  ]
  const rows = toRows(data).map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email),
    address: safeStr(row.Address),
    city: safeStr(row.City),
    state: safeStr(row.State),
    zip: safeStr(row.Zip ?? row.ZipCode),
    country: safeStr(row.Country),
    phone: safeStr(row.Phone),
    status: safeStr(row.Status),
    createdOn: formatDisplayDate(String(row.DateCreated ?? "")),
  }))
  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
}

function transformNewCustomers(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "lastName", label: "Last Name" },
    { key: "firstName", label: "First Name" },
    { key: "email", label: "Email Address" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "phone", label: "Phone" },
    { key: "zip", label: "Zip" },
    { key: "createdOn", label: "Created On" },
  ]
  const rows = toRows(data).map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email1 ?? row.Email),
    address: [row.Addr1, row.Addr2].filter(Boolean).join(", ") || "-",
    city: safeStr(row.City),
    state: safeStr(row.State),
    phone: safeStr(row.Phone),
    zip: safeStr(row.Zip ?? row.ZipCode),
    createdOn: formatDisplayDate(String(row.DateCreated ?? "")),
  }))
  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
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
    { key: "email", label: "Email Address" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "phone", label: "Phone" },
    { key: "zip", label: "Zip" },
    { key: "createdOn", label: "Created On" },
  ]
  const rows = toRows(data).map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email1 ?? row.Email),
    address: [row.Addr1, row.Addr2].filter(Boolean).join(", ") || "-",
    city: safeStr(row.City),
    state: safeStr(row.State),
    phone: safeStr(row.Phone),
    zip: safeStr(row.Zip ?? row.ZipCode),
    createdOn: formatDisplayDate(String(row.DateCreated ?? "")),
  }))
  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
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
    { key: "date", label: "Date" },
    { key: "comicName", label: "Comic Name" },
    { key: "seats", label: "Seats", align: "right" },
    { key: "seated", label: "Seated", align: "right" },
    { key: "scan", label: "Scan", align: "right" },
    { key: "dine", label: "Dinner", align: "right" },
    { key: "nComp", label: "NComp", align: "right" },
    { key: "nDisc", label: "NDisc", align: "right" },
    { key: "nPaid", label: "NPaid", align: "right" },
    { key: "paid", label: "Paid", align: "right" },
    { key: "saleTax", label: "Sale Tax", align: "right" },
    { key: "afterTax", label: "After Tax", align: "right" },
    { key: "svc", label: "SVC", align: "right" },
    { key: "netTotal", label: "Net", align: "right" },
  ]

  const totals = {
    seats: 0,
    seated: 0,
    scan: 0,
    dine: 0,
    nComp: 0,
    nDisc: 0,
    nPaid: 0,
    paid: 0,
    saleTax: 0,
    afterTax: 0,
    svc: 0,
    netTotal: 0,
  }

  const rows = toRows(data).map((row) => {
    const seats = toNum(row.Seats)
    const seated = toNum(row.Seated)
    const scan = toNum(row.ScannerIn ?? row.Scan)
    const dine = toNum(row.Dine)
    const nComp = toNum(row.NComp)
    const nDisc = toNum(row.NDisc)
    const nPaid = toNum(row.NPaid)
    const paid = toNum(row.Paid)
    const saleTax = toNum(row.SalesTax ?? row.SaleTax)
    const afterTax = toNum(row.AfterTax)
    const svc = toNum(row.SVC)
    const netTotal = toNum(row.NetTotal)

    totals.seats += seats
    totals.seated += seated
    totals.scan += scan
    totals.dine += dine
    totals.nComp += nComp
    totals.nDisc += nDisc
    totals.nPaid += nPaid
    totals.paid += paid
    totals.saleTax += saleTax
    totals.afterTax += afterTax
    totals.svc += svc
    totals.netTotal += netTotal

    return {
      day: safeStr(row.Day),
      date: formatQuickViewDate(row.ShowDt),
      comicName: safeStr(row.ComicName),
      seats: String(seats),
      seated: String(seated),
      scan: String(scan),
      dine: String(dine),
      nComp: String(nComp),
      nDisc: String(nDisc),
      nPaid: String(nPaid),
      paid: formatCurrency(paid),
      saleTax: formatCurrency(saleTax),
      afterTax: formatCurrency(afterTax),
      svc: formatCurrency(svc),
      netTotal: formatCurrency(netTotal),
    }
  })

  const footerRow: ReportViewerRow = {
    day: "",
    date: "",
    comicName: "Total",
    seats: String(totals.seats),
    seated: String(totals.seated),
    scan: String(totals.scan),
    dine: String(totals.dine),
    nComp: String(totals.nComp),
    nDisc: String(totals.nDisc),
    nPaid: String(totals.nPaid),
    paid: formatCurrency(totals.paid),
    saleTax: formatCurrency(totals.saleTax),
    afterTax: formatCurrency(totals.afterTax),
    svc: formatCurrency(totals.svc),
    netTotal: formatCurrency(totals.netTotal),
  }

  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    footerRow,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
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
    { key: "ticketPurchased", label: "Ticket Purchased", align: "right" },
    { key: "prepaidRedeemed", label: "Prepaid Redeemed", align: "right" },
    { key: "totalEarned", label: "Total Earned", align: "right" },
  ]

  const totals = { ticketPurchased: 0, prepaidRedeemed: 0, totalEarned: 0 }

  const rows = toRows(data).map((row) => {
    const ticketPurchased = toNum(row.TicketPurchased)
    const prepaidRedeemed = toNum(row.PerpaidRedeemed ?? row.PrepaidRedeemed)
    const totalEarned = toNum(row.TotalEarned)

    totals.ticketPurchased += ticketPurchased
    totals.prepaidRedeemed += prepaidRedeemed
    totals.totalEarned += totalEarned

    return {
      day: formatQuickViewDate(row.Day),
      time: formatRevenueTime(row.Time),
      performer: safeStr(row.Performer),
      ticketPurchased: formatCurrency(ticketPurchased),
      prepaidRedeemed: formatCurrency(prepaidRedeemed),
      totalEarned: formatCurrency(totalEarned),
    }
  })

  const footerRow: ReportViewerRow = {
    day: "",
    time: "",
    performer: "Total",
    ticketPurchased: formatCurrency(totals.ticketPurchased),
    prepaidRedeemed: formatCurrency(totals.prepaidRedeemed),
    totalEarned: formatCurrency(totals.totalEarned),
  }

  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    footerRow,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
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
    { key: "comicName", label: "Comic Name" },
    { key: "phoneIn", label: "PhoneIn", align: "right" },
    { key: "walkup", label: "Walkup", align: "right" },
    { key: "web", label: "Web", align: "right" },
  ]

  const totals = { phoneIn: 0, walkup: 0, web: 0 }

  const rows = toRows(data).map((row) => {
    const phoneIn = toNum(row.PhoneIn)
    const walkup = toNum(row.Walkup)
    const web = toNum(row.Web)
    totals.phoneIn += phoneIn
    totals.walkup += walkup
    totals.web += web

    return {
      showDate: formatQuickViewDate(row.ShowDate),
      showTime: formatShowTime(row.ShowTimeStr, row.ShowTime),
      comicName: safeStr(row.ComicName),
      phoneIn: String(phoneIn),
      walkup: String(walkup),
      web: String(web),
    }
  })

  const footerRow: ReportViewerRow = {
    showDate: "",
    showTime: "",
    comicName: "Total",
    phoneIn: String(totals.phoneIn),
    walkup: String(totals.walkup),
    web: String(totals.web),
  }

  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    footerRow,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
}

function transformSalesByShow(
  data: unknown,
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
    emptyMessage: toRows(data).length === 0 ? "No records found" : "",
    generatedAt,
    rawData: data,
  }
}

function transformManagerCheckout(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string,
  drillContext?: ReportDrillContext
): ReportViewerResult {
  const rows = toRows(data)
  return {
    reportType,
    title,
    subtitle,
    columns: [],
    rows: [],
    emptyMessage: rows.length === 0 ? "No records found" : "",
    generatedAt,
    rawData: data,
    drillContext,
  }
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
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt, rawData: data }
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
  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
}

function transformComicSalesBreakdown(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "comicName", label: "Comic Names" },
    { key: "inHouse", label: "House Reservation", align: "right" },
    { key: "web", label: "Web Reservation", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ]
  const rows = toRows(data).map((row) => ({
    comicName: safeStr(row.ComicName),
    inHouse: safeStr(row.InHouseReservation),
    web: safeStr(row.WebReservations),
    total: safeStr(row.TotalReservationsCount),
  }))

  const inHouseTotal = rows.reduce((sum, row) => sum + toNum(row.inHouse), 0)
  const webTotal = rows.reduce((sum, row) => sum + toNum(row.web), 0)
  const footerRow: ReportViewerRow = {
    comicName: "Total",
    inHouse: String(inHouseTotal),
    web: String(webTotal),
    total: String(inHouseTotal + webTotal),
  }

  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    footerRow: rows.length ? footerRow : undefined,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
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

  let totalCount = 0
  const rows = toRows(data).map((row) => {
    const count = toNum(row.Count)
    totalCount += count
    return {
      zipCode: safeStr(row.ZipCode),
      count: String(count),
    }
  })

  const footerRow: ReportViewerRow = {
    zipCode: "Total",
    count: String(totalCount),
  }

  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    footerRow,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
}

function transformWebReservationsForDay(
  data: unknown,
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
    emptyMessage: toRows(data).length === 0 ? "No records found" : "",
    generatedAt,
    rawData: data,
  }
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

  const totals = { originalAmount: 0, amount: 0, paidAmount: 0 }

  const rows = rawList.map((row) => {
    const originalAmount = toNum(row.OrginalAmount ?? row.OriginalAmount)
    const amount = toNum(row.Amount)
    const paidAmount = toNum(row.PaidAmount)
    totals.originalAmount += originalAmount
    totals.amount += amount
    totals.paidAmount += paidAmount

    return {
      createDate: formatQuickViewDate(row.CreateDt ?? row.Createdate),
      lastName: safeStr(row.LastName),
      firstName: safeStr(row.FirstName),
      recLastName: safeStr(row.RecLastName),
      recFirstName: safeStr(row.RecFirstName),
      originalAmount: formatCurrency(originalAmount),
      amount: formatCurrency(amount),
      paidAmount: formatCurrency(paidAmount),
    }
  })

  const footerRow: ReportViewerRow = {
    createDate: "",
    lastName: "",
    firstName: "",
    recLastName: "Total",
    recFirstName: "",
    originalAmount: formatCurrency(totals.originalAmount),
    amount: formatCurrency(totals.amount),
    paidAmount: formatCurrency(totals.paidAmount),
  }

  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    footerRow,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
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
  return { reportType, title, subtitle, columns, rows, emptyMessage: "No records found", generatedAt, rawData: data }
}

function transformReceipts(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const columns: ReportViewerColumn[] = [
    { key: "paymentDate", label: "Payment Date" },
    { key: "cash", label: "Cash", align: "right" },
    { key: "american", label: "AmEx", align: "right" },
    { key: "masterCard", label: "MasterCard", align: "right" },
    { key: "visa", label: "Visa", align: "right" },
    { key: "discover", label: "Discover", align: "right" },
    { key: "creditCard", label: "Credit Card", align: "right" },
    { key: "giftCard", label: "Gift Card", align: "right" },
    { key: "webGiftCard", label: "Web Gift Card", align: "right" },
    { key: "refund", label: "Refund", align: "right" },
    { key: "deferedPaid", label: "Deferred Paid", align: "right" },
    { key: "totalPaid", label: "Total Paid", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ]

  const totals = {
    cash: 0,
    american: 0,
    masterCard: 0,
    visa: 0,
    discover: 0,
    creditCard: 0,
    giftCard: 0,
    webGiftCard: 0,
    refund: 0,
    deferedPaid: 0,
    totalPaid: 0,
    total: 0,
  }

  const rows = toRows(data).map((row) => {
    const cash = toNum(row.Cash)
    const american = toNum(row.American)
    const masterCard = toNum(row.MasterCard)
    const visa = toNum(row.Visa)
    const discover = toNum(row.Discover)
    const creditCard = toNum(row.CreditCard ?? row.CreditCatrd)
    const giftCard = toNum(row.GiftCard)
    const webGiftCard = toNum(row.WebGiftCard)
    const refund = toNum(row.Refund)
    const deferedPaid = toNum(row.DeferedPaid)
    const totalPaid = toNum(row.TotalPaid)
    const total = toNum(row.Total)

    totals.cash += cash
    totals.american += american
    totals.masterCard += masterCard
    totals.visa += visa
    totals.discover += discover
    totals.creditCard += creditCard
    totals.giftCard += giftCard
    totals.webGiftCard += webGiftCard
    totals.refund += refund
    totals.deferedPaid += deferedPaid
    totals.totalPaid += totalPaid
    totals.total += total

    return {
      paymentDate: formatDisplayDate(String(row.PaymentDate ?? row.ReportDate ?? "")),
      cash: formatCurrency(cash),
      american: formatCurrency(american),
      masterCard: formatCurrency(masterCard),
      visa: formatCurrency(visa),
      discover: formatCurrency(discover),
      creditCard: formatCurrency(creditCard),
      giftCard: formatCurrency(giftCard),
      webGiftCard: formatCurrency(webGiftCard),
      refund: formatCurrency(refund),
      deferedPaid: formatCurrency(deferedPaid),
      totalPaid: formatCurrency(totalPaid),
      total: formatCurrency(total),
    }
  })

  const footerRow: ReportViewerRow = {
    paymentDate: "Total",
    cash: formatCurrency(totals.cash),
    american: formatCurrency(totals.american),
    masterCard: formatCurrency(totals.masterCard),
    visa: formatCurrency(totals.visa),
    discover: formatCurrency(totals.discover),
    creditCard: formatCurrency(totals.creditCard),
    giftCard: formatCurrency(totals.giftCard),
    webGiftCard: formatCurrency(totals.webGiftCard),
    refund: formatCurrency(totals.refund),
    deferedPaid: formatCurrency(totals.deferedPaid),
    totalPaid: formatCurrency(totals.totalPaid),
    total: formatCurrency(totals.total),
  }

  return {
    reportType,
    title,
    subtitle,
    columns,
    rows,
    footerRow,
    emptyMessage: "No records found",
    generatedAt,
    rawData: data,
  }
}

function transformPromoReport(
  data: unknown,
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
    emptyMessage: toRows(data).length === 0 ? "No records found" : "",
    generatedAt,
    rawData: data,
  }
}

function transformAuditReport(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string,
  drillContext?: ReportDrillContext
): ReportViewerResult {
  const rows = toRows(data)
  return {
    reportType, title, subtitle,
    columns: [], rows: [],
    emptyMessage: rows.length === 0 ? "No records found" : "",
    generatedAt, rawData: data, drillContext,
  }
}

function transformWebCounts(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string,
  drillContext?: ReportDrillContext
): ReportViewerResult {
  const rows = toRows(data)
  return {
    reportType, title, subtitle,
    columns: [], rows: [],
    emptyMessage: rows.length === 0 ? "No records found" : "",
    generatedAt, rawData: data, drillContext,
  }
}

function transformReconcileReport(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string,
  drillContext?: ReportDrillContext
): ReportViewerResult {
  const rows = toRows(data)
  return {
    reportType, title, subtitle,
    columns: [], rows: [],
    emptyMessage: rows.length === 0 ? "No records found" : "",
    generatedAt, rawData: data, drillContext,
  }
}

function transformTicketPriceBreakdown(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string
): ReportViewerResult {
  const rows = toRows(data)
  return {
    reportType, title, subtitle,
    columns: [], rows: [],
    emptyMessage: rows.length === 0 ? "No records found" : "",
    generatedAt, rawData: data,
  }
}

function transformDoorCheckout(
  data: unknown,
  reportType: string,
  title: string,
  subtitle: string,
  generatedAt: string,
  drillContext?: ReportDrillContext
): ReportViewerResult {
  const rows = toRows(data)
  return {
    reportType,
    title,
    subtitle,
    columns: [],
    rows: [],
    emptyMessage: rows.length === 0 ? "No records found" : "",
    generatedAt,
    rawData: data,
    drillContext,
  }
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
  connectionName = "",
}: {
  reportType: string
  data: unknown
  filters: ReportViewerFilters
  locationOptions: ReportViewerLocationOption[]
  connectionName?: string
}): ReportViewerResult {
  const config = getReportConfig(reportType)
  const subtitle = buildSubtitle(filters, locationOptions)
  const generatedAt = dayjs().format("MM/DD/YYYY hh:mm A")

  switch (reportType) {
    case "banned-inactive-customers":
      return transformBannedCustomers(data, reportType, config.title, subtitle, generatedAt)
    case "new-customers":
      return transformNewCustomers(data, reportType, config.title, subtitle, generatedAt)
    case "past-customers":
      return transformPastCustomers(data, reportType, config.title, subtitle, generatedAt)
    case "quick-view-sales":
      return transformQuickViewSales(data, reportType, config.title, subtitle, generatedAt)
    case "revenue":
      return transformRevenue(data, reportType, config.title, subtitle, generatedAt)
    case "sales-by-day":
      return transformSalesByDay(data, reportType, config.title, subtitle, generatedAt)
    case "sales-by-show":
      return transformSalesByShow(data, reportType, config.title, subtitle, generatedAt)
    case "manager-checkout":
      return transformManagerCheckout(data, reportType, config.title, subtitle, generatedAt, {
        connectionName,
        startDate: filters.dateFrom,
        endDate: filters.dateTo,
        locationId: filters.locationId,
      })
    case "door-checkout":
      return transformDoorCheckout(data, reportType, config.title, subtitle, generatedAt, {
        connectionName,
        startDate: filters.dateFrom,
        endDate: filters.dateTo,
        locationId: filters.locationId,
      })
    case "receipts":
      return transformReceipts(data, reportType, config.title, subtitle, generatedAt)
    case "promo-report":
      return transformPromoReport(data, reportType, config.title, subtitle, generatedAt)
    case "audit-report":
      return transformAuditReport(data, reportType, config.title, subtitle, generatedAt, {
        connectionName, startDate: filters.dateFrom, endDate: filters.dateTo, locationId: filters.locationId,
      })
    case "web-counts":
      return transformWebCounts(data, reportType, config.title, subtitle, generatedAt, {
        connectionName, startDate: filters.dateFrom, endDate: filters.dateTo, locationId: filters.locationId,
      })
    case "reconcile-report":
      return transformReconcileReport(data, reportType, config.title, subtitle, generatedAt, {
        connectionName, startDate: filters.dateFrom, endDate: filters.dateTo, locationId: filters.locationId,
      })
    case "ticket-price-breakdown":
      return transformTicketPriceBreakdown(data, reportType, config.title, subtitle, generatedAt)
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

export function createReportCsv(result: ReportViewerResult, clubName = "") {
  if (result.reportType === "manager-checkout") {
    void clubName
    return "Manager Checkout exports use Excel (.xlsx). Click Export to download."
  }

  if (result.reportType === "banned-inactive-customers") {
    void clubName
    return "Banned/Inactive Customers exports use Excel (.xlsx). Click Export to download."
  }

  if (result.reportType === "new-customers" || result.reportType === "past-customers") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "comic-sales-breakdown" || result.reportType === "comic-ticket-revenue") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "door-checkout" || result.reportType === "export-shows-attendees") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "audit-report") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "projected-sales" || result.reportType === "promo-report") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "quick-view-sales" || result.reportType === "receipts") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "reconcile-report" || result.reportType === "revenue") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "sales-by-day" || result.reportType === "sales-by-show") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (result.reportType === "ticket-price-breakdown" || result.reportType === "web-counts") {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  if (
    result.reportType === "web-gift-certificates" ||
    result.reportType === "web-reservations-for-day" ||
    result.reportType === "zipcode-breakdown"
  ) {
    void clubName
    return `${result.title} exports use Excel (.xlsx). Click Export to download.`
  }

  const headers = result.columns.map((column) => csvEscape(column.label)).join(",")
  const rows = result.rows.map((row) =>
    result.columns.map((column) => csvEscape(row[column.key] ?? "")).join(",")
  )

  return [headers, ...rows].join("\n")
}

export function createReportExportBlob(result: ReportViewerResult, clubName = "") {
  if (result.reportType === "manager-checkout") {
    return buildManagerCheckoutExportBlob({ result, clubName })
  }

  if (result.reportType === "banned-inactive-customers") {
    void clubName
    return buildBannedCustomersExportBlob(result)
  }

  if (result.reportType === "new-customers") {
    void clubName
    return buildNewCustomersExportBlob(result)
  }

  if (result.reportType === "past-customers") {
    void clubName
    return buildPastCustomersExportBlob(result)
  }

  if (result.reportType === "comic-sales-breakdown") {
    void clubName
    return buildComicSalesBreakdownExportBlob(result)
  }

  if (result.reportType === "comic-ticket-revenue") {
    void clubName
    return buildComicTicketRevenueExportBlob(result)
  }

  if (result.reportType === "door-checkout") {
    void clubName
    return buildDoorCheckoutExportBlob(result)
  }

  if (result.reportType === "export-shows-attendees") {
    void clubName
    return buildExportShowsAttendeesExportBlob(result)
  }

  if (result.reportType === "audit-report") {
    void clubName
    return buildAuditReportExportBlob(result)
  }

  if (result.reportType === "projected-sales") {
    void clubName
    return buildProjectedSalesExportBlob(result)
  }

  if (result.reportType === "promo-report") {
    void clubName
    return buildPromoReportExportBlob(result)
  }

  if (result.reportType === "quick-view-sales") {
    void clubName
    return buildQuickViewSalesExportBlob(result)
  }

  if (result.reportType === "receipts") {
    void clubName
    return buildReceiptsExportBlob(result)
  }

  if (result.reportType === "reconcile-report") {
    void clubName
    return buildReconcileReportExportBlob(result)
  }

  if (result.reportType === "revenue") {
    void clubName
    return buildRevenueExportBlob(result)
  }

  if (result.reportType === "sales-by-day") {
    void clubName
    return buildSalesByDayExportBlob(result)
  }

  if (result.reportType === "sales-by-show") {
    void clubName
    return buildSalesByShowExportBlob(result)
  }

  if (result.reportType === "ticket-price-breakdown") {
    void clubName
    return buildTicketPriceBreakdownExportBlob(result)
  }

  if (result.reportType === "web-counts") {
    void clubName
    return buildWebCountsExportBlob(result)
  }

  if (result.reportType === "web-gift-certificates") {
    void clubName
    return buildWebGiftCertificatesExportBlob(result)
  }

  if (result.reportType === "web-reservations-for-day") {
    return buildWebReservationsForDayExportBlob(result, clubName)
  }

  if (result.reportType === "zipcode-breakdown") {
    void clubName
    return buildZipCodeBreakdownExportBlob(result)
  }

  const csv = createReportCsv(result, clubName)
  return new Blob([csv], { type: "text/csv;charset=utf-8" })
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

export function createReportPdfBlob(result: ReportViewerResult, _clubName = "") {
  if (result.reportType === "manager-checkout") {
    throw new Error("Use createReportPdfBlobAsync for manager checkout reports.")
  }

  if (result.reportType === "banned-inactive-customers") {
    throw new Error("Use createReportPdfBlobAsync for banned/inactive customer reports.")
  }

  if (result.reportType === "new-customers" || result.reportType === "past-customers") {
    throw new Error("Use createReportPdfBlobAsync for customer list reports.")
  }

  if (result.reportType === "comic-sales-breakdown" || result.reportType === "comic-ticket-revenue") {
    throw new Error("Use createReportPdfBlobAsync for comic report exports.")
  }

  if (result.reportType === "door-checkout" || result.reportType === "export-shows-attendees") {
    throw new Error("Use createReportPdfBlobAsync for structured report exports.")
  }

  if (result.reportType === "audit-report") {
    throw new Error("Use createReportPdfBlobAsync for audit report exports.")
  }

  if (result.reportType === "projected-sales" || result.reportType === "promo-report") {
    throw new Error("Use createReportPdfBlobAsync for structured report exports.")
  }

  if (result.reportType === "quick-view-sales" || result.reportType === "receipts") {
    throw new Error("Use createReportPdfBlobAsync for structured report exports.")
  }

  if (result.reportType === "reconcile-report" || result.reportType === "revenue") {
    throw new Error("Use createReportPdfBlobAsync for structured report exports.")
  }

  if (result.reportType === "sales-by-day" || result.reportType === "sales-by-show") {
    throw new Error("Use createReportPdfBlobAsync for structured report exports.")
  }

  if (result.reportType === "ticket-price-breakdown" || result.reportType === "web-counts") {
    throw new Error("Use createReportPdfBlobAsync for structured report exports.")
  }

  if (
    result.reportType === "web-gift-certificates" ||
    result.reportType === "web-reservations-for-day" ||
    result.reportType === "zipcode-breakdown"
  ) {
    throw new Error("Use createReportPdfBlobAsync for structured report exports.")
  }

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

export async function createReportPdfBlobAsync(result: ReportViewerResult, clubName = "") {
  if (result.reportType === "manager-checkout") {
    return createManagerCheckoutPdfBlob({ result, clubName })
  }

  if (result.reportType === "banned-inactive-customers") {
    void clubName
    return createBannedCustomersPdfBlob(result)
  }

  if (result.reportType === "new-customers") {
    void clubName
    return createNewCustomersPdfBlob(result)
  }

  if (result.reportType === "past-customers") {
    void clubName
    return createPastCustomersPdfBlob(result)
  }

  if (result.reportType === "comic-sales-breakdown") {
    void clubName
    return createComicSalesBreakdownPdfBlob(result)
  }

  if (result.reportType === "comic-ticket-revenue") {
    void clubName
    return createComicTicketRevenuePdfBlob(result)
  }

  if (result.reportType === "door-checkout") {
    void clubName
    return createDoorCheckoutPdfBlob(result)
  }

  if (result.reportType === "export-shows-attendees") {
    void clubName
    return createExportShowsAttendeesPdfBlob(result)
  }

  if (result.reportType === "audit-report") {
    void clubName
    return createAuditReportPdfBlob(result)
  }

  if (result.reportType === "projected-sales") {
    void clubName
    return createProjectedSalesPdfBlob(result)
  }

  if (result.reportType === "promo-report") {
    void clubName
    return createPromoReportPdfBlob(result)
  }

  if (result.reportType === "quick-view-sales") {
    void clubName
    return createQuickViewSalesPdfBlob(result)
  }

  if (result.reportType === "receipts") {
    void clubName
    return createReceiptsPdfBlob(result)
  }

  if (result.reportType === "reconcile-report") {
    void clubName
    return createReconcileReportPdfBlob(result)
  }

  if (result.reportType === "revenue") {
    void clubName
    return createRevenuePdfBlob(result)
  }

  if (result.reportType === "sales-by-day") {
    void clubName
    return createSalesByDayPdfBlob(result)
  }

  if (result.reportType === "sales-by-show") {
    void clubName
    return createSalesByShowPdfBlob(result)
  }

  if (result.reportType === "ticket-price-breakdown") {
    void clubName
    return createTicketPriceBreakdownPdfBlob(result)
  }

  if (result.reportType === "web-counts") {
    void clubName
    return createWebCountsPdfBlob(result)
  }

  if (result.reportType === "web-gift-certificates") {
    void clubName
    return createWebGiftCertificatesPdfBlob(result)
  }

  if (result.reportType === "web-reservations-for-day") {
    return createWebReservationsForDayPdfBlob(result, clubName)
  }

  if (result.reportType === "zipcode-breakdown") {
    void clubName
    return createZipCodeBreakdownPdfBlob(result)
  }

  return createReportPdfBlob(result, clubName)
}

export function buildReportPrintHtml(result: ReportViewerResult, clubName = "") {
  if (result.reportType === "manager-checkout") {
    return buildManagerCheckoutPrintHtml({ result, clubName })
  }

  if (result.reportType === "banned-inactive-customers") {
    void clubName
    return buildBannedCustomersPrintHtml(result)
  }

  if (result.reportType === "new-customers") {
    void clubName
    return buildNewCustomersPrintHtml(result)
  }

  if (result.reportType === "past-customers") {
    void clubName
    return buildPastCustomersPrintHtml(result)
  }

  if (result.reportType === "comic-sales-breakdown") {
    void clubName
    return buildComicSalesBreakdownPrintHtml(result)
  }

  if (result.reportType === "comic-ticket-revenue") {
    void clubName
    return buildComicTicketRevenuePrintHtml(result)
  }

  if (result.reportType === "door-checkout") {
    void clubName
    return buildDoorCheckoutPrintHtml(result)
  }

  if (result.reportType === "export-shows-attendees") {
    void clubName
    return buildExportShowsAttendeesPrintHtml(result)
  }

  if (result.reportType === "audit-report") {
    void clubName
    return buildAuditReportPrintHtml(result)
  }

  if (result.reportType === "projected-sales") {
    void clubName
    return buildProjectedSalesPrintHtml(result)
  }

  if (result.reportType === "promo-report") {
    void clubName
    return buildPromoReportPrintHtml(result)
  }

  if (result.reportType === "quick-view-sales") {
    void clubName
    return buildQuickViewSalesPrintHtml(result)
  }

  if (result.reportType === "receipts") {
    void clubName
    return buildReceiptsPrintHtml(result)
  }

  if (result.reportType === "reconcile-report") {
    void clubName
    return buildReconcileReportPrintHtml(result)
  }

  if (result.reportType === "revenue") {
    void clubName
    return buildRevenuePrintHtml(result)
  }

  if (result.reportType === "sales-by-day") {
    void clubName
    return buildSalesByDayPrintHtml(result)
  }

  if (result.reportType === "sales-by-show") {
    void clubName
    return buildSalesByShowPrintHtml(result)
  }

  if (result.reportType === "ticket-price-breakdown") {
    void clubName
    return buildTicketPriceBreakdownPrintHtml(result)
  }

  if (result.reportType === "web-counts") {
    void clubName
    return buildWebCountsPrintHtml(result)
  }

  if (result.reportType === "web-gift-certificates") {
    void clubName
    return buildWebGiftCertificatesPrintHtml(result)
  }

  if (result.reportType === "web-reservations-for-day") {
    return buildWebReservationsForDayPrintHtml(result, clubName)
  }

  if (result.reportType === "zipcode-breakdown") {
    void clubName
    return buildZipCodeBreakdownPrintHtml(result)
  }

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

export function openReportPrintWindow(result: ReportViewerResult, clubName = "") {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1080,height=780")
  if (!printWindow) {
    return
  }

  printWindow.document.open()
  printWindow.document.write(buildReportPrintHtml(result, clubName))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}


