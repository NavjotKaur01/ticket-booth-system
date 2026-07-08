import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { WebServerFormFields } from "@/features/web-servers/web-server-form-fields"
import {
  EMPTY_WEB_SERVER_FORM,
  type WebServer,
  type WebServerFormValues,
} from "@/types/web-server"

type EditWebServerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  server: WebServer | null
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

export function EditWebServerDialog({
  open,
  onOpenChange,
  server,
  onSaved,
}: EditWebServerDialogProps) {
  const [form, setForm] = useState<WebServerFormValues>(EMPTY_WEB_SERVER_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !server) {
      setForm(EMPTY_WEB_SERVER_FORM)
      setError(null)
      return
    }

    setForm({
      serverIp: server.serverIp,
      serverName: server.serverName,
      activeIndicator: server.activeIndicator,
    })
    setError(null)
  }, [open, server])

  function updateField<K extends keyof WebServerFormValues>(
    field: K,
    value: WebServerFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    if (!server) {
      return
    }

    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    onSaved({
      ...server,
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
      title="Edit Web Server"
      error={error}
      onSave={handleSave}
    >
      <WebServerFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
