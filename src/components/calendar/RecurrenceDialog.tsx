import { CalendarIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly"
type EndMode = "after" | "date"
type MonthlyMode = "day" | "weekday"
type YearlyMode = "date" | "weekday"

type RecurrenceDialogProps = {
  open: boolean
  startDate: Date | null
  onOpenChange: (open: boolean) => void
  onSave?: (value: RecurrenceFormValue) => void
}

export type RecurrenceFormValue = {
  startDate: Date
  pattern: RecurrencePattern
  selectedWeekdays: number[]
  monthlyMode: MonthlyMode
  yearlyMode: YearlyMode
  interval: number
  occurrences: number
  endMode: EndMode
  endDate: Date
}

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const ordinalOptions = ["First", "Second", "Third", "Fourth", "Last"]

function formatDate(date: Date | null) {
  if (!date) {
    return "Select date"
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function getStartOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function DatePickerField({
  id,
  date,
  onSelect,
  className,
}: {
  id: string
  date: Date | null
  onSelect: (date: Date) => void
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-[12.5rem] justify-start px-3 text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          {formatDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(selected) => {
            if (selected) {
              onSelect(getStartOfDay(selected))
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function NumberInput({
  value,
  onChange,
  className,
}: {
  value: number
  onChange: (value: number) => void
  className?: string
}) {
  return (
    <Input
      type="number"
      min={1}
      value={value}
      onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
      className={cn("w-20", className)}
    />
  )
}

export default function RecurrenceDialog({
  open,
  startDate,
  onOpenChange,
  onSave,
}: RecurrenceDialogProps) {
  const normalizedStartDate = useMemo(
    () => (startDate ? getStartOfDay(startDate) : getStartOfDay(new Date())),
    [startDate]
  )

  const [pattern, setPattern] = useState<RecurrencePattern>("daily")
  const [dialogStartDate, setDialogStartDate] = useState(normalizedStartDate)
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([
    normalizedStartDate.getDay(),
  ])
  const [monthlyMode, setMonthlyMode] = useState<MonthlyMode>("day")
  const [yearlyMode, setYearlyMode] = useState<YearlyMode>("date")
  const [interval, setInterval] = useState(1)
  const [occurrences, setOccurrences] = useState(1)
  const [endMode, setEndMode] = useState<EndMode>("after")
  const [endDate, setEndDate] = useState(normalizedStartDate)

  useEffect(() => {
    if (!open) {
      return
    }

    setDialogStartDate(normalizedStartDate)
    setSelectedWeekdays([normalizedStartDate.getDay()])
    setEndDate(normalizedStartDate)
  }, [normalizedStartDate, open])

  const startDay = dialogStartDate.getDate()
  const startMonth = dialogStartDate.getMonth()
  const startWeekday = dialogStartDate.getDay()

  function toggleWeekday(day: number) {
    setSelectedWeekdays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort((a, b) => a - b)
    )
  }

  function handleSave() {
    onSave?.({
      startDate: dialogStartDate,
      pattern,
      selectedWeekdays,
      monthlyMode,
      yearlyMode,
      interval,
      occurrences,
      endMode,
      endDate,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableOutsideDismiss className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg">Recurrence</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Label htmlFor="recurrence-start-date" className="min-w-20">
              Start Date
            </Label>
            <DatePickerField
              id="recurrence-start-date"
              date={dialogStartDate}
              onSelect={setDialogStartDate}
            />
          </div>

          <fieldset className="rounded-md border p-4">
            <legend className="px-2 text-sm font-medium">Recurrence Pattern</legend>
            <div className="grid gap-5 md:grid-cols-[12.5rem_minmax(0,1fr)]">
              <RadioGroup
                value={pattern}
                onValueChange={(value) => setPattern(value as RecurrencePattern)}
                className="grid gap-2 border-border md:border-r md:pr-5"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="pattern-daily" value="daily" />
                  <Label htmlFor="pattern-daily">EveryDay</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="pattern-weekly" value="weekly" />
                  <Label htmlFor="pattern-weekly">Weekly</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="pattern-monthly" value="monthly" />
                  <Label htmlFor="pattern-monthly">Monthly</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="pattern-yearly" value="yearly" />
                  <Label htmlFor="pattern-yearly">Yearly</Label>
                </div>
              </RadioGroup>

              <div className="min-h-32 pt-1">
                {pattern === "daily" ? (
                  <p className="text-sm text-muted-foreground">Repeats every day.</p>
                ) : null}

                {pattern === "weekly" ? (
                  <div className="flex flex-wrap gap-x-5 gap-y-4">
                    {weekdays.map((day, index) => (
                      <div key={day} className="flex items-center gap-2">
                        <Checkbox
                          id={`weekday-${day}`}
                          checked={selectedWeekdays.includes(index)}
                          onCheckedChange={() => toggleWeekday(index)}
                        />
                        <Label htmlFor={`weekday-${day}`}>{day}</Label>
                      </div>
                    ))}
                  </div>
                ) : null}

                {pattern === "monthly" ? (
                  <RadioGroup
                    value={monthlyMode}
                    onValueChange={(value) => setMonthlyMode(value as MonthlyMode)}
                    className="grid gap-3"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <RadioGroupItem id="monthly-day" value="day" />
                      <Label htmlFor="monthly-day">Day</Label>
                      <NumberInput value={startDay} onChange={() => undefined} />
                      <span className="text-sm">after every</span>
                      <NumberInput value={interval} onChange={setInterval} />
                      <span className="text-sm">month(s)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <RadioGroupItem id="monthly-weekday" value="weekday" />
                      <Label htmlFor="monthly-weekday">The</Label>
                      <Select defaultValue="Fourth">
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ordinalOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue={weekdays[startWeekday]}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weekdays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm">after every</span>
                      <NumberInput value={interval} onChange={setInterval} />
                      <span className="text-sm">month(s)</span>
                    </div>
                  </RadioGroup>
                ) : null}

                {pattern === "yearly" ? (
                  <RadioGroup
                    value={yearlyMode}
                    onValueChange={(value) => setYearlyMode(value as YearlyMode)}
                    className="grid gap-3"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <RadioGroupItem id="yearly-date" value="date" />
                      <Label htmlFor="yearly-date">Every</Label>
                      <Select defaultValue={months[startMonth]}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <NumberInput value={startDay} onChange={() => undefined} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <RadioGroupItem id="yearly-weekday" value="weekday" />
                      <Label htmlFor="yearly-weekday">The</Label>
                      <Select defaultValue="Fourth">
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ordinalOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue={weekdays[startWeekday]}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weekdays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm">of</span>
                      <Select defaultValue={months[startMonth]}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </RadioGroup>
                ) : null}
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-md border p-4">
            <legend className="px-2 text-sm font-medium">Range of Recurrence</legend>
            <RadioGroup
              value={endMode}
              onValueChange={(value) => setEndMode(value as EndMode)}
              className="flex flex-wrap items-center gap-x-6 gap-y-4 py-8"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="end-after" value="after" />
                <Label htmlFor="end-after">End after</Label>
                <NumberInput value={occurrences} onChange={setOccurrences} className="w-24" />
                <span className="text-sm">occurrences</span>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="end-date" value="date" />
                <Label htmlFor="end-date">End Date</Label>
                <DatePickerField
                  id="recurrence-end-date"
                  date={endDate}
                  onSelect={setEndDate}
                />
              </div>
            </RadioGroup>
          </fieldset>
        </div>

        <DialogFooter className="border-t px-6 py-4 sm:justify-start">
          <Button type="button" onClick={handleSave}>
            Next
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


