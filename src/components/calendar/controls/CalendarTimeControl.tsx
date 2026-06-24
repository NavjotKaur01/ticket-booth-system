import { ChevronDown, ChevronUp } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { CalendarScrollSelectList } from "./CalendarScrollSelectList"

const TIME_INTERVAL_MINUTES = 15
const MINUTES_PER_DAY = 24 * 60

const quarterHourTimeOptions = Array.from(
  { length: MINUTES_PER_DAY / TIME_INTERVAL_MINUTES },
  (_, index) => {
    const totalMinutes = index * TIME_INTERVAL_MINUTES
    const hour = Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60

    return formatTimeValue(hour, minute)
  }
)

function parseTimeValue(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)

  if (!match) {
    return { hour: 0, minute: 0 }
  }

  const period = match[3].toLowerCase()
  const rawHour = Number(match[1])
  const minute = Math.min(59, Math.max(0, Number(match[2] ?? 0)))
  let hour = rawHour % 12

  if (period === "pm") {
    hour += 12
  }

  return { hour, minute }
}

function formatTimeValue(hour: number, minute: number) {
  const normalizedHour = ((hour % 24) + 24) % 24
  const period = normalizedHour >= 12 ? "pm" : "am"
  const displayHour = normalizedHour % 12 || 12

  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`
}

function timeToMinutes(value: string) {
  const { hour, minute } = parseTimeValue(value)
  return hour * 60 + minute
}

function normalizeTimeValue(value: string) {
  const { hour, minute } = parseTimeValue(value)
  return formatTimeValue(hour, minute)
}

function getTimeOptions(value: string) {
  const normalized = normalizeTimeValue(value)

  if (quarterHourTimeOptions.includes(normalized)) {
    return quarterHourTimeOptions
  }

  const targetMinutes = timeToMinutes(normalized)
  const insertIndex = quarterHourTimeOptions.findIndex(
    (option) => timeToMinutes(option) > targetMinutes
  )

  if (insertIndex === -1) {
    return [...quarterHourTimeOptions, normalized]
  }

  return [
    ...quarterHourTimeOptions.slice(0, insertIndex),
    normalized,
    ...quarterHourTimeOptions.slice(insertIndex),
  ]
}

function stepTimeValue(value: string, direction: 1 | -1) {
  const totalMinutes = timeToMinutes(value) + direction * TIME_INTERVAL_MINUTES
  const wrapped =
    ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY

  return formatTimeValue(Math.floor(wrapped / 60), wrapped % 60)
}

type CalendarTimeControlProps = {
  id: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function CalendarTimeControl({
  id,
  value,
  onChange,
  className,
}: CalendarTimeControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const timeOptions = useMemo(
    () =>
      getTimeOptions(value).map((option) => ({
        value: option,
        label: option,
      })),
    [value]
  )

  function handleSelect(option: string) {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className={cn("flex w-full max-w-48 items-stretch", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="h-9 flex-1 justify-between rounded-r-none border-r-0 px-3 font-normal"
          >
            <span>{value}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40 p-1" sideOffset={4}>
          <CalendarScrollSelectList
            isOpen={isOpen}
            value={value}
            options={timeOptions}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
      <div className="flex h-9 w-7 flex-col overflow-hidden rounded-r-md border bg-background">
        <Button
          type="button"
          variant="ghost"
          className="h-1/2 rounded-none p-0 hover:bg-primary/10"
          aria-label="Move time fifteen minutes forward"
          onClick={() => onChange(stepTimeValue(value, 1))}
        >
          <ChevronUp className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-1/2 rounded-none border-t p-0 hover:bg-primary/10"
          aria-label="Move time fifteen minutes backward"
          onClick={() => onChange(stepTimeValue(value, -1))}
        >
          <ChevronDown className="size-3" />
        </Button>
      </div>
    </div>
  )
}
