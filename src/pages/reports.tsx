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
import { useGenerateReportMutation } from "@/store/api/clubmanApi"

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

  function updateDraftField<K extends keyof ReportViewerFilters>(
    key: K,
    value: ReportViewerFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }))

    if (key === "dateFrom" || key === "dateTo") {
      setActiveQuickRange(null)
    }
  }

  async function handleGenerate(nextFilters = draftFilters) {
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const config = getReportConfig(nextFilters.reportType)
      const requestBody = buildReportRequest(nextFilters, connectionName)

      const apiData = await generateReport({
        endpoint: config.endpoint,
        body: requestBody,
      }).unwrap()

      const result = transformReportApiResponse({
        reportType: nextFilters.reportType,
        data: apiData,
        filters: nextFilters,
        locationOptions,
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
