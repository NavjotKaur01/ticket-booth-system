import {
  LoaderCircle,
  Plus,
  Save,
  Share2,
} from "lucide-react"
import { Fragment, useEffect, useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { StandardRowActionsMenu } from "@/components/common/standard-row-actions-menu"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { VENUE_SOCIAL_PLATFORM_OPTIONS } from "@/features/venue-socials/venue-socials.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  useAddUpdateSocialMutation,
  useDeleteSocialMutation,
  useGetSocialsQuery,
} from "@/store/api/clubmanApi"
import type { SocialItem } from "@/types/api/social"
import type {
  VenueSocialFilters,
  VenueSocialPlatform,
  VenueSocialRecord,
} from "@/types/venue-social"
import { EMPTY_VENUE_SOCIAL_FILTERS } from "@/types/venue-social"

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

function formatSocialLabel(value: string) {
  if (!value) {
    return "-"
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function normalizeSocialPlatform(displayName: string): string {
  const normalized = displayName.trim().toLowerCase()
  const matched = VENUE_SOCIAL_PLATFORM_OPTIONS.find((option) => option === normalized)
  return matched ?? displayName.trim()
}

function mapSocialItemToRecord(item: SocialItem): VenueSocialRecord {
  return {
    id: item.SocialId,
    locationId: item.LocationId,
    social: normalizeSocialPlatform(item.DisplayName),
    displayOrder: item.OrderNumber,
    url: item.NavigateUrl,
  }
}

function filterVenueSocialRows(rows: VenueSocialRecord[], filters: VenueSocialFilters) {
  return rows.filter((row) => {
    if (
      filters.social.trim() &&
      !row.social.toLowerCase().includes(filters.social.trim().toLowerCase())
    ) {
      return false
    }

    if (
      filters.displayOrder.trim() &&
      !String(row.displayOrder).includes(filters.displayOrder.trim())
    ) {
      return false
    }

    if (
      filters.url.trim() &&
      !row.url.toLowerCase().includes(filters.url.trim().toLowerCase())
    ) {
      return false
    }

    return true
  })
}

function getNextDisplayOrder(rows: VenueSocialRecord[]) {
  if (rows.length === 0) {
    return 1
  }

  return Math.max(...rows.map((row) => row.displayOrder)) + 1
}

export function VenueSocialsScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<VenueSocialRecord[]>([])
  const [filters, setFilters] = useState<VenueSocialFilters>(EMPTY_VENUE_SOCIAL_FILTERS)
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null)
  const [socialInput, setSocialInput] = useState<string>("facebook")
  const [displayOrderInput, setDisplayOrderInput] = useState("1")
  const [urlInput, setUrlInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<VenueSocialRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {
    data: apiSocials,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useGetSocialsQuery(
    { connectionString: "demo_prod", locationId: locationId ?? "" },
    { skip: !locationId }
  )

  const [addUpdateSocial] = useAddUpdateSocialMutation()
  const [deleteSocial] = useDeleteSocialMutation()

  const filteredRows = useMemo(
    () => filterVenueSocialRows(rows, filters),
    [rows, filters]
  )

  const socialSelectOptions = useMemo(() => {
    const options = [...VENUE_SOCIAL_PLATFORM_OPTIONS]
    if (socialInput && !options.includes(socialInput as VenueSocialPlatform)) {
      options.push(socialInput as VenueSocialPlatform)
    }
    return options
  }, [socialInput])

  const parsedDisplayOrder = Number.parseInt(displayOrderInput, 10)
  const canSave =
    urlInput.trim().length > 0 &&
    Number.isFinite(parsedDisplayOrder) &&
    parsedDisplayOrder >= 0

  useEffect(() => {
    if (queryError) {
      reportErrorMessage(setError, "Unable to load venue social links.")
    } else {
      setError(null)
    }
  }, [queryError])

  useEffect(() => {
    if (apiSocials) {
      setRows(apiSocials.map(mapSocialItemToRecord))
    } else {
      setRows([])
    }
  }, [apiSocials])

  useEffect(() => {
    setFilters(EMPTY_VENUE_SOCIAL_FILTERS)
    setEditorMode(null)
    setEditingSocialId(null)
    setSocialInput("facebook")
    setDisplayOrderInput("1")
    setUrlInput("")
    setError(null)
    setStatusMessage(null)
    if (!locationId) {
      setLoading(false)
    }
  }, [locationId])

  useEffect(() => {
    setLoading(isQueryLoading)
  }, [isQueryLoading])

  function openCreateEditor() {
    setEditorMode("create")
    setEditingSocialId(null)
    setSocialInput("facebook")
    setDisplayOrderInput(String(getNextDisplayOrder(rows)))
    setUrlInput("")
    setError(null)
  }

  function openEditEditor(row: VenueSocialRecord) {
    setEditorMode("edit")
    setEditingSocialId(row.id)
    setSocialInput(row.social)
    setDisplayOrderInput(String(row.displayOrder))
    setUrlInput(row.url)
    setError(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingSocialId(null)
    setSocialInput("facebook")
    setDisplayOrderInput("1")
    setUrlInput("")
    setError(null)
  }

  async function handleSave() {
    if (!locationId || !canSave || saving) {
      return
    }

    const normalizedUrl = urlInput.trim()
    const normalizedSocial = socialInput.trim()
    const isEdit = editorMode === "edit" && Boolean(editingSocialId)
    const duplicateRow = rows.find(
      (row) =>
        row.social.toLowerCase() === normalizedSocial.toLowerCase() &&
        row.id !== editingSocialId
    )
    if (duplicateRow) {
      reportErrorMessage(
        setError,
        "This social platform already exists for the selected location."
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addUpdateSocial({
        ConnectionString: "demo_prod",
        LocationId: locationId,
        SocialId: isEdit ? editingSocialId! : "",
        DisplayName: normalizedSocial,
        NavigateUrl: normalizedUrl,
        OrderNumber: parsedDisplayOrder,
      }).unwrap()

      const saveMessage = isEdit
        ? `Updated ${formatSocialLabel(normalizedSocial)} for ${locationName}.`
        : `Added ${formatSocialLabel(normalizedSocial)} for ${locationName}.`
      setStatusMessage(saveMessage)
      toastSuccess(saveMessage)
      closeEditor()
      await refetch()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to save the social link.")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!locationId || !deletingRow || deletingId) {
      return
    }

    setDeletingId(deletingRow.id)
    setError(null)

    try {
      await deleteSocial({
        ConnectionString: "demo_prod",
        SocialId: deletingRow.id,
      }).unwrap()

      if (editingSocialId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Deleted ${formatSocialLabel(deletingRow.social)} from ${locationName}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
      await refetch()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the social link.")
    } finally {
      setDeletingId(null)
    }
  }

  function renderEditorRow() {
    return (
      <TableRow className="bg-muted/20 hover:bg-muted/20">
        <TableCell colSpan={4} className="p-4 whitespace-normal">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,12rem)_minmax(0,8rem)_minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="venue-social-platform">Social</Label>
              <Select
                value={socialInput}
                onValueChange={setSocialInput}
              >
                <SelectTrigger id="venue-social-platform" className="w-full bg-background">
                  <SelectValue placeholder="Select social platform" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {socialSelectOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatSocialLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue-social-display-order">Display Order</Label>
              <Input
                id="venue-social-display-order"
                type="number"
                min={0}
                value={displayOrderInput}
                onChange={(event) => setDisplayOrderInput(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue-social-url">URL</Label>
              <Input
                id="venue-social-url"
                type="url"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                placeholder="https://www.example.com"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditor}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => void handleSave()}
                disabled={!canSave || saving}
              >
                {saving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {editorMode === "edit" ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Location Socials Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage venue social links, display order, and profile URLs for the
                selected location.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={!locationId || loading}
              onClick={() => openCreateEditor()}
            >
              <Plus className="size-4" />
              New
            </Button>
          </div>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b bg-muted/40 px-4 py-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Location Socials Management
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-0 px-0 py-0">
              {error && !editorMode ? (
                <div className="px-4 pt-4">
                  <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                </div>
              ) : null}

              {!locationId ? (
                <div className="p-4">
                  <VenueNoLocationState featureLabel="Venue social links" />
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading venue social links...
                </div>
              ) : rows.length === 0 && editorMode !== "create" ? (
                <div className="p-4">
                  <EmptyState
                    title="No social links configured yet."
                    description="Use New to add the first social profile for this location."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto px-4 py-4">
                  <Table className="min-w-[48rem]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="min-w-40 px-3">Social</TableHead>
                        <TableHead className="w-36 px-3">Display Order</TableHead>
                        <TableHead className="min-w-80 px-3">URL</TableHead>
                        <TableHead className="w-24 px-3">Actions</TableHead>
                      </TableRow>
                      <TableRow className="bg-background hover:bg-background">
                        <TableCell className="px-3 py-2">
                          <Input
                            value={filters.social}
                            onChange={(event) =>
                              setFilters((current) => ({
                                ...current,
                                social: event.target.value,
                              }))
                            }
                            placeholder="Filter social"
                            className="h-8 bg-background text-xs"
                          />
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <Input
                            value={filters.displayOrder}
                            onChange={(event) =>
                              setFilters((current) => ({
                                ...current,
                                displayOrder: event.target.value,
                              }))
                            }
                            placeholder="Filter order"
                            className="h-8 bg-background text-xs"
                          />
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <Input
                            value={filters.url}
                            onChange={(event) =>
                              setFilters((current) => ({
                                ...current,
                                url: event.target.value,
                              }))
                            }
                            placeholder="Filter URL"
                            className="h-8 bg-background text-xs"
                          />
                        </TableCell>
                        <TableCell className="px-3 py-2" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editorMode === "create" ? renderEditorRow() : null}
                      {filteredRows.length === 0 && editorMode !== "create" ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={4} className="px-4 py-10 text-center">
                            <EmptyState
                              title="No matching social links"
                              description="Adjust the column filters or clear them to view all social profiles."
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row) => (
                          <Fragment key={row.id}>
                            <TableRow
                              className={editorMode === "edit" && editingSocialId === row.id
                                ? "bg-primary/5"
                                : undefined
                              }
                            >
                              <TableCell className="px-3 font-medium capitalize text-foreground">
                                {row.social}
                              </TableCell>
                              <TableCell className="px-3 tabular-nums text-muted-foreground">
                                {row.displayOrder}
                              </TableCell>
                              <TableCell className="px-3">
                                <a
                                  href={row.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  {row.url}
                                </a>
                              </TableCell>
                              <TableCell className="px-3">
                                <div className="flex items-center justify-end">
                                  <StandardRowActionsMenu
                                    ariaLabel={`Actions for ${formatSocialLabel(row.social)}`}
                                    hiddenActions={["Add"]}
                                    onAction={(action) => {
                                      if (action === "Edit") {
                                        openEditEditor(row)
                                      }
                                      if (action === "Delete") {
                                        setDeletingRow(row)
                                      }
                                    }}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                            {editorMode === "edit" && editingSocialId === row.id
                              ? renderEditorRow()
                              : null}
                          </Fragment>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
              <div aria-live="polite" className="text-sm text-muted-foreground">
                {locationId
                  ? statusMessage ||
                    `${filteredRows.length} of ${rows.length} social link${rows.length === 1 ? "" : "s"} shown for ${locationName}.`
                  : "Select a location from the header to begin managing social links."}
              </div>
              {locationId && rows.length > 0 ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Share2 className="size-3.5" />
                  Social links
                </div>
              ) : null}
            </CardFooter>
          </Card>
        </div>

        <ConfirmDeleteDialog
          open={Boolean(deletingRow)}
          onOpenChange={(open) => {
            if (!open && !deletingId) {
              setDeletingRow(null)
            }
          }}
          onConfirm={() => void confirmDelete()}
          title="Delete social link?"
          description={deletingRow
            ? `This will remove ${formatSocialLabel(deletingRow.social)} from ${locationName}.`
            : ""}
          confirmLabel="Delete social link"
          isPending={Boolean(deletingId)}
        />
    </>
  )
}
