import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { VenueGatewayFormFields } from "@/features/venue-gateway/venue-gateway-form-fields"
import {
  EMPTY_VENUE_GATEWAY_FORM,
  type VenueGateway,
  type VenueGatewayFormValues,
} from "@/types/venue-gateway"

type AddVenueGatewayDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function AddVenueGatewayDialog({
  open,
  onOpenChange,
  onSaved,
}: AddVenueGatewayDialogProps) {
  const [form, setForm] = useState<VenueGatewayFormValues>(EMPTY_VENUE_GATEWAY_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_VENUE_GATEWAY_FORM)
      setError(null)
    }
  }, [open])

  function updateField<K extends keyof VenueGatewayFormValues>(
    field: K,
    value: VenueGatewayFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    onSaved({
      id: crypto.randomUUID(),
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
      title="New Venue Gateway"
      error={error}
      onSave={handleSave}
      size="lg"
    >
      <VenueGatewayFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
