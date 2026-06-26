import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

import { FormField } from "@/components/forms/form-fields"
import {
  PhoneInputGroup,
  type PhoneParts,
} from "@/components/forms/phone-input-group"
import CalendarSelectControl from "@/components/calendar/controls/CalendarSelectControl"
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
import { Textarea } from "@/components/ui/textarea"
import {
  countryOptions,
  dobMonthOptions,
  usStateOptions,
} from "@/data/customer-form-options"
import { saveCustomer, updateCustomer, getCustomerById } from "@/lib/api/customers"
import { mapApiCustomerToForm } from "@/lib/map-api-customer-to-form"
import { mapCustomerToForm } from "@/lib/map-customer-form"
import { cn } from "@/lib/utils"
import type { Customer } from "@/types/customer"
import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormValues,
} from "@/types/customer-form"

const FIELD_GRID_2 = "grid gap-2 sm:grid-cols-2"
const FIELD_GRID_3 = "grid gap-2 sm:grid-cols-3"

type AddCustomerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  lastUpdateId: string
  customer?: Customer | null
  initialValues?: CustomerFormValues | null
  nested?: boolean
  onBack?: () => void
  onBuyCertificate?: (customer: Customer) => void
  onSaved?: (form: CustomerFormValues) => Promise<void> | void
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  connectionName,
  locationId,
  lastUpdateId,
  customer = null,
  initialValues = null,
  nested = false,
  onBack,
  onBuyCertificate,
  onSaved,
}: AddCustomerDialogProps) {
  const isEditMode = customer != null
  const [form, setForm] = useState<CustomerFormValues>(EMPTY_CUSTOMER_FORM)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_CUSTOMER_FORM)
      setLoadingDetails(false)
      setSaving(false)
      setError(null)
      return
    }

    if (!customer) {
      if (initialValues) {
        setForm({
          ...EMPTY_CUSTOMER_FORM,
          ...initialValues,
          phone: { ...EMPTY_CUSTOMER_FORM.phone, ...initialValues.phone },
          altPhone1: {
            ...EMPTY_CUSTOMER_FORM.altPhone1,
            ...initialValues.altPhone1,
          },
          altPhone2: {
            ...EMPTY_CUSTOMER_FORM.altPhone2,
            ...initialValues.altPhone2,
          },
        })
        return
      }

      setForm(EMPTY_CUSTOMER_FORM)
      return
    }

    const customerId = customer.id
    const fallbackCustomer = customer
    let cancelled = false

    async function loadCustomerDetails() {
      setLoadingDetails(true)
      setError(null)

      try {
        const details = await getCustomerById({
          connectionName,
          locationId,
          customerId,
        })

        if (cancelled) {
          return
        }

        setForm(mapApiCustomerToForm(details))
      } catch (requestError) {
        if (!cancelled) {
          setForm(mapCustomerToForm(fallbackCustomer))
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load customer details."
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingDetails(false)
        }
      }
    }

    void loadCustomerDetails()

    return () => {
      cancelled = true
    }
  }, [open, customer, initialValues, connectionName, locationId])

  function updateField<K extends keyof CustomerFormValues>(
    field: K,
    value: CustomerFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updatePhoneField(
    field: "phone" | "altPhone1" | "altPhone2",
    value: PhoneParts
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleClear() {
    setForm(EMPTY_CUSTOMER_FORM)
    setError(null)
  }

  function validateForm() {
    if (!form.lastName.trim()) {
      return "Last name is required."
    }
    if (!form.firstName.trim()) {
      return "First name is required."
    }
    if (!locationId) {
      return "Location is required before creating a customer."
    }

    return null
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEditMode && customer) {
        await updateCustomer({
          connectionName,
          locationId,
          lastUpdateId,
          form,
          customerId: customer.id,
        })
      } else {
        await saveCustomer({
          connectionName,
          locationId,
          lastUpdateId,
          form,
        })
      }

      await onSaved?.(form)
      onOpenChange(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save customer"
      )
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (onBack) {
      onBack()
      return
    }

    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          onBack?.()
        }
      }}
    >
      <DialogContent
        nested={nested}
        disableOutsideDismiss={nested}
        showCloseButton
        className="flex max-h-[88vh] max-w-4xl flex-col overflow-hidden sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-2.5 pr-12">
          <div className="flex items-center gap-2">
            {onBack ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="size-8"
                aria-label="Back to add reservation"
              >
                <ArrowLeft className="size-4" />
              </Button>
            ) : null}
            <DialogTitle className="text-base font-semibold text-foreground">
              {isEditMode ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2.5">
          {error ? (
            <p className="mb-2 text-sm text-destructive">{error}</p>
          ) : null}

          {loadingDetails ? (
            <p className="text-sm text-muted-foreground">
              Loading customer details...
            </p>
          ) : (
          <div className="space-y-2">
            <div className={FIELD_GRID_3}>
              <FormField label="Last Name" htmlFor="add-customer-last-name">
                <Input
                  id="add-customer-last-name"
                  value={form.lastName}
                  onChange={(event) =>
                    updateField("lastName", event.target.value)
                  }
                />
              </FormField>
              <FormField label="First Name" htmlFor="add-customer-first-name">
                <Input
                  id="add-customer-first-name"
                  value={form.firstName}
                  onChange={(event) =>
                    updateField("firstName", event.target.value)
                  }
                />
              </FormField>
              <FormField label="Email" htmlFor="add-customer-email">
                <Input
                  id="add-customer-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </FormField>
            </div>

            <div className={FIELD_GRID_3}>
              <FormField label="Phone">
                <PhoneInputGroup
                  idPrefix="add-customer-phone"
                  value={form.phone}
                  onChange={(value) => updatePhoneField("phone", value)}
                />
              </FormField>
              <FormField label="Alt Phone">
                <PhoneInputGroup
                  idPrefix="add-customer-alt-phone-1"
                  value={form.altPhone1}
                  onChange={(value) => updatePhoneField("altPhone1", value)}
                />
              </FormField>
              <FormField label="Alt Phone 2">
                <PhoneInputGroup
                  idPrefix="add-customer-alt-phone-2"
                  value={form.altPhone2}
                  onChange={(value) => updatePhoneField("altPhone2", value)}
                />
              </FormField>
            </div>

            <div className={FIELD_GRID_2}>
              <FormField label="Address1" htmlFor="add-customer-address1">
                <Input
                  id="add-customer-address1"
                  value={form.address1}
                  onChange={(event) =>
                    updateField("address1", event.target.value)
                  }
                />
              </FormField>
              <FormField label="Address2" htmlFor="add-customer-address2">
                <Input
                  id="add-customer-address2"
                  value={form.address2}
                  onChange={(event) =>
                    updateField("address2", event.target.value)
                  }
                />
              </FormField>
            </div>

            <div className={FIELD_GRID_3}>
              <FormField label="Country">
                <CalendarSelectControl
                  id="add-customer-country"
                  value={form.country}
                  onChange={(value) => updateField("country", value)}
                  options={countryOptions.map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))}
                />
              </FormField>
              <FormField label="City" htmlFor="add-customer-city">
                <Input
                  id="add-customer-city"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                />
              </FormField>
              <FormField label="State">
                <CalendarSelectControl
                  id="add-customer-state"
                  value={form.state}
                  onChange={(value) => updateField("state", value)}
                  options={usStateOptions.map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))}
                />
              </FormField>
            </div>

            <div className={FIELD_GRID_3}>
              <FormField label="Zip Code" htmlFor="add-customer-zip">
                <Input
                  id="add-customer-zip"
                  value={form.zipCode}
                  onChange={(event) =>
                    updateField("zipCode", event.target.value)
                  }
                />
              </FormField>
              <FormField label="DOB" className="sm:col-span-2">
                <div className="flex min-w-0 items-center gap-2">
                  <CalendarSelectControl
                    id="add-customer-dob-month"
                    value={form.dobMonth}
                    onChange={(value) => updateField("dobMonth", value)}
                    placeholder="Month"
                    className="min-w-0 flex-1"
                    options={dobMonthOptions.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                  />
                  <Input
                    id="add-customer-dob-day-year"
                    value={form.dobDayYear}
                    onChange={(event) =>
                      updateField("dobDayYear", event.target.value)
                    }
                    placeholder="DD/YYYY"
                    className="h-9 w-28 shrink-0"
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Status">
              <div className="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-border/60 px-2.5 py-1.5">
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <Checkbox
                    id="add-customer-banned"
                    checked={form.banned}
                    onCheckedChange={(value) =>
                      updateField("banned", value === true)
                    }
                  />
                  Banned
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <Checkbox
                    id="add-customer-no-call"
                    checked={form.noCall}
                    onCheckedChange={(value) =>
                      updateField("noCall", value === true)
                    }
                  />
                  No Call
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <Checkbox
                    id="add-customer-inactive"
                    checked={form.inactive}
                    onCheckedChange={(value) =>
                      updateField("inactive", value === true)
                    }
                  />
                  Inactive
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <Checkbox
                    id="add-customer-opt-out"
                    checked={form.optOutEcm}
                    onCheckedChange={(value) =>
                      updateField("optOutEcm", value === true)
                    }
                  />
                  Opt out (ECM)
                </label>
              </div>
            </FormField>

            <FormField label="Customer Notes" htmlFor="add-customer-notes">
              <Textarea
                id="add-customer-notes"
                value={form.customerNotes}
                onChange={(event) =>
                  updateField("customerNotes", event.target.value)
                }
                className="min-h-16 resize-y"
              />
            </FormField>
          </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            "shrink-0 border-t px-4 py-2",
            isEditMode && !onBuyCertificate
              ? "sm:justify-end"
              : "sm:justify-between"
          )}
        >
          {!isEditMode ? (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={handleClear}
            >
              Clear
            </Button>
          ) : onBuyCertificate && customer ? (
            <Button
              type="button"
              variant="outline"
              disabled={saving || loadingDetails}
              onClick={() => onBuyCertificate(customer)}
            >
              Buy Certificate
            </Button>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || loadingDetails}
              onClick={() => void handleSave()}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
