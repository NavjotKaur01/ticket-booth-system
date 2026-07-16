import { useEffect, useMemo, useState } from "react"

import { FormField } from "@/components/forms/form-fields"
import {
  PhoneInputGroup,
  type PhoneParts,
} from "@/components/forms/phone-input-group"
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
import { Textarea } from "@/components/ui/textarea"
import { countryOptions, usStateOptions } from "@/data/customer-form-options"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  getBusinessContactById,
  saveBusinessContact,
  updateBusinessContact,
} from "@/lib/api/business-contacts"
import { mapBusinessContactToForm } from "@/lib/map-business-contact-form"
import type { BusinessContact } from "@/types/business-contact"
import {
  EMPTY_BUSINESS_CONTACT_FORM,
  type BusinessContactFormValues,
} from "@/types/business-contact"

function getRegionLabels(country: string) {
  if (country === "CA") {
    return {
      city: "Municipality",
      state: "Province",
      zip: "Post Code",
    }
  }

  return {
    city: "City",
    state: "State",
    zip: "Zip Code",
  }
}

type AddBusinessContactDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  lastUpdateId: string
  contact?: BusinessContact | null
  onSaved?: (form: BusinessContactFormValues) => Promise<void> | void
}

export function AddBusinessContactDialog({
  open,
  onOpenChange,
  connectionName,
  locationId,
  lastUpdateId,
  contact = null,
  onSaved,
}: AddBusinessContactDialogProps) {
  const isEditMode = contact != null
  const [form, setForm] = useState<BusinessContactFormValues>(
    EMPTY_BUSINESS_CONTACT_FORM
  )
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const regionLabels = useMemo(
    () => getRegionLabels(form.country),
    [form.country]
  )

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_BUSINESS_CONTACT_FORM)
      setLoadingDetails(false)
      setSaving(false)
      setError(null)
      return
    }

    if (!contact) {
      setForm(EMPTY_BUSINESS_CONTACT_FORM)
      return
    }

    const businessId = contact.id
    let cancelled = false

    async function loadContactDetails() {
      setLoadingDetails(true)
      setError(null)

      try {
        const details = await getBusinessContactById({
          connectionName,
          locationId,
          businessId,
        })

        if (cancelled) {
          return
        }

        setForm(mapBusinessContactToForm(details))
      } catch (requestError) {
        if (!cancelled) {
          reportError(
            setError,
            requestError,
            "Unable to load business contact details."
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingDetails(false)
        }
      }
    }

    void loadContactDetails()

    return () => {
      cancelled = true
    }
  }, [open, contact, connectionName, locationId])

  function updateField<K extends keyof BusinessContactFormValues>(
    field: K,
    value: BusinessContactFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updatePhoneField(
    field: "phone" | "altPhone" | "fax",
    value: PhoneParts
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validateForm() {
    if (!locationId) {
      return "Location is required before saving a business contact."
    }

    return null
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError) {
      reportErrorMessage(setError, validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEditMode && contact) {
        await updateBusinessContact({
          connectionName,
          locationId,
          lastUpdateId,
          form,
          businessId: contact.id,
        })
      } else {
        await saveBusinessContact({
          connectionName,
          locationId,
          lastUpdateId,
          form,
        })
      }

      toastSuccess(
        isEditMode ? "Business contact updated" : "Business contact saved"
      )
      await onSaved?.(form)
      onOpenChange(false)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to save business contact.")
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
            <span className="font-semibold text-foreground">
              {isEditMode ? "Edit Business Contacts" : "Add Business Contacts"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          {error ? (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          ) : null}

          {loadingDetails ? (
            <p className="text-sm text-muted-foreground">
              Loading business contact details...
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Business Name" htmlFor="add-business-name">
                <Input
                  id="add-business-name"
                  value={form.businessName}
                  onChange={(event) =>
                    updateField("businessName", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Web Address" htmlFor="add-business-web">
                <Input
                  id="add-business-web"
                  value={form.webAddress}
                  onChange={(event) =>
                    updateField("webAddress", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Last Name" htmlFor="add-business-last-name">
                <Input
                  id="add-business-last-name"
                  value={form.lastName}
                  onChange={(event) =>
                    updateField("lastName", event.target.value)
                  }
                />
              </FormField>

              <FormField label="First Name" htmlFor="add-business-first-name">
                <Input
                  id="add-business-first-name"
                  value={form.firstName}
                  onChange={(event) =>
                    updateField("firstName", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Email" htmlFor="add-business-email">
                <Input
                  id="add-business-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </FormField>

              <FormField label="Phone">
                <PhoneInputGroup
                  idPrefix="add-business-phone"
                  value={form.phone}
                  onChange={(value) => updatePhoneField("phone", value)}
                />
              </FormField>

              <FormField label="Alt Phone">
                <PhoneInputGroup
                  idPrefix="add-business-alt-phone"
                  value={form.altPhone}
                  onChange={(value) => updatePhoneField("altPhone", value)}
                />
              </FormField>

              <FormField label="Fax">
                <PhoneInputGroup
                  idPrefix="add-business-fax"
                  value={form.fax}
                  onChange={(value) => updatePhoneField("fax", value)}
                />
              </FormField>

              <FormField label="Address1" htmlFor="add-business-address1">
                <Input
                  id="add-business-address1"
                  value={form.address1}
                  onChange={(event) =>
                    updateField("address1", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Address2" htmlFor="add-business-address2">
                <Input
                  id="add-business-address2"
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
                    <SelectValue placeholder="Select country" />
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

              <FormField
                label={regionLabels.city}
                htmlFor="add-business-city"
              >
                <Input
                  id="add-business-city"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                />
              </FormField>

              <FormField label={regionLabels.state}>
                <Select
                  value={form.state || undefined}
                  onValueChange={(value) => updateField("state", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${regionLabels.state}`} />
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

              <FormField
                label={regionLabels.zip}
                htmlFor="add-business-zip"
              >
                <Input
                  id="add-business-zip"
                  value={form.zipCode}
                  onChange={(event) =>
                    updateField("zipCode", event.target.value)
                  }
                />
              </FormField>

              <FormField
                label="Business Notes"
                htmlFor="add-business-notes"
                className="sm:col-span-2"
              >
                <Textarea
                  id="add-business-notes"
                  value={form.businessNotes}
                  onChange={(event) =>
                    updateField("businessNotes", event.target.value)
                  }
                  className="min-h-20 resize-y"
                />
              </FormField>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2 sm:justify-end">
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || loadingDetails}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
