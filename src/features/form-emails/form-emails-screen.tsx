import {
  LoaderCircle,
  Mail,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Fragment, useEffect, useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
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
import { useAppSession } from "@/hooks/use-app-session"
import { reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import {
  useAddUpdateFormEmailMutation,
  useDeleteFormEmailMutation,
  useGetFormEmailsQuery,
} from "@/store/api/clubmanApi"
import type { FormEmailRecord } from "@/types/form-email"

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

function normalizeEmailAddress(value: string) {
  return value.trim().toLowerCase()
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function FormEmailsScreen() {
  const { connectionName, locationId, locationName, username } = useAppSession()

  const [selectedFormId, setSelectedFormId] = useState("")
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null)
  const [emailAddressInput, setEmailAddressInput] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<FormEmailRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const canQuery = Boolean(connectionName && locationId)

  const {
    data: allEmails = [],
    isLoading,
    isFetching,
    error: queryError,
  } = useGetFormEmailsQuery(
    { connectionString: connectionName, locationId: locationId ?? "" },
    { skip: !canQuery }
  )

  const [addUpdateFormEmail, { isLoading: isSaving }] = useAddUpdateFormEmailMutation()
  const [deleteFormEmail] = useDeleteFormEmailMutation()

  const loading = isLoading || isFetching

  const formDefinitions = useMemo(() => {
    const seen = new Set<string>()

    return allEmails
      .filter((email) => {
        if (seen.has(email.formId)) {
          return false
        }

        seen.add(email.formId)
        return true
      })
      .map((email) => ({
        id: email.formId,
        locationId: email.locationId,
        name: email.formId,
      }))
  }, [allEmails])

  const rows = useMemo(
    () => allEmails.filter((email) => email.formId === selectedFormId),
    [allEmails, selectedFormId]
  )

  const formOptions = useMemo(
    () =>
      formDefinitions.map((definition) => ({
        value: definition.id,
        label: definition.name,
      })),
    [formDefinitions]
  )

  const selectedFormLabel = useMemo(
    () => formDefinitions.find((definition) => definition.id === selectedFormId)?.name || "",
    [formDefinitions, selectedFormId]
  )

  const canSave = useMemo(() => {
    const normalized = normalizeEmailAddress(emailAddressInput)
    return normalized.length > 0 && isValidEmailAddress(normalized)
  }, [emailAddressInput])

  useEffect(() => {
    if (queryError) {
      reportErrorMessage(setError, getClubmanErrorMessage(queryError))
      return
    }

    setError(null)
  }, [queryError])

  useEffect(() => {
    if (!locationId) {
      setSelectedFormId("")
      setEditorMode(null)
      setEditingEmailId(null)
      setEmailAddressInput("")
      setError(null)
      setStatusMessage(null)
      return
    }

    setSelectedFormId("")
    setStatusMessage(null)
  }, [locationId])

  useEffect(() => {
    if (formDefinitions.length > 0 && !selectedFormId) {
      setSelectedFormId(formDefinitions[0].id)
    }
  }, [formDefinitions, selectedFormId])

  useEffect(() => {
    setEditorMode(null)
    setEditingEmailId(null)
    setEmailAddressInput("")
  }, [selectedFormId])

  function openCreateEditor() {
    setEditorMode("create")
    setEditingEmailId(null)
    setEmailAddressInput("")
    setError(null)
  }

  function openEditEditor(row: FormEmailRecord) {
    setEditorMode("edit")
    setEditingEmailId(row.id)
    setEmailAddressInput(row.emailAddress)
    setError(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingEmailId(null)
    setEmailAddressInput("")
    setError(null)
  }

  async function handleSave() {
    const normalized = normalizeEmailAddress(emailAddressInput)

    if (!connectionName || !locationId || !username || !selectedFormId || !canSave || isSaving) {
      return
    }

    const duplicateRow = rows.find(
      (row) => row.emailAddress.toLowerCase() === normalized && row.id !== editingEmailId
    )
    if (duplicateRow) {
      reportErrorMessage(
        setError,
        "This email address already exists for the selected form."
      )
      return
    }

    setError(null)

    try {
      await addUpdateFormEmail({
        EmailReferenceId: editingEmailId ?? "",
        LocationId: locationId,
        ItemId: selectedFormId,
        EmailAddress: normalized,
        ConnectionString: connectionName,
        Username: username,
      }).unwrap()

      const saveMessage =
        editorMode === "edit"
          ? `Updated ${selectedFormLabel} email address for ${locationName}.`
          : `Added a new ${selectedFormLabel} email address for ${locationName}.`
      setStatusMessage(saveMessage)
      toastSuccess(saveMessage)
      closeEditor()
    } catch (requestError) {
      reportErrorMessage(setError, getClubmanErrorMessage(requestError))
    }
  }

  async function confirmDelete() {
    if (!connectionName || !deletingRow || deletingId) {
      return
    }

    setDeletingId(deletingRow.id)
    setError(null)

    try {
      await deleteFormEmail({
        EmailReferenceId: deletingRow.id,
        ConnectionString: connectionName,
      }).unwrap()

      if (editingEmailId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Removed ${deletingRow.emailAddress} from ${selectedFormLabel}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
    } catch (requestError) {
      reportErrorMessage(setError, getClubmanErrorMessage(requestError))
    } finally {
      setDeletingId(null)
    }
  }

  function renderEditorRow() {
    return (
      <TableRow className="bg-muted/20 hover:bg-muted/20">
        <TableCell colSpan={3} className="p-4 whitespace-normal">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="form-email-address-input">Email Address</Label>
              <Input
                id="form-email-address-input"
                type="email"
                value={emailAddressInput}
                onChange={(event) => setEmailAddressInput(event.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditor}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => void handleSave()}
                disabled={!canSave || isSaving}
              >
                {isSaving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
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
            Form Emails
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage which email addresses receive submissions for each venue form.
            Form options are derived from ItemId values returned by GetFormEmails.
          </p>
        </div>

        <Card className="gap-0 py-0">
          <CardContent className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="form-emails-form">Form</Label>
              <ScrollSelectControl
                id="form-emails-form"
                value={selectedFormId}
                onChange={setSelectedFormId}
                options={formOptions}
                placeholder={loading ? "Loading forms..." : "Select form"}
                disabled={!locationId || loading || formOptions.length === 0}
              />
            </div>

          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Form Emails Management
              </CardTitle>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={!selectedFormId}
                onClick={openCreateEditor}
              >
                <Plus className="size-4" />
                New Email
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
                <VenueNoLocationState featureLabel="Form emails" />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading form emails...
              </div>
            ) : !selectedFormId ? (
              <div className="p-4">
                <EmptyState
                  title="Select a form to view its recipients."
                  description="Choose one of the available forms to manage the email addresses tied to it."
                />
              </div>
            ) : rows.length === 0 && editorMode !== "create" ? (
              <div className="p-4">
                <EmptyState
                  title={`No email addresses configured for ${selectedFormLabel}.`}
                  description="Use New Email to add the first recipient for this form."
                />
              </div>
            ) : (
              <div className="px-4 py-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16 px-4">#</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead className="w-32 px-4 text-right">Actions</TableHead>
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
                            {row.emailAddress}
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center justify-end gap-1">
                              <ActionButton
                                label="Edit email"
                                onClick={() => openEditEditor(row)}
                              >
                                <Pencil className="size-4" />
                              </ActionButton>
                              <ActionButton
                                label="Delete email"
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
                        {editorMode === "edit" && editingEmailId === row.id
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
              {locationId && selectedFormId
                ? statusMessage ||
                  `${rows.length} email address${rows.length === 1 ? "" : "es"} loaded for ${selectedFormLabel} in ${locationName}.`
                : "Select a location from the header and choose a form to begin managing form emails."}
            </div>
            {selectedFormLabel ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="text-foreground">Form:</span>
                <span>{selectedFormLabel}</span>
              </div>
            ) : null}
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
          title="Delete email recipient?"
          description={deletingRow
            ? `This will remove ${deletingRow.emailAddress} from ${selectedFormLabel} for ${locationName}.`
            : ""}
          confirmLabel="Delete email"
          isPending={Boolean(deletingId)}
        />
      </div>
    </TooltipProvider>
  )
}





