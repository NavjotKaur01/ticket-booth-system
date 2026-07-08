import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { VenueGatewayFormFields } from "@/features/venue-gateway/venue-gateway-form-fields"
import {
  EMPTY_VENUE_GATEWAY_FORM,
  type VenueGateway,
  type VenueGatewayFormValues,
} from "@/types/venue-gateway"

type EditVenueGatewayDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: VenueGateway | null
  onSaved: (record: VenueGateway) => void
}

function validateForm(form: VenueGatewayFormValues) {
  if (!form.venue.trim()) {
    return "Venue is required."
  }
  if (!form.gateway.trim()) {
    return "Gateway is required."
  }
  return null
}

export function EditVenueGatewayDialog({
  open,
  onOpenChange,
  record,
  onSaved,
}: EditVenueGatewayDialogProps) {
  const [form, setForm] = useState<VenueGatewayFormValues>(EMPTY_VENUE_GATEWAY_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !record) {
      setForm(EMPTY_VENUE_GATEWAY_FORM)
      setError(null)
      return
    }

    setForm({
      venue: record.venue,
      gateway: record.gateway,
      partner: record.partner,
      vendor: record.vendor,
      user: record.user,
      password: record.password,
    })
    setError(null)
  }, [open, record])

  function updateField<K extends keyof VenueGatewayFormValues>(
    field: K,
    value: VenueGatewayFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    if (!record) {
      return
    }

    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    onSaved({
      ...record,
      venue: form.venue.trim(),
      gateway: form.gateway.trim(),
      partner: form.partner.trim(),
      vendor: form.vendor.trim(),
      user: form.user.trim(),
      password: form.password.trim(),
    })
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Venue Gateway"
      error={error}
      onSave={handleSave}
      size="lg"
    >
      <VenueGatewayFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
