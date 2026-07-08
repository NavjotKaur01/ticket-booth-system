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
  EMPTY_NAVIGATION_DROPDOWN_ITEM_FORM,
  type NavigationDropDownItem,
  type NavigationDropDownItemFormValues,
} from "@/types/navigation-admin"

type NavigationDropDownItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: NavigationDropDownItem | null
  onSaved: (item: NavigationDropDownItem) => void
}

function validateForm(form: NavigationDropDownItemFormValues) {
  if (!form.name.trim()) return "Drop down name is required."
  return null
}

export function NavigationDropDownItemDialog({
  open,
  onOpenChange,
  item = null,
  onSaved,
}: NavigationDropDownItemDialogProps) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState<NavigationDropDownItemFormValues>(
    EMPTY_NAVIGATION_DROPDOWN_ITEM_FORM
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_NAVIGATION_DROPDOWN_ITEM_FORM)
      setError(null)
      return
    }

    if (item) {
      setForm({ name: item.name, active: item.active })
      return
    }

    setForm(EMPTY_NAVIGATION_DROPDOWN_ITEM_FORM)
  }, [item, open])

  function updateField<K extends keyof NavigationDropDownItemFormValues>(
    field: K,
    value: NavigationDropDownItemFormValues[K]
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

    onSaved({
      id: item?.id ?? `dropdown-item-${Date.now()}`,
      name: form.name.trim(),
      active: form.active,
    })
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Drop Down" : "New Drop Down"}
      onSave={handleSave}
      error={error}
    >
      <FormField label="Drop Down Name" htmlFor="dropdown-item-name">
        <Input
          id="dropdown-item-name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
      </FormField>

      <FormField label="Active Indicator" htmlFor="dropdown-item-active">
        <Select
          value={form.active}
          onValueChange={(value) =>
            updateField("active", value as NavigationDropDownItemFormValues["active"])
          }
        >
          <SelectTrigger id="dropdown-item-active" className="w-full">
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
    </FormDialog>
  )
}
