import { Input } from "@/components/ui/input"

export type PhoneParts = {
  area: string
  prefix: string
  line: string
}

export const EMPTY_PHONE_PARTS: PhoneParts = {
  area: "",
  prefix: "",
  line: "",
}

type PhoneInputGroupProps = {
  value: PhoneParts
  onChange: (value: PhoneParts) => void
  idPrefix: string
}

export function PhoneInputGroup({
  value,
  onChange,
  idPrefix,
}: PhoneInputGroupProps) {
  function updateField(field: keyof PhoneParts, nextValue: string) {
    onChange({ ...value, [field]: nextValue })
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Input
        id={`${idPrefix}-area`}
        inputMode="numeric"
        maxLength={3}
        placeholder="918"
        value={value.area}
        onChange={(event) => updateField("area", event.target.value)}
        className="h-9 w-[4.25rem] shrink-0 px-2 text-center tabular-nums"
      />
      <Input
        id={`${idPrefix}-prefix`}
        inputMode="numeric"
        maxLength={3}
        value={value.prefix}
        onChange={(event) => updateField("prefix", event.target.value)}
        className="h-9 w-[4.25rem] shrink-0 px-2 text-center tabular-nums"
      />
      <Input
        id={`${idPrefix}-line`}
        inputMode="numeric"
        maxLength={4}
        value={value.line}
        onChange={(event) => updateField("line", event.target.value)}
        className="h-9 w-[4.5rem] shrink-0 px-2 tabular-nums"
      />
    </div>
  )
}
