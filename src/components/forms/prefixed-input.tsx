import type { HTMLInputTypeAttribute } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PrefixedInputProps = {
  id?: string
  prefix?: string
  value: string
  onChange: (value: string) => void
  className?: string
  inputClassName?: string
  type?: HTMLInputTypeAttribute
  min?: number
  disabled?: boolean
}

export function PrefixedInput({
  id,
  prefix = "$",
  value,
  onChange,
  className,
  inputClassName,
  type = "text",
  min,
  disabled,
}: PrefixedInputProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        {prefix}
      </span>
      <Input
        id={id}
        type={type}
        min={min}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn("h-9 w-full pl-6 tabular-nums", inputClassName)}
      />
    </div>
  )
}
