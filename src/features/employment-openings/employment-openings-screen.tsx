import {
  Briefcase,
  LoaderCircle,
  Plus,
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
import { deleteEmploymentOpening } from "@/features/employment-openings/employment-openings.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { useGetEmploymentPositionsQuery, useAddUpdateEmploymentPositionMutation } from "@/store/api/clubmanApi"
import type { EmploymentOpeningRecord } from "@/types/employment-opening"

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

export function EmploymentOpeningsScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<EmploymentOpeningRecord[]>([])
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingOpeningId, setEditingOpeningId] = useState<string | null>(null)
  const [titleInput, setTitleInput] = useState("")
  const [activeInput, setActiveInput] = useState("Y")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<EmploymentOpeningRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const canSave = titleInput.trim().length > 0

  const { data: apiPositions, isLoading: isQueryLoading, error: queryError, refetch } = useGetEmploymentPositionsQuery(
    { connectionString: "demo_prod", locationId: locationId ?? "" },
    { skip: !locationId }
  )

  const [addUpdateEmploymentPosition] = useAddUpdateEmploymentPositionMutation()

  useEffect(() => {
    if (queryError) {
      reportErrorMessage(setError, "Unable to load employment openings.")
    } else {
      setError(null)
    }
  }, [queryError])

  useEffect(() => {
    if (apiPositions) {
      setRows(
        apiPositions.map((pos) => ({
          id: pos.PositionID,
          locationId: pos.LocationId,
          title: pos.PositionText,
          active: pos.ActiveIndicator === "Y",
        }))
      )
    } else {
      setRows([])
    }
  }, [apiPositions])

  useEffect(() => {
    if (!locationId) {
      setEditorMode(null)
      setEditingOpeningId(null)
      setTitleInput("")
      setActiveInput("Y")
      setLoading(false)
      setError(null)
      setStatusMessage(null)
    }
  }, [locationId])

  useEffect(() => {
    setLoading(isQueryLoading)
  }, [isQueryLoading])

  function openCreateEditor() {
    setEditorMode("create")
    setEditingOpeningId(null)
    setTitleInput("")
    setActiveInput("Y")
    setError(null)
  }

  function openEditEditor(row: EmploymentOpeningRecord) {
    setEditorMode("edit")
    setEditingOpeningId(row.id)
    setTitleInput(row.title)
    setActiveInput(row.active ? "Y" : "N")
    setError(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingOpeningId(null)
    setTitleInput("")
    setActiveInput("Y")
    setError(null)
  }

  async function handleSave() {
    const normalizedTitle = titleInput.trim()

    if (!locationId || !canSave || saving) {
      return
    }

    const duplicateRow = rows.find(
      (row) =>
        row.title.trim().toLowerCase() === normalizedTitle.toLowerCase() &&
        row.id !== editingOpeningId
    )
    if (duplicateRow) {
      reportErrorMessage(
        setError,
        "This employment opening already exists for the selected location."
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (editorMode === "edit" && editingOpeningId) {
        await addUpdateEmploymentPosition({
          ConnectionString: "demo_prod",
          LocationId: locationId,
          PositionID: editingOpeningId,
          PositionText: normalizedTitle,
          ActiveIndicator: activeInput,
          LastUpdatedId: "Admin",
        }).unwrap()
        
        const updateMessage = `Updated employment opening for ${locationName}.`
        setStatusMessage(updateMessage)
        toastSuccess(updateMessage)
      } else {
        await addUpdateEmploymentPosition({
          ConnectionString: "demo_prod",
          LocationId: locationId,
          PositionID: "",
          PositionText: normalizedTitle,
          ActiveIndicator: activeInput,
          LastUpdatedId: "Admin",
        }).unwrap()

        const createMessage = `Added a new employment opening for ${locationName}.`
        setStatusMessage(createMessage)
        toastSuccess(createMessage)
      }

      closeEditor()
      refetch()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to save the employment opening.")
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
      await deleteEmploymentOpening({
        locationId: locationId,
        locationLabel: locationName,
        openingId: deletingRow.id,
      })

      setRows((current) => current.filter((row) => row.id !== deletingRow.id))
      if (editingOpeningId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Deleted employment opening for ${locationName}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the employment opening.")
    } finally {
      setDeletingId(null)
    }
  }

  function renderEditorRow() {
    return (
      <TableRow className="bg-muted/20 hover:bg-muted/20">
        <TableCell colSpan={4} className="p-4 whitespace-normal">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="employment-opening-title">Other Opportunity</Label>
              <Input
                id="employment-opening-title"
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
                placeholder="Enter opening title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment-opening-active">Active</Label>
              <Select value={activeInput} onValueChange={setActiveInput}>
                <SelectTrigger id="employment-opening-active" className="w-full bg-background">
                  <SelectValue placeholder="Select active state" />
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
                  <Briefcase className="size-4" />
                )}
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
              Employment Openings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage venue employment opportunities with mock service data until the
              backend integration for openings is ready.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled={!locationId}
            onClick={openCreateEditor}
          >
            <Plus className="size-4" />
            New Opening
          </Button>
        </div>


        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Employment Other Opportunities Data
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 px-0 py-0">
            {error ? (
              <div className="px-4 pt-4">
                <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              </div>
            ) : null}

            {!locationId ? (
              <div className="p-4">
                <VenueNoLocationState featureLabel="Employment openings" />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading employment openings...
              </div>
            ) : rows.length === 0 && editorMode !== "create" ? (
              <div className="p-4">
                <EmptyState
                  title="No employment openings configured yet."
                  description="Use New Opening to add the first opportunity for this location."
                />
              </div>
            ) : (
              <div className="px-4 py-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16 px-4">#</TableHead>
                      <TableHead>Other Opportunity</TableHead>
                      <TableHead className="w-28">Active</TableHead>
                      <TableHead className="w-24 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editorMode === "create" ? renderEditorRow() : null}
                    {rows.map((row, index) => (
                      <Fragment key={row.id}>
                        <TableRow>
                          <TableCell className="px-4 font-medium tabular-nums text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {row.title}
                          </TableCell>
                          <TableCell>
                            <ActivePill active={row.active} />
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center justify-end">
                              <StandardRowActionsMenu
                                ariaLabel={`Actions for ${row.title}`}
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
                        {editorMode === "edit" && editingOpeningId === row.id
                          ? renderEditorRow()
                          : null}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
            <div aria-live="polite" className="text-sm text-muted-foreground">
              {locationId
                ? statusMessage ||
                  `${rows.length} employment opening${rows.length === 1 ? "" : "s"} loaded for ${locationName}.`
                : "Select a location from the header to begin managing employment openings."}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Briefcase className="size-3.5" />
              Mock management mode
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
          title="Delete opening?"
          description={deletingRow
            ? `This will remove "${deletingRow.title}" from ${locationName}.`
            : ""}
          confirmLabel="Delete opening"
          isPending={Boolean(deletingId)}
        />
    </div>
  )
}










