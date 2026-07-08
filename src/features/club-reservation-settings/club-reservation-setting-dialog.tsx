import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  EMPTY_CLUB_RESERVATION_SETTING_FORM,
  type ClubReservationSetting,
  type ClubReservationSettingFormValues,
} from "@/types/club-reservation-setting"

type ClubReservationSettingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: ClubReservationSetting | null
  onSaved: (record: ClubReservationSetting) => void
}

export function ClubReservationSettingDialog({
  open,
  onOpenChange,
  record,
  onSaved,
}: ClubReservationSettingDialogProps) {
  const [form, setForm] = useState<ClubReservationSettingFormValues>(
    EMPTY_CLUB_RESERVATION_SETTING_FORM
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !record) {
      setForm(EMPTY_CLUB_RESERVATION_SETTING_FORM)
      setError(null)
      return
    }

    setForm({ newReservation: record.newReservation })
    setError(null)
  }, [open, record])

  function handleSave() {
    if (!record) return
    if (!form.newReservation.trim()) {
      setError("New Reservation value is required.")
      return
    }

    onSaved({
      ...record,
      newReservation: form.newReservation.trim(),
    })
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Club Setting"
      error={error}
      onSave={handleSave}
    >
      <FormField label="New Reservation" htmlFor="new-reservation">
        <Input
          id="new-reservation"
          value={form.newReservation}
          onChange={(event) => setForm({ newReservation: event.target.value })}
        />
      </FormField>
    </FormDialog>
  )
}
