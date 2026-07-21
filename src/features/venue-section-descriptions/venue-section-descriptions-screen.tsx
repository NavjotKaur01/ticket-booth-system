import {
  ChevronLeft,
  ChevronRight,
  LayoutList,
  LoaderCircle,
  Plus,
  Save,
} from "lucide-react"
import { Fragment, useEffect, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  deleteVenueSectionDescription,
} from "@/features/venue-section-descriptions/venue-section-descriptions.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  useAddUpdateSectionDetailMutation,
  useGetSectionDetailsQuery,
} from "@/store/api/clubmanApi"
import type { SectionDetailItem } from "@/types/api/section-details"
import type { VenueSectionDescriptionRecord } from "@/types/venue-section-description"

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 10

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

function mapSectionDetailToRecord(
  item: SectionDetailItem,
  locationId: string
): VenueSectionDescriptionRecord {
  return {
    id: item.LookupCode,
    locationId,
    sectionName: item.SectionName,
    sectionDetail: item.SectionDetail,
    lookupOrder: item.LookupOrder,
  }
}

function SectionDetailsPagination({
  pageNumber,
  pageSize,
  itemCount,
  hasNextPage,
  disabled,
  onPageChange,
  onPageSizeChange,
}: {
  pageNumber: number
  pageSize: number
  itemCount: number
  hasNextPage: boolean
  disabled?: boolean
  onPageChange: (pageNumber: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const from = itemCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const to = (pageNumber - 1) * pageSize + itemCount
  const canGoPrevious = pageNumber > 1
  const canGoNext = hasNextPage

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-xs text-muted-foreground">
          {itemCount === 0 ? (
            "No records"
          ) : (
            <>
              <span className="font-medium text-foreground">
                {from}–{to}
              </span>{" "}
              on page {pageNumber}
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-[4.5rem] bg-background"
              aria-label="Rows per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={disabled || !canGoPrevious}
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <Button
          type="button"
          variant="default"
          size="icon-sm"
          className="size-8"
          disabled
          aria-current="page"
        >
          {pageNumber}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={disabled || !canGoNext}
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
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
  const { locationId, locationName, username } = useAppSession()

  const [rows, setRows] = useState<VenueSectionDescriptionRecord[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingLookupOrder, setEditingLookupOrder] = useState<number | null>(null)
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

  const {
    data: apiSections,
    isLoading: isQueryLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetSectionDetailsQuery(
    {
      ConnectionString: "demo_prod",
      PageNumber: pageNumber,
      PageSize: pageSize,
      SortColumn: "LookupOrder",
      SortDirection: "ASC",
    },
    { skip: !locationId }
  )

  const [addUpdateSectionDetail] = useAddUpdateSectionDetailMutation()

  const hasNextPage = (apiSections?.length ?? 0) >= pageSize
  const rowOffset = (pageNumber - 1) * pageSize

  useEffect(() => {
    if (queryError) {
      reportErrorMessage(setError, "Unable to load section descriptions.")
    } else {
      setError(null)
    }
  }, [queryError])

  useEffect(() => {
    if (apiSections && locationId) {
      setRows(apiSections.map((item) => mapSectionDetailToRecord(item, locationId)))
    } else {
      setRows([])
    }
  }, [apiSections, locationId])

  useEffect(() => {
    setPageNumber(1)
    setPageSize(DEFAULT_PAGE_SIZE)
    setEditorMode(null)
    setEditingSectionId(null)
    setEditingLookupOrder(null)
    setSectionNameInput("")
    setSectionDetailInput("")
    setError(null)
    setStatusMessage(null)
    if (!locationId) {
      setLoading(false)
    }
  }, [locationId])

  useEffect(() => {
    setLoading(isQueryLoading || isFetching)
  }, [isQueryLoading, isFetching])

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage === pageNumber) {
      return
    }

    setPageNumber(nextPage)
    setEditorMode(null)
    setEditingSectionId(null)
    setEditingLookupOrder(null)
    setSectionNameInput("")
    setSectionDetailInput("")
    setError(null)
    setStatusMessage(null)
  }

  function changePageSize(nextPageSize: number) {
    if (nextPageSize === pageSize) {
      return
    }

    setPageSize(nextPageSize)
    setPageNumber(1)
    setEditorMode(null)
    setEditingSectionId(null)
    setEditingLookupOrder(null)
    setSectionNameInput("")
    setSectionDetailInput("")
    setError(null)
    setStatusMessage(null)
  }

  function openCreateEditor() {
    setEditorMode("create")
    setEditingSectionId(null)
    setEditingLookupOrder(null)
    setSectionNameInput("")
    setSectionDetailInput("")
    setError(null)
  }

  function openEditEditor(row: VenueSectionDescriptionRecord) {
    setEditorMode("edit")
    setEditingSectionId(row.id)
    setEditingLookupOrder(row.lookupOrder)
    setSectionNameInput(row.sectionName)
    setSectionDetailInput(row.sectionDetail)
    setError(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingSectionId(null)
    setEditingLookupOrder(null)
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
    const isEdit = editorMode === "edit" && Boolean(editingSectionId)
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
      const nextLookupOrder = isEdit
        ? (editingLookupOrder ??
          rows.find((row) => row.id === editingSectionId)?.lookupOrder ??
          0)
        : Math.max(0, ...rows.map((row) => row.lookupOrder), 0) + 1

      await addUpdateSectionDetail({
        ConnectionString: "demo_prod",
        LookupCode: isEdit ? editingSectionId! : "",
        SectionName: normalizedName,
        SectionDetail: normalizedDetail,
        LookupOrder: nextLookupOrder,
        LastUpdateID: username || "Admin",
      }).unwrap()

      const saveMessage = isEdit
        ? `Updated ${normalizedName} for ${locationName}.`
        : `Added ${normalizedName} for ${locationName}.`
      setStatusMessage(saveMessage)
      toastSuccess(saveMessage)
      closeEditor()
      await refetch()
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

  return (
    <>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Section Details
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage venue section names and descriptions for the selected location.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={!locationId || loading}
              onClick={openCreateEditor}
            >
              <Plus className="size-4" />
              New
            </Button>
          </div>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b bg-muted/40 px-4 py-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Section Details
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
                  <VenueNoLocationState featureLabel="Section descriptions" />
                </div>
              ) : loading && rows.length === 0 ? (
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
                              rowNumber={rowOffset + index + 1}
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
                                {rowOffset + index + 1}
                              </TableCell>
                              <TableCell className="px-4 font-medium text-foreground">
                                {row.sectionName}
                              </TableCell>
                              <TableCell className="px-4 text-sm text-muted-foreground">
                                {row.sectionDetail}
                              </TableCell>
                              <TableCell className="px-4">
                                <div className="flex items-center justify-end">
                                  <StandardRowActionsMenu
                                    ariaLabel={`Actions for ${row.sectionName}`}
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

              {locationId ? (
                <SectionDetailsPagination
                  pageNumber={pageNumber}
                  pageSize={pageSize}
                  itemCount={rows.length}
                  hasNextPage={hasNextPage}
                  disabled={loading}
                  onPageChange={changePage}
                  onPageSizeChange={changePageSize}
                />
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
                  Section details
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
  )
}
