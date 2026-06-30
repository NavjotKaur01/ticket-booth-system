import {
  LayoutList,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { Fragment, useEffect, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  createVenueSectionDescription,
  deleteVenueSectionDescription,
  getVenueSectionDescriptionsByLocation,
  updateVenueSectionDescription,
} from "@/features/venue-section-descriptions/venue-section-descriptions.service"
import { useAppSession } from "@/hooks/use-app-session"
import type { VenueSectionDescriptionRecord } from "@/types/venue-section-description"

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

function ActionButton({
  label,
  onClick,
  tone = "default",
  children,
  disabled = false,
}: {
  label: string
  onClick: () => void
  tone?: "default" | "danger"
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          className={tone === "danger"
            ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

function InlineEditorRow({
  rowNumber,
  sectionName,
  sectionDetail,
  saving,
  canSave,
  mode,
  onSectionNameChange,
  onSectionDetailChange,
  onCancel,
  onSave,
}: {
  rowNumber?: number
  sectionName: string
  sectionDetail: string
  saving: boolean
  canSave: boolean
  mode: "create" | "edit"
  onSectionNameChange: (value: string) => void
  onSectionDetailChange: (value: string) => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <TableRow className="bg-muted/20 hover:bg-muted/20">
      <TableCell className="px-4 align-top font-medium tabular-nums text-muted-foreground">
        {rowNumber ?? "—"}
      </TableCell>
      <TableCell className="align-top px-4">
        <Input
          value={sectionName}
          onChange={(event) => onSectionNameChange(event.target.value)}
          placeholder="Section name"
          aria-label="Section name"
          className="bg-background"
        />
      </TableCell>
      <TableCell className="align-top px-4">
        <Textarea
          value={sectionDetail}
          onChange={(event) => onSectionDetailChange(event.target.value)}
          placeholder="Section detail"
          aria-label="Section detail"
          rows={3}
          className="min-h-20 bg-background"
        />
      </TableCell>
      <TableCell className="px-4 align-top">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={onSave}
            disabled={!canSave || saving}
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {mode === "edit" ? "Update" : "Add"}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

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
  const [deletingRow, setDeletingRow] = useState<VenueSectionDescriptionRecord | null>(null)
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
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load section descriptions."
          )
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
      setError("A section with this name already exists for the selected location.")
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
        setStatusMessage(`Updated ${updatedRow.sectionName} for ${locationName}.`)
      } else {
        const createdRow = await createVenueSectionDescription({
          locationId,
          locationLabel: locationName,
          input: payload,
        })

        setRows((current) => [...current, createdRow])
        setStatusMessage(`Added ${createdRow.sectionName} for ${locationName}.`)
      }

      closeEditor()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the section description."
      )
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
      setStatusMessage(`Deleted ${deletingRow.sectionName} from ${locationName}.`)
      setDeletingRow(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete the section description."
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <TooltipProvider>
      <>
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Section Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage venue section names and descriptions with mock service data
              until the backend integration is ready.
            </p>
          </div>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b bg-muted/40 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Section Details
                </CardTitle>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  disabled={!locationId || loading}
                  onClick={openCreateEditor}
                >
                  <Plus className="size-4" />
                  New
                </Button>
              </div>
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
                  <VenueNoLocationState featureLabel="Section descriptions" />
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading section descriptions...
                </div>
              ) : rows.length === 0 && editorMode !== "create" ? (
                <div className="p-4">
                  <EmptyState
                    title="No section descriptions configured yet."
                    description="Use New to add the first section for this location."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto px-4 py-4">
                  <Table className="min-w-[48rem]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-16 px-4">#</TableHead>
                        <TableHead className="min-w-48 px-4">Section Name</TableHead>
                        <TableHead className="min-w-80 px-4">Section Detail</TableHead>
                        <TableHead className="w-36 px-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editorMode === "create" ? (
                        <InlineEditorRow
                          sectionName={sectionNameInput}
                          sectionDetail={sectionDetailInput}
                          saving={saving}
                          canSave={canSave}
                          mode="create"
                          onSectionNameChange={setSectionNameInput}
                          onSectionDetailChange={setSectionDetailInput}
                          onCancel={closeEditor}
                          onSave={() => void handleSave()}
                        />
                      ) : null}

                      {rows.map((row, index) => (
                        <Fragment key={row.id}>
                          {editorMode === "edit" && editingSectionId === row.id ? (
                            <InlineEditorRow
                              rowNumber={index + 1}
                              sectionName={sectionNameInput}
                              sectionDetail={sectionDetailInput}
                              saving={saving}
                              canSave={canSave}
                              mode="edit"
                              onSectionNameChange={setSectionNameInput}
                              onSectionDetailChange={setSectionDetailInput}
                              onCancel={closeEditor}
                              onSave={() => void handleSave()}
                            />
                          ) : (
                            <TableRow
                              className={editorMode === "edit" && editingSectionId === row.id
                                ? "bg-primary/5"
                                : undefined
                              }
                            >
                              <TableCell className="px-4 font-medium tabular-nums text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              <TableCell className="px-4 font-medium text-foreground">
                                {row.sectionName}
                              </TableCell>
                              <TableCell className="px-4 text-sm text-muted-foreground">
                                {row.sectionDetail}
                              </TableCell>
                              <TableCell className="px-4">
                                <div className="flex items-center justify-end gap-1">
                                  <ActionButton
                                    label="Edit section"
                                    onClick={() => openEditEditor(row)}
                                  >
                                    <Pencil className="size-4" />
                                  </ActionButton>
                                  <ActionButton
                                    label="Delete section"
                                    onClick={() => setDeletingRow(row)}
                                    tone="danger"
                                    disabled={deletingId === row.id}
                                  >
                                    {deletingId === row.id ? (
                                      <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-4" />
                                    )}
                                  </ActionButton>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {error && editorMode ? (
                <div className="px-4 pb-4">
                  <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                </div>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
              <div aria-live="polite" className="text-sm text-muted-foreground">
                {locationId
                  ? statusMessage ||
                    `${rows.length} section description${rows.length === 1 ? "" : "s"} loaded for ${locationName}.`
                  : "Select a location from the header to begin managing section descriptions."}
              </div>
              {locationId && rows.length > 0 ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <LayoutList className="size-3.5" />
                  Mock management mode
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
          title="Delete section description?"
          description={deletingRow
            ? `This will remove ${deletingRow.sectionName} from ${locationName}.`
            : ""}
          confirmLabel="Delete section"
          isPending={Boolean(deletingId)}
        />
      </>
    </TooltipProvider>
  )
}
