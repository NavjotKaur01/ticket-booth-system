import { LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import {
  AdminPageShell,
  AdminPageTitle,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VenueSocialDataTable } from "@/features/venue-socials/venue-social-data-table"
import {
  createVenueSocial,
  deleteVenueSocial,
  getVenueSocialsByLocation,
  updateVenueSocial,
  VENUE_SOCIAL_PLATFORM_OPTIONS,
} from "@/features/venue-socials/venue-socials.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import type {
  VenueSocialPlatform,
  VenueSocialRecord,
} from "@/types/venue-social"

function formatSocialLabel(value: VenueSocialPlatform) {
  return value.charAt(0).toUpperCase() + value.slice(1)
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
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null)
  const [socialInput, setSocialInput] = useState<VenueSocialPlatform>("facebook")
  const [displayOrderInput, setDisplayOrderInput] = useState("1")
  const [urlInput, setUrlInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<VenueSocialRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const parsedDisplayOrder = Number.parseInt(displayOrderInput, 10)
  const canSave =
    urlInput.trim().length > 0 &&
    Number.isFinite(parsedDisplayOrder) &&
    parsedDisplayOrder >= 0

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setEditorMode(null)
      setEditingSocialId(null)
      setSocialInput("facebook")
      setDisplayOrderInput("1")
      setUrlInput("")
      setLoading(false)
      setError(null)
      setStatusMessage(null)
      return
    }

    let isActive = true
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    setRows([])
    setEditorMode(null)
    setEditingSocialId(null)
    setSocialInput("facebook")
    setDisplayOrderInput("1")
    setUrlInput("")

    getVenueSocialsByLocation({
      locationId,
      locationLabel: locationName,
    })
      .then((result) => {
        if (isActive) {
          setRows(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          reportError(setError, requestError, "Unable to load venue social links.")
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [locationId, locationName])

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
    const duplicateRow = rows.find(
      (row) => row.social === socialInput && row.id !== editingSocialId
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
      const payload = {
        social: socialInput,
        displayOrder: parsedDisplayOrder,
        url: normalizedUrl,
      }

      if (editorMode === "edit" && editingSocialId) {
        const updatedRow = await updateVenueSocial({
          locationId,
          locationLabel: locationName,
          socialId: editingSocialId,
          input: payload,
        })

        setRows((current) =>
          current
            .map((row) => (row.id === updatedRow.id ? updatedRow : row))
            .sort((left, right) => left.displayOrder - right.displayOrder)
        )
        const updateMessage = `Updated ${formatSocialLabel(updatedRow.social)} for ${locationName}.`
        setStatusMessage(updateMessage)
        toastSuccess(updateMessage)
      } else {
        const createdRow = await createVenueSocial({
          locationId,
          locationLabel: locationName,
          input: payload,
        })

        setRows((current) =>
          [...current, createdRow].sort(
            (left, right) => left.displayOrder - right.displayOrder
          )
        )
        const createMessage = `Added ${formatSocialLabel(createdRow.social)} for ${locationName}.`
        setStatusMessage(createMessage)
        toastSuccess(createMessage)
      }

      closeEditor()
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
      await deleteVenueSocial({
        locationId,
        locationLabel: locationName,
        socialId: deletingRow.id,
      })

      setRows((current) => current.filter((row) => row.id !== deletingRow.id))
      if (editingSocialId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Deleted ${formatSocialLabel(deletingRow.social)} from ${locationName}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the social link.")
    } finally {
      setDeletingId(null)
    }
  }

  function renderEditorPanel() {
    if (!editorMode) {
      return null
    }

    return (
      <div className="border-b px-3 py-4">
        <div className="rounded-sm border border-border bg-background p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">
              {editorMode === "edit" ? "Edit Social Link" : "New Social Link"}
            </p>
            <p className="text-xs text-muted-foreground">
              Set the platform, display order, and profile URL, then save.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,12rem)_minmax(0,8rem)_minmax(0,1fr)] lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="venue-social-platform">Social</Label>
              <Select
                value={socialInput}
                onValueChange={(value) =>
                  setSocialInput(value as VenueSocialPlatform)
                }
              >
                <SelectTrigger
                  id="venue-social-platform"
                  className="w-full bg-background"
                >
                  <SelectValue placeholder="Select social platform" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {VENUE_SOCIAL_PLATFORM_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatSocialLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue-social-display-order">Display Order</Label>
              <Input
                id="venue-social-display-order"
                type="number"
                min={0}
                value={displayOrderInput}
                onChange={(event) => setDisplayOrderInput(event.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue-social-url">URL</Label>
              <Input
                id="venue-social-url"
                type="url"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                placeholder="https://www.example.com"
                className="bg-background"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
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
              onClick={() => void handleSave()}
              disabled={!canSave || saving}
            >
              {saving ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {editorMode === "edit" ? "Update" : "Create"}
                </>
              ) : editorMode === "edit" ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AdminPageShell>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <AdminPageTitle>Venue Socials</AdminPageTitle>
            <p className="text-sm text-muted-foreground">
              Manage venue social links, display order, and profile URLs with mock
              service data until the backend integration is ready.
            </p>
          </div>
          <Button
            type="button"
            disabled={!locationId || loading}
            onClick={openCreateEditor}
            className="w-full sm:w-auto"
          >
            New
          </Button>
        </div>

        <PanelCard>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> Add
              with New, or edit a row when a social profile changes.
            </p>
            <p className="text-xs text-muted-foreground">
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {rows.length}
              </span>
            </p>
          </div>

          {error ? (
            <p className="border-b px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}

          {statusMessage ? (
            <p className="border-b px-3 py-2 text-sm text-muted-foreground">
              {statusMessage}
            </p>
          ) : null}

          {!locationId ? (
            <div className="p-4">
              <VenueNoLocationState featureLabel="Venue social links" />
            </div>
          ) : (
            <>
              {renderEditorPanel()}
              <VenueSocialDataTable
                data={rows}
                loading={loading}
                emptyMessage="No social links found for this location."
                onEdit={openEditEditor}
                onDelete={setDeletingRow}
              />
            </>
          )}
        </PanelCard>
      </AdminPageShell>

      <ConfirmDeleteDialog
        open={Boolean(deletingRow)}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setDeletingRow(null)
          }
        }}
        onConfirm={() => void confirmDelete()}
        title="Delete social link?"
        description={
          deletingRow
            ? `This will remove ${formatSocialLabel(deletingRow.social)} from ${locationName}.`
            : ""
        }
        confirmLabel="Delete social link"
        isPending={Boolean(deletingId)}
      />
    </>
  )
}
