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
import { EmploymentQuestionDataTable } from "@/features/employment-questions/employment-question-data-table"
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
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
] as const

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
  const [deletingRow, setDeletingRow] = useState<EmploymentQuestionRecord | null>(
    null
  )
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

  function renderEditorPanel() {
    if (!editorMode) {
      return null
    }

    return (
      <div className="border-b px-3 py-4">
        <div className="rounded-sm border border-border bg-background p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">
              {editorMode === "edit" ? "Edit Question" : "New Question"}
            </p>
            <p className="text-xs text-muted-foreground">
              Set the question text and active state, then save.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,12rem)] lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="employment-question-input">Question</Label>
              <Input
                id="employment-question-input"
                value={questionInput}
                onChange={(event) => setQuestionInput(event.target.value)}
                placeholder="Enter employment question"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="employment-question-active">Active</Label>
              <Select value={activeInput} onValueChange={setActiveInput}>
                <SelectTrigger
                  id="employment-question-active"
                  className="w-full bg-background"
                >
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
            <AdminPageTitle>Employment Questions</AdminPageTitle>
            <p className="text-sm text-muted-foreground">
              Manage employment application questions with mock service data until the
              backend integration for questions is ready.
            </p>
          </div>
          <Button
            type="button"
            disabled={!locationId}
            onClick={openCreateEditor}
            className="w-full sm:w-auto"
          >
            New Question
          </Button>
        </div>

        <PanelCard>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> Add
              with New Question, or edit a row when a question changes.
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
              <VenueNoLocationState featureLabel="Employment questions" />
            </div>
          ) : (
            <>
              {renderEditorPanel()}
              <EmploymentQuestionDataTable
                data={rows}
                loading={loading}
                emptyMessage="No employment questions found for this location."
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
        title="Delete question?"
        description={
          deletingRow
            ? `This will remove "${deletingRow.question}" from ${locationName}.`
            : ""
        }
        confirmLabel="Delete question"
        isPending={Boolean(deletingId)}
      />
    </>
  )
}
