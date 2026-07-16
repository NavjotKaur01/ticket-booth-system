import {
  Clock3,
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
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  createVenueShowTime,
  deleteVenueShowTime,
  getVenueShowTimesByLocation,
  updateVenueShowTime,
} from "@/features/venue-show-times/venue-show-times.service"
import type { VenueShowTimeRecord } from "@/types/venue-show-time"

const DAY_OF_WEEK_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

const FLAG_OPTIONS = [
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

function BooleanPill({ value }: { value: boolean }) {
  return (
    <span
      className={value
        ? "inline-flex min-w-9 items-center justify-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
        : "inline-flex min-w-9 items-center justify-center rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {value ? "Y" : "N"}
    </span>
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

function toFlagValue(value: boolean) {
  return value ? "Y" : "N"
}

function fromFlagValue(value: string) {
  return value === "Y"
}

export function VenueShowTimesScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<VenueShowTimeRecord[]>([])
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingShowTimeId, setEditingShowTimeId] = useState<string | null>(null)
  const [dayOfWeekInput, setDayOfWeekInput] = useState<string>(DAY_OF_WEEK_OPTIONS[0])
  const [showTimeInput, setShowTimeInput] = useState("")
  const [arrivalTimeInput, setArrivalTimeInput] = useState("")
  const [dinnerInput, setDinnerInput] = useState("N")
  const [noPassesInput, setNoPassesInput] = useState("N")
  const [vipInput, setVipInput] = useState("N")
  const [over21Input, setOver21Input] = useState("Y")
  const [showSeatingChartInput, setShowSeatingChartInput] = useState("N")
  const [deletingRow, setDeletingRow] = useState<VenueShowTimeRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const canSave =
    dayOfWeekInput.trim().length > 0 &&
    showTimeInput.trim().length > 0 &&
    arrivalTimeInput.trim().length > 0

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setEditorMode(null)
      setEditingShowTimeId(null)
      setDayOfWeekInput(DAY_OF_WEEK_OPTIONS[0])
      setShowTimeInput("")
      setArrivalTimeInput("")
      setDinnerInput("N")
      setNoPassesInput("N")
      setVipInput("N")
      setOver21Input("Y")
      setShowSeatingChartInput("N")
      setDeletingRow(null)
      setLoading(false)
      setSaving(false)
      setDeletingId(null)
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
    setEditingShowTimeId(null)
    setDeletingRow(null)

    getVenueShowTimesByLocation({
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
          reportError(setError, requestError, "Unable to load venue show times.")
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
    setEditingShowTimeId(null)
    setDayOfWeekInput(DAY_OF_WEEK_OPTIONS[0])
    setShowTimeInput("")
    setArrivalTimeInput("")
    setDinnerInput("N")
    setNoPassesInput("N")
    setVipInput("N")
    setOver21Input("Y")
    setShowSeatingChartInput("N")
    setDeletingRow(null)
    setError(null)
    setStatusMessage(null)
  }

  function openEditEditor(row: VenueShowTimeRecord) {
    setEditorMode("edit")
    setEditingShowTimeId(row.id)
    setDayOfWeekInput(row.dayOfWeek)
    setShowTimeInput(row.showTime)
    setArrivalTimeInput(row.arrivalTime)
    setDinnerInput(toFlagValue(row.dinner))
    setNoPassesInput(toFlagValue(row.noPasses))
    setVipInput(toFlagValue(row.vip))
    setOver21Input(toFlagValue(row.over21))
    setShowSeatingChartInput(toFlagValue(row.showSeatingChart))
    setDeletingRow(null)
    setError(null)
    setStatusMessage(null)
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingShowTimeId(null)
    setDayOfWeekInput(DAY_OF_WEEK_OPTIONS[0])
    setShowTimeInput("")
    setArrivalTimeInput("")
    setDinnerInput("N")
    setNoPassesInput("N")
    setVipInput("N")
    setOver21Input("Y")
    setShowSeatingChartInput("N")
    setError(null)
  }

  async function handleSave() {
    const normalizedShowTime = showTimeInput.trim().toUpperCase()
    const normalizedArrivalTime = arrivalTimeInput.trim().toUpperCase()

    if (!locationId || !canSave || saving) {
      return
    }

    const duplicateRow = rows.find(
      (row) =>
        row.dayOfWeek === dayOfWeekInput &&
        row.showTime.trim().toUpperCase() === normalizedShowTime &&
        row.id !== editingShowTimeId
    )
    if (duplicateRow) {
      reportErrorMessage(setError, "This show time already exists for the selected day.")
      return
    }

    setSaving(true)
    setError(null)
    setStatusMessage(null)

    try {
      if (editorMode === "edit" && editingShowTimeId) {
        const updatedRow = await updateVenueShowTime({
          locationId,
          locationLabel: locationName,
          showTimeId: editingShowTimeId,
          dayOfWeek: dayOfWeekInput,
          showTime: normalizedShowTime,
          arrivalTime: normalizedArrivalTime,
          dinner: fromFlagValue(dinnerInput),
          noPasses: fromFlagValue(noPassesInput),
          vip: fromFlagValue(vipInput),
          over21: fromFlagValue(over21Input),
          showSeatingChart: fromFlagValue(showSeatingChartInput),
        })

        setRows((current) =>
          current
            .map((row) => (row.id === updatedRow.id ? updatedRow : row))
            .sort((left, right) => left.dayOfWeek.localeCompare(right.dayOfWeek) || left.showTime.localeCompare(right.showTime))
        )
        const updateMessage = `Updated ${updatedRow.dayOfWeek} ${updatedRow.showTime} for ${locationName}.`
        setStatusMessage(updateMessage)
        toastSuccess(updateMessage)
      } else {
        const createdRow = await createVenueShowTime({
          locationId,
          locationLabel: locationName,
          dayOfWeek: dayOfWeekInput,
          showTime: normalizedShowTime,
          arrivalTime: normalizedArrivalTime,
          dinner: fromFlagValue(dinnerInput),
          noPasses: fromFlagValue(noPassesInput),
          vip: fromFlagValue(vipInput),
          over21: fromFlagValue(over21Input),
          showSeatingChart: fromFlagValue(showSeatingChartInput),
        })

        setRows((current) =>
          [createdRow, ...current].sort(
            (left, right) => left.dayOfWeek.localeCompare(right.dayOfWeek) || left.showTime.localeCompare(right.showTime)
          )
        )
        const createMessage = `Added ${createdRow.dayOfWeek} ${createdRow.showTime} for ${locationName}.`
        setStatusMessage(createMessage)
        toastSuccess(createMessage)
      }

      closeEditor()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to save the venue show time.")
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
      await deleteVenueShowTime({
        locationId,
        locationLabel: locationName,
        showTimeId: deletingRow.id,
      })

      setRows((current) => current.filter((row) => row.id !== deletingRow.id))
      if (editingShowTimeId === deletingRow.id) {
        closeEditor()
      }
      const deleteMessage = `Deleted ${deletingRow.dayOfWeek} ${deletingRow.showTime} for ${locationName}.`
      setStatusMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setDeletingRow(null)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the venue show time.")
    } finally {
      setDeletingId(null)
    }
  }

  function renderFlagField({
    label,
    value,
    onChange,
    id,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    id: string
  }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full bg-background">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent position="popper">
            {FLAG_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  function renderEditorRow() {
    return (
      <TableRow className="bg-muted/20 hover:bg-muted/20">
        <TableCell colSpan={10} className="p-4 whitespace-normal">
          <div className="rounded-xl border border-border/70 bg-background/90 p-4 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="venue-show-time-day">Day Of Week</Label>
                  <Select value={dayOfWeekInput} onValueChange={setDayOfWeekInput}>
                    <SelectTrigger id="venue-show-time-day" className="w-full bg-background">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {DAY_OF_WEEK_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue-show-time-show">Show Time</Label>
                  <Input
                    id="venue-show-time-show"
                    value={showTimeInput}
                    onChange={(event) => setShowTimeInput(event.target.value)}
                    placeholder="10:00 PM"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue-show-time-arrival">Arrival Time</Label>
                  <Input
                    id="venue-show-time-arrival"
                    value={arrivalTimeInput}
                    onChange={(event) => setArrivalTimeInput(event.target.value)}
                    placeholder="9:45 PM"
                    className="bg-background"
                  />
                </div>

                {renderFlagField({
                  label: "Dinner",
                  value: dinnerInput,
                  onChange: setDinnerInput,
                  id: "venue-show-time-dinner",
                })}
                {renderFlagField({
                  label: "No Passes",
                  value: noPassesInput,
                  onChange: setNoPassesInput,
                  id: "venue-show-time-no-passes",
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {renderFlagField({
                  label: "VIP",
                  value: vipInput,
                  onChange: setVipInput,
                  id: "venue-show-time-vip",
                })}
                {renderFlagField({
                  label: "Over 21",
                  value: over21Input,
                  onChange: setOver21Input,
                  id: "venue-show-time-over-21",
                })}
                <div className="space-y-2 sm:col-span-2">
                  {renderFlagField({
                    label: "Show Seating Chart",
                    value: showSeatingChartInput,
                    onChange: setShowSeatingChartInput,
                    id: "venue-show-time-seating-chart",
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border/70 pt-4">
              <Button type="button" variant="outline" onClick={closeEditor} disabled={saving}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleSave()} disabled={!canSave || saving}>
                {saving ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
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
      <>
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Venue Show Times
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage club show-time rules by location with inline editing and mock service
              data until the backend is wired in.
            </p>
          </div>

          <Card className="gap-0 py-0">
            <CardContent className="px-4 py-4">
              <div className="rounded-sm border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Use New Show Time to add a row, or edit a specific row inline when a venue
                rule changes.
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b bg-muted/40 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Club Show Times Data
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
                  New Show Time
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
                  <VenueNoLocationState featureLabel="Venue show times" />
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading show times...
                </div>
              ) : rows.length === 0 && editorMode !== "create" ? (
                <div className="p-4">
                  <EmptyState
                    title="No show times found."
                    description="Use New Show Time to add the first row for this location."
                  />
                </div>
              ) : (
                <div className="px-4 py-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-14 px-4">#</TableHead>
                        <TableHead>Day of Week</TableHead>
                        <TableHead>Show Time</TableHead>
                        <TableHead>Arrival Time</TableHead>
                        <TableHead>Dinner</TableHead>
                        <TableHead>No Passes</TableHead>
                        <TableHead>VIP</TableHead>
                        <TableHead>Over 21</TableHead>
                        <TableHead>Show Seating Chart</TableHead>
                        <TableHead className="w-28 px-4 text-right">Actions</TableHead>
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
                            <TableCell>{row.dayOfWeek}</TableCell>
                            <TableCell className="font-medium text-foreground">{row.showTime}</TableCell>
                            <TableCell>{row.arrivalTime}</TableCell>
                            <TableCell><BooleanPill value={row.dinner} /></TableCell>
                            <TableCell><BooleanPill value={row.noPasses} /></TableCell>
                            <TableCell><BooleanPill value={row.vip} /></TableCell>
                            <TableCell><BooleanPill value={row.over21} /></TableCell>
                            <TableCell><BooleanPill value={row.showSeatingChart} /></TableCell>
                            <TableCell className="px-4">
                              <div className="flex items-center justify-end gap-1">
                                <ActionButton label="Edit show time" onClick={() => openEditEditor(row)}>
                                  <Pencil className="size-4" />
                                </ActionButton>
                                <ActionButton
                                  label="Delete show time"
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
                          {editorMode === "edit" && editingShowTimeId === row.id
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
                  ? statusMessage || `${rows.length} mock show-time row${rows.length === 1 ? "" : "s"} loaded for ${locationName}.`
                  : "Select a location from the header to begin reviewing venue show times."}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Clock3 className="size-3.5" />
                Mock management mode
              </div>
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
          title="Delete show time?"
          description={deletingRow
            ? `This will remove ${deletingRow.dayOfWeek} ${deletingRow.showTime} from ${locationName}.`
            : ""}
          confirmLabel="Delete show time"
          isPending={Boolean(deletingId)}
        />
      </>
    </TooltipProvider>
  )
}
