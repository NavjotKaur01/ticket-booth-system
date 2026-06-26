import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { PanelCard } from "@/components/common/panel-card"
import { useAppSession } from "@/hooks/use-app-session"
import { ReportFiltersToolbar } from "@/features/reports/report-filters-toolbar"
import { ReportViewerResults } from "@/features/reports/report-viewer-results"
import {
  createDefaultReportFilters,
  createReportCsv,
  createReportPdfBlob,
  createReportViewerLocationOptions,
  downloadBlob,
  generateReportViewerResult,
  openReportPrintWindow,
  reportViewerOptions,
  resolveReportType,
  type ReportViewerFilters,
  type ReportViewerResult,
} from "@/features/reports/reports.service"

function buildFilename(base: string, extension: string) {
  const safeBase = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const stamp = dayjs().format("YYYYMMDD-HHmm")
  return `${safeBase || "report"}-${stamp}.${extension}`
}

export function Reports() {
  const { locationId, locationName, locations } = useAppSession()
  const [searchParams] = useSearchParams()

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

    try {
      const result = await generateReportViewerResult({
        filters: nextFilters,
        locationOptions,
      })
      setGeneratedResult(result)
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
          <ReportViewerResults result={generatedResult} isLoading={isGenerating} />
        </div>
      </PanelCard>
    </div>
  )
}
