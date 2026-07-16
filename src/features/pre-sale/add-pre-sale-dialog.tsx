import { useEffect, useMemo, useState } from "react"

import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { savePrePrivateSetupLink } from "@/lib/api/private-show-links"
import { buildSavePrePrivateSetupLinkRequest } from "@/lib/build-private-show-link-request"
import {
  mapPrivateShowComics,
  mapPrivateShowsForDate,
} from "@/lib/map-private-show-options"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetShowDetailsByDateQuery } from "@/store/api/clubmanApi"
import {
  createEmptyPreSaleForm,
  type PreSaleFormValues,
} from "@/types/pre-sale"

type AddPreSaleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void | Promise<void>
}

function combineDateAndTime(dateYmd: string, timeHHmm: string): Date {
  const [year, month, day] = dateYmd.split("-").map((part) =>
    Number.parseInt(part, 10)
  )
  const [hours, minutes] = timeHHmm.split(":").map((part) =>
    Number.parseInt(part, 10)
  )
  return new Date(
    year || 1970,
    (month || 1) - 1,
    day || 1,
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0
  )
}

export function AddPreSaleDialog({
  open,
  onOpenChange,
  onSaved,
}: AddPreSaleDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const [form, setForm] = useState<PreSaleFormValues>(createEmptyPreSaleForm())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const shouldLoadShows =
    open && isReady && Boolean(connectionName && locationId && form.showDate)

  const {
    data: showDetails,
    isLoading: showsLoading,
    isFetching: showsFetching,
    error: showsError,
  } = useGetShowDetailsByDateQuery(
    {
      connectionString: connectionName,
      locationId,
      showDate: form.showDate,
      isCancelledShow: false,
    },
    { skip: !shouldLoadShows }
  )

  const privateShows = useMemo(
    () => mapPrivateShowsForDate(showDetails ?? []),
    [showDetails]
  )

  const comicOptions = useMemo(
    () => mapPrivateShowComics(privateShows, showDetails ?? []),
    [privateShows, showDetails]
  )

  const showOptions = useMemo(() => {
    if (!form.comicId) return []
    return privateShows.filter((show) => show.comicId === form.comicId)
  }, [form.comicId, privateShows])

  useEffect(() => {
    if (!open) {
      setForm(createEmptyPreSaleForm())
      setError(null)
      setSaving(false)
    }
  }, [open])

  // Clear comic/show when private options for the date change.
  useEffect(() => {
    if (!open) return
    setForm((current) => {
      const comicStillValid = comicOptions.some(
        (option) => option.id === current.comicId
      )
      const nextComicId = comicStillValid ? current.comicId : ""
      const showsForComic = privateShows.filter(
        (show) => show.comicId === nextComicId
      )
      const showStillValid = showsForComic.some(
        (show) => show.id === current.showId
      )
      if (
        nextComicId === current.comicId &&
        (showStillValid || !current.showId)
      ) {
        return current
      }
      return {
        ...current,
        comicId: nextComicId,
        showId: showStillValid ? current.showId : "",
      }
    })
  }, [comicOptions, open, privateShows])

  function updateField<K extends keyof PreSaleFormValues>(
    field: K,
    value: PreSaleFormValues[K]
  ) {
    setForm((current) => {
      if (field === "comicId") {
        return { ...current, comicId: value as string, showId: "" }
      }
      if (field === "showDate") {
        return {
          ...current,
          showDate: value as string,
          comicId: "",
          showId: "",
        }
      }
      return { ...current, [field]: value }
    })
  }

  function validateForm(values: PreSaleFormValues): string | null {
    if (!values.comicId) return "Please select a comic."
    if (!values.showId) return "Please select a show."
    if (!values.accessCode.trim()) return "Please enter an access code."
    if (!values.startDate || !values.endDate) {
      return "Please enter start and end dates."
    }
    const start = combineDateAndTime(values.startDate, values.startTime)
    const end = combineDateAndTime(values.endDate, values.endTime)
    if (end.getTime() < start.getTime()) {
      return "End date/time must be on or after start date/time."
    }
    return null
  }

  async function handleSave() {
    const validationError = validateForm(form)
    if (validationError) {
      reportErrorMessage(setError, validationError)
      return
    }
    if (!isReady || !connectionName || !locationId) {
      reportErrorMessage(
        setError,
        "Location is required before saving a private show link."
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      await savePrePrivateSetupLink(
        buildSavePrePrivateSetupLinkRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          form,
        })
      )
      toastSuccess("Private show link saved")
      await onSaved?.()
      onOpenChange(false)
    } catch (saveError) {
      reportError(setError, saveError, "Failed to save private show link")
    } finally {
      setSaving(false)
    }
  }

  const showsBusy = showsLoading || showsFetching
  const formDisabled = saving || showsBusy

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              Private Pre-sale Setup
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          {error || showsError ? (
            <p className="mb-3 text-sm text-destructive">
              {error ||
                (showsError ? getClubmanErrorMessage(showsError) : null)}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Show Date" htmlFor="pre-sale-show-date">
              <CalendarDatePickerControl
                id="pre-sale-show-date"
                value={form.showDate}
                onChange={(value) => updateField("showDate", value)}
              />
            </FormField>

            <FormField label="Select Comic">
              <Select
                value={form.comicId || undefined}
                onValueChange={(value) => updateField("comicId", value)}
                disabled={formDisabled || comicOptions.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      showsBusy
                        ? "Loading comics..."
                        : comicOptions.length === 0
                          ? "No private shows"
                          : "Select Comic"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {comicOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select Show">
              <Select
                value={form.showId || undefined}
                onValueChange={(value) => updateField("showId", value)}
                disabled={
                  formDisabled || !form.comicId || showOptions.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !form.comicId
                        ? "Select comic first"
                        : showOptions.length === 0
                          ? "No shows for comic"
                          : "Select Show"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {showOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Access Code" htmlFor="pre-sale-access-code">
              <Input
                id="pre-sale-access-code"
                value={form.accessCode}
                disabled={formDisabled}
                onChange={(event) =>
                  updateField("accessCode", event.target.value)
                }
              />
            </FormField>

            <FormField label="Start Date" htmlFor="pre-sale-start-date">
              <CalendarDatePickerControl
                id="pre-sale-start-date"
                value={form.startDate}
                onChange={(value) => updateField("startDate", value)}
              />
            </FormField>

            <FormField label="Start Time" htmlFor="pre-sale-start-time">
              <Input
                id="pre-sale-start-time"
                type="time"
                value={form.startTime}
                disabled={formDisabled}
                onChange={(event) =>
                  updateField("startTime", event.target.value)
                }
              />
            </FormField>

            <FormField label="End Date" htmlFor="pre-sale-end-date">
              <CalendarDatePickerControl
                id="pre-sale-end-date"
                value={form.endDate}
                onChange={(value) => updateField("endDate", value)}
              />
            </FormField>

            <FormField label="End Time" htmlFor="pre-sale-end-time">
              <Input
                id="pre-sale-end-time"
                type="time"
                value={form.endTime}
                disabled={formDisabled}
                onChange={(event) =>
                  updateField("endTime", event.target.value)
                }
              />
            </FormField>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
