import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { DomainFormFields } from "@/features/domains/domain-form-fields"
import {
  EMPTY_DOMAIN_FORM,
  type Domain,
  type DomainFormValues,
} from "@/types/domain"

type AddDomainDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (domain: Domain) => void
  nextProcessingOrder: number
}

function validateForm(form: DomainFormValues) {
  if (!form.domainName.trim()) {
    return "Domain name is required."
  }
  if (!form.locationId.trim()) {
    return "Location ID is required."
  }
  if (!form.processingOrder.trim()) {
    return "Processing order is required."
  }
  if (Number(form.processingOrder) < 1) {
    return "Processing order must be at least 1."
  }
  return null
}

export function AddDomainDialog({
  open,
  onOpenChange,
  onSaved,
  nextProcessingOrder,
}: AddDomainDialogProps) {
  const [form, setForm] = useState<DomainFormValues>(EMPTY_DOMAIN_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_DOMAIN_FORM)
      setError(null)
      return
    }

    setForm({
      ...EMPTY_DOMAIN_FORM,
      processingOrder: String(nextProcessingOrder),
    })
    setError(null)
  }, [nextProcessingOrder, open])

  function updateField<K extends keyof DomainFormValues>(
    field: K,
    value: DomainFormValues[K]
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
      domainName: form.domainName.trim(),
      locationId: form.locationId.trim(),
      activeIndicator: form.activeIndicator,
      processingOrder: Number(form.processingOrder),
    })
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Domain"
      error={error}
      onSave={handleSave}
    >
      <DomainFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
