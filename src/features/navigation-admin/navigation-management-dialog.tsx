import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { YES_NO_OPTIONS } from "@/data/user-setup"
import {
  EMPTY_NAVIGATION_MANAGEMENT_FORM,
  type NavigationManagementFormValues,
  type NavigationManagementRecord,
} from "@/types/navigation-admin"

type NavigationManagementDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: NavigationManagementRecord | null
  onSaved: (record: NavigationManagementRecord) => void
}

function validateForm(form: NavigationManagementFormValues) {
  if (!form.menu.trim()) return "Menu name is required."
  return null
}

function toRecord(
  form: NavigationManagementFormValues,
  id: string
): NavigationManagementRecord {
  return {
    id,
    menu: form.menu.trim(),
    navigationUrl: form.navigationUrl.trim(),
    level: Number(form.level) || 0,
    order: Number(form.order) || 0,
    active: form.active,
    updatedBy: form.updatedBy.trim(),
    parentMenu: form.parentMenu.trim(),
  }
}

export function NavigationManagementDialog({
  open,
  onOpenChange,
  record = null,
  onSaved,
}: NavigationManagementDialogProps) {
  const isEdit = Boolean(record)
  const [form, setForm] = useState<NavigationManagementFormValues>(
    EMPTY_NAVIGATION_MANAGEMENT_FORM
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_NAVIGATION_MANAGEMENT_FORM)
      setError(null)
      return
    }

    if (record) {
      setForm({
        menu: record.menu,
        navigationUrl: record.navigationUrl,
        level: String(record.level),
        order: String(record.order),
        active: record.active,
        updatedBy: record.updatedBy,
        parentMenu: record.parentMenu,
      })
      return
    }

    setForm(EMPTY_NAVIGATION_MANAGEMENT_FORM)
  }, [open, record])

  function updateField<K extends keyof NavigationManagementFormValues>(
    field: K,
    value: NavigationManagementFormValues[K]
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

    onSaved(toRecord(form, record?.id ?? `nav-${Date.now()}`))
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Navigation Item" : "New Navigation Item"}
      onSave={handleSave}
      error={error}
      size="xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Menu" htmlFor="nav-menu">
          <Input
            id="nav-menu"
            value={form.menu}
            onChange={(event) => updateField("menu", event.target.value)}
          />
        </FormField>

        <FormField label="Parent Menu" htmlFor="nav-parent-menu">
          <Input
            id="nav-parent-menu"
            value={form.parentMenu}
            onChange={(event) => updateField("parentMenu", event.target.value)}
          />
        </FormField>

        <FormField label="Navigation URL" htmlFor="nav-url" className="sm:col-span-2">
          <Input
            id="nav-url"
            value={form.navigationUrl}
            onChange={(event) => updateField("navigationUrl", event.target.value)}
          />
        </FormField>

        <FormField label="Level" htmlFor="nav-level">
          <Input
            id="nav-level"
            type="number"
            min={0}
            value={form.level}
            onChange={(event) => updateField("level", event.target.value)}
          />
        </FormField>

        <FormField label="Order" htmlFor="nav-order">
          <Input
            id="nav-order"
            type="number"
            min={0}
            value={form.order}
            onChange={(event) => updateField("order", event.target.value)}
          />
        </FormField>

        <FormField label="Active" htmlFor="nav-active">
          <Select
            value={form.active}
            onValueChange={(value) =>
              updateField("active", value as NavigationManagementFormValues["active"])
            }
          >
            <SelectTrigger id="nav-active" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YES_NO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Updated By" htmlFor="nav-updated-by">
          <Input
            id="nav-updated-by"
            value={form.updatedBy}
            onChange={(event) => updateField("updatedBy", event.target.value)}
          />
        </FormField>
      </div>
    </FormDialog>
  )
}
