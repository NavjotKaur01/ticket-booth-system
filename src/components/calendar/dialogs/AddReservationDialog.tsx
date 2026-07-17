import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, ContactRound } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

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
import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormValues,
} from "@/types/customer-form"

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
      <Input
        id={id}
        value={value}
        readOnly
        tabIndex={-1}
        className={cn(COMPACT_INPUT, "bg-muted/40")}
      />
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
  const partyInputRef = useRef<HTMLInputElement>(null)
  const promoTriggerRef = useRef<HTMLButtonElement>(null)
  const passesInputRef = useRef<HTMLInputElement>(null)
  const lastNameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const hasFocusedInitialInputRef = useRef(false)
  const { connectionName, locationId, username } = useAppSession()

  function resetDialogSession() {
    setDialogData(null)
    setFormValues(null)
    setIsLoading(false)
    setIsComicInfoOpen(false)
    setIsAddCustomerOpen(false)
    hasFocusedInitialInputRef.current = false
  }

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

  useEffect(() => {
    if (!open || isLoading || !formValues || hasFocusedInitialInputRef.current) {
      return
    }

    hasFocusedInitialInputRef.current = true
    focusInitialPartyInput()
  }, [formValues, isLoading, open])

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

  function focusInput(input: HTMLInputElement | null, fallbackId?: string) {
    const target =
      input ??
      (fallbackId
        ? (document.getElementById(fallbackId) as HTMLInputElement | null)
        : null)

    target?.focus({ preventScroll: true })
    target?.select()
  }

  function focusInitialPartyInput() {
    window.setTimeout(() => focusInput(partyInputRef.current, "reservation-party"), 0)
    window.setTimeout(() => {
      const partyInput =
        partyInputRef.current ??
        (document.getElementById("reservation-party") as HTMLInputElement | null)

      if (document.activeElement !== partyInput) {
        focusInput(partyInput, "reservation-party")
      }
    }, 100)
  }

  function focusPassesInput() {
    window.setTimeout(() => focusInput(passesInputRef.current, "reservation-passes"), 0)
  }

  function handlePartyKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault()
      focusInput(emailInputRef.current, "reservation-email")
    }
  }

  function handlePromoKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault()
      focusInput(passesInputRef.current, "reservation-passes")
    }
  }

  function handlePassesKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault()
      focusInput(lastNameInputRef.current, "reservation-last-name")
    }
  }

  function handleEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault()
      focusInput(partyInputRef.current, "reservation-party")
    }
  }

  const headerTitle = dialogData
    ? `Add Reservation :- ${dialogData.performer}    ${dialogData.headerDateLabel}`
    : "Add Reservation"
  const headerSubtitle = dialogData
    ? `${dialogData.performer} ${dialogData.headerDateLabel}`
    : ""
  const addCustomerInitialValues: CustomerFormValues | null = formValues
    ? {
      ...EMPTY_CUSTOMER_FORM,
      lastName: formValues.customer.lastName,
      firstName: formValues.customer.firstName,
      email: formValues.customer.email,
      phone: { ...EMPTY_CUSTOMER_FORM.phone, ...formValues.customer.phone },
    }
    : null

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
          className="flex max-h-[calc(100dvh-1rem)] w-full max-w-[calc(100vw-1rem)] flex-col overflow-hidden sm:max-h-[calc(100dvh-2rem)] sm:max-w-6xl"
          onAfterClose={resetDialogSession}
          onOpenAutoFocus={(autoFocusEvent) => {
            autoFocusEvent.preventDefault()
            focusInitialPartyInput()
          }}
        >
          <DialogHeader className="shrink-0 border-b px-3 py-3 pr-12 sm:px-5 sm:py-4 lg:pr-12">
            <DialogTitle className="text-lg">
              <span className="hidden lg:inline">{headerTitle}</span>
              <span className="block lg:hidden">Add Reservation</span>
              {headerSubtitle ? (
                <span className="mt-1 block text-base font-semibold leading-snug lg:hidden">
                  {headerSubtitle}
                </span>
              ) : null}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading || !formValues || !dialogData ? (
              <AddReservationSkeleton />
            ) : (
              <div className="space-y-4 px-3 py-3 sm:space-y-5 sm:px-5 sm:py-5">
                <fieldset className="rounded-md border p-3 sm:p-4">
                  <legend className="px-2 text-sm font-medium">Show Details</legend>
                  <div className="grid items-end gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-[minmax(13rem,14rem)_minmax(13rem,1fr)_minmax(18rem,1.25fr)_auto]">
                    <div className="min-w-0">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="reservation-show-date">Show Date</Label>
                        <div className="flex items-center gap-2">
                          <CalendarDatePickerControl
                            id="reservation-show-date"
                            value={formValues.showDate}
                            onChange={(value) => updateField("showDate", value)}
                            disablePastDates
                            tabIndex={-1}
                            className="min-w-0 flex-1"
                          />
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              tabIndex={-1}
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
                              tabIndex={-1}
                              aria-label="Next show date"
                              onClick={() => shiftShowDate(1)}
                            >
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid min-w-0 gap-2">
                      <Label htmlFor="reservation-show-time">Show Time</Label>
                      <CalendarSelectControl
                        id="reservation-show-time"
                        value={formValues.showTimeId}
                        onChange={(value) => updateField("showTimeId", value)}
                        placeholder="Select show time"
                        tabIndex={-1}
                        options={dialogData.showTimeOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                      />
                    </div>

                    <div className="grid min-w-0 gap-2 md:col-span-2 lg:col-span-1">
                      <Label htmlFor="reservation-section">Section</Label>
                      <CalendarSelectControl
                        id="reservation-section"
                        value={formValues.sectionId}
                        onChange={(value) => updateField("sectionId", value)}
                        placeholder="Select section"
                        tabIndex={-1}
                        options={dialogData.sectionOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                      />
                    </div>

                    <Button
                      type="button"
                      tabIndex={-1}
                      className={cn(COMPACT_INPUT, "w-full md:w-auto lg:justify-self-end", SUCCESS_BUTTON_CLASS)}
                      onClick={() => setIsComicInfoOpen(true)}
                    >
                      Comic Info
                    </Button>
                  </div>
                </fieldset>

                <fieldset className="rounded-md border p-3 sm:p-4">
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
                          tabIndex={-1}
                          options={dialogData.originOptions.map((option) => ({
                            value: option.id,
                            label: option.label,
                          }))}
                        />
                      </div>

                      <div className="grid min-w-[6rem] gap-2">
                        <Label htmlFor="reservation-party">Party</Label>
                        <Input
                          ref={partyInputRef}
                          id="reservation-party"
                          type="number"
                          autoFocus
                          min={0}
                          value={formValues.party}
                          onChange={(changeEvent) => updateField("party", changeEvent.target.value)}
                          onFocus={(focusEvent) => focusEvent.currentTarget.select()}
                          onKeyDown={handlePartyKeyDown}
                          className={cn(COMPACT_INPUT, "w-20")}
                        />
                      </div>

                      <div className="grid min-w-[10rem] gap-2">
                        <Label htmlFor="reservation-promo">Promo</Label>
                        <CalendarSelectControl
                          id="reservation-promo"
                          value={formValues.promoId}
                          onChange={(value) => {
                            updateField("promoId", value)
                            focusPassesInput()
                          }}
                          placeholder="Select promo"
                          allowClear
                          triggerRef={promoTriggerRef}
                          onTriggerKeyDown={handlePromoKeyDown}
                          options={dialogData.promoOptions.map((option) => ({
                            value: option.id,
                            label: option.label,
                          }))}
                        />
                      </div>

                      <div className="grid min-w-[6rem] gap-2">
                        <Label htmlFor="reservation-passes">Passes</Label>
                        <Input
                          ref={passesInputRef}
                          id="reservation-passes"
                          type="number"
                          min={0}
                          value={formValues.passes}
                          onChange={(changeEvent) => updateField("passes", changeEvent.target.value)}
                          onKeyDown={handlePassesKeyDown}
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
                          tabIndex={-1}
                          checked={formValues.dinner}
                          onCheckedChange={(checked) => updateField("dinner", Boolean(checked))}
                        />
                        <Label htmlFor="reservation-dinner">Dinner</Label>
                      </div>
                      <Button
                        type="button"
                        tabIndex={-1}
                        className={SUCCESS_BUTTON_CLASS}
                        onClick={handleCalculateTotal}
                      >
                        Calculate Total
                      </Button>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="rounded-md border p-3 sm:p-4">
                  <legend className="px-2 text-sm font-medium">Customer Details</legend>
                  <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                    <div className={FIELD_ROW_CLASS}>
                      <Label htmlFor="reservation-last-name">Last Name</Label>
                      <Input
                        ref={lastNameInputRef}
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
                          ref={emailInputRef}
                          id="reservation-email"
                          type="email"
                          value={formValues.customer.email}
                          onChange={(changeEvent) => updateCustomerField("email", changeEvent.target.value)}
                          onKeyDown={handleEmailKeyDown}
                          className={cn(COMPACT_INPUT, "min-w-0 flex-1")}
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          tabIndex={-1}
                          className="size-8 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                          aria-label="Customer profile"
                          onClick={() => setIsAddCustomerOpen(true)}
                        >
                          <ContactRound className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="rounded-md border p-3 sm:p-4">
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
                        <RadioGroupItem value="customer" id="reservation-search-customer" tabIndex={-1} />
                        <Label htmlFor="reservation-search-customer">Customer</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="business" id="reservation-search-business" tabIndex={-1} />
                        <Label htmlFor="reservation-search-business">Business</Label>
                      </div>
                    </RadioGroup>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" tabIndex={-1} className={SUCCESS_BUTTON_CLASS}>
                        Search
                      </Button>
                      <Button
                        type="button"
                        tabIndex={-1}
                        className={SUCCESS_BUTTON_CLASS}
                        onClick={() => setIsAddCustomerOpen(true)}
                      >
                        Add Customer
                      </Button>
                      <Button type="button" tabIndex={-1} className={ACCENT_BUTTON_CLASS}>
                        Swipe
                      </Button>
                      <Button type="button" tabIndex={-1} onClick={handleClearSearchCriteria}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="rounded-md border p-3 sm:p-4">
                  <legend className="px-2 text-sm font-medium">Notes / Request</legend>
                  <Textarea
                    id="reservation-notes"
                    tabIndex={-1}
                    value={formValues.notes}
                    onChange={(changeEvent) => updateField("notes", changeEvent.target.value)}
                    className="min-h-28 resize-y"
                  />
                </fieldset>
              </div>
            )}
          </div>

          <DialogFooter className="!flex-row flex-wrap justify-start gap-2 border-t px-3 py-3 sm:px-5 sm:py-4">
            <Button
              type="button"
              tabIndex={-1}
              className="flex-1 sm:flex-none"
              onClick={handleContinue}
              disabled={!formValues || isLoading}
            >
              Continue
            </Button>
            <Button
              type="button"
              tabIndex={-1}
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
            >
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
        initialValues={addCustomerInitialValues}
        onSaved={applySavedCustomer}
      />
    </>
  )
}
