import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  EMPTY_ONLINE_SETTING_FORM,
  type OnlineSetting,
  type OnlineSettingFormValues,
} from "@/types/online-setting"

type OnlineSettingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: OnlineSetting | null
  onSaved: (record: OnlineSetting) => void
}

export function OnlineSettingDialog({
  open,
  onOpenChange,
  record = null,
  onSaved,
}: OnlineSettingDialogProps) {
  const isEdit = Boolean(record)
  const [form, setForm] = useState<OnlineSettingFormValues>(EMPTY_ONLINE_SETTING_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_ONLINE_SETTING_FORM)
      setError(null)
      return
    }

    if (!record) {
      setForm(EMPTY_ONLINE_SETTING_FORM)
      setError(null)
      return
    }

    setForm({
      settingsName: record.settingsName,
      defaultValue: record.defaultValue,
    })
    setError(null)
  }, [open, record])

  function handleSave() {
    if (!form.settingsName.trim()) {
      setError("Settings name is required.")
      return
    }

    onSaved({
      id: record?.id ?? crypto.randomUUID(),
      settingsName: form.settingsName.trim(),
      defaultValue: form.defaultValue,
    })
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Online Setting" : "New Online Setting"}
      error={error}
      onSave={handleSave}
      size="lg"
    >
      <FormField label="Settings Name" htmlFor="settings-name">
        <Input
          id="settings-name"
          value={form.settingsName}
          onChange={(event) =>
            setForm((current) => ({ ...current, settingsName: event.target.value }))
          }
        />
      </FormField>

      <FormField label="Default Value" htmlFor="default-value">
        <Textarea
          id="default-value"
          value={form.defaultValue}
          onChange={(event) =>
            setForm((current) => ({ ...current, defaultValue: event.target.value }))
          }
          rows={4}
        />
      </FormField>
    </FormDialog>
  )
}
