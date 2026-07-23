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
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { VenueShowTimeDataTable } from "@/features/venue-show-times/venue-show-time-data-table"
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
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
] as const

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
            .sort(
              (left, right) =>
                left.dayOfWeek.localeCompare(right.dayOfWeek) ||
                left.showTime.localeCompare(right.showTime)
            )
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
            (left, right) =>
              left.dayOfWeek.localeCompare(right.dayOfWeek) ||
              left.showTime.localeCompare(right.showTime)
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
      <div className="space-y-1.5">
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

  function renderEditorPanel() {
    if (!editorMode) {
      return null
    }

    return (
      <div className="border-b px-3 py-4">
        <div className="rounded-sm border border-border bg-background p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">
              {editorMode === "edit" ? "Edit Show Time" : "New Show Time"}
            </p>
            <p className="text-xs text-muted-foreground">
              Update the show-time rule, then save to apply changes.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="venue-show-time-day">Day Of Week</Label>
                <Select value={dayOfWeekInput} onValueChange={setDayOfWeekInput}>
                  <SelectTrigger
                    id="venue-show-time-day"
                    className="w-full bg-background"
                  >
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

              <div className="space-y-1.5">
                <Label htmlFor="venue-show-time-show">Show Time</Label>
                <Input
                  id="venue-show-time-show"
                  value={showTimeInput}
                  onChange={(event) => setShowTimeInput(event.target.value)}
                  placeholder="10:00 PM"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
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

            <div className="grid gap-3 sm:grid-cols-2">
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
              <div className="sm:col-span-2">
                {renderFlagField({
                  label: "Show Seating Chart",
                  value: showSeatingChartInput,
                  onChange: setShowSeatingChartInput,
                  id: "venue-show-time-seating-chart",
                })}
              </div>
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
            <AdminPageTitle>Venue Show Times</AdminPageTitle>
            <p className="text-sm text-muted-foreground">
              Manage club show-time rules by location with inline editing and mock
              service data until the backend is wired in.
            </p>
          </div>
          <Button
            type="button"
            disabled={!locationId}
            onClick={openCreateEditor}
            className="w-full sm:w-auto"
          >
            New Show Time
          </Button>
        </div>

        <PanelCard>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> Add
              with New Show Time, or edit a row when a venue rule changes.
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
              <VenueNoLocationState featureLabel="Venue show times" />
            </div>
          ) : (
            <>
              {renderEditorPanel()}
              <VenueShowTimeDataTable
                data={rows}
                loading={loading}
                emptyMessage="No show times found for this location."
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
        title="Delete show time?"
        description={
          deletingRow
            ? `This will remove ${deletingRow.dayOfWeek} ${deletingRow.showTime} from ${locationName}.`
            : ""
        }
        confirmLabel="Delete show time"
        isPending={Boolean(deletingId)}
      />
    </>
  )
}
