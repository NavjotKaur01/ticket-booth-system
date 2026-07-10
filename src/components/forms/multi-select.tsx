import { ChevronDown, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type MultiSelectProps = {
  options: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  itemNoun?: string
  disabled?: boolean
  id?: string
  className?: string
}

function formatTriggerLabel(
  selected: string[],
  options: readonly string[],
  placeholder: string,
  itemNoun: string
) {
  if (selected.length === 0) return placeholder
  if (selected.length === 1) return selected[0]
  return `${selected.length} of ${options.length} ${itemNoun} selected`
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  emptyMessage = "No items match your search.",
  itemNoun = "items",
  disabled = false,
  id,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (open) {
      setSearch("")
    }
  }, [open])

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) => option.toLowerCase().includes(query))
  }, [options, search])

  const allVisibleSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => selected.includes(option))

  function toggleOption(option: string, checked: boolean) {
    onChange(
      checked
        ? [...selected, option]
        : selected.filter((item) => item !== option)
    )
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      onChange(selected.filter((item) => !filteredOptions.includes(item)))
      return
    }

    onChange(Array.from(new Set([...selected, ...filteredOptions])))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between font-normal shadow-xs",
            selected.length === 0 && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {formatTriggerLabel(selected, options, placeholder, itemNoun)}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <div className="space-y-2 p-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={toggleAllVisible}
              disabled={filteredOptions.length === 0}
            >
              {allVisibleSelected ? "Clear shown" : "Select shown"}
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {selected.length} selected
            </span>
          </div>

          <div className="calendar-thin-scrollbar max-h-56 space-y-0.5 overflow-y-auto rounded-md border border-border p-1.5">
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                {emptyMessage}
              </p>
            ) : (
              filteredOptions.map((option) => {
                const checked = selected.includes(option)
                const inputId = id ? `${id}-${option}` : `multi-select-${option}`

                return (
                  <label
                    key={option}
                    htmlFor={inputId}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
                      checked ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleOption(option, value === true)
                      }
                    />
                    <span className="truncate text-sm font-normal">{option}</span>
                  </label>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
