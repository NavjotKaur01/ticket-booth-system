import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { PanelCard } from "@/components/common/panel-card"
import { useAppSession } from "@/hooks/use-app-session"
import { ReportFiltersToolbar } from "@/features/reports/report-filters-toolbar"
import { ReportViewerResults } from "@/features/reports/report-viewer-results"
import {
  buildReportPermissionRequest,
  buildReportRequest,
  resolveReportViewerOptions,
  createDefaultReportFilters,
  createReportCsv,
  createReportPdfBlob,
  createReportViewerLocationOptions,
  downloadBlob,
  getReportConfig,
  openReportPrintWindow,
  resolveReportType,
  transformReportApiResponse,
  type ReportViewerFilters,
  type ReportViewerResult,
} from "@/features/reports/reports.service"
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
  const initialReportType = resolveReportType(searchParams.get("report"), reportOptions)

  const [draftFilters, setDraftFilters] = useState<ReportViewerFilters>(() =>
    createDefaultReportFilters({
      locationId: locationOptions[0]?.id ?? locationId,
      reportType: initialReportType,
    })
  )
  const [generatedResult, setGeneratedResult] = useState<ReportViewerResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeQuickRange, setActiveQuickRange] = useState<"today" | "yesterday" | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

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
    if (!locationOptions.length) {
      return
    }

    setDraftFilters((current) => {
      if (current.locationId && locationOptions.some((option) => option.id === current.locationId)) {
        return current
      }

      return {
        ...current,
        locationId: locationOptions[0].id,
      }
    })
  }, [locationOptions])

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

  useEffect(() => {
    const urlReportType = resolveReportType(searchParams.get("report"), reportOptions)
    if (!urlReportType || !reportOptions.length) return

    setDraftFilters((current) =>
      current.reportType === urlReportType ? current : { ...current, reportType: urlReportType }
    )
  }, [searchParams, reportOptions])

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

      const result = transformReportApiResponse({
        reportType: nextFilters.reportType,
        data: apiData,
        filters: nextFilters,
        locationOptions,
        connectionName,
      })

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
    setDraftFilters((current) => ({
      ...current,
      dateFrom: nextDate,
      dateTo: nextDate,
    }))
    setActiveQuickRange(range)
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

    openReportPrintWindow(generatedResult)
  }

  function handleExport() {
    if (!generatedResult) {
      return
    }

    const csv = createReportCsv(generatedResult)
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      buildFilename(generatedResult.title, "csv")
    )
  }

  function handlePdf() {
    if (!generatedResult) {
      return
    }

    downloadBlob(
      createReportPdfBlob(generatedResult),
      buildFilename(generatedResult.title, "pdf")
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelCard className="flex min-h-0 flex-1 flex-col rounded-2xl border-border/70 bg-card shadow-sm">
        <div className="shrink-0 border-b border-border/70 bg-card">
          <ReportFiltersToolbar
            filters={draftFilters}
            reportOptions={reportOptions}
            locationOptions={locationOptions}
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
            onPdf={handlePdf}
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
