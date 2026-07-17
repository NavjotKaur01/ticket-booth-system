import { ChevronDown } from "lucide-react"
import { useMemo, useState, type KeyboardEvent, type RefObject } from "react"

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
  listClassName?: string
  disabled?: boolean
  triggerRef?: RefObject<HTMLButtonElement | null>
  onTriggerKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
  allowClear?: boolean
  tabIndex?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  ariaLabel?: string
}

export default function CalendarSelectControl({
  id,
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  listClassName,
  disabled = false,
  triggerRef,
  onTriggerKeyDown,
  allowClear = false,
  tabIndex,
  open,
  onOpenChange,
  ariaLabel,
}: CalendarSelectControlProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen

  function handleOpenChange(nextOpen: boolean) {
    if (open === undefined) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  const selectedLabel = selectedOption?.label ?? placeholder

  function handleSelect(nextValue: string) {
    onChange(nextValue)
    handleOpenChange(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            "h-9 w-full justify-between px-3 font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[8rem] touch-pan-y p-1"
        sideOffset={4}
      >
        <CalendarScrollSelectList
          isOpen={isOpen}
          value={value}
          options={options}
          onSelect={handleSelect}
          clearOptionLabel={allowClear ? placeholder : undefined}
          className={listClassName}
        />
      </PopoverContent>
    </Popover>
  )
}
