import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { DomainConfigurationFormFields } from "@/features/domain-configuration/domain-configuration-form-fields"
import {
  EMPTY_DOMAIN_CONFIGURATION_FORM,
  type DomainConfiguration,
  type DomainConfigurationFormValues,
} from "@/types/domain-configuration"

type EditDomainConfigurationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: DomainConfiguration | null
  onSaved: (record: DomainConfiguration) => void
}

function validateForm(form: DomainConfigurationFormValues) {
  if (!form.serverIp.trim()) {
    return "Server IP is required."
  }
  if (!form.serverName.trim()) {
    return "Server name is required."
  }
  return null
}

export function EditDomainConfigurationDialog({
  open,
  onOpenChange,
  record,
  onSaved,
}: EditDomainConfigurationDialogProps) {
  const [form, setForm] = useState<DomainConfigurationFormValues>(
    EMPTY_DOMAIN_CONFIGURATION_FORM
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !record) {
      setForm(EMPTY_DOMAIN_CONFIGURATION_FORM)
      setError(null)
      return
    }

    setForm({
      serverIp: record.serverIp,
      serverName: record.serverName,
      activeIndicator: record.activeIndicator,
    })
    setError(null)
  }, [open, record])

  function updateField<K extends keyof DomainConfigurationFormValues>(
    field: K,
    value: DomainConfigurationFormValues[K]
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
      serverIp: form.serverIp.trim(),
      serverName: form.serverName.trim(),
      activeIndicator: form.activeIndicator,
    })
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Domain Configuration"
      error={error}
      onSave={handleSave}
    >
      <DomainConfigurationFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
