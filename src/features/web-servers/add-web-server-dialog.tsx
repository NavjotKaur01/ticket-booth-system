import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { WebServerFormFields } from "@/features/web-servers/web-server-form-fields"
import {
  EMPTY_WEB_SERVER_FORM,
  type WebServer,
  type WebServerFormValues,
} from "@/types/web-server"

type AddWebServerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (server: WebServer) => void
}

function validateForm(form: WebServerFormValues) {
  if (!form.serverIp.trim()) {
    return "Server IP is required."
  }
  if (!form.serverName.trim()) {
    return "Server name is required."
  }
  return null
}

export function AddWebServerDialog({
  open,
  onOpenChange,
  onSaved,
}: AddWebServerDialogProps) {
  const [form, setForm] = useState<WebServerFormValues>(EMPTY_WEB_SERVER_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_WEB_SERVER_FORM)
      setError(null)
    }
  }, [open])

  function updateField<K extends keyof WebServerFormValues>(
    field: K,
    value: WebServerFormValues[K]
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
      title="New Web Server"
      error={error}
      onSave={handleSave}
    >
      <WebServerFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
