import { useEffect, useState } from "react"

import { FormField } from "@/components/forms/form-fields"
import {
  PhoneInputGroup,
  type PhoneParts,
} from "@/components/forms/phone-input-group"
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
import { Textarea } from "@/components/ui/textarea"
import {
  countryOptions,
  dobMonthOptions,
  usStateOptions,
} from "@/data/customer-form-options"
import { saveCustomer } from "@/lib/api/customers"
import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormValues,
} from "@/types/customer-form"

type AddCustomerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  lastUpdateId: string
  onSaved?: (form: CustomerFormValues) => Promise<void> | void
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  connectionName,
  locationId,
  lastUpdateId,
  onSaved,
}: AddCustomerDialogProps) {
  const [form, setForm] = useState<CustomerFormValues>(EMPTY_CUSTOMER_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_CUSTOMER_FORM)
      setSaving(false)
      setError(null)
    }
  }, [open])

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
      await saveCustomer({
        connectionName,
        locationId,
        lastUpdateId,
        form,
      })

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-4xl flex-col overflow-hidden sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Add Customer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          {error ? (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
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

            <FormField label="Alt Phone">
              <PhoneInputGroup
                idPrefix="add-customer-alt-phone-2"
                value={form.altPhone2}
                onChange={(value) => updatePhoneField("altPhone2", value)}
              />
            </FormField>

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

            <FormField label="Country">
              <Select
                value={form.country}
                onValueChange={(value) => updateField("country", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="City" htmlFor="add-customer-city">
              <Input
                id="add-customer-city"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
              />
            </FormField>

            <FormField label="State">
              <Select
                value={form.state}
                onValueChange={(value) => updateField("state", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {usStateOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Zip Code" htmlFor="add-customer-zip">
              <Input
                id="add-customer-zip"
                value={form.zipCode}
                onChange={(event) =>
                  updateField("zipCode", event.target.value)
                }
              />
            </FormField>

            <FormField label="DOB">
              <div className="flex min-w-0 items-center gap-2">
                <Select
                  value={form.dobMonth || undefined}
                  onValueChange={(value) => updateField("dobMonth", value)}
                >
                  <SelectTrigger className="min-w-0 flex-1">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {dobMonthOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="flex flex-col justify-end">
              <Label className="mb-1 block text-xs font-medium opacity-0">
                Flags
              </Label>
              <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    id="add-customer-banned"
                    checked={form.banned}
                    onCheckedChange={(value) =>
                      updateField("banned", value === true)
                    }
                  />
                  Banned
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    id="add-customer-no-call"
                    checked={form.noCall}
                    onCheckedChange={(value) =>
                      updateField("noCall", value === true)
                    }
                  />
                  No Call
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    id="add-customer-inactive"
                    checked={form.inactive}
                    onCheckedChange={(value) =>
                      updateField("inactive", value === true)
                    }
                  />
                  Inactive
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox
                    id="add-customer-opt-out"
                    checked={form.optOutEcm}
                    onCheckedChange={(value) =>
                      updateField("optOutEcm", value === true)
                    }
                  />
                  Opt out(ECM)
                </label>
              </div>
            </div>

            <FormField
              label="Customer Notes"
              htmlFor="add-customer-notes"
              className="sm:col-span-2"
            >
              <Textarea
                id="add-customer-notes"
                value={form.customerNotes}
                onChange={(event) =>
                  updateField("customerNotes", event.target.value)
                }
                className="min-h-20 resize-y"
              />
            </FormField>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={handleClear}
          >
            Clear
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
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
