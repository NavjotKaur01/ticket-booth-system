import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type GiftCardAccountFieldsProps = {
  accountId: string
  label?: string
  value: string
  onChange: (value: string) => void
  onSwipe?: () => void
}

export function GiftCardAccountFields({
  accountId,
  label = "Gift Card Account",
  value,
  onChange,
  onSwipe,
}: GiftCardAccountFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Click Swipe or Manually Enter Gift Card Number
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={onSwipe}>
          Swipe
        </Button>
      </div>

      <FormField label={label} htmlFor={accountId}>
        <Input
          id={accountId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </FormField>
    </div>
  )
}
