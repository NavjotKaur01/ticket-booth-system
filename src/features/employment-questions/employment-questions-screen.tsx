import {
  HelpCircle,
  LoaderCircle,
  Pencil,
  Plus,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  createEmploymentQuestion,
  deleteEmploymentQuestion,
  getEmploymentQuestionsByLocation,
  updateEmploymentQuestion,
} from "@/features/employment-questions/employment-questions.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import type { EmploymentQuestionRecord } from "@/types/employment-question"

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

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export function EmploymentQuestionsScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<EmploymentQuestionRecord[]>([])
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [questionInput, setQuestionInput] = useState("")
  const [activeInput, setActiveInput] = useState("Y")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<EmploymentQuestionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const canSave = questionInput.trim().length > 0

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setEditorMode(null)
      setEditingQuestionId(null)
      setQuestionInput("")
      setActiveInput("Y")
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
    setEditingQuestionId(null)
    setQuestionInput("")
    setActiveInput("Y")

    getEmploymentQuestionsByLocation({
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
          reportError(setError, requestError, "Unable to load employment questions.")
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
    setEditingQuestionId(null)
    setQuestionInput("")
    setActiveInput("Y")
    setError(null)
  }

  function openEditEditor(row: EmploymentQuestionRecord) {
    setEditorMode("edit")
    setEditingQuestionId(row.id)
    setQuestionInput(row.question)
    setActiveInput(row.active ? "Y" : "N")
    setError(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingQuestionId(null)
    setQuestionInput("")
    setActiveInput("Y")
    setError(null)
  }

  async function handleSave() {
    const normalizedQuestion = questionInput.trim()

    if (!locationId || !canSave || saving) {
      return
    }

    const duplicateRow = rows.find(
      (row) =>
        row.question.trim().toLowerCase() === normalizedQuestion.toLowerCase() &&
        row.id !== editingQuestionId
    )
    if (duplicateRow) {
      reportErrorMessage(
        setError,
        "This employment question already exists for the selected location."
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (editorMode === "edit" && editingQuestionId) {
        const updatedRow = await updateEmploymentQuestion({
          locationId: locationId,
          locationLabel: locationName,
          questionId: editingQuestionId,
          question: normalizedQuestion,
          active: activeInput === "Y",
        })

        setRows((current) =>
          current.map((row) => (row.id === updatedRow.id ? updatedRow : row))
        )
        const updateMessage = `Updated employment question for ${locationName}.`
        setStatusMessage(updateMessage)
        toastSuccess(updateMessage)
      } else {
        const createdRow = await createEmploymentQuestion({
          locationId: locationId,
          locationLabel: locationName,
          question: normalizedQuestion,
          active: activeInput === "Y",
        })

        setRows((current) => [createdRow, ...current])
        const createMessage = `Added a new employment question for ${locationName}.`
        setStatusMessage(createMessage)
        toastSuccess(createMessage)
      }

      closeEditor()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to save the employment question.")
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
      await deleteEmploymentQuestion({
        locationId: locationId,
        locationLabel: locationName,
        questionId: deletingRow.id,
      })

      setRows((current) => current.filter((row) => row.id !== deletingRow.id))
      if (editingQuestionId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Deleted employment question for ${locationName}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the employment question.")
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
              <Label htmlFor="employment-question-input">Question</Label>
              <Input
                id="employment-question-input"
                value={questionInput}
                onChange={(event) => setQuestionInput(event.target.value)}
                placeholder="Enter employment question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment-question-active">Active</Label>
              <Select value={activeInput} onValueChange={setActiveInput}>
                <SelectTrigger id="employment-question-active" className="w-full bg-background">
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
                  <HelpCircle className="size-4" />
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
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Employment Questions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage employment application questions with mock service data until the
            backend integration for questions is ready.
          </p>
        </div>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Employment Questions Data
              </CardTitle>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={!locationId}
                onClick={openCreateEditor}
              >
                <Plus className="size-4" />
                New Question
              </Button>
            </div>
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
                <VenueNoLocationState featureLabel="Employment questions" />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading employment questions...
              </div>
            ) : rows.length === 0 && editorMode !== "create" ? (
              <div className="p-4">
                <EmptyState
                  title="No employment questions configured yet."
                  description="Use New Question to add the first question for this location."
                />
              </div>
            ) : (
              <div className="px-4 py-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16 px-4">#</TableHead>
                      <TableHead>Question</TableHead>
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
                            {row.question}
                          </TableCell>
                          <TableCell>
                            <ActivePill active={row.active} />
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center justify-end gap-1">
                              <ActionButton
                                label="Edit question"
                                onClick={() => openEditEditor(row)}
                              >
                                <Pencil className="size-4" />
                              </ActionButton>
                              <ActionButton
                                label="Delete question"
                                onClick={() => setDeletingRow(row)}
                              >
                                <Trash2 className="size-4" />
                              </ActionButton>
                            </div>
                          </TableCell>
                        </TableRow>
                        {editorMode === "edit" && editingQuestionId === row.id
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
                  `${rows.length} employment question${rows.length === 1 ? "" : "s"} loaded for ${locationName}.`
                : "Select a location from the header to begin managing employment questions."}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <HelpCircle className="size-3.5" />
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
          title="Delete question?"
          description={deletingRow
            ? `This will remove "${deletingRow.question}" from ${locationName}.`
            : ""}
          confirmLabel="Delete question"
          isPending={Boolean(deletingId)}
        />
      </div>
    </TooltipProvider>
  )
}










