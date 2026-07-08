import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { ReservationDefaultFormFields } from "@/features/reservation-defaults/reservation-default-form-fields"
import {
  EMPTY_RESERVATION_DEFAULT_FORM,
  type ReservationDefault,
  type ReservationDefaultFormValues,
} from "@/types/reservation-default"

type ReservationDefaultDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: ReservationDefault | null
  onSaved: (record: ReservationDefault) => void
}

function validateForm(form: ReservationDefaultFormValues) {
  if (!form.defaultName.trim()) return "Default name is required."
  return null
}

function toRecord(
  form: ReservationDefaultFormValues,
  id: string
): ReservationDefault {
  return {
    id,
    defaultName: form.defaultName.trim(),
    defaultValue: form.defaultValue,
    description: form.description.trim(),
    active: form.active,
    showClub: form.showClub,
    screen: Number(form.screen) || 1,
    defaultType: form.defaultType.trim(),
    updatedBy: form.updatedBy.trim(),
    updatedDate: form.updatedDate.trim(),
  }
}

export function ReservationDefaultDialog({
  open,
  onOpenChange,
  record = null,
  onSaved,
}: ReservationDefaultDialogProps) {
  const isEdit = Boolean(record)
  const [form, setForm] = useState<ReservationDefaultFormValues>(
    EMPTY_RESERVATION_DEFAULT_FORM
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_RESERVATION_DEFAULT_FORM)
      setError(null)
      return
    }

    if (!record) {
      setForm(EMPTY_RESERVATION_DEFAULT_FORM)
      setError(null)
      return
    }

    setForm({
      defaultName: record.defaultName,
      defaultValue: record.defaultValue,
      description: record.description,
      active: record.active,
      showClub: record.showClub,
      screen: String(record.screen),
      defaultType: record.defaultType,
      updatedBy: record.updatedBy,
      updatedDate: record.updatedDate,
    })
    setError(null)
  }, [open, record])

  function updateField<K extends keyof ReservationDefaultFormValues>(
    field: K,
    value: ReservationDefaultFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    onSaved(toRecord(form, record?.id ?? crypto.randomUUID()))
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Reservation Default" : "New Reservation Default"}
      error={error}
      onSave={handleSave}
      size="lg"
    >
      <ReservationDefaultFormFields form={form} onFieldChange={updateField} />
    </FormDialog>
  )
}
