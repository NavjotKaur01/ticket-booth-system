import { ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import {
  CalendarScrollSelectList,
  type CalendarSelectOption,
} from "./CalendarScrollSelectList"

export type { CalendarSelectOption } from "./CalendarScrollSelectList"

type CalendarSelectControlProps = {
  id: string
  value: string
  onChange: (value: string) => void
  options: CalendarSelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function CalendarSelectControl({
  id,
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  disabled = false,
}: CalendarSelectControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedLabel = useMemo(() => {
    if (!value) {
      return placeholder
    }

    return options.find((option) => option.value === value)?.label ?? placeholder
  }, [options, placeholder, value])

  function handleSelect(nextValue: string) {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between px-3 font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[8rem] p-1"
        sideOffset={4}
      >
        <CalendarScrollSelectList
          isOpen={isOpen}
          value={value}
          options={options}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
