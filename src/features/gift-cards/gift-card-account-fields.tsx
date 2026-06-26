import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"

type GiftCardAccountFieldsProps = {
  accountId: string
  label?: string
  value: string
  onChange: (value: string) => void
}

export function GiftCardAccountFields({
  accountId,
  label = "Gift Card Account",
  value,
  onChange,
}: GiftCardAccountFieldsProps) {
  return (
    <FormField label={label} htmlFor={accountId}>
      <Input
        id={accountId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter gift card number"
        autoComplete="off"
      />
    </FormField>
  )
}
