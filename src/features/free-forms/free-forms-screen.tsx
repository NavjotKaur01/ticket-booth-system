import { LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { RichTextEditor } from "@/components/common/rich-text-editor"
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
import { FreeFormDataTable } from "@/features/free-forms/free-form-data-table"
import {
  createFreeForm,
  deleteFreeForm,
  getFreeFormsByLocation,
  updateFreeForm,
} from "@/features/free-forms/free-forms.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import type { FreeFormRecord } from "@/types/free-form"

const ACTIVE_OPTIONS = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
] as const

function buildDefaultHtml(buttonText: string, locationLabel: string) {
  const heading = buttonText.trim() || "Free Form Content"
  const venueLabel = locationLabel.trim() || "this venue"

  return `<div style="text-align: center;"><h2>${heading}</h2><p>Add promotional copy, sponsor details, or custom webpage content for ${venueLabel} here.</p></div>`
}

export function FreeFormsScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<FreeFormRecord[]>([])
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingFreeFormId, setEditingFreeFormId] = useState<string | null>(null)
  const [buttonTextInput, setButtonTextInput] = useState("")
  const [displayOrderInput, setDisplayOrderInput] = useState("1")
  const [activeInput, setActiveInput] = useState("Y")
  const [htmlContentInput, setHtmlContentInput] = useState("<p></p>")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<FreeFormRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const parsedDisplayOrder = Number.parseInt(displayOrderInput, 10)
  const hasValidDisplayOrder =
    Number.isFinite(parsedDisplayOrder) && parsedDisplayOrder >= 0
  const canSave = buttonTextInput.trim().length > 0 && hasValidDisplayOrder

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setEditorMode(null)
      setEditingFreeFormId(null)
      setButtonTextInput("")
      setDisplayOrderInput("1")
      setActiveInput("Y")
      setHtmlContentInput("<p></p>")
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
    setEditingFreeFormId(null)
    setButtonTextInput("")
    setDisplayOrderInput("1")
    setActiveInput("Y")
    setHtmlContentInput("<p></p>")

    getFreeFormsByLocation({
      locationId: locationId,
      locationLabel: locationName,
    })
      .then((result) => {
        if (isActive) {
          setRows(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          reportError(setError, requestError, "Unable to load free forms.")
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
    setEditingFreeFormId(null)
    setButtonTextInput("")
    setDisplayOrderInput(rows.length > 0 ? String(rows.length + 1) : "1")
    setActiveInput("Y")
    setHtmlContentInput(buildDefaultHtml("", locationName))
    setError(null)
    setStatusMessage(null)
  }

  function openEditEditor(row: FreeFormRecord) {
    setEditorMode("edit")
    setEditingFreeFormId(row.id)
    setButtonTextInput(row.buttonText)
    setDisplayOrderInput(String(row.displayOrder))
    setActiveInput(row.active ? "Y" : "N")
    setHtmlContentInput(row.htmlContent)
    setError(null)
    setStatusMessage(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingFreeFormId(null)
    setButtonTextInput("")
    setDisplayOrderInput("1")
    setActiveInput("Y")
    setHtmlContentInput("<p></p>")
    setError(null)
  }

  async function handleSave() {
    const normalizedButtonText = buttonTextInput.trim()
    const normalizedDisplayOrder = Number.parseInt(displayOrderInput, 10)

    if (!locationId || !canSave || saving) {
      return
    }

    const duplicateRow = rows.find(
      (row) =>
        row.buttonText.trim().toLowerCase() === normalizedButtonText.toLowerCase() &&
        row.id !== editingFreeFormId
    )
    if (duplicateRow) {
      reportErrorMessage(
        setError,
        "This button text already exists for the selected location."
      )
      return
    }

    setSaving(true)
    setError(null)
    setStatusMessage(null)

    try {
      if (editorMode === "edit" && editingFreeFormId) {
        const updatedRow = await updateFreeForm({
          locationId: locationId,
          locationLabel: locationName,
          freeFormId: editingFreeFormId,
          buttonText: normalizedButtonText,
          displayOrder: normalizedDisplayOrder,
          active: activeInput === "Y",
          htmlContent: htmlContentInput,
        })

        setRows((current) =>
          current
            .map((row) => (row.id === updatedRow.id ? updatedRow : row))
            .sort((left, right) => left.displayOrder - right.displayOrder)
        )
        const updateMessage = `Updated free form for ${locationName}.`
        setStatusMessage(updateMessage)
        toastSuccess(updateMessage)
      } else {
        const createdRow = await createFreeForm({
          locationId: locationId,
          locationLabel: locationName,
          buttonText: normalizedButtonText,
          displayOrder: normalizedDisplayOrder,
          active: activeInput === "Y",
          htmlContent: htmlContentInput,
        })

        setRows((current) =>
          [createdRow, ...current].sort(
            (left, right) => left.displayOrder - right.displayOrder
          )
        )
        const createMessage = `Created a new free form for ${locationName}.`
        setStatusMessage(createMessage)
        toastSuccess(createMessage)
      }

      closeEditor()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to save the free form.")
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
    setStatusMessage(null)

    try {
      await deleteFreeForm({
        locationId: locationId,
        locationLabel: locationName,
        freeFormId: deletingRow.id,
      })

      setRows((current) =>
        current.filter((currentRow) => currentRow.id !== deletingRow.id)
      )
      if (editingFreeFormId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Deleted free form for ${locationName}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the free form.")
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
              {editorMode === "edit" ? "Edit Free Form" : "New Free Form"}
            </p>
            <p className="text-xs text-muted-foreground">
              Set button text, display order, active state, and content, then save.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)] lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="free-form-button-text">Button Text</Label>
              <Input
                id="free-form-button-text"
                value={buttonTextInput}
                onChange={(event) => setButtonTextInput(event.target.value)}
                placeholder="Enter button text"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="free-form-display-order">Display Order</Label>
              <Input
                id="free-form-display-order"
                type="number"
                min={0}
                value={displayOrderInput}
                onChange={(event) => setDisplayOrderInput(event.target.value)}
                placeholder="0"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="free-form-active">Active</Label>
              <Select value={activeInput} onValueChange={setActiveInput}>
                <SelectTrigger id="free-form-active" className="w-full bg-background">
                  <SelectValue placeholder="Select active status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {ACTIVE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label>Content</Label>
            <RichTextEditor
              value={htmlContentInput}
              onChange={setHtmlContentInput}
              minHeightClassName="min-h-[16rem]"
              onClear={() => setHtmlContentInput("<p></p>")}
            />
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
            <AdminPageTitle>Free Form</AdminPageTitle>
            <p className="text-sm text-muted-foreground">
              Manage reusable venue landing blocks with button labels, display order,
              active state, and shared rich-text content using mock service data.
            </p>
          </div>
          <Button
            type="button"
            disabled={!locationId || saving}
            onClick={openCreateEditor}
            className="w-full sm:w-auto"
          >
            New Form
          </Button>
        </div>

        <PanelCard>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> Add with New
              Form, or edit a row when a content block changes.
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
              <VenueNoLocationState featureLabel="Free forms" />
            </div>
          ) : (
            <>
              {renderEditorPanel()}
              <FreeFormDataTable
                data={rows}
                loading={loading}
                emptyMessage="No free forms found for this location."
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
        title="Delete free form?"
        description={
          deletingRow
            ? `This will remove "${deletingRow.buttonText}" from ${locationName}.`
            : ""
        }
        confirmLabel="Delete free form"
        isPending={Boolean(deletingId)}
      />
    </>
  )
}
