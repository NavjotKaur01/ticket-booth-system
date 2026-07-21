import {
  LoaderCircle,
  Pencil,
  Plus,
  Save,
} from "lucide-react"
import { Fragment, useEffect, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { RichTextEditor } from "@/components/common/rich-text-editor"
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
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
] as const

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

function ActivePill({ active }: { active: boolean }) {
  return (
    <span
      className={active
        ? "inline-flex min-w-9 items-center justify-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
        : "inline-flex min-w-9 items-center justify-center rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {active ? "Y" : "N"}
    </span>
  )
}

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
  const hasValidDisplayOrder = Number.isFinite(parsedDisplayOrder) && parsedDisplayOrder >= 0
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

      setRows((current) => current.filter((currentRow) => currentRow.id !== deletingRow.id))
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

  function renderEditorRow() {
    return (
      <TableRow>
        <TableCell colSpan={5} className="bg-muted/20 px-0 py-0">
          <div className="space-y-5 border-y border-border/70 px-4 py-4 md:px-5">
            <div className="rounded-lg border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:gap-5">
                <div className="min-w-0 xl:w-1/2 xl:flex-none space-y-2">
                  <Label htmlFor="free-form-button-text">Button Text</Label>
                  <Input
                    id="free-form-button-text"
                    value={buttonTextInput}
                    onChange={(event) => setButtonTextInput(event.target.value)}
                    placeholder="Enter button text"
                    className="bg-background"
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row xl:shrink-0">
                  <div className="w-full space-y-2 sm:w-40">
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

                  <div className="w-full space-y-2 sm:w-32">
                    <Label htmlFor="free-form-active">Active</Label>
                    <Select value={activeInput} onValueChange={setActiveInput}>
                      <SelectTrigger id="free-form-active" className="bg-background">
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
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                value={htmlContentInput}
                onChange={setHtmlContentInput}
                minHeightClassName="min-h-[16rem]"
                onClear={() => setHtmlContentInput("<p></p>")}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/70 pt-4">
              <Button type="button" variant="outline" onClick={closeEditor}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={!canSave || saving}>
                {saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                {editorMode === "edit" ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Free Form
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage reusable venue landing blocks with button labels, display order,
              active state, and shared rich-text content using mock service data.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={openCreateEditor}
            disabled={!locationId || saving}
          >
            <Plus className="size-4" />
            New Form
          </Button>
        </div>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Free Form Management
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4">
            {!locationId ? (
              <VenueNoLocationState featureLabel="Free forms" />
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-muted/20 px-4 py-10 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading free forms...
              </div>
            ) : rows.length === 0 && editorMode !== "create" ? (
              <EmptyState
                title="No free forms yet"
                description="Use New Form to create the first content block for this location."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/70">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Button Text</TableHead>
                      <TableHead className="w-32">Display Order</TableHead>
                      <TableHead className="w-28">Active</TableHead>
                      <TableHead className="w-28 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editorMode === "create" ? renderEditorRow() : null}

                    {rows.map((row, index) => (
                      <Fragment key={row.id}>
                        <TableRow className="align-top">
                          <TableCell className="font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="max-w-[34rem] whitespace-normal break-words font-medium text-foreground">
                                {row.buttonText}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{row.displayOrder}</TableCell>
                          <TableCell>
                            <ActivePill active={row.active} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <StandardRowActionsMenu
                                ariaLabel={`Actions for ${row.buttonText}`}
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
                        {editorMode === "edit" && editingFreeFormId === row.id
                          ? renderEditorRow()
                          : null}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-2 border-t bg-muted/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Pencil className="size-4" />
              <span>
                {locationName
                  ? `${rows.length} free form${rows.length === 1 ? "" : "s"} loaded for ${locationName}.`
                  : "Select a location from the header to begin."}
              </span>
            </div>
            <div className="min-h-5 text-sm">
              {error ? <span className="text-destructive">{error}</span> : null}
              {!error && statusMessage ? (
                <span className="text-emerald-700 dark:text-emerald-300">{statusMessage}</span>
              ) : null}
            </div>
          </CardFooter>
        </Card>

        <ConfirmDeleteDialog
          open={Boolean(deletingRow)}
          onOpenChange={(open) => {
            if (!open && !deletingId) {
              setDeletingRow(null)
            }
          }}
          onConfirm={() => void confirmDelete()}
          title="Delete free form?"
          description={deletingRow
            ? `This will remove "${deletingRow.buttonText}" from ${locationName}.`
            : ""}
          confirmLabel="Delete free form"
          isPending={Boolean(deletingId)}
        />
    </div>
  )
}











