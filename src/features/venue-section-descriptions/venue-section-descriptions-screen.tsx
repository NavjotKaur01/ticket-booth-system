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
import { Textarea } from "@/components/ui/textarea"
import { VenueSectionDescriptionDataTable } from "@/features/venue-section-descriptions/venue-section-description-data-table"
import {
  createVenueSectionDescription,
  deleteVenueSectionDescription,
  getVenueSectionDescriptionsByLocation,
  updateVenueSectionDescription,
} from "@/features/venue-section-descriptions/venue-section-descriptions.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import type { VenueSectionDescriptionRecord } from "@/types/venue-section-description"

export function VenueSectionDescriptionsScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<VenueSectionDescriptionRecord[]>([])
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [sectionNameInput, setSectionNameInput] = useState("")
  const [sectionDetailInput, setSectionDetailInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<VenueSectionDescriptionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const canSave =
    sectionNameInput.trim().length > 0 && sectionDetailInput.trim().length > 0

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setEditorMode(null)
      setEditingSectionId(null)
      setSectionNameInput("")
      setSectionDetailInput("")
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
    setEditingSectionId(null)
    setSectionNameInput("")
    setSectionDetailInput("")

    getVenueSectionDescriptionsByLocation({
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
          reportError(setError, requestError, "Unable to load section descriptions.")
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
    setEditingSectionId(null)
    setSectionNameInput("")
    setSectionDetailInput("")
    setError(null)
  }

  function openEditEditor(row: VenueSectionDescriptionRecord) {
    setEditorMode("edit")
    setEditingSectionId(row.id)
    setSectionNameInput(row.sectionName)
    setSectionDetailInput(row.sectionDetail)
    setError(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingSectionId(null)
    setSectionNameInput("")
    setSectionDetailInput("")
    setError(null)
  }

  async function handleSave() {
    if (!locationId || !canSave || saving) {
      return
    }

    const normalizedName = sectionNameInput.trim()
    const normalizedDetail = sectionDetailInput.trim()
    const duplicateRow = rows.find(
      (row) =>
        row.sectionName.toLowerCase() === normalizedName.toLowerCase() &&
        row.id !== editingSectionId
    )
    if (duplicateRow) {
      reportErrorMessage(
        setError,
        "A section with this name already exists for the selected location."
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        sectionName: normalizedName,
        sectionDetail: normalizedDetail,
      }

      if (editorMode === "edit" && editingSectionId) {
        const updatedRow = await updateVenueSectionDescription({
          locationId,
          locationLabel: locationName,
          sectionId: editingSectionId,
          input: payload,
        })

        setRows((current) =>
          current.map((row) => (row.id === updatedRow.id ? updatedRow : row))
        )
        const updateMessage = `Updated ${updatedRow.sectionName} for ${locationName}.`
        setStatusMessage(updateMessage)
        toastSuccess(updateMessage)
      } else {
        const createdRow = await createVenueSectionDescription({
          locationId,
          locationLabel: locationName,
          input: payload,
        })

        setRows((current) => [...current, createdRow])
        const createMessage = `Added ${createdRow.sectionName} for ${locationName}.`
        setStatusMessage(createMessage)
        toastSuccess(createMessage)
      }

      closeEditor()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to save the section description.")
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
      await deleteVenueSectionDescription({
        locationId,
        locationLabel: locationName,
        sectionId: deletingRow.id,
      })

      setRows((current) => current.filter((row) => row.id !== deletingRow.id))
      if (editingSectionId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Deleted ${deletingRow.sectionName} from ${locationName}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the section description.")
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
              {editorMode === "edit"
                ? "Edit Section Description"
                : "New Section Description"}
            </p>
            <p className="text-xs text-muted-foreground">
              Set the section name and detail, then save.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
            <div className="space-y-1.5">
              <Label htmlFor="venue-section-name">Section Name</Label>
              <Input
                id="venue-section-name"
                value={sectionNameInput}
                onChange={(event) => setSectionNameInput(event.target.value)}
                placeholder="Section name"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue-section-detail">Section Detail</Label>
              <Textarea
                id="venue-section-detail"
                value={sectionDetailInput}
                onChange={(event) => setSectionDetailInput(event.target.value)}
                placeholder="Section detail"
                rows={3}
                className="min-h-20 bg-background"
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
            <AdminPageTitle>Section Details</AdminPageTitle>
            <p className="text-sm text-muted-foreground">
              Manage venue section names and descriptions with mock service data
              until the backend integration is ready.
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
              with New, or edit a row when a section description changes.
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
              <VenueNoLocationState featureLabel="Section descriptions" />
            </div>
          ) : (
            <>
              {renderEditorPanel()}
              <VenueSectionDescriptionDataTable
                data={rows}
                loading={loading}
                emptyMessage="No section descriptions found for this location."
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
        title="Delete section description?"
        description={
          deletingRow
            ? `This will remove ${deletingRow.sectionName} from ${locationName}.`
            : ""
        }
        confirmLabel="Delete section"
        isPending={Boolean(deletingId)}
      />
    </>
  )
}
