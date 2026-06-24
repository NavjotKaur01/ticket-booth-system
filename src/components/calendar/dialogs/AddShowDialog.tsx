import { ArrowLeft, PlusCircle, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAddShowDialogData } from "../service/mockAddShow.service"
import type {
  AddShowDialogData,
  AddShowFormValues,
  PerformerOption,
  ShowTimeOption,
} from "@/types/calendar-show"

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
  dayOfShowFee: "1",
  phoneFee: "0.00",
  walkupFee: "0.00",
  webFee: "0.00",
  useSectionFee: false,
  preSalePrivateShow: false,
  selectedShowTimeIds: [],
}
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

type AddShowDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack?: () => void
  onSave?: (values: AddShowFormValues) => void
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
}: {
  id: string
  label: string
  value: string
  performers: PerformerOption[]
  onValueChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto_auto] sm:items-center">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="h-9 w-full bg-background">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="max-h-56 overflow-y-auto">
          {performers.map((performer) => (
            <SelectItem key={performer.id} value={performer.id}>
              {performer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="icon" className="hidden sm:inline-flex" aria-label={`Add ${label}`}>
        <PlusCircle className="size-4" />
      </Button>
      <Button type="button" size="icon" className="hidden sm:inline-flex" aria-label={`Search ${label}`}>
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
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="shrink-0">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-24"
      />
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
}: {
  showTimes: ShowTimeOption[]
  selectedShowTimeIds: string[]
  onToggleShowTime: (showTimeId: string) => void
}) {
  return (
    <div className="max-h-64 overflow-auto border">
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
                        aria-label={`Toggle ${showTime.dayLabel} ${showTime.timeRange}`}
                      />
                      <div className="text-xs leading-5">
                        <p className="font-medium text-foreground">{showTime.dayLabel}</p>
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

export default function AddShowDialog({ open, onOpenChange, onBack, onSave }: AddShowDialogProps) {
  const [dialogData, setDialogData] = useState<AddShowDialogData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formValues, setFormValues] = useState<AddShowFormValues>(emptyFormValues)
  const [isShowDetailsVisible, setIsShowDetailsVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    let isActive = true
    setIsLoading(true)
    setIsShowDetailsVisible(false)

    getAddShowDialogData()
      .then((data) => {
        if (!isActive) {
          return
        }

        setDialogData(data)
        setFormValues({
          ...emptyFormValues,
          selectedShowTimeIds: data.showTimes
            .filter((showTime) => showTime.enabled)
            .map((showTime) => showTime.id),
        })
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [open])

  const performers = dialogData?.performers ?? []
  const showTimes = dialogData?.showTimes ?? []
  const ageRestrictions = dialogData?.ageRestrictions ?? []

  const selectedCount = useMemo(
    () => formValues.selectedShowTimeIds.length,
    [formValues.selectedShowTimeIds.length]
  )

  function updateField<K extends keyof AddShowFormValues>(
    field: K,
    value: AddShowFormValues[K]
  ) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  function toggleShowTime(showTimeId: string) {
    setFormValues((current) => ({
      ...current,
      selectedShowTimeIds: current.selectedShowTimeIds.includes(showTimeId)
        ? current.selectedShowTimeIds.filter((id) => id !== showTimeId)
        : [...current.selectedShowTimeIds, showTimeId],
    }))
  }


  function handleSave() {
    onSave?.(formValues)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-6xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            {onBack ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="size-8"
                aria-label="Back to recurrence"
              >
                <ArrowLeft className="size-4" />
              </Button>
            ) : null}
            <DialogTitle className="text-lg">Add Show</DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(100vh-10rem)] space-y-6 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <AddShowDialogSkeleton />
          ) : (
            <>
              <div className="grid gap-x-10 gap-y-3 lg:grid-cols-2">
                <div className="space-y-3">
                  <PerformerSelect
                    id="show-headliner"
                    label="Headliner"
                    value={formValues.headlinerId}
                    performers={performers}
                    onValueChange={(value) => updateField("headlinerId", value)}
                  />
                  <PerformerSelect
                    id="show-feature"
                    label="Feature"
                    value={formValues.featureId}
                    performers={performers}
                    onValueChange={(value) => updateField("featureId", value)}
                  />
                  <PerformerSelect
                    id="show-opener"
                    label="Opener"
                    value={formValues.openerId}
                    performers={performers}
                    onValueChange={(value) => updateField("openerId", value)}
                  />
                </div>

                <div className="space-y-3">
                  <PerformerSelect
                    id="show-headliner-2"
                    label="Headliner2"
                    value={formValues.headliner2Id}
                    performers={performers}
                    onValueChange={(value) => updateField("headliner2Id", value)}
                  />
                  <PerformerSelect
                    id="show-feature-2"
                    label="Feature2"
                    value={formValues.feature2Id}
                    performers={performers}
                    onValueChange={(value) => updateField("feature2Id", value)}
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

              {!isShowDetailsVisible ? (
                <div>
                  <Button type="button" onClick={() => setIsShowDetailsVisible(true)}>
                    Show Details
                  </Button>
                </div>
              ) : (
                <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Show Details</legend>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
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

                  <div className="flex min-w-[16rem] items-center gap-2">
                    <Label htmlFor="show-age-restriction" className="shrink-0">
                      Age Restrictions
                    </Label>
                    <Select
                      value={formValues.ageRestriction}
                      onValueChange={(value) =>
                        updateField("ageRestriction", value === "select" ? "" : value)
                      }
                    >
                      <SelectTrigger id="show-age-restriction" className="h-9 flex-1 bg-background">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56 overflow-y-auto">
                        <SelectItem value="select">Select</SelectItem>
                        {ageRestrictions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Note: Select minimum age [ Blank = Do not show age on web, A = All ages, Y = Over 21, N = Over 18, S = Special case set min age ]
                </p>
              </fieldset>

              )}
              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Fees or Recurrence</legend>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <FeeInput
                    id="day-of-show-fee"
                    label="Day Of Show:"
                    value={formValues.dayOfShowFee}
                    onChange={(value) => updateField("dayOfShowFee", value)}
                  />
                  <FeeInput
                    id="phone-fee"
                    label="Phone:"
                    value={formValues.phoneFee}
                    onChange={(value) => updateField("phoneFee", value)}
                  />
                  <FeeInput
                    id="walkup-fee"
                    label="Walkup:"
                    value={formValues.walkupFee}
                    onChange={(value) => updateField("walkupFee", value)}
                  />
                  <FeeInput
                    id="web-fee"
                    label="Web:"
                    value={formValues.webFee}
                    onChange={(value) => updateField("webFee", value)}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="use-section-fee"
                      checked={formValues.useSectionFee}
                      onCheckedChange={(checked) => updateField("useSectionFee", Boolean(checked))}
                    />
                    <Label htmlFor="use-section-fee">Use Section Fee</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pre-sale-private-show"
                      checked={formValues.preSalePrivateShow}
                      onCheckedChange={(checked) => updateField("preSalePrivateShow", Boolean(checked))}
                    />
                    <Label htmlFor="pre-sale-private-show">Pre-sale Private Show</Label>
                  </div>
                </div>
              </fieldset>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {selectedCount} show time{selectedCount === 1 ? "" : "s"} selected
                </p>
              </div>

              <ShowTimesTable
                showTimes={showTimes}
                selectedShowTimeIds={formValues.selectedShowTimeIds}
                onToggleShowTime={toggleShowTime}
              />
            </>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4 sm:justify-start">
          <Button type="button" onClick={handleSave} disabled={isLoading || !dialogData}>
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



