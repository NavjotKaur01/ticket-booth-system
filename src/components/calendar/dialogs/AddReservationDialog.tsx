import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, ContactRound } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import CalendarDatePickerControl, {
  canNavigateToPreviousDate,
} from "../controls/CalendarDatePickerControl"
import CalendarSelectControl from "../controls/CalendarSelectControl"
import { PhoneInputGroup } from "@/components/forms/phone-input-group"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import type { CalendarEvent } from "@/data/calendarEvents"
import { AddCustomerDialog } from "@/features/customers/add-customer-dialog"
import { ComicInfoDialog } from "@/features/reservations/comic-info-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import type { CustomerFormValues } from "@/types/customer-form"

import {
  calculateAddReservationTotals,
  createAddReservationFormValues,
  getAddReservationDialogData,
  type AddReservationDialogData,
  type AddReservationFormValues,
} from "../service/addReservation.service"

type AddReservationDialogProps = {
  open: boolean
  event: CalendarEvent | null
  onOpenChange: (open: boolean) => void
  onContinue?: (values: AddReservationFormValues) => void
}

const SUCCESS_BUTTON_CLASS =
  "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
const ACCENT_BUTTON_CLASS =
  "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"

const FIELD_ROW_CLASS =
  "grid gap-2 sm:grid-cols-[minmax(6rem,auto)_minmax(0,1fr)] sm:items-center"
const COMPACT_INPUT = "h-9"

function AddReservationSkeleton() {
  return (
    <div className="space-y-5 px-5 py-5" aria-label="Loading add reservation form">
      {Array.from({ length: 5 }).map((_, index) => (
        <fieldset key={index} className="rounded-md border p-4">
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-9 w-28" />
          </div>
        </fieldset>
      ))}
    </div>
  )
}

function MoneyField({
  id,
  label,
  value,
}: {
  id: string
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-[8.5rem] flex-1 items-center gap-2">
      <Label htmlFor={id} className="shrink-0 text-sm">
        {label}
      </Label>
      <Input id={id} value={value} readOnly className={cn(COMPACT_INPUT, "bg-muted/40")} />
    </div>
  )
}

export default function AddReservationDialog({
  open,
  event,
  onOpenChange,
  onContinue,
}: AddReservationDialogProps) {
  const [dialogData, setDialogData] = useState<AddReservationDialogData | null>(null)
  const [formValues, setFormValues] = useState<AddReservationFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isComicInfoOpen, setIsComicInfoOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const { connectionName, locationId, username } = useAppSession()

  useEffect(() => {
    if (!open) {
      setIsComicInfoOpen(false)
      setIsAddCustomerOpen(false)
    }
  }, [open])

  useEffect(() => {
    if (!open || !event) {
      return
    }

    let isCurrent = true

    setIsLoading(true)
    getAddReservationDialogData(event)
      .then((data) => {
        if (isCurrent) {
          setDialogData(data)
          setFormValues(createAddReservationFormValues(data))
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [event, open])

  function updateField<K extends keyof AddReservationFormValues>(
    field: K,
    value: AddReservationFormValues[K]
  ) {
    setFormValues((current) => (current ? { ...current, [field]: value } : current))
  }

  function updateCustomerField(field: keyof AddReservationFormValues["customer"], value: string) {
    setFormValues((current) =>
      current
        ? {
            ...current,
            customer: {
              ...current.customer,
              [field]: value,
            },
          }
        : current
    )
  }

  function shiftShowDate(direction: -1 | 1) {
    if (!formValues) {
      return
    }

    const nextDate = dayjs(formValues.showDate).add(direction, "day")

    if (direction < 0 && nextDate.startOf("day").isBefore(dayjs().startOf("day"))) {
      return
    }

    updateField("showDate", nextDate.format("YYYY-MM-DD"))
  }

  function handleCalculateTotal() {
    if (!formValues || !dialogData) {
      return
    }

    const totals = calculateAddReservationTotals(formValues, dialogData.sectionOptions)
    updateField("totals", totals)
  }

  function applySavedCustomer(customer: CustomerFormValues) {
    setFormValues((current) =>
      current
        ? {
            ...current,
            customer: {
              lastName: customer.lastName,
              firstName: customer.firstName,
              email: customer.email,
              phone: { ...customer.phone },
            },
          }
        : current
    )
  }

  function handleClearSearchCriteria() {
    if (!formValues) {
      return
    }

    updateField("searchType", "customer")
    setFormValues((current) =>
      current
        ? {
            ...current,
            customer: {
              lastName: "",
              firstName: "",
              email: "",
              phone: { area: "", prefix: "", line: "" },
            },
          }
        : current
    )
  }

  function handleContinue() {
    if (formValues) {
      onContinue?.(formValues)
    }

    onOpenChange(false)
  }

  const headerTitle = dialogData
    ? `Add Reservation :- ${dialogData.performer}    ${dialogData.headerDateLabel}`
    : "Add Reservation"

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && (isComicInfoOpen || isAddCustomerOpen)) {
            return
          }
          onOpenChange(nextOpen)
        }}
      >
      <DialogContent
        disableOutsideDismiss
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-6xl"
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-lg">{headerTitle}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading || !formValues || !dialogData ? (
            <AddReservationSkeleton />
          ) : (
            <div className="space-y-5 px-5 py-5">
              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Show Details</legend>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                  <div className="flex min-w-[14rem] flex-1 items-end gap-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="reservation-show-date">Show Date</Label>
                      <div className="flex items-center gap-2">
                        <CalendarDatePickerControl
                          id="reservation-show-date"
                          value={formValues.showDate}
                          onChange={(value) => updateField("showDate", value)}
                          disablePastDates
                          className="min-w-0 flex-1"
                        />
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Previous show date"
                            disabled={!canNavigateToPreviousDate(formValues.showDate, true)}
                            onClick={() => shiftShowDate(-1)}
                          >
                            <ChevronLeft className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Next show date"
                            onClick={() => shiftShowDate(1)}
                          >
                            <ChevronRight className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid min-w-[12rem] flex-1 gap-2">
                    <Label htmlFor="reservation-show-time">Show Time</Label>
                    <CalendarSelectControl
                      id="reservation-show-time"
                      value={formValues.showTimeId}
                      onChange={(value) => updateField("showTimeId", value)}
                      placeholder="Select show time"
                      options={dialogData.showTimeOptions.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                    />
                  </div>

                  <div className="grid min-w-[16rem] flex-[1.5] gap-2">
                    <Label htmlFor="reservation-section">Section</Label>
                    <CalendarSelectControl
                      id="reservation-section"
                      value={formValues.sectionId}
                      onChange={(value) => updateField("sectionId", value)}
                      placeholder="Select section"
                      options={dialogData.sectionOptions.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                    />
                  </div>

                  <Button
                    type="button"
                    className={cn(COMPACT_INPUT, SUCCESS_BUTTON_CLASS)}
                    onClick={() => setIsComicInfoOpen(true)}
                  >
                    Comic Info
                  </Button>
                </div>
              </fieldset>

              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Reservation Details</legend>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                    <div className="grid min-w-[10rem] gap-2">
                      <Label htmlFor="reservation-origin">Origin</Label>
                      <CalendarSelectControl
                        id="reservation-origin"
                        value={formValues.originId}
                        onChange={(value) => updateField("originId", value)}
                        placeholder="Select origin"
                        options={dialogData.originOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                      />
                    </div>

                    <div className="grid min-w-[6rem] gap-2">
                      <Label htmlFor="reservation-party">Party</Label>
                      <Input
                        id="reservation-party"
                        type="number"
                        min={0}
                        value={formValues.party}
                        onChange={(changeEvent) => updateField("party", changeEvent.target.value)}
                        className={cn(COMPACT_INPUT, "w-20")}
                      />
                    </div>

                    <div className="grid min-w-[10rem] gap-2">
                      <Label htmlFor="reservation-promo">Promo</Label>
                      <CalendarSelectControl
                        id="reservation-promo"
                        value={formValues.promoId}
                        onChange={(value) => updateField("promoId", value)}
                        placeholder="Select promo"
                        options={dialogData.promoOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                      />
                    </div>

                    <div className="grid min-w-[6rem] gap-2">
                      <Label htmlFor="reservation-passes">Passes</Label>
                      <Input
                        id="reservation-passes"
                        type="number"
                        min={0}
                        value={formValues.passes}
                        onChange={(changeEvent) => updateField("passes", changeEvent.target.value)}
                        className={cn(COMPACT_INPUT, "w-20")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <MoneyField id="reservation-subtotal" label="Subtotal" value={formValues.totals.subtotal} />
                    <MoneyField
                      id="reservation-service-charge"
                      label="Service Charge"
                      value={formValues.totals.serviceCharge}
                    />
                    <MoneyField id="reservation-discount" label="Discount" value={formValues.totals.discount} />
                    <MoneyField id="reservation-taxes" label="Taxes" value={formValues.totals.taxes} />
                    <MoneyField id="reservation-total" label="Total" value={formValues.totals.total} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="reservation-dinner"
                        checked={formValues.dinner}
                        onCheckedChange={(checked) => updateField("dinner", Boolean(checked))}
                      />
                      <Label htmlFor="reservation-dinner">Dinner</Label>
                    </div>
                    <Button
                      type="button"
                      className={SUCCESS_BUTTON_CLASS}
                      onClick={handleCalculateTotal}
                    >
                      Calculate Total
                    </Button>
                  </div>
                </div>
              </fieldset>

              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Customer Details</legend>
                <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                  <div className={FIELD_ROW_CLASS}>
                    <Label htmlFor="reservation-last-name">Last Name</Label>
                    <Input
                      id="reservation-last-name"
                      value={formValues.customer.lastName}
                      onChange={(changeEvent) => updateCustomerField("lastName", changeEvent.target.value)}
                      className={COMPACT_INPUT}
                    />
                  </div>
                  <div className={FIELD_ROW_CLASS}>
                    <Label htmlFor="reservation-first-name">First Name</Label>
                    <Input
                      id="reservation-first-name"
                      value={formValues.customer.firstName}
                      onChange={(changeEvent) => updateCustomerField("firstName", changeEvent.target.value)}
                      className={COMPACT_INPUT}
                    />
                  </div>
                  <div className={FIELD_ROW_CLASS}>
                    <Label>Phone No.</Label>
                    <PhoneInputGroup
                      idPrefix="reservation-phone"
                      value={formValues.customer.phone}
                      onChange={(phone) =>
                        setFormValues((current) =>
                          current ? { ...current, customer: { ...current.customer, phone } } : current
                        )
                      }
                    />
                  </div>
                  <div className={FIELD_ROW_CLASS}>
                    <Label htmlFor="reservation-email">Email</Label>
                    <div className="flex min-w-0 items-center gap-2">
                      <Input
                        id="reservation-email"
                        type="email"
                        value={formValues.customer.email}
                        onChange={(changeEvent) => updateCustomerField("email", changeEvent.target.value)}
                        className={cn(COMPACT_INPUT, "min-w-0 flex-1")}
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        className="size-8 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                        aria-label="Customer profile"
                      >
                        <ContactRound className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Search Criteria</legend>
                <div className="space-y-4">
                  <RadioGroup
                    value={formValues.searchType}
                    onValueChange={(value) =>
                      updateField("searchType", value as AddReservationFormValues["searchType"])
                    }
                    className="flex flex-wrap items-center gap-x-6 gap-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="customer" id="reservation-search-customer" />
                      <Label htmlFor="reservation-search-customer">Customer</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="business" id="reservation-search-business" />
                      <Label htmlFor="reservation-search-business">Business</Label>
                    </div>
                  </RadioGroup>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" className={SUCCESS_BUTTON_CLASS}>
                      Search
                    </Button>
                    <Button
                      type="button"
                      className={SUCCESS_BUTTON_CLASS}
                      onClick={() => setIsAddCustomerOpen(true)}
                    >
                      Add Customer
                    </Button>
                    <Button type="button" className={ACCENT_BUTTON_CLASS}>
                      Swipe
                    </Button>
                    <Button type="button" onClick={handleClearSearchCriteria}>
                      Clear
                    </Button>
                  </div>
                </div>
              </fieldset>

              <fieldset className="rounded-md border p-4">
                <legend className="px-2 text-sm font-medium">Notes / Request</legend>
                <Textarea
                  id="reservation-notes"
                  value={formValues.notes}
                  onChange={(changeEvent) => updateField("notes", changeEvent.target.value)}
                  className="min-h-28 resize-y"
                />
              </fieldset>
            </div>
          )}
        </div>

        <DialogFooter className="!flex-row flex-wrap justify-start border-t px-5 py-4">
          <Button type="button" onClick={handleContinue} disabled={!formValues || isLoading}>
            Continue
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <ComicInfoDialog
        open={isComicInfoOpen}
        onOpenChange={setIsComicInfoOpen}
        stageName={dialogData?.performer ?? ""}
        nested
      />

      <AddCustomerDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        nested
        onBack={() => setIsAddCustomerOpen(false)}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={username}
        onSaved={applySavedCustomer}
      />
    </>
  )
}
