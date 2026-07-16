import { ArrowLeft, PlusCircle, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"

import CalendarSelectControl from "../controls/CalendarSelectControl"
import CalendarDatePickerControl from "../controls/CalendarDatePickerControl"
import CalendarTimeControl from "../controls/CalendarTimeControl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { fetchAddShowDialogData, saveShowRequest } from "@/lib/api/add-show"
// import { buildSaveShowRequest } from "@/lib/build-save-show-request"
import { buildUpdateShowRequest } from "@/lib/build-update-show-request"
import { useGetShowDataQuery, useGetShowPropertiesQuery, useUpdateShowMutation } from "@/store/api/clubmanApi"
import SaveVerifyDialog from "./SaveVerifyDialog"
import ComedianSearchDialog, {
  type ComedianSearchSelection,
} from "./ComedianSearchDialog"
import {
  buildSaveShowFilterList,
} from "@/lib/map-default-show-sections"
import { formatShowTime } from "@/lib/format-show-time"
import { parseAgeRestrictionValue } from "../service/adjustAge.service"
import {
  validateAddShowForm,
} from "@/lib/build-save-show-request"
import { saveShowsWithRecurrence } from "@/lib/save-shows-with-recurrence"
import type {
  AddShowDialogData,
  AddShowFormValues,
  PerformerOption,
  ShowTimeOption,
} from "@/types/calendar-show"
import type { RecurrenceState } from "@/types/recurrence"
import type { CalendarEvent } from "@/types/calendar-event"
import type { ApiDefaultShowSection } from "@/types/api/save-show"

const emptyFormValues: AddShowFormValues = {
  headlinerId: "",
  featureId: "",
  openerId: "",
  headliner2Id: "",
  feature2Id: "",
  specialNote: "",
  dinner: true,
  noPasses: false,
  vipSeating: false,
  hub: false,
  assignTable: false,
  showOnWeb: true,
  ageRestriction: "",
  minAge: "",
  dayOfShowFee: "1",
  phoneFee: "0.00",
  walkupFee: "0.00",
  webFee: "0.00",
  useSectionFee: false,
  preSalePrivateShow: false,
  isShowSoldOut: false,
  selectedShowTimeIds: [],
  startDate: "",
  showTime: "",
  arrivalTime: "",
}

type AddShowValidationErrors = Partial<
  Record<
    | "headlinerId"
    | "selectedShowTimeIds"
    | "dayOfShowFee"
    | "phoneFee"
    | "walkupFee"
    | "webFee",
    string
  >
>

type ShowDetailCheckboxField =
  | "dinner"
  | "noPasses"
  | "vipSeating"
  | "hub"
  | "assignTable"
  | "showOnWeb"

const showDetailCheckboxes: { field: ShowDetailCheckboxField; label: string }[] = [
  { field: "dinner", label: "Dinner" },
  { field: "noPasses", label: "No Passes" },
  { field: "vipSeating", label: "VIP Seating" },
  { field: "hub", label: "Hub" },
  { field: "assignTable", label: "Assign Table" },
  { field: "showOnWeb", label: "Show On Web" },
]

const editOtherCheckboxes: {
  field: keyof AddShowFormValues
  label: string
  ageFlag?: "Y"
}[] = [
    { field: "dinner", label: "Dinner" },
    { field: "noPasses", label: "No Passes" },
    { field: "vipSeating", label: "VIP Seating" },
    { field: "ageRestriction", label: "21 and Over", ageFlag: "Y" },
    { field: "hub", label: "Hub" },
    { field: "isShowSoldOut", label: "Show Sold Out" },
    { field: "showOnWeb", label: "Show On Web" },
    { field: "preSalePrivateShow", label: "Pre-sale Private Show" },
  ]

const AGE_RESTRICTION_NOTE =
  "Note: Select minimum age [ Blank = Do not show age on web, A = All ages, Y = Over 21, N = Over 18, S = Special case set min age ]"

type PerformerSearchField =
  | "headlinerId"
  | "headliner2Id"
  | "featureId"
  | "feature2Id"
  | "openerId"

function normalizePerformerName(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase()
}

function resolveInitialHeadlinerId(
  performers: PerformerOption[],
  initialEvent: CalendarEvent | null | undefined
) {
  if (!initialEvent) {
    return ""
  }

  if (initialEvent.comicId) {
    const directMatch = performers.find(
      (performer) => performer.id === initialEvent.comicId
    )

    if (directMatch) {
      return directMatch.id
    }
  }

  const candidateNames = [initialEvent.performer, initialEvent.title]
    .filter(Boolean)
    .map(normalizePerformerName)

  const nameMatch = performers.find((performer) =>
    candidateNames.includes(normalizePerformerName(performer.name))
  )

  return nameMatch?.id ?? ""
}

function getAddShowValidationErrors(
  formValues: AddShowFormValues
): AddShowValidationErrors {
  const errors: AddShowValidationErrors = {}

  if (!formValues.headlinerId) {
    errors.headlinerId = "Headliner is required."
  }

  if (formValues.selectedShowTimeIds.length === 0) {
    errors.selectedShowTimeIds = "Select at least one show time."
  }

  const dayOfShowVal = Number.parseFloat(formValues.dayOfShowFee)
  if (!formValues.dayOfShowFee || !Number.isFinite(dayOfShowVal) || dayOfShowVal <= 0) {
    errors.dayOfShowFee = "Day of Show Fee must be greater than 0."
  }

  const phoneVal = Number.parseFloat(formValues.phoneFee)
  if (!formValues.phoneFee || !Number.isFinite(phoneVal) || phoneVal < 0) {
    errors.phoneFee = "Phone Fee must be 0 or greater."
  }

  const walkupVal = Number.parseFloat(formValues.walkupFee)
  if (!formValues.walkupFee || !Number.isFinite(walkupVal) || walkupVal < 0) {
    errors.walkupFee = "Walkup Fee must be 0 or greater."
  }

  const webVal = Number.parseFloat(formValues.webFee)
  if (!formValues.webFee || !Number.isFinite(webVal) || webVal < 0) {
    errors.webFee = "Web Fee must be 0 or greater."
  }

  return errors
}

function normalizeMinimumNumberValue(value: string, minimum: number) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= minimum ? String(parsed) : String(minimum)
}

/** Normalize API/display times to CalendarTimeControl format (e.g. "7:35 am"). */
function toCalendarTimeControlValue(value: string | null | undefined) {
  const formatted = formatShowTime(value, { seconds: false })
  if (!formatted) {
    return ""
  }

  const normalized = formatted.replace(/\s+/g, " ").trim()
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) {
    return normalized.toLowerCase()
  }

  return `${Number(match[1])}:${match[2]} ${match[3].toLowerCase()}`
}

function parseCalendarTimeParts(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)

  if (!match) {
    return { hour: 0, minute: 0 }
  }

  const period = match[3].toLowerCase()
  const rawHour = Number(match[1])
  const minute = Math.min(59, Math.max(0, Number(match[2] ?? 0)))
  let hour = rawHour % 12

  if (period === "pm") {
    hour += 12
  }

  return { hour, minute }
}

function combineDateAndCalendarTime(dateYmd: string, timeValue: string) {
  const base = dayjs(dateYmd)
  if (!base.isValid()) {
    return new Date()
  }

  const { hour, minute } = parseCalendarTimeParts(timeValue)
  return base.hour(hour).minute(minute).second(0).millisecond(0).toDate()
}



type AddShowDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack?: () => void
  onSave?: (values: AddShowFormValues) => void
  recurrence: RecurrenceState | null
  initialEvent?: CalendarEvent | null
  connectionString: string
  locationId: string
  username: string
  onSaved?: () => void
  title?: string
}

function formatCurrencyValue(value: number | null) {
  return value === null ? "" : value.toFixed(1)
}

function PerformerSelect({
  id,
  label,
  value,
  performers,
  onValueChange,
  onSearchClick,
  error,
}: {
  id: string
  label: string
  value: string
  performers: PerformerOption[]
  onValueChange: (value: string) => void
  onSearchClick?: () => void
  error?: string
}) {
  const REDIRECT_TO_DASHBOARD_STANDUP_MEDIA = "https://dashboard.standup-media.com/"
  return (
    <div className="grid gap-1.5 sm:grid-cols-[7rem_minmax(0,1fr)_auto_auto] sm:items-start sm:gap-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="min-w-0">
        <CalendarSelectControl
          id={id}
          value={value}
          onChange={onValueChange}
          placeholder="Select"
          className={cn(error && "border-destructive ring-2 ring-destructive/20")}
          options={performers.map((performer) => ({
            value: performer.id,
            label: performer.name,
          }))}
        />
      </div>
      <Button onClick={() => window.open(REDIRECT_TO_DASHBOARD_STANDUP_MEDIA, "_blank", "noopener,noreferrer")} type="button" size="icon" className="hidden sm:inline-flex" aria-label={`Add ${label}`}>
        <PlusCircle className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        className="hidden sm:inline-flex"
        aria-label={`Search ${label}`}
        onClick={onSearchClick}
      >
        <Search className="size-4" />
      </Button>
    </div>
  )
}

function FeeInput({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  minimum: number
  error?: boolean
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[auto_3rem] items-center sm:gap-2">
      <Label htmlFor={id} className="shrink-0">
        {label}
      </Label>
      <div className="relative pb-4 sm:pb-0">
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
          autoComplete="off"
          className={cn(
            "h-9 w-full ",
            error && "border-destructive ring-2 ring-destructive/20"
          )}
        />
      </div>
    </div>
  )
}
function AddShowDialogSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading add show form">
      <div className="grid gap-x-10 gap-y-3 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, columnIndex) => (
          <div key={columnIndex} className="space-y-3">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div
                key={`${columnIndex}-${rowIndex}`}
                className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="hidden size-9 sm:block" />
                <Skeleton className="hidden size-9 sm:block" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <fieldset className="rounded-md border p-4">
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-28" />
          ))}
        </div>
        <Skeleton className="mx-auto mt-5 h-4 w-full max-w-2xl" />
      </fieldset>

      <fieldset className="rounded-md border p-4">
        <legend className="px-2 text-sm font-medium">Fees or Recurrence</legend>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-32" />
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="h-64 overflow-hidden border">
        <div className="grid min-w-[52rem] grid-cols-[1.1fr_1.1fr_1.1fr_0.55fr_1.5fr_0.9fr_0.9fr_0.9fr_0.9fr] bg-muted">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="m-2 h-5 rounded-sm" />
          ))}
        </div>
        <div className="min-w-[52rem] space-y-px">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[1.1fr_1.1fr_1.1fr_0.55fr_1.5fr_0.9fr_0.9fr_0.9fr_0.9fr]"
            >
              {Array.from({ length: 9 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} className="m-2 h-6 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ShowTimesTable({
  showTimes,
  selectedShowTimeIds,
  onToggleShowTime,
  showDayLabel = true,
  error,
}: {
  showTimes: ShowTimeOption[]
  selectedShowTimeIds: string[]
  onToggleShowTime: (showTimeId: string) => void
  showDayLabel?: boolean
  error?: string
}) {
  return (
    <div
      className={cn(
        "max-h-[min(14rem,40vh)] overflow-auto border sm:max-h-64",
        error && "border-destructive ring-2 ring-destructive/20"
      )}
    >
      <Table className="min-w-[52rem] border-collapse">
        <TableHeader className="sticky top-0 z-10 bg-muted text-muted-foreground">
          <TableRow>
            <TableHead className="border px-3 py-2 font-semibold">Time</TableHead>
            <TableHead className="border px-3 py-2 font-semibold">Section</TableHead>
            <TableHead className="border px-3 py-2 text-right font-semibold">Price</TableHead>
            <TableHead className="border px-3 py-2 text-right font-semibold">Seats</TableHead>
            <TableHead className="border px-3 py-2 text-center font-semibold">Restrict Show Promo</TableHead>
            <TableHead className="border px-3 py-2 text-center font-semibold">Web</TableHead>
            <TableHead className="border px-3 py-2 text-right font-semibold">Walkup Fee</TableHead>
            <TableHead className="border px-3 py-2 text-right font-semibold">Phone Fee</TableHead>
            <TableHead className="border px-3 py-2 text-right font-semibold">Web Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showTimes.map((showTime) =>
            showTime.sections.map((section, index) => (
              <TableRow key={section.id} className="odd:bg-background even:bg-muted/20">
                {index === 0 ? (
                  <TableCell className="border px-3 py-2 align-middle" rowSpan={showTime.sections.length}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedShowTimeIds.includes(showTime.id)}
                        onCheckedChange={() => onToggleShowTime(showTime.id)}
                        aria-label={`Toggle ${showDayLabel ? `${showTime.dayLabel} ` : ""}${showTime.timeRange}`}
                      />
                      <div className="text-xs leading-5">
                        {showDayLabel ? (
                          <p className="font-medium text-foreground">{showTime.dayLabel}</p>
                        ) : null}
                        <p>{showTime.timeRange}</p>
                      </div>
                    </div>
                  </TableCell>
                ) : null}
                <TableCell className="border px-3 py-2">{section.section}</TableCell>
                <TableCell className="border px-3 py-2 text-right">{section.price.toFixed(2)}</TableCell>
                <TableCell className="border px-3 py-2 text-right">{section.seats}</TableCell>
                <TableCell className="border px-3 py-2 text-center">{section.restrictShowPromo ? "Y" : "N"}</TableCell>
                <TableCell className="border px-3 py-2 text-center">{section.web ? "Y" : "N"}</TableCell>
                <TableCell className="border px-3 py-2 text-right">{formatCurrencyValue(section.walkupFee)}</TableCell>
                <TableCell className="border px-3 py-2 text-right">{formatCurrencyValue(section.phoneFee)}</TableCell>
                <TableCell className="border px-3 py-2 text-right">{formatCurrencyValue(section.webFee)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function AddShowDialog({
  open,
  onOpenChange,
  onBack,
  onSave,
  recurrence,
  initialEvent = null,
  connectionString,
  locationId,
  username,
  onSaved,
  title = "Add Show",
}: AddShowDialogProps) {
  const [dialogData, setDialogData] = useState<AddShowDialogData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<AddShowFormValues>(emptyFormValues)
  const [isShowDetailsVisible, setIsShowDetailsVisible] = useState(false)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [verifyRows, setVerifyRows] = useState<ApiDefaultShowSection[]>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [performers, setPerformers] = useState<PerformerOption[]>([])
  const [isComedianSearchOpen, setIsComedianSearchOpen] = useState(false)
  const [searchTargetField, setSearchTargetField] =
    useState<PerformerSearchField | null>(null)

  const isEditMode = Boolean(initialEvent?.showId)
  const showId = initialEvent?.showId || ""

  const {
    data: showData,
    isFetching: isFetchingShowData,
  } = useGetShowDataQuery(
    { connectionName: connectionString, showId },
    { skip: !open || !isEditMode || !connectionString || !showId }
  )

  const {
    data: showProperties,
    isFetching: isFetchingShowProperties,
  } = useGetShowPropertiesQuery(
    { connectionName: connectionString, showId },
    { skip: !open || !isEditMode || !connectionString || !showId }
  )

  const isShowDataReady = !isEditMode || (showData != null && showProperties != null)
  const isShowDataLoading = isEditMode && (isFetchingShowData || isFetchingShowProperties)

  const [updateShow] = useUpdateShowMutation()

  useEffect(() => {
    if (!open || !recurrence || !connectionString || !locationId) {
      return
    }

    let isActive = true
    setIsLoading(true)
    setIsShowDetailsVisible(false)
    setErrorMessage(null)
    setIsVerifyOpen(false)
    setVerifyRows([])
    setHasSubmitted(false)

    fetchAddShowDialogData({
      connectionString,
      locationId,
      recurrence,
    })
      .then((data) => {
        if (!isActive) {
          return
        }

        setDialogData(data)
        setPerformers(data.performers)
      })
      .catch((error: Error) => {
        if (isActive) {
          setErrorMessage(error.message || "Unable to load add show data.")
          setDialogData(null)
          setPerformers([])
        }
      })
      .finally(() => {
        if (isActive && !isShowDataLoading) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [open, recurrence, connectionString, locationId, isShowDataLoading]) // removed initialEvent

  useEffect(() => {
    if (!open || !dialogData || !isShowDataReady) return

    if (isEditMode && showData && showData.length > 0 && showProperties) {
      const mainShowData = showData[0]
      setFormValues({
        ...emptyFormValues,
        headlinerId: mainShowData.Headliner ?? resolveInitialHeadlinerId(dialogData.performers, initialEvent),
        featureId: mainShowData.Feature ?? "",
        openerId: mainShowData.Opener ?? "",
        headliner2Id: mainShowData.Headliner2 ?? "",
        feature2Id: mainShowData.Feature2 ?? "",
        specialNote: mainShowData.specialnotes ?? "",
        dinner: mainShowData.ShowDinner === "Y",
        noPasses: mainShowData.NoPasses === "Y",
        vipSeating: mainShowData.VIP === "Y",
        hub: mainShowData.Hub === "Y",
        showOnWeb: mainShowData.IsShowAvailableOnWeb,
        dayOfShowFee: normalizeMinimumNumberValue(String(mainShowData.DayOfShowCharge), 1),
        phoneFee: normalizeMinimumNumberValue(String(mainShowData.PhoneCharge), 0),
        walkupFee: normalizeMinimumNumberValue(String(mainShowData.WalkupCharge), 0),
        webFee: normalizeMinimumNumberValue(String(mainShowData.WebCharge), 0),
        ageRestriction: parseAgeRestrictionValue(showProperties.Over21),
        minAge:
          showProperties.MinAge?.trim() ||
          mainShowData.MinAge?.trim() ||
          "",
        useSectionFee: mainShowData.IsUseSectionFee,
        preSalePrivateShow: mainShowData.IsPrivateShow,
        isShowSoldOut: mainShowData.IsShowSolidOut,
        selectedShowTimeIds: ["edit-show-time"],
        startDate: dayjs(mainShowData.ShowDate).isValid()
          ? dayjs(mainShowData.ShowDate).format("YYYY-MM-DD")
          : "",
        showTime: toCalendarTimeControlValue(mainShowData.ShowTim),
        arrivalTime: toCalendarTimeControlValue(mainShowData.ShowArrival),
      })
      setIsLoading(false)
    } else if (!isEditMode) {
      setFormValues({
        ...emptyFormValues,
        headlinerId: resolveInitialHeadlinerId(dialogData.performers, initialEvent),
        selectedShowTimeIds: dialogData.showTimes
          .filter((showTime) => showTime.enabled)
          .map((showTime) => showTime.id),
      })
      setIsLoading(false)
    }
  }, [open, dialogData, isEditMode, showData, showProperties, isShowDataReady, initialEvent])

  let showTimes = dialogData?.showTimes ?? []
  const ageRestrictions = dialogData?.ageRestrictions ?? []

  if (isEditMode && showData && showData.length > 0) {
    const mainShowData = showData[0]
    const arrivalTime = formValues.arrivalTime || toCalendarTimeControlValue(mainShowData.ShowArrival)
    const showTime = formValues.showTime || toCalendarTimeControlValue(mainShowData.ShowTim)

    showTimes = [
      {
        id: "edit-show-time",
        dayLabel: dayjs(mainShowData.ShowDate).format("dddd"),
        timeRange:
          arrivalTime && showTime
            ? `${arrivalTime} - ${showTime}`
            : arrivalTime || showTime || "",
        enabled: true,
        sections: showData.map(row => ({
          id: row.ShowDetID,
          section: row.Section ?? "",
          price: row.ShowPrice ?? 0,
          seats: row.ShowNon ?? 0,
          restrictShowPromo: row.ShowDetRestrictPromo === "Y",
          web: row.Web === "Y",
          walkupFee: row.ShowDefDetwalkupsvc ?? 0,
          phoneFee: row.ShowDefDetphonesvc ?? 0,
          webFee: row.ShowDefDetwebsvc ?? 0,
        }))
      }
    ]
  }

  const selectedCount = useMemo(
    () => formValues.selectedShowTimeIds.length,
    [formValues.selectedShowTimeIds.length]
  )

  const validationErrors = useMemo(
    () => getAddShowValidationErrors(formValues),
    [formValues]
  )

  const visibleValidationErrors = hasSubmitted ? validationErrors : {}
  const hasErrors = Object.keys(validationErrors).length > 0

  function updateField<K extends keyof AddShowFormValues>(
    field: K,
    value: AddShowFormValues[K]
  ) {
    setErrorMessage(null)
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  function openComedianSearch(field: PerformerSearchField) {
    setSearchTargetField(field)
    setIsComedianSearchOpen(true)
  }

  function handleComedianSearchSelect(comedian: ComedianSearchSelection) {
    if (!searchTargetField) {
      return
    }

    updateField(searchTargetField, comedian.id)
    setPerformers((current) => {
      if (current.some((performer) => performer.id === comedian.id)) {
        return current
      }

      return [...current, { id: comedian.id, name: comedian.name }]
    })
    setSearchTargetField(null)
  }

  function toggleShowTime(showTimeId: string) {
    setErrorMessage(null)
    setFormValues((current) => ({
      ...current,
      selectedShowTimeIds: current.selectedShowTimeIds.includes(showTimeId)
        ? current.selectedShowTimeIds.filter((id) => id !== showTimeId)
        : [...current.selectedShowTimeIds, showTimeId],
    }))
  }


  function handleSave() {
    if (!dialogData || !recurrence) {
      return
    }

    let filteredRows: ApiDefaultShowSection[] = []

    if (isEditMode && showData) {
      filteredRows = showData.map(row => ({
        ShowId: row.ShowId,
        ShowDetID: row.ShowDetID,
        ShowDefID: "",
        ShowDay: "",
        WeekDay: 0,
        ShowDate: row.ShowDate,
        ShowArrival: row.ShowArrival,
        ShowTim: row.ShowTim,
        Section: row.Section,
        ShowPrice: row.ShowPrice,
        ShowNon: row.ShowNon,
        ShowSmoking: null,
        Web: row.Web,
        Hub: null,
        NoPasses: null,
        VIP: null,
        Over21: null,
        ShowDinner: null,
        ShowDetRestrictPromo: row.ShowDetRestrictPromo,
        ShowDefDetwalkupsvc: row.ShowDefDetwalkupsvc,
        ShowDefDetphonesvc: row.ShowDefDetphonesvc,
        ShowDefDetwebsvc: row.ShowDefDetwebsvc,
      }))
    } else {
      filteredRows = buildSaveShowFilterList(
        dialogData.sectionRows,
        formValues.selectedShowTimeIds
      )
    }

    const currentValidationErrors = getAddShowValidationErrors(formValues)
    const firstFieldError = Object.values(currentValidationErrors).find(Boolean)
    if (firstFieldError) {
      setHasSubmitted(true)
      setErrorMessage(null)
      return
    }

    const validationError = validateAddShowForm(formValues, filteredRows)

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setErrorMessage(null)
    setVerifyRows(filteredRows.map((row) => ({ ...row })))

    if (isEditMode) {
      handleConfirmSave(formValues, filteredRows)
    } else {
      setIsVerifyOpen(true)
    }
  }

  async function handleConfirmSave(
    valuesToSave: AddShowFormValues = formValues,
    rowsToSave: ApiDefaultShowSection[] = verifyRows
  ) {
    if (!dialogData || !recurrence) {
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      if (isEditMode) {
        if (!initialEvent) throw new Error("No initial event")
        const mainShowData = showData?.[0]
        if (!mainShowData) throw new Error("No show data available")

        const reqPayload = buildUpdateShowRequest({
          connectionString,
          locationId,
          username,
          showDate: combineDateAndCalendarTime(
            valuesToSave.startDate,
            valuesToSave.showTime
          ),
          showArrivalTime: combineDateAndCalendarTime(
            valuesToSave.startDate,
            valuesToSave.arrivalTime
          ),
          form: valuesToSave,
          sectionRows: rowsToSave,
          sectionLookups: dialogData.sectionLookups,
          showId: showId,
        })

        await updateShow(reqPayload).unwrap()
      } else {
        const saved = await saveShowsWithRecurrence({
          connectionString,
          locationId,
          username,
          recurrence,
          form: valuesToSave,
          sectionRows: rowsToSave,
          sectionLookups: dialogData.sectionLookups,
          saveShow: saveShowRequest,
        })

        if (!saved) {
          throw new Error("Unable to save show.")
        }
      }

      onSave?.(valuesToSave)
      onSaved?.()
      setIsVerifyOpen(false)
      onOpenChange(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save show."
      )
    } finally {
      setIsSaving(false)
    }
  }

  function handleVerifyRowsChange(rows: ApiDefaultShowSection[]) {
    setVerifyRows(rows)

    if (!dialogData) {
      return
    }

    const priceByDetId = new Map(
      rows.map((row) => [row.ShowDetID, row.ShowPrice])
    )

    setDialogData({
      ...dialogData,
      sectionRows: dialogData.sectionRows.map((row) =>
        priceByDetId.has(row.ShowDetID)
          ? { ...row, ShowPrice: priceByDetId.get(row.ShowDetID) ?? row.ShowPrice }
          : row
      ),
      showTimes: dialogData.showTimes.map((showTime) => ({
        ...showTime,
        sections: showTime.sections.map((section) =>
          priceByDetId.has(section.id)
            ? {
              ...section,
              price: priceByDetId.get(section.id) ?? section.price,
            }
            : section
        ),
      })),
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          disableOutsideDismiss
          className={cn(
            "fixed top-[max(0.5rem,env(safe-area-inset-top))] right-auto bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-[50%] flex max-h-none w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] translate-x-[-50%] translate-y-0 flex-col overflow-hidden p-0 sm:top-[50%] sm:bottom-auto sm:max-h-[min(90dvh,48rem)] sm:w-[calc(100vw-2rem)] sm:max-w-6xl sm:translate-y-[-50%]"
          )}
        >
          <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12 sm:px-5 sm:py-4">
            <div className="flex items-center gap-2">
              {onBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="size-8 shrink-0"
                  aria-label="Back to recurrence"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              ) : null}
              <DialogTitle className={cn("text-base sm:text-lg flex w-full items-center justify-between flex-wrap gap-x-2")}>
                {title}
                <span className={cn(`${hasSubmitted && hasErrors && "mr-2 sm:mr-8 text-xs border border-red-600 text-red-600 bg-red-600/10 font-normal p-1.5 rounded-sm"}`)}>{hasSubmitted && hasErrors && "Please fill required fields"}</span>
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
            <div className="space-y-4 sm:space-y-6">
              {errorMessage ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}
              {isLoading ? (
                <AddShowDialogSkeleton />
              ) : (
                <>
                  {isEditMode ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 items-end gap-x-6 gap-y-4">
                      {/* Start Date */}
                      <div className="grid grid-cols-2 col-span-2 sm:col-span-2 min-w-[12rem] flex-1 gap-2">
                        <div className="grid flex-1 col-span-1 gap-2">
                          <Label htmlFor="edit-show-start-date">Start Date</Label>
                          <CalendarDatePickerControl
                            id="edit-show-start-date"
                            value={formValues.startDate}
                            onChange={() => undefined}
                            disabled
                            placeholder="Start date"
                          />
                        </div>
                      </div>

                      {/* Show Time + Arrival Time collapse together on small screens */}
                      <div className="grid grid-cols-2 col-span-2 sm:col-span-2 gap-2">
                        <div className="grid gap-2 min-w-0">
                          <Label htmlFor="edit-show-time">Show Time</Label>
                          <CalendarTimeControl
                            id="edit-show-time"
                            value={formValues.showTime}
                            onChange={(value) => updateField("showTime", value)}
                          />
                        </div>
                        <div className="grid gap-2 min-w-0">
                          <Label htmlFor="edit-show-arrival-time">Arrival Time</Label>
                          <CalendarTimeControl
                            id="edit-show-arrival-time"
                            value={formValues.arrivalTime}
                            onChange={(value) => updateField("arrivalTime", value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-2 pt-3 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-2">
                    <div className="space-y-1">
                      <PerformerSelect
                        id="show-headliner"
                        label="Headliner"
                        value={formValues.headlinerId}
                        performers={performers}
                        onValueChange={(value) => updateField("headlinerId", value)}
                        onSearchClick={() => openComedianSearch("headlinerId")}
                        error={visibleValidationErrors.headlinerId}
                      />
                      <PerformerSelect
                        id="show-feature"
                        label="Feature"
                        value={formValues.featureId}
                        performers={performers}
                        onValueChange={(value) => updateField("featureId", value)}
                        onSearchClick={() => openComedianSearch("featureId")}
                      />
                      <PerformerSelect
                        id="show-opener"
                        label="Opener"
                        value={formValues.openerId}
                        performers={performers}
                        onValueChange={(value) => updateField("openerId", value)}
                        onSearchClick={() => openComedianSearch("openerId")}
                      />
                    </div>

                    <div className="space-y-1">
                      <PerformerSelect
                        id="show-headliner-2"
                        label="Headliner2"
                        value={formValues.headliner2Id}
                        performers={performers}
                        onValueChange={(value) => updateField("headliner2Id", value)}
                        onSearchClick={() => openComedianSearch("headliner2Id")}
                      />
                      <PerformerSelect
                        id="show-feature-2"
                        label="Feature2"
                        value={formValues.feature2Id}
                        performers={performers}
                        onValueChange={(value) => updateField("feature2Id", value)}
                        onSearchClick={() => openComedianSearch("feature2Id")}
                      />
                      <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center">
                        <Label htmlFor="show-special-note">Special Note</Label>
                        <Input
                          id="show-special-note"
                          value={formValues.specialNote}
                          onChange={(event) => updateField("specialNote", event.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {!isEditMode ? (
                    <div>
                      <Button type="button" onClick={() => setIsShowDetailsVisible(!isShowDetailsVisible)}>
                        {isShowDetailsVisible ? "Hide Default" : "Show Default"}
                      </Button>
                    </div>
                  ) : null}

                  {!isEditMode && isShowDetailsVisible ? (
                    <fieldset className="rounded-md border p-3 sm:p-4">
                      <legend className="px-2 text-sm font-medium">Show Details</legend>
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3">
                        {showDetailCheckboxes.map(({ field, label }) => (
                          <div key={field} className="flex items-center gap-2">
                            <Checkbox
                              id={`show-${field}`}
                              checked={formValues[field]}
                              onCheckedChange={(checked) => updateField(field, Boolean(checked))}
                            />
                            <Label htmlFor={`show-${field}`}>{label}</Label>
                          </div>
                        ))}

                        <div className="flex w-full flex-col gap-2 sm:min-w-[16rem] sm:w-auto sm:flex-row sm:items-center">
                          <Label htmlFor="show-age-restriction" className="shrink-0">
                            Age Restrictions
                          </Label>
                          <CalendarSelectControl
                            id="show-age-restriction"
                            value={formValues.ageRestriction}
                            onChange={(value) => {
                              setErrorMessage(null)
                              setFormValues((current) => ({
                                ...current,
                                ageRestriction: value,
                                minAge:
                                  value === "S"
                                    ? current.minAge.trim() || "16"
                                    : current.minAge,
                              }))
                            }}
                            placeholder="Select"
                            className="flex-1"
                            options={ageRestrictions.map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                          />
                          {formValues.ageRestriction === "S" ? (
                            <>
                              <Label htmlFor="show-min-age" className="shrink-0">
                                Min Age:
                              </Label>
                              <Input
                                id="show-min-age"
                                type="number"
                                min={0}
                                value={formValues.minAge}
                                onChange={(event) =>
                                  updateField("minAge", event.target.value)
                                }
                                className="h-9 w-20"
                              />
                            </>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        {AGE_RESTRICTION_NOTE}
                      </p>
                    </fieldset>
                  ) : null}

                  {isEditMode ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                      <span className="text-sm font-medium">Other:</span>
                      {editOtherCheckboxes.map(({ field, label, ageFlag }) => {
                        const checked = ageFlag
                          ? formValues.ageRestriction === ageFlag
                          : Boolean(formValues[field])

                        return (
                          <div key={`${field}-${label}`} className="flex items-center gap-2">
                            <Checkbox
                              id={`edit-${field}-${label}`}
                              checked={checked}
                              onCheckedChange={(isChecked) => {
                                if (ageFlag) {
                                  setErrorMessage(null)
                                  setFormValues((current) => ({
                                    ...current,
                                    ageRestriction: isChecked
                                      ? ageFlag
                                      : current.ageRestriction === ageFlag
                                        ? ""
                                        : current.ageRestriction,
                                  }))
                                  return
                                }

                                updateField(field, Boolean(isChecked) as never)
                              }}
                            />
                            <Label htmlFor={`edit-${field}-${label}`}>{label}</Label>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}

                  <fieldset
                    className={cn(
                      "rounded-md border p-3 sm:p-4",
                      hasSubmitted &&
                      (validationErrors.dayOfShowFee ||
                        validationErrors.phoneFee ||
                        validationErrors.walkupFee ||
                        validationErrors.webFee) &&
                      "border-destructive"
                    )}
                  >
                    <legend
                      className={cn(
                        "px-2 text-sm font-medium",
                        hasSubmitted &&
                        (validationErrors.dayOfShowFee ||
                          validationErrors.phoneFee ||
                          validationErrors.walkupFee ||
                          validationErrors.webFee) &&
                        "text-destructive"
                      )}
                    >
                      {isEditMode ? "Fees or Age" : "Fees or Recurrence"}
                    </legend>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap sm:items-start sm:gap-x-5">
                        <FeeInput
                          id="day-of-show-fee"
                          label="Day Of Show:"
                          value={formValues.dayOfShowFee}
                          onChange={(value) => updateField("dayOfShowFee", value)}
                          minimum={1}
                          error={hasSubmitted && Boolean(validationErrors.dayOfShowFee)}
                        />
                        <FeeInput
                          id="phone-fee"
                          label="Phone:"
                          value={formValues.phoneFee}
                          onChange={(value) => updateField("phoneFee", value)}
                          minimum={0}
                          error={hasSubmitted && Boolean(validationErrors.phoneFee)}
                        />
                        <FeeInput
                          id="walkup-fee"
                          label="Walkup:"
                          value={formValues.walkupFee}
                          onChange={(value) => updateField("walkupFee", value)}
                          minimum={0}
                          error={hasSubmitted && Boolean(validationErrors.walkupFee)}
                        />
                        <FeeInput
                          id="web-fee"
                          label="Web:"
                          value={formValues.webFee}
                          onChange={(value) => updateField("webFee", value)}
                          minimum={0}
                          error={hasSubmitted && Boolean(validationErrors.webFee)}
                        />
                        {isEditMode ? (
                          <div className="flex w-full flex-col gap-2 sm:min-w-[16rem] sm:w-auto sm:flex-row sm:items-center">
                            <Label htmlFor="edit-age-restriction" className="shrink-0">
                              Age Restrictions
                            </Label>
                            <CalendarSelectControl
                              id="edit-age-restriction"
                              value={formValues.ageRestriction}
                              onChange={(value) => {
                                setErrorMessage(null)
                                setFormValues((current) => ({
                                  ...current,
                                  ageRestriction: value,
                                  minAge:
                                    value === "S"
                                      ? current.minAge.trim() || "16"
                                      : current.minAge,
                                }))
                              }}
                              placeholder="Select"
                              className="flex-1"
                              options={ageRestrictions.map((option) => ({
                                value: option.value,
                                label: option.label,
                              }))}
                            />
                            {formValues.ageRestriction === "S" ? (
                              <>
                                <Label htmlFor="edit-min-age" className="shrink-0">
                                  Min Age
                                </Label>
                                <Input
                                  id="edit-min-age"
                                  type="number"
                                  min={0}
                                  value={formValues.minAge}
                                  onChange={(event) =>
                                    updateField("minAge", event.target.value)
                                  }
                                  className="h-9 w-20"
                                />
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="use-section-fee"
                            checked={formValues.useSectionFee}
                            onCheckedChange={(checked) => updateField("useSectionFee", Boolean(checked))}
                          />
                          <Label htmlFor="use-section-fee">Use Section Fee</Label>
                        </div>
                        {!isEditMode ? (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="pre-sale-private-show"
                              checked={formValues.preSalePrivateShow}
                              onCheckedChange={(checked) => updateField("preSalePrivateShow", Boolean(checked))}
                            />
                            <Label htmlFor="pre-sale-private-show">Pre-sale Private Show</Label>
                          </div>
                        ) : null}
                      </div>
                      {isEditMode ? (
                        <p className="text-center text-sm text-muted-foreground">
                          {AGE_RESTRICTION_NOTE}
                        </p>
                      ) : null}
                    </div>
                  </fieldset>

                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={cn(
                        "text-sm",
                        visibleValidationErrors.selectedShowTimeIds
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {selectedCount} show time{selectedCount === 1 ? "" : "s"} selected
                    </p>
                  </div>
                  {visibleValidationErrors.selectedShowTimeIds ? (
                    <p className="text-sm text-destructive">
                      {visibleValidationErrors.selectedShowTimeIds}
                    </p>
                  ) : null}

                  <ShowTimesTable
                    showTimes={showTimes}
                    selectedShowTimeIds={formValues.selectedShowTimeIds}
                    onToggleShowTime={toggleShowTime}
                    showDayLabel={!isEditMode}
                    error={visibleValidationErrors.selectedShowTimeIds}
                  />
                </>
              )}
            </div>
          </div>

          <DialogFooter className="!flex-row flex-wrap justify-start gap-2 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4">
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              onClick={handleSave}
              disabled={isLoading || isSaving || !dialogData}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SaveVerifyDialog
        open={isVerifyOpen}
        onOpenChange={setIsVerifyOpen}
        rows={verifyRows}
        onRowsChange={handleVerifyRowsChange}
        onConfirm={() => handleConfirmSave()}
        isSaving={isSaving}
      />

      <ComedianSearchDialog
        open={isComedianSearchOpen}
        onOpenChange={(nextOpen) => {
          setIsComedianSearchOpen(nextOpen)
          if (!nextOpen) {
            setSearchTargetField(null)
          }
        }}
        connectionString={connectionString}
        locationId={locationId}
        onSelect={handleComedianSearchSelect}
      />
    </>
  )
}








