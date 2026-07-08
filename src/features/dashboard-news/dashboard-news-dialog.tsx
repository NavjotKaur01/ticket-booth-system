import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  EMPTY_DASHBOARD_NEWS_FORM,
  type DashboardNewsFormValues,
  type DashboardNewsItem,
} from "@/types/dashboard-news"

type DashboardNewsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: DashboardNewsItem | null
  onSaved: (record: DashboardNewsItem) => void
}

function validateForm(form: DashboardNewsFormValues) {
  if (!form.header.trim()) return "Header is required."
  if (!form.date.trim()) return "Date is required."
  if (!form.startingDate.trim()) return "Starting date is required."
  if (!form.endingDate.trim()) return "Ending date is required."
  return null
}

function toRecord(form: DashboardNewsFormValues, id: string): DashboardNewsItem {
  return {
    id,
    header: form.header.trim(),
    date: form.date.trim(),
    startingDate: form.startingDate.trim(),
    endingDate: form.endingDate.trim(),
  }
}

export function DashboardNewsDialog({
  open,
  onOpenChange,
  record = null,
  onSaved,
}: DashboardNewsDialogProps) {
  const isEdit = Boolean(record)
  const [form, setForm] = useState<DashboardNewsFormValues>(EMPTY_DASHBOARD_NEWS_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_DASHBOARD_NEWS_FORM)
      setError(null)
      return
    }

    if (!record) {
      setForm(EMPTY_DASHBOARD_NEWS_FORM)
      return
    }

    setForm({
      header: record.header,
      date: record.date,
      startingDate: record.startingDate,
      endingDate: record.endingDate,
    })
  }, [open, record])

  function updateField<K extends keyof DashboardNewsFormValues>(
    field: K,
    value: DashboardNewsFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  function handleSave() {
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    onSaved(toRecord(form, record?.id ?? `news-${Date.now()}`))
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit News Item" : "New News Item"}
      onSave={handleSave}
      error={error}
      size="lg"
    >
      <FormField label="Header" htmlFor="news-header">
        <Input
          id="news-header"
          value={form.header}
          onChange={(event) => updateField("header", event.target.value)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Date" htmlFor="news-date">
          <Input
            id="news-date"
            placeholder="M/D/YYYY"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
        </FormField>

        <FormField label="Starting Date" htmlFor="news-starting-date">
          <Input
            id="news-starting-date"
            placeholder="M/D/YYYY"
            value={form.startingDate}
            onChange={(event) => updateField("startingDate", event.target.value)}
          />
        </FormField>

        <FormField label="Ending Date" htmlFor="news-ending-date">
          <Input
            id="news-ending-date"
            placeholder="M/D/YYYY"
            value={form.endingDate}
            onChange={(event) => updateField("endingDate", event.target.value)}
          />
        </FormField>
      </div>
    </FormDialog>
  )
}
