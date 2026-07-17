import { useEffect, useMemo, useRef, useState } from "react"

import CalendarDatePickerControl from "../controls/CalendarDatePickerControl"
import CalendarSelectControl from "../controls/CalendarSelectControl"
import CalendarTimeControl from "../controls/CalendarTimeControl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSession } from "@/hooks/use-app-session"
import { buildSavePrePrivateSetupLinkRequest } from "@/lib/build-private-show-link-request"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import {
  useGetShowDetailsByDateQuery,
  useSavePrePrivateSetupLinkMutation,
} from "@/store/api/clubmanApi"
import type { CalendarEvent } from "@/types/calendar-event"

import {
  buildSelectedPrivateShowOptions,
  createPrivatePreSaleFormValues,
  findSelectedPrivateShow,
  validatePrivatePreSaleForm,
  type PrivatePreSaleFormValues,
} from "../service/privatePreSale.service"

type PrivatePreSaleDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
  onSaved?: () => void | Promise<void>
}

const FIELD_ROW_CLASS = "grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center"

function PrivatePreSaleSkeleton() {
  return (
    <div className="px-5 py-5" aria-label="Loading private pre-sale form">
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={FIELD_ROW_CLASS}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PrivatePreSaleDialog({
  open,
  event,
  onOpenChange,
  onAfterClose,
  onSaved,
}: PrivatePreSaleDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const [formValues, setFormValues] = useState<PrivatePreSaleFormValues | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const sessionGenerationRef = useRef(0)

  const selectedShowId = event?.showId || event?.id || ""
  const shouldLoadShows = Boolean(
    open &&
      isReady &&
      connectionName &&
      locationId &&
      formValues?.showDate
  )
  const showDetailsQuery = useGetShowDetailsByDateQuery(
    {
      connectionString: connectionName,
      locationId,
      showDate: formValues?.showDate ?? "",
      isCancelledShow: false,
    },
    {
      skip: !shouldLoadShows,
      refetchOnMountOrArgChange: true,
    }
  )
  const [savePrePrivateSetupLink, { isLoading: isSubmitting }] =
    useSavePrePrivateSetupLinkMutation()

  const privateShow = useMemo(
    () =>
      findSelectedPrivateShow(
        showDetailsQuery.data ?? [],
        selectedShowId
      ),
    [selectedShowId, showDetailsQuery.data]
  )
  const options = useMemo(
    () => buildSelectedPrivateShowOptions(privateShow),
    [privateShow]
  )

  function resetDialogSession() {
    setFormValues(null)
    setFormError(null)
    onAfterClose?.()
  }

  useEffect(() => {
    if (open) {
      sessionGenerationRef.current += 1
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      sessionGenerationRef.current += 1
    }
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open) {
      return
    }

    if (event) {
      setFormValues(createPrivatePreSaleFormValues(event))
      setFormError(null)
    }
  }, [event, open])

  useEffect(() => {
    if (!open || showDetailsQuery.isFetching || !showDetailsQuery.isSuccess) {
      return
    }

    setFormValues((current) => {
      if (!current) return current
      const showId = privateShow?.ShowId ?? ""
      const comicId = privateShow?.ComicId ?? ""
      if (current.showId === showId && current.comicId === comicId) {
        return current
      }
      return { ...current, showId, comicId }
    })
  }, [
    open,
    privateShow,
    showDetailsQuery.isFetching,
    showDetailsQuery.isSuccess,
  ])

  function updateField<K extends keyof PrivatePreSaleFormValues>(
    field: K,
    value: PrivatePreSaleFormValues[K]
  ) {
    setFormError(null)
    setFormValues((current) => {
      if (!current) return current
      if (field === "showDate") {
        return {
          ...current,
          showDate: value as string,
          showId: "",
          comicId: "",
        }
      }
      return { ...current, [field]: value }
    })
  }

  async function handleSave() {
    if (!formValues) {
      return
    }

    const validationError = validatePrivatePreSaleForm(
      formValues,
      privateShow
    )
    if (validationError) {
      setFormError(validationError)
      return
    }
    if (!isReady || !connectionName || !locationId) {
      setFormError("Location is required before saving a private show link.")
      return
    }

    const generation = sessionGenerationRef.current

    try {
      setFormError(null)
      const didSave = await savePrePrivateSetupLink(
        buildSavePrePrivateSetupLinkRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          form: formValues,
        })
      ).unwrap()
      if (generation !== sessionGenerationRef.current) return
      if (!didSave) {
        setFormError("Unable to save the private pre-sale link.")
        return
      }
      await onSaved?.()
      if (generation !== sessionGenerationRef.current) return
      handleOpenChange(false)
    } catch (error: unknown) {
      if (generation !== sessionGenerationRef.current) return
      setFormError(
        error instanceof Error
          ? error.message
          : getClubmanErrorMessage(error)
      )
    }
  }

  const isLoading =
    shouldLoadShows &&
    (showDetailsQuery.isLoading || showDetailsQuery.isFetching)
  const queryError = showDetailsQuery.error
    ? getClubmanErrorMessage(showDetailsQuery.error)
    : null
  const privateShowError =
    showDetailsQuery.isSuccess && !privateShow
      ? "Selected show is not configured as a private show."
      : null
  const errorMessage = formError ?? queryError ?? privateShowError
  const formDisabled = isLoading || isSubmitting

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        disableOutsideDismiss
        onAfterClose={resetDialogSession}
        className="flex w-full max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">Private Pre-sale Setup</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading || !formValues ? (
            <PrivatePreSaleSkeleton />
          ) : (
            <div className="px-5 py-5">
              {errorMessage ? (
                <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-show-date">Show Date</Label>
                  <CalendarDatePickerControl
                    id="private-pre-sale-show-date"
                    value={formValues.showDate}
                    onChange={(value) => updateField("showDate", value)}
                    disablePastDates
                    disabled={formDisabled}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-comic">Select Comic</Label>
                  <CalendarSelectControl
                    id="private-pre-sale-comic"
                    value={formValues.comicId}
                    onChange={(value) => updateField("comicId", value)}
                    placeholder="Select Comic"
                    options={options.comicOptions}
                    disabled={formDisabled || !privateShow}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-show">Select Show</Label>
                  <CalendarSelectControl
                    id="private-pre-sale-show"
                    value={formValues.showId}
                    onChange={(value) => updateField("showId", value)}
                    placeholder="Select Show"
                    options={options.showOptions}
                    disabled={formDisabled || !privateShow}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-access-code">Access Code</Label>
                  <Input
                    id="private-pre-sale-access-code"
                    value={formValues.accessCode}
                    onChange={(changeEvent) =>
                      updateField("accessCode", changeEvent.target.value)
                    }
                    className="h-9"
                    disabled={formDisabled || !privateShow}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-start-date">Start Date</Label>
                  <CalendarDatePickerControl
                    id="private-pre-sale-start-date"
                    value={formValues.startDate}
                    onChange={(value) => updateField("startDate", value)}
                    disabled={formDisabled}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-start-time">Start Time</Label>
                  <CalendarTimeControl
                    id="private-pre-sale-start-time"
                    value={formValues.startTime}
                    onChange={(value) => updateField("startTime", value)}
                    disabled={formDisabled}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-end-date">End Date</Label>
                  <CalendarDatePickerControl
                    id="private-pre-sale-end-date"
                    value={formValues.endDate}
                    onChange={(value) => updateField("endDate", value)}
                    disabled={formDisabled}
                  />
                </div>

                <div className={FIELD_ROW_CLASS}>
                  <Label htmlFor="private-pre-sale-end-time">End Time</Label>
                  <CalendarTimeControl
                    id="private-pre-sale-end-time"
                    value={formValues.endTime}
                    onChange={(value) => updateField("endTime", value)}
                    disabled={formDisabled}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-5 py-4">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={
              !formValues ||
              !privateShow ||
              formDisabled ||
              Boolean(queryError)
            }
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
