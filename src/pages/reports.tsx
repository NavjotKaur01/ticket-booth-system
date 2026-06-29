import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { PanelCard } from "@/components/common/panel-card"
import { useAppSession } from "@/hooks/use-app-session"
import { ReportFiltersToolbar } from "@/features/reports/report-filters-toolbar"
import { ReportViewerResults } from "@/features/reports/report-viewer-results"
import {
  buildReportRequest,
  createDefaultReportFilters,
  createReportCsv,
  createReportPdfBlob,
  createReportViewerLocationOptions,
  downloadBlob,
  getReportConfig,
  openReportPrintWindow,
  reportViewerOptions,
  resolveReportType,
  transformReportApiResponse,
  type ReportViewerFilters,
  type ReportViewerResult,
} from "@/features/reports/reports.service"
import { useGenerateReportMutation, useGetComedianListQuery } from "@/store/api/clubmanApi"

function buildFilename(base: string, extension: string) {
  const safeBase = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const stamp = dayjs().format("YYYYMMDD-HHmm")
  return `${safeBase || "report"}-${stamp}.${extension}`
}

export function Reports() {
  const { locationId, locationName, locations, connectionName } = useAppSession()
  const [searchParams] = useSearchParams()
  const [generateReport] = useGenerateReportMutation()

  const locationOptions = useMemo(
    () => createReportViewerLocationOptions(locations, locationId, locationName),
    [locationId, locationName, locations]
  )
  const initialReportType = resolveReportType(searchParams.get("report"))

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
        isSeparateByUsers: nextConfig.showSeparateByUsers ? current.isSeparateByUsers : false,
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
        // ── Separate by users: get user list → per-user data ─────────────
        const userListRaw = await generateReport({
          endpoint: "GetDoorCheckOutByUserName",
          body: requestBody,
        }).unwrap()

        const userList = Array.isArray(userListRaw)
          ? (userListRaw as Array<Record<string, unknown>>)
          : []

        const allRows: Array<Record<string, unknown>> = []
        for (const user of userList) {
          const userName = String(user.CreatedBy ?? user.UserName ?? "")
          const userData = await generateReport({
            endpoint: "GetDoorCheckOutSeparetUserData",
            body: { ...requestBody, CreatedBy: userName },
          }).unwrap()
          const rows = Array.isArray(userData) ? (userData as Array<Record<string, unknown>>) : []
          for (const row of rows) {
            allRows.push({ ...row, _userLabel: userName })
          }
        }
        apiData = allRows
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
    <div className="space-y-3">
      <PanelCard className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
        <ReportFiltersToolbar
          filters={draftFilters}
          reportOptions={reportViewerOptions}
          locationOptions={locationOptions}
          comedianOptions={comedianOptions}
          isGenerating={isGenerating}
          activeQuickRange={activeQuickRange}
          onFilterChange={updateDraftField}
          onGenerate={() => void handleGenerate()}
          onToday={handleToday}
          onYesterday={handleYesterday}
          onPrint={handlePrint}
          onExport={handleExport}
          onPdf={handlePdf}
        />

        <div className="min-h-[38rem] bg-background">
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
