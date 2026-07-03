import { Check, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SystemDefault } from "@/types/system-default"

type SystemDefaultValuePopoverProps = {
  record: SystemDefault
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (record: SystemDefault, value: string) => void
}

function isBooleanDefault(value: string) {
  const normalized = value.trim().toUpperCase()
  return normalized === "Y" || normalized === "N"
}

function toBooleanLabel(value: string) {
  return value.trim().toUpperCase() === "Y" ? "Yes" : "No"
}

function toBooleanValue(value: string) {
  return value === "Yes" ? "Y" : "N"
}

function isNumericDefault(value: string) {
  return /^\d+(?:\.\d+)?$/.test(value.trim())
}

function acceptsNumericInput(value: string, allowDecimal: boolean) {
  return allowDecimal ? /^\d*(?:\.\d*)?$/.test(value) : /^\d*$/.test(value)
}

export function SystemDefaultValuePopover({
  record,
  open,
  onOpenChange,
  onSave,
}: SystemDefaultValuePopoverProps) {
  const [value, setValue] = useState("")
  const isBooleanValue = isBooleanDefault(record.defaultValue)
  const isNumericValue = isNumericDefault(record.defaultValue)
  const allowsDecimal = record.defaultValue.includes(".")

  useEffect(() => {
    if (!open) {
      return
    }

    setValue(
      isBooleanValue ? toBooleanLabel(record.defaultValue) : record.defaultValue
    )
  }, [isBooleanValue, open, record.defaultValue])

  function handleSave() {
    onSave(record, isBooleanValue ? toBooleanValue(value) : value)
    onOpenChange(false)
  }

  function handleInputChange(nextValue: string) {
    if (isNumericValue && !acceptsNumericInput(nextValue, allowsDecimal)) {
      return
    }

    setValue(nextValue)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <span
          className="block w-full cursor-default select-none rounded-sm text-center tabular-nums"
        >
          {record.defaultValue}
        </span>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={16}
        className="relative w-[min(18rem,calc(100vw-1.5rem))] overflow-visible rounded-md border p-0 shadow-xl"
      >
        <div className="rounded-t-md border-b bg-background px-2.5 py-1 text-xs font-semibold text-foreground dark:bg-background">
          Value
        </div>
        <div className="flex items-center gap-1.5 p-2">
          <div className="min-w-0 flex-1">
            {isBooleanValue ? (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="h-8 w-full rounded-md bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={value}
                onChange={(event) => handleInputChange(event.target.value)}
                inputMode={isNumericValue ? "decimal" : undefined}
                className="h-8 bg-background"
                autoFocus
              />
            )}
          </div>
          <Button
            type="button"
            size="icon-xs"
            aria-label="Save value"
            onClick={handleSave}
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="destructive"
            aria-label="Cancel edit"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
        <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b bg-popover" />
      </PopoverContent>
    </Popover>
  )
}
