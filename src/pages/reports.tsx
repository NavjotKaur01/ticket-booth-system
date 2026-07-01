import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { PanelCard } from "@/components/common/panel-card"
import { ROUTES } from "@/constants/routes"
import { useAppSession } from "@/hooks/use-app-session"
import { ReportFiltersToolbar } from "@/features/reports/report-filters-toolbar"
import { ReportViewerResults } from "@/features/reports/report-viewer-results"
import {
  buildReportPermissionRequest,
  buildReportRequest,
  resolveReportViewerOptions,
  createDefaultReportFilters,
  createReportExportBlob,
  createReportPdfBlobAsync,
  createReportViewerLocationOptions,
  downloadBlob,
  getReportConfig,
  openReportPrintWindow,
  resolveReportType,
  transformReportApiResponse,
  usesExcelExport,
  type ReportViewerFilters,
  type ReportViewerResult,
} from "@/features/reports/reports.service"
import type { ManagerCheckoutGiftCertApiRow } from "@/features/reports/manager-checkout-data"
import {
  useGenerateReportMutation,
  useGetComedianListQuery,
  useGetReportPermissionAccessesQuery,
} from "@/store/api/clubmanApi"

function buildFilename(base: string, extension: string) {
  const safeBase = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const stamp = dayjs().format("YYYYMMDD-HHmm")
  return `${safeBase || "report"}-${stamp}.${extension}`
}

export function Reports() {
  const { locationId, locationName, locations, connectionName, userRight } = useAppSession()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [generateReport] = useGenerateReportMutation()

  const permissionRequest = useMemo(
    () =>
      connectionName && locationId
        ? buildReportPermissionRequest(connectionName, userRight, locationId)
        : null,
    [connectionName, locationId, userRight]
  )

  const {
    data: reportPermissions = [],
    isLoading: isLoadingReportOptions,
    isError: isReportOptionsError,
  } = useGetReportPermissionAccessesQuery(permissionRequest!, {
    skip: !permissionRequest,
    refetchOnMountOrArgChange: true,
  })

  const reportOptions = useMemo(
    () =>
      resolveReportViewerOptions(reportPermissions, userRight, {
        isError: isReportOptionsError,
      }),
    [reportPermissions, userRight, isReportOptionsError]
  )

  const locationOptions = useMemo(
    () => createReportViewerLocationOptions(locations, locationId, locationName),
    [locationId, locationName, locations]
  )
  const [draftFilters, setDraftFilters] = useState<ReportViewerFilters>(() =>
    createDefaultReportFilters({
      locationId: locationId ?? locationOptions[0]?.id ?? "",
    })
  )
  const [generatedResult, setGeneratedResult] = useState<ReportViewerResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeQuickRange, setActiveQuickRange] = useState<"today" | "yesterday" | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const isComicReport = draftFilters.reportType === "comic-ticket-revenue"
  const { data: rawComedianList = [] } = useGetComedianListQuery(connectionName, {
    skip: !connectionName || !isComicReport,
  })

  const comedianOptions = useMemo(
    () =>
      rawComedianList.map((c) => {
        // The API returns "ComicName" as the display field.
        // WPF maps it to "CominName" client-side; StageName and First/LastName are fallbacks.
        // Per spec: show blank if name is unavailable (never fall back to the GUID).
        const nameParts = [c.LastName, c.FirstName].filter(Boolean).join(", ")
        const label = c.ComicName || c.CominName || c.StageName || nameParts || ""
        return { id: c.ComicID, label }
      }),
    [rawComedianList]
  )

  useEffect(() => {
    if (searchParams.has("report")) {
      navigate(ROUTES.reports, { replace: true })
    }
  }, [searchParams, navigate])

  useEffect(() => {
    if (!locationId) return

    setDraftFilters((current) =>
      current.locationId === locationId ? current : { ...current, locationId }
    )
  }, [locationId])

  useEffect(() => {
    if (comedianOptions.length > 0 && !draftFilters.headlinerId) {
      setDraftFilters((current) => ({
        ...current,
        headlinerId: comedianOptions[0].id,
      }))
    }
  }, [comedianOptions, draftFilters.headlinerId])

  useEffect(() => {
    if (!reportOptions.length) return

    setDraftFilters((current) => {
      const nextReportType = resolveReportType(current.reportType, reportOptions)
      if (nextReportType === current.reportType) return current
      const nextConfig = getReportConfig(nextReportType)
      return {
        ...current,
        reportType: nextReportType,
        headlinerId: nextConfig.showComicPicker ? current.headlinerId : "",
        isAllDates: nextConfig.showAllDatesOption ? current.isAllDates : false,
        isWebReservationOnly: nextConfig.showWebReservationOnly ? current.isWebReservationOnly : false,
        isSeparateByUsers: nextReportType === "door-checkout" ? true : (nextConfig.showSeparateByUsers ? current.isSeparateByUsers : false),
      }
    })
  }, [reportOptions])

  function updateDraftField<K extends keyof ReportViewerFilters>(
    key: K,
    value: ReportViewerFilters[K]
  ) {
    if (key === "reportType") {
      const nextType = value as string
      const nextConfig = getReportConfig(nextType)
      setDraftFilters((current) => ({
        ...current,
        [key]: value,
        headlinerId: nextConfig.showComicPicker ? current.headlinerId : "",
        isAllDates: nextConfig.showAllDatesOption ? current.isAllDates : false,
        isWebReservationOnly: nextConfig.showWebReservationOnly ? current.isWebReservationOnly : false,
        isSeparateByUsers: nextType === "door-checkout" ? true : (nextConfig.showSeparateByUsers ? current.isSeparateByUsers : false),
      }))
    } else {
      setDraftFilters((current) => ({ ...current, [key]: value }))
    }

    if (key === "dateFrom" || key === "dateTo") {
      setActiveQuickRange(null)
    }
  }

  async function handleGenerate(nextFilters = draftFilters) {
    const config = getReportConfig(nextFilters.reportType)

    if (config.showComicPicker && !nextFilters.headlinerId) {
      setGenerateError("Please select a comedian before generating this report.")
      return
    }

    setIsGenerating(true)
    setGenerateError(null)
    setExportError(null)

    try {
      const requestBody = buildReportRequest(nextFilters, connectionName)
      let apiData: unknown

      if (nextFilters.reportType === "door-checkout" && nextFilters.isSeparateByUsers) {
        // WPF always loads GetDoorCheckOutReport first, then appends per-user sections.
        const mainData = await generateReport({
          endpoint: "GetDoorCheckOutReport",
          body: requestBody,
        }).unwrap()

        const mainRows = Array.isArray(mainData)
          ? (mainData as Array<Record<string, unknown>>)
          : []

        const userListRaw = await generateReport({
          endpoint: "GetDoorCheckOutByUserName",
          body: requestBody,
        }).unwrap()

        const userList = Array.isArray(userListRaw)
          ? (userListRaw as Array<Record<string, unknown>>)
          : []

        const userRows: Array<Record<string, unknown>> = []
        for (const user of userList) {
          const userName = String(user.CreatedBy ?? user.UserName ?? "")
          const userData = await generateReport({
            endpoint: "GetDoorCheckOutSeparetUserData",
            body: { ...requestBody, CreatedBy: userName },
          }).unwrap()
          const rows = Array.isArray(userData) ? (userData as Array<Record<string, unknown>>) : []
          for (const row of rows) {
            userRows.push({ ...row, _userLabel: userName })
          }
        }

        apiData = [...mainRows, ...userRows]
      } else {
        apiData = await generateReport({
          endpoint: config.endpoint,
          body: requestBody,
        }).unwrap()
      }

      let managerCheckoutExtras: ReportViewerResult["managerCheckoutExtras"]

      if (nextFilters.reportType === "manager-checkout") {
        const giftListRaw = await generateReport({
          endpoint: "GetManagerWebGiftCertificateDetail",
          body: requestBody,
        }).unwrap()

        const giftCertificateList = Array.isArray(giftListRaw)
          ? (giftListRaw as ManagerCheckoutGiftCertApiRow[])
          : []

        let giftCertificatePayments: ManagerCheckoutGiftCertApiRow[] = []
        if (giftCertificateList.length > 0) {
          const giftPayRaw = await generateReport({
            endpoint: "GetManagerWebGiftCertificatePayment",
            body: requestBody,
          }).unwrap()
          giftCertificatePayments = Array.isArray(giftPayRaw)
            ? (giftPayRaw as ManagerCheckoutGiftCertApiRow[])
            : []
        }

        managerCheckoutExtras = { giftCertificateList, giftCertificatePayments }
      }

      const result = transformReportApiResponse({
        reportType: nextFilters.reportType,
        data: apiData,
        filters: nextFilters,
        locationOptions,
        connectionName,
      })

      if (managerCheckoutExtras) {
        result.managerCheckoutExtras = managerCheckoutExtras
      }

      result.exportMeta = {
        dateFrom: nextFilters.dateFrom,
        dateTo: nextFilters.dateTo,
      }

      setGeneratedResult(result)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "error" in error
            ? String((error as { error: unknown }).error)
            : "Failed to generate report. Please try again."
      setGenerateError(message)
      setGeneratedResult(null)
    } finally {
      setIsGenerating(false)
    }
  }

  function applyPreset(nextDate: string, range: "today" | "yesterday") {
    const nextFilters: ReportViewerFilters = {
      ...draftFilters,
      dateFrom: nextDate,
      dateTo: nextDate,
    }
    setDraftFilters(nextFilters)
    setActiveQuickRange(range)
    void handleGenerate(nextFilters)
  }

  function handleToday() {
    applyPreset(dayjs().format("YYYY-MM-DD"), "today")
  }

  function handleYesterday() {
    applyPreset(dayjs().subtract(1, "day").format("YYYY-MM-DD"), "yesterday")
  }

  function handlePrint() {
    if (!generatedResult) {
      return
    }

    setExportError(null)
    openReportPrintWindow(generatedResult, locationName)
  }

  function handleExport() {
    if (!generatedResult) {
      return
    }

    setExportError(null)
    const blob = createReportExportBlob(generatedResult, locationName)
    const extension = usesExcelExport(generatedResult.reportType) ? "xlsx" : "csv"
    downloadBlob(blob, buildFilename(generatedResult.title, extension))
  }

  async function handlePdf() {
    if (!generatedResult || isExportingPdf) {
      return
    }

    setIsExportingPdf(true)
    setExportError(null)

    try {
      const blob = await createReportPdfBlobAsync(generatedResult, locationName)
      downloadBlob(blob, buildFilename(generatedResult.title, "pdf"))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to export PDF. Please try again."
      setExportError(message)
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelCard className="flex min-h-0 flex-1 flex-col rounded-2xl border-border/70 bg-card shadow-sm">
        <div className="shrink-0 border-b border-border/70 bg-card">
          <ReportFiltersToolbar
            filters={draftFilters}
            reportOptions={reportOptions}
            comedianOptions={comedianOptions}
            isGenerating={isGenerating}
            isLoadingReportOptions={isLoadingReportOptions}
            reportOptionsError={isReportOptionsError}
            activeQuickRange={activeQuickRange}
            onFilterChange={updateDraftField}
            onGenerate={() => void handleGenerate()}
            onToday={handleToday}
            onYesterday={handleYesterday}
            onPrint={handlePrint}
            onExport={handleExport}
            onPdf={() => void handlePdf()}
            isExportingPdf={isExportingPdf}
            exportError={exportError}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
          <ReportViewerResults
            result={generatedResult}
            isLoading={isGenerating}
            errorMessage={generateError}
          />
        </div>
      </PanelCard>
    </div>
  )
}
