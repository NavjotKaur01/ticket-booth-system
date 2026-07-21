import {
  Filter,
  LoaderCircle,
  MoreVertical,
  Pencil,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
  getEmploymentApplicantFilterGroupsByLocation,
  updateEmploymentApplicant,
} from "@/features/employment-applicants/employment-applicants.service"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  useGetEmploymentApplicationsQuery,
  useGetEmploymentPositionsQuery,
  useDownloadEmploymentApplicationPdfMutation,
} from "@/store/api/clubmanApi"
import type { EmploymentApplication } from "@/types/api/employment-application"
import type {
  EmploymentApplicantFilterGroup,
  EmploymentApplicantRecord,
  EmploymentApplicantUpdateInput,
} from "@/types/employment-applicant"
import type { EmploymentOpeningRecord } from "@/types/employment-opening"

type ChecklistOption = {
  value: string
  label: string
}

const REVIEW_OPTIONS = [
  { value: "Y", label: "Reviewed" },
  { value: "N", label: "Pending review" },
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


function FilterChecklistPanel({
  title,
  options,
  selectedValues,
  onToggle,
  onSelectAll,
  onClearAll,
  disabled,
}: {
  title: string
  options: ChecklistOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  disabled?: boolean
}) {
  const selectedCount = selectedValues.length

  return (
    <section className="flex min-w-0 flex-col gap-2.5 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Label className="text-sm font-semibold text-foreground">{title}</Label>
          {selectedCount > 0 ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {selectedCount}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={disabled || options.length === 0}
            onClick={onSelectAll}
          >
            All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={disabled || selectedCount === 0}
            onClick={onClearAll}
          >
            Clear
          </Button>
        </div>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Options appear after the header location loads employment data.
        </p>
      ) : (
        <ul className="flex min-w-0 flex-wrap items-center gap-2">
          {options.map((option) => {
            const checked = selectedValues.includes(option.value)

            return (
              <li key={option.value} className="shrink-0">
                <label
                  className={disabled
                    ? "inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 opacity-60"
                    : checked
                      ? "inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5"
                      : "inline-flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  }
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={() => onToggle(option.value)}
                  />
                  <span className="whitespace-nowrap text-sm text-foreground">{option.label}</span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function ApplicantStatusPill({ reviewed }: { reviewed: boolean }) {
  return reviewed ? (
    <span className="inline-flex min-w-24 items-center justify-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
      Reviewed
    </span>
  ) : (
    <span className="inline-flex min-w-24 items-center justify-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
      Pending
    </span>
  )
}

function formatShortDate(value: string | null) {
  if (!value) {
    return "-"
  }

  const dateOnly = value.includes("T") ? value.slice(0, 10) : value.slice(0, 10)
  const parsed = new Date(`${dateOnly}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function normalizeApiDate(value: string | null) {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.includes("T")) {
    return trimmed.slice(0, 10)
  }

  if (trimmed.includes(" ")) {
    return trimmed.slice(0, 10)
  }

  return trimmed.slice(0, 10)
}

function mapApplicationToRecord(
  application: EmploymentApplication,
  openingsById: Map<string, string>
): EmploymentApplicantRecord {
  return {
    id: application.EntryID,
    locationId: application.LocationID,
    firstName: application.FirstName,
    lastName: application.LastName,
    email: "",
    phone: "",
    positionGroupId: "",
    positionGroupLabel: "",
    opportunityId: application.OpeningID,
    opportunityTitle: openingsById.get(application.OpeningID) ?? application.OpeningID,
    submittedOn: normalizeApiDate(application.DateSubmitted) ?? application.DateSubmitted,
    reviewed: application.Reviewed === "Y",
    reviewedBy: application.ReviewedBy ?? "",
    hireDate: normalizeApiDate(application.HireDate),
    dismissalDate: normalizeApiDate(application.DismissalDate),
    notes: application.ReviewComments ?? "",
  }
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase()
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function buildOpportunityOptions(rows: EmploymentOpeningRecord[]): ChecklistOption[] {
  const seen = new Set<string>()

  return rows.reduce<ChecklistOption[]>((options, row) => {
    if (seen.has(row.id)) {
      return options
    }

    seen.add(row.id)
    options.push({
      value: row.id,
      label: row.title,
    })
    return options
  }, [])
}

export function EmploymentApplicantsScreen() {
  const { locationId, locationName } = useAppSession()

  const [positionGroups, setPositionGroups] = useState<EmploymentApplicantFilterGroup[]>([])
  const [openings, setOpenings] = useState<EmploymentOpeningRecord[]>([])
  const [rows, setRows] = useState<EmploymentApplicantRecord[]>([])
  const [draftPositionIds, setDraftPositionIds] = useState<string[]>([])
  const [draftOpportunityIds, setDraftOpportunityIds] = useState<string[]>([])
  const [appliedPositionIds, setAppliedPositionIds] = useState<string[]>([])
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [editingApplicantId, setEditingApplicantId] = useState<string | null>(null)
  const [editDialogApplicant, setEditDialogApplicant] = useState<EmploymentApplicantRecord | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null)
  const [reviewedInput, setReviewedInput] = useState("N")
  const [reviewedByInput, setReviewedByInput] = useState("")
  const [hireDateInput, setHireDateInput] = useState("")
  const [dismissalDateInput, setDismissalDateInput] = useState("")
  const [notesInput, setNotesInput] = useState("")

  const {
    data: apiApplications,
    isLoading: isApplicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useGetEmploymentApplicationsQuery(
    { connectionString: "demo_prod", locationId: locationId ?? "" },
    { skip: !locationId }
  )

  const {
    data: apiPositions,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useGetEmploymentPositionsQuery(
    { connectionString: "demo_prod", locationId: locationId ?? "" },
    { skip: !locationId }
  )

  const [downloadEmploymentApplicationPdf] = useDownloadEmploymentApplicationPdfMutation()

  const positionOptions = useMemo<ChecklistOption[]>(
    () =>
      positionGroups.map((group) => ({
        value: group.id,
        label: group.label,
      })),
    [positionGroups]
  )

  const opportunityOptions = useMemo(
    () => buildOpportunityOptions(openings),
    [openings]
  )

  const openingsById = useMemo(() => {
    const map = new Map<string, string>()
    for (const opening of openings) {
      map.set(opening.id, opening.title)
    }
    return map
  }, [openings])

  const editingApplicant = useMemo(
    () => rows.find((row) => row.id === editingApplicantId) ?? editDialogApplicant,
    [rows, editingApplicantId, editDialogApplicant]
  )

  useEffect(() => {
    if (!locationId) {
      setPositionGroups([])
      setOpenings([])
      setRows([])
      setDraftPositionIds([])
      setDraftOpportunityIds([])
      setAppliedPositionIds([])
      setAppliedOpportunityIds([])
      setLoading(false)
      setSaving(false)
      setError(null)
      setStatusMessage(null)
      setEditingApplicantId(null)
      setEditDialogApplicant(null)
      setIsEditDialogOpen(false)
      setDownloadingPdfId(null)
      return
    }

    let isActive = true
    setError(null)
    setStatusMessage(null)
    setDraftPositionIds([])
    setDraftOpportunityIds([])
    setAppliedPositionIds([])
    setAppliedOpportunityIds([])
    setEditingApplicantId(null)
    setEditDialogApplicant(null)
    setIsEditDialogOpen(false)
    setDownloadingPdfId(null)

    getEmploymentApplicantFilterGroupsByLocation({
      locationId: locationId,
      locationLabel: locationName,
    })
      .then((nextGroups) => {
        if (isActive) {
          setPositionGroups(nextGroups)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          reportError(setError, requestError, "Unable to load employment applicant filters.")
        }
      })

    return () => {
      isActive = false
    }
  }, [locationId, locationName])

  useEffect(() => {
    if (apiPositions) {
      setOpenings(
        apiPositions.map((position) => ({
          id: position.PositionID,
          locationId: position.LocationId,
          title: position.PositionText,
          active: position.ActiveIndicator === "Y",
        }))
      )
    } else {
      setOpenings([])
    }
  }, [apiPositions])

  useEffect(() => {
    if (apiApplications) {
      setRows(apiApplications.map((application) => mapApplicationToRecord(application, openingsById)))
    } else {
      setRows([])
    }
  }, [apiApplications, openingsById])

  useEffect(() => {
    setLoading(isApplicationsLoading || isPositionsLoading)
  }, [isApplicationsLoading, isPositionsLoading])

  useEffect(() => {
    if (applicationsError || positionsError) {
      reportErrorMessage(setError, "Unable to load employment applicants.")
    } else {
      setError(null)
    }
  }, [applicationsError, positionsError])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (appliedPositionIds.length > 0 && !appliedPositionIds.includes(row.positionGroupId)) {
        return false
      }

      if (appliedOpportunityIds.length > 0 && !appliedOpportunityIds.includes(row.opportunityId)) {
        return false
      }

      return true
    })
  }, [rows, appliedOpportunityIds, appliedPositionIds])

  const appliedFilterCount = appliedPositionIds.length + appliedOpportunityIds.length
  const hasDraftChanges =
    draftPositionIds.join("|") !== appliedPositionIds.join("|") ||
    draftOpportunityIds.join("|") !== appliedOpportunityIds.join("|")

  function toggleValue(current: string[], value: string) {
    return current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
  }

  function applyFilters() {
    setAppliedPositionIds([...draftPositionIds])
    setAppliedOpportunityIds([...draftOpportunityIds])

    const filterCount = draftPositionIds.length + draftOpportunityIds.length
    setStatusMessage(
      filterCount > 0
        ? `Applied ${filterCount} filter${filterCount === 1 ? "" : "s"} for ${locationName}.`
        : `Showing all applicants for ${locationName}.`
    )
  }

  function openEditDialog(row: EmploymentApplicantRecord) {
    setEditingApplicantId(row.id)
    setEditDialogApplicant(row)
    setIsEditDialogOpen(true)
    setReviewedInput(row.reviewed ? "Y" : "N")
    setReviewedByInput(row.reviewedBy)
    setHireDateInput(row.hireDate ?? "")
    setDismissalDateInput(row.dismissalDate ?? "")
    setNotesInput(row.notes)
    setError(null)
  }

  function closeEditDialog() {
    setIsEditDialogOpen(false)
    setError(null)
  }

  async function handleDownloadPdf(row: EmploymentApplicantRecord) {
    if (downloadingPdfId) {
      return
    }

    setDownloadingPdfId(row.id)
    setError(null)

    try {
      const blob = await downloadEmploymentApplicationPdf({
        connectionString: "demo_prod",
        entryId: row.id,
      }).unwrap()

      const pdfBlob =
        blob.type && blob.type !== "application/octet-stream"
          ? blob
          : new Blob([blob], { type: "application/pdf" })
      const url = URL.createObjectURL(pdfBlob)
      const opened = window.open(url, "_blank", "noopener,noreferrer")

      if (!opened) {
        const link = document.createElement("a")
        link.href = url
        link.download = `${row.firstName}-${row.lastName}-application.pdf`.replace(/\s+/g, "-")
        document.body.appendChild(link)
        link.click()
        link.remove()
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      toastSuccess(`Opened PDF for ${row.firstName} ${row.lastName}.`)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to download the employment application PDF.")
    } finally {
      setDownloadingPdfId(null)
    }
  }

  async function handleSaveApplicant() {
    if (!locationId || !editingApplicant || saving) {
      return
    }

    setSaving(true)
    setError(null)

    const input: EmploymentApplicantUpdateInput = {
      reviewed: reviewedInput === "Y",
      reviewedBy: normalizeText(reviewedByInput),
      hireDate: hireDateInput || null,
      dismissalDate: dismissalDateInput || null,
      notes: normalizeText(notesInput),
    }

    try {
      const updatedRow = await updateEmploymentApplicant({
        locationId: locationId,
        locationLabel: locationName,
        applicantId: editingApplicant.id,
        input,
      })

      setRows((current) =>
        current.map((row) => (row.id === updatedRow.id ? updatedRow : row))
      )
      setEditDialogApplicant(updatedRow)
      const updateMessage = `Updated ${updatedRow.firstName} ${updatedRow.lastName}.`
      setStatusMessage(updateMessage)
      toastSuccess(updateMessage)
      closeEditDialog()
      void refetchApplications()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to update the employment applicant.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Employment Applicants
          </h1>
          <p className="text-sm text-muted-foreground">
            Review applicant submissions, narrow them by employment category or opening,
            and keep mock hiring data organized until the backend applicant endpoints are ready.
          </p>
        </div>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Optional Filters
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Refine applicants by position family and by specific opening.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {appliedFilterCount > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border/70">
                    {appliedFilterCount} active filter{appliedFilterCount === 1 ? "" : "s"}
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  disabled={!locationId || loading || !hasDraftChanges}
                  onClick={applyFilters}
                >
                  <Filter className="size-4" />
                  Apply Filter
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <FilterChecklistPanel
                title="Positions"
                options={positionOptions}
                selectedValues={draftPositionIds}
                onToggle={(value) => setDraftPositionIds((current) => toggleValue(current, value))}
                onSelectAll={() => setDraftPositionIds(positionOptions.map((option) => option.value))}
                onClearAll={() => setDraftPositionIds([])}
                disabled={!locationId || loading}
              />
              <FilterChecklistPanel
                title="Other Opportunities"
                options={opportunityOptions}
                selectedValues={draftOpportunityIds}
                onToggle={(value) => setDraftOpportunityIds((current) => toggleValue(current, value))}
                onSelectAll={() => setDraftOpportunityIds(opportunityOptions.map((option) => option.value))}
                onClearAll={() => setDraftOpportunityIds([])}
                disabled={!locationId || loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Employment Applicants Data
              </CardTitle>
              <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border/70">
                <span className="text-foreground">Visible rows:</span>
                <span>{filteredRows.length}</span>
              </div>
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
                <VenueNoLocationState featureLabel="Employment applicants" />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading applicants and employment filters...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No applicants match the current filter selection."
                  description="Adjust the draft filters and apply them again, or clear the filters to view every applicant for this location."
                />
              </div>
            ) : (
              <div className="overflow-x-auto px-4 py-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16 px-4">#</TableHead>
                      <TableHead className="min-w-64">Applicant</TableHead>
                      <TableHead className="min-w-44">Opportunity</TableHead>
                      <TableHead className="w-32">Submitted</TableHead>
                      <TableHead className="w-32">Reviewed</TableHead>
                      <TableHead className="min-w-40">Reviewed By</TableHead>
                      <TableHead className="w-32">Hire Date</TableHead>
                      <TableHead className="w-32">Dismissal Date</TableHead>
                      <TableHead className="w-32 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 font-medium tabular-nums text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(row.firstName, row.lastName)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="font-medium text-foreground">
                                {row.firstName} {row.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{row.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">{row.opportunityTitle}</p>
                            <p className="text-sm text-muted-foreground">{row.positionGroupLabel}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {formatShortDate(row.submittedOn)}
                        </TableCell>
                        <TableCell>
                          <ApplicantStatusPill reviewed={row.reviewed} />
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {row.reviewedBy || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {formatShortDate(row.hireDate)}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {formatShortDate(row.dismissalDate)}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                                  aria-label={`Actions for ${row.firstName} ${row.lastName}`}
                                >
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[8rem]">
                                <DropdownMenuItem onClick={() => openEditDialog(row)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={downloadingPdfId === row.id}
                                  onClick={() => void handleDownloadPdf(row)}
                                >
                                  {downloadingPdfId === row.id ? "Downloading..." : "PDF"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 lg:flex-row lg:items-center">
            <div aria-live="polite" className="text-sm text-muted-foreground">
              {locationId
                ? statusMessage ||
                  `${filteredRows.length} applicant${filteredRows.length === 1 ? "" : "s"} visible for ${locationName}. Use Edit to maintain reviewed and hiring state.`
                : "Select a location from the header to begin reviewing employment applicants."}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
           
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) { closeEditDialog() } else { setIsEditDialogOpen(true) } }}>
        <DialogContent className="max-w-3xl p-0 sm:max-w-3xl">
          <DialogHeader className="border-b bg-muted/40 px-5 py-4">
            <DialogTitle className="text-base font-semibold text-foreground">
              Applicant Review
            </DialogTitle>
            <DialogDescription>
              Update review and hiring notes for the selected applicant.
            </DialogDescription>
          </DialogHeader>

          {editingApplicant ? (
            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Applicant
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {editingApplicant.firstName} {editingApplicant.lastName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{editingApplicant.email}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{editingApplicant.phone}</p>
                </div>

                <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Applied For
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {editingApplicant.opportunityTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {editingApplicant.positionGroupLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted {formatShortDate(editingApplicant.submittedOn)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employment-applicant-reviewed">Reviewed</Label>
                  <Select value={reviewedInput} onValueChange={setReviewedInput}>
                    <SelectTrigger id="employment-applicant-reviewed" className="w-full bg-background">
                      <SelectValue placeholder="Select review state" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {REVIEW_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment-applicant-reviewed-by">Reviewed By</Label>
                  <Input
                    id="employment-applicant-reviewed-by"
                    value={reviewedByInput}
                    onChange={(event) => setReviewedByInput(event.target.value)}
                    placeholder="Manager or reviewer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment-applicant-hire-date">Hire Date</Label>
                  <CalendarDatePickerControl
                    id="employment-applicant-hire-date"
                    value={hireDateInput}
                    onChange={setHireDateInput}
                    placeholder="Select hire date"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment-applicant-dismissal-date">Dismissal Date</Label>
                  <CalendarDatePickerControl
                    id="employment-applicant-dismissal-date"
                    value={dismissalDateInput}
                    onChange={setDismissalDateInput}
                    placeholder="Select dismissal date"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="employment-applicant-notes">Internal Notes</Label>
                  <Textarea
                    id="employment-applicant-notes"
                    value={notesInput}
                    onChange={(event) => setNotesInput(event.target.value)}
                    placeholder="Capture interview notes, availability, or next-step details"
                    className="min-h-28"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="border-t px-5 py-4">
            <Button type="button" variant="outline" onClick={closeEditDialog} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" className="gap-2" onClick={() => void handleSaveApplicant()} disabled={saving}>
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Pencil className="size-4" />}
              Update Applicant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}







