import {
  FilePenLine,
  LoaderCircle,
  Save,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { RichTextEditor } from "@/components/common/rich-text-editor"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  getWebpageTextByLocation,
  updateWebpageText,
} from "@/features/webpages-text/webpages-text.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { useGetWebpagePagesQuery } from "@/store/api/clubmanApi"
import type { WebpageTextPageItem } from "@/types/api/webpage-text"
import type {
  WebpageTextPageDefinition,
  WebpageTextRecord,
} from "@/types/webpage-text"

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function mapWebpagePageItem(item: WebpageTextPageItem): WebpageTextPageDefinition {
  return {
    id: item.ItemId,
    label: item.ItemName,
  }
}

export function WebpagesTextScreen() {
  const { locationId, locationName } = useAppSession()

  const [pageDefinitions, setPageDefinitions] = useState<WebpageTextPageDefinition[]>([])
  const [selectedPageId, setSelectedPageId] = useState("")
  const [record, setRecord] = useState<WebpageTextRecord | null>(null)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {
    data: apiPages,
    isLoading: loadingPages,
    error: pagesQueryError,
  } = useGetWebpagePagesQuery(
    { locationId: locationId ?? "" },
    { skip: !locationId }
  )

  const pageOptions = useMemo(
    () => pageDefinitions.map((page) => ({ value: page.id, label: page.label })),
    [pageDefinitions]
  )

  const selectedPageLabel = useMemo(
    () => pageDefinitions.find((page) => page.id === selectedPageId)?.label || "",
    [pageDefinitions, selectedPageId]
  )

  useEffect(() => {
    if (pagesQueryError) {
      reportErrorMessage(setError, "Unable to load webpage text pages.")
    }
  }, [pagesQueryError])

  useEffect(() => {
    if (apiPages) {
      const mapped = apiPages.map(mapWebpagePageItem)
      setPageDefinitions(mapped)
      setSelectedPageId((current) =>
        current && mapped.some((page) => page.id === current)
          ? current
          : ""
      )
    } else {
      setPageDefinitions([])
      setSelectedPageId("")
    }
  }, [apiPages])

  useEffect(() => {
    setRecord(null)
    setError(null)
    setStatusMessage(null)
  }, [locationId])

  useEffect(() => {
    if (!locationId || !selectedPageId) {
      setRecord(null)
      setLoadingRecord(false)
      return
    }

    const pageLabel =
      pageDefinitions.find((page) => page.id === selectedPageId)?.label || "Selected page"

    let isActive = true
    setLoadingRecord(true)
    setError(null)
    setStatusMessage(null)
    setRecord(null)

    getWebpageTextByLocation({
      locationId: locationId,
      pageId: selectedPageId,
      locationLabel: locationName,
    })
      .then((result) => {
        if (isActive) {
          setRecord({
            ...result,
            pageId: selectedPageId,
            pageLabel,
            locationLabel: locationName || result.locationLabel,
          })
        }
      })
      .catch(() => {
        if (isActive) {
          setRecord({
            locationId,
            locationLabel: locationName,
            pageId: selectedPageId,
            pageLabel,
            htmlContent: `<h2 style="text-align: center;">${pageLabel}</h2><p style="text-align: center;">Add webpage copy for ${locationName || "this venue"} here.</p>`,
          })
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingRecord(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [locationId, selectedPageId, locationName, pageDefinitions])

  function updateHtmlContent(htmlContent: string) {
    setRecord((current) => (current ? { ...current, htmlContent } : current))
    setError(null)
    setStatusMessage(null)
  }

  function clearContent() {
    updateHtmlContent("<p></p>")
  }

  async function handleUpdate() {
    if (!record || saving) {
      return
    }

    setSaving(true)
    setError(null)
    setStatusMessage(null)

    try {
      const updatedRecord = await updateWebpageText(record)
      setRecord(updatedRecord)
      const message = `Updated ${updatedRecord.pageLabel} for ${updatedRecord.locationLabel}.`
      setStatusMessage(message)
      toastSuccess(message)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to update webpage text.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Webpages Text
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage editable venue webpage copy with reusable rich-text tooling.
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="webpage-text-page">Page</Label>
            <ScrollSelectControl
              id="webpage-text-page"
              value={selectedPageId}
              onChange={setSelectedPageId}
              options={pageOptions}
              placeholder={loadingPages ? "Loading pages..." : "Select page"}
              disabled={!locationId || loadingPages || pageOptions.length === 0}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b bg-muted/40 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Webpage Text Management
            </CardTitle>
            {selectedPageLabel ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border/70">
                <FilePenLine className="size-3.5" />
                <span>{selectedPageLabel}</span>
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 py-5">
          {error ? (
            <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!locationId ? (
            <VenueNoLocationState featureLabel="Webpage text" />
          ) : loadingPages ? (
            <EmptyState
              title="Loading available webpage copy sections..."
              description="Page definitions are being loaded for the selected location."
            />
          ) : pageOptions.length === 0 ? (
            <EmptyState
              title="No pages found."
              description="This location does not have webpage text pages yet."
            />
          ) : !selectedPageId ? (
            <EmptyState
              title="Select a page to start editing."
              description="Choose one of the available webpage sections to load its stored HTML content."
            />
          ) : loadingRecord || !record ? (
            <EmptyState
              title="Loading webpage text content..."
              description="The selected page HTML is being loaded into the shared editor."
            />
          ) : (
            <section className="space-y-4">
              <RichTextEditor
                value={record.htmlContent}
                onChange={updateHtmlContent}
                onClear={clearContent}
                previewLabel={locationName ? `${locationName} • ${record.pageLabel}` : record.pageLabel}
                minHeightClassName="min-h-[24rem]"
              />

              <Separator />

              <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                Edit the page content below, then click Update to save your changes.
              </div>
            </section>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
          <div aria-live="polite" className="text-sm text-muted-foreground">
            {locationId && selectedPageId
              ? statusMessage || `Editing ${selectedPageLabel} for ${locationName}.`
              : "Select a location from the header and choose a page to begin updating webpage text."}
          </div>
          <Button
            type="button"
            onClick={() => void handleUpdate()}
            disabled={!record || saving || loadingPages || loadingRecord}
            className="gap-2"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Update
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
