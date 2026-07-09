import { useEffect, useState } from "react"

import { FormDialog } from "@/components/common/form-dialog"
import { FormField } from "@/components/forms/form-fields"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  EMPTY_CUSTOMER_LOGIN_FORM,
  type CustomerLogin,
  type CustomerLoginFormValues,
} from "@/types/customer-login"

type LoginManagementDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: CustomerLogin | null
  onSaved: (record: CustomerLogin) => void
}

function validateForm(form: CustomerLoginFormValues) {
  if (!form.email.trim()) return "Email is required."
  return null
}

export function LoginManagementDialog({
  open,
  onOpenChange,
  record = null,
  onSaved,
}: LoginManagementDialogProps) {
  const [form, setForm] = useState<CustomerLoginFormValues>(EMPTY_CUSTOMER_LOGIN_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_CUSTOMER_LOGIN_FORM)
      setError(null)
      return
    }

    if (!record) {
      setForm(EMPTY_CUSTOMER_LOGIN_FORM)
      return
    }

    setForm({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      password: record.password,
      banned: record.banned,
      inactive: record.inactive,
      active: record.active,
    })
  }, [open, record])

  function updateField<K extends keyof CustomerLoginFormValues>(
    field: K,
    value: CustomerLoginFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  function handleSave() {
    if (!record) return

    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    onSaved({
      ...record,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      banned: form.banned,
      inactive: form.inactive,
      active: form.active,
    })
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Customer Login"
      error={error}
      onSave={handleSave}
      saveLabel="Save"
      size="lg"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="First Name" htmlFor="login-edit-first-name">
          <Input
            id="login-edit-first-name"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
        </FormField>

        <FormField label="Last Name" htmlFor="login-edit-last-name">
          <Input
            id="login-edit-last-name"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
        </FormField>

        <FormField label="Email" htmlFor="login-edit-email" className="sm:col-span-2">
          <Input
            id="login-edit-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </FormField>

        <FormField label="Password" htmlFor="login-edit-password" className="sm:col-span-2">
          <Input
            id="login-edit-password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
        </FormField>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={form.banned}
            onCheckedChange={(value) => updateField("banned", value === true)}
          />
          Banned
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={form.inactive}
            onCheckedChange={(value) => updateField("inactive", value === true)}
          />
          Inactive
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={form.active}
            onCheckedChange={(value) => updateField("active", value === true)}
          />
          Active
        </label>
      </div>
    </FormDialog>
  )
}
