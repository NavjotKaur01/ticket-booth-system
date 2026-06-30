import {
  FilePenLine,
  LoaderCircle,
  Save,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { RichTextEditor } from "@/components/common/rich-text-editor"
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
import { getVenueInfoLocationOptions } from "@/features/venue-info/venue-info.service"
import {
  getWebpageTextByLocation,
  getWebpageTextPagesByLocation,
  updateWebpageText,
} from "@/features/webpages-text/webpages-text.service"
import { useAppSession } from "@/hooks/use-app-session"
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

export function WebpagesTextScreen() {
  const { locations } = useAppSession()

  const locationOptions = useMemo(
    () =>
      getVenueInfoLocationOptions(locations).map((option) => ({
        value: option.id,
        label: option.label,
      })),
    [locations]
  )

  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [pageDefinitions, setPageDefinitions] = useState<WebpageTextPageDefinition[]>([])
  const [selectedPageId, setSelectedPageId] = useState("")
  const [record, setRecord] = useState<WebpageTextRecord | null>(null)
  const [loadingPages, setLoadingPages] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const selectedLocationLabel = useMemo(
    () => locationOptions.find((option) => option.value === selectedLocationId)?.label || "",
    [locationOptions, selectedLocationId]
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
    if (!selectedLocationId) {
      setPageDefinitions([])
      setSelectedPageId("")
      setRecord(null)
      setLoadingPages(false)
      setLoadingRecord(false)
      setError(null)
      setStatusMessage(null)
      return
    }

    let isActive = true
    setLoadingPages(true)
    setLoadingRecord(false)
    setError(null)
    setStatusMessage(null)
    setPageDefinitions([])
    setSelectedPageId("")
    setRecord(null)

    getWebpageTextPagesByLocation({
      locationId: selectedLocationId,
      locationLabel: selectedLocationLabel,
    })
      .then((result) => {
        if (isActive) {
          setPageDefinitions(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load webpage text pages."
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingPages(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [selectedLocationId, selectedLocationLabel])

  useEffect(() => {
    if (!selectedLocationId || !selectedPageId) {
      setRecord(null)
      setLoadingRecord(false)
      return
    }

    let isActive = true
    setLoadingRecord(true)
    setError(null)
    setStatusMessage(null)
    setRecord(null)

    getWebpageTextByLocation({
      locationId: selectedLocationId,
      pageId: selectedPageId,
      locationLabel: selectedLocationLabel,
    })
      .then((result) => {
        if (isActive) {
          setRecord(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load webpage text content."
          )
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
  }, [selectedLocationId, selectedPageId, selectedLocationLabel])

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
      setStatusMessage(`Updated ${updatedRecord.pageLabel} for ${updatedRecord.locationLabel}.`)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update webpage text."
      )
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
          Manage editable venue webpage copy with reusable rich-text tooling, using
          mock service content until the real CMS-style endpoint is connected.
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,18rem)_1fr] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="webpage-text-location">Location</Label>
            <ScrollSelectControl
              id="webpage-text-location"
              value={selectedLocationId}
              onChange={setSelectedLocationId}
              options={locationOptions}
              placeholder="Select location"
              disabled={locationOptions.length === 0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webpage-text-page">Page</Label>
            <ScrollSelectControl
              id="webpage-text-page"
              value={selectedPageId}
              onChange={setSelectedPageId}
              options={pageOptions}
              placeholder={loadingPages ? "Loading pages..." : "Select page"}
              disabled={!selectedLocationId || loadingPages || pageOptions.length === 0}
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

          {!selectedLocationId ? (
            <EmptyState
              title="Select a location to manage webpage text."
              description="The page selector and rich-text content will load once you choose a venue location."
            />
          ) : loadingPages ? (
            <EmptyState
              title="Loading available webpage copy sections..."
              description="Mock page definitions are being prepared for the selected location."
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
                previewLabel={selectedLocationLabel ? `${selectedLocationLabel} • ${record.pageLabel}` : record.pageLabel}
                minHeightClassName="min-h-[24rem]"
              />

              <Separator />

              <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                Stored HTML is preserved in the mock service exactly the way we will send it to
                the backend later, so this screen already matches the future API contract well.
              </div>
            </section>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
          <div aria-live="polite" className="text-sm text-muted-foreground">
            {selectedLocationId && selectedPageId
              ? statusMessage || `Editing ${selectedPageLabel} for ${selectedLocationLabel}.`
              : "Choose a location and page to begin updating webpage text."}
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

