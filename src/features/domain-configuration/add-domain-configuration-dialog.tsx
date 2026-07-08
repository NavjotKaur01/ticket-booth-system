import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { DomainConfigurationFormFields } from "@/features/domain-configuration/domain-configuration-form-fields"
import {
  EMPTY_DOMAIN_CONFIGURATION_FORM,
  type DomainConfiguration,
  type DomainConfigurationFormValues,
} from "@/types/domain-configuration"

type AddDomainConfigurationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function AddDomainConfigurationDialog({
  open,
  onOpenChange,
  onSaved,
}: AddDomainConfigurationDialogProps) {
  const [form, setForm] = useState<DomainConfigurationFormValues>(
    EMPTY_DOMAIN_CONFIGURATION_FORM
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_DOMAIN_CONFIGURATION_FORM)
      setError(null)
    }
  }, [open])

  function updateField<K extends keyof DomainConfigurationFormValues>(
    field: K,
    value: DomainConfigurationFormValues[K]
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
      title="New Domain Configuration"
      error={error}
      onSave={handleSave}
    >
      <DomainConfigurationFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
