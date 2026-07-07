import { CalendarIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import CalendarSelectControl from "../controls/CalendarSelectControl"
import { DatePickerCalendarPanel } from "../controls/date-picker-calendar-panel"
import { Button } from "@/components/ui/button"
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
import { formatDateForDisplay } from "@/lib/date-display-format"

import type { RecurrenceFormValue } from "@/types/recurrence"

export type { RecurrenceFormValue } from "@/types/recurrence"

type RecurrencePattern = RecurrenceFormValue["pattern"]
type EndMode = RecurrenceFormValue["endMode"]
type MonthlyMode = RecurrenceFormValue["monthlyMode"]
type YearlyMode = RecurrenceFormValue["yearlyMode"]

type RecurrenceDialogProps = {
  open: boolean
  startDate: Date | null
  onOpenChange: (open: boolean) => void
  onSave?: (value: RecurrenceFormValue) => void
  errorMessage?: string | null
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

function toSelectOptions(values: string[]) {
  return values.map((value) => ({ value, label: value }))
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Select date"
  }

  return formatDateForDisplay(date, "Select date")
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
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => date ?? new Date())

  useEffect(() => {
    if (date) {
      setVisibleMonth(date)
    }
  }, [date])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
        {isOpen ? (
          <DatePickerCalendarPanel
            key={`${id}-${date?.toISOString() ?? "empty"}`}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={date ?? undefined}
            onSelect={(selected) => {
              onSelect(getStartOfDay(selected))
              setIsOpen(false)
            }}
          />
        ) : null}
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
  errorMessage,
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
  const [dailyWeekdays, setDailyWeekdays] = useState<number[]>([
    normalizedStartDate.getDay(),
  ])
  const [monthlyMode, setMonthlyMode] = useState<MonthlyMode>("day")
  const [yearlyMode, setYearlyMode] = useState<YearlyMode>("date")
  const [interval, setInterval] = useState(1)
  const [occurrences, setOccurrences] = useState(1)
  const [endMode, setEndMode] = useState<EndMode>("after")
  const [endDate, setEndDate] = useState(normalizedStartDate)
  const [monthlyOrdinal, setMonthlyOrdinal] = useState("Fourth")
  const [monthlyWeekday, setMonthlyWeekday] = useState(
    weekdays[normalizedStartDate.getDay()]
  )
  const [yearlyMonth, setYearlyMonth] = useState(months[normalizedStartDate.getMonth()])
  const [yearlyOrdinal, setYearlyOrdinal] = useState("Fourth")
  const [yearlyWeekday, setYearlyWeekday] = useState(
    weekdays[normalizedStartDate.getDay()]
  )
  const [yearlyWeekdayMonth, setYearlyWeekdayMonth] = useState(
    months[normalizedStartDate.getMonth()]
  )

  useEffect(() => {
    if (!open) {
      return
    }

    setDialogStartDate(normalizedStartDate)
    setSelectedWeekdays([normalizedStartDate.getDay()])
    setDailyWeekdays([normalizedStartDate.getDay()])
    setEndDate(normalizedStartDate)
    setMonthlyWeekday(weekdays[normalizedStartDate.getDay()])
    setYearlyMonth(months[normalizedStartDate.getMonth()])
    setYearlyWeekday(weekdays[normalizedStartDate.getDay()])
    setYearlyWeekdayMonth(months[normalizedStartDate.getMonth()])
  }, [normalizedStartDate, open])

  const startDay = dialogStartDate.getDate()
  const weekdayOptions = useMemo(() => toSelectOptions(weekdays), [])
  const monthOptions = useMemo(() => toSelectOptions(months), [])
  const ordinalSelectOptions = useMemo(() => toSelectOptions(ordinalOptions), [])

  function toggleWeekday(day: number) {
    setSelectedWeekdays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort((a, b) => a - b)
    )
  }

  function toggleDailyWeekday(day: number) {
    setDailyWeekdays((current) =>
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
      dailyWeekdays,
      monthlyMode,
      yearlyMode,
      interval,
      occurrences,
      endMode,
      endDate,
      monthlyOrdinal,
      monthlyWeekday,
      yearlyMonth,
      yearlyDay: startDay,
      yearlyOrdinal,
      yearlyWeekday,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        disableOutsideDismiss
        className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-lg">Recurrence</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
          {errorMessage ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
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
                  <div className="flex flex-wrap gap-x-5 gap-y-4">
                    {weekdays.map((day, index) => (
                      <div key={day} className="flex items-center gap-2">
                        <Checkbox
                          id={`daily-weekday-${day}`}
                          checked={dailyWeekdays.includes(index)}
                          onCheckedChange={() => toggleDailyWeekday(index)}
                        />
                        <Label htmlFor={`daily-weekday-${day}`}>{day}</Label>
                      </div>
                    ))}
                  </div>
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
                      <CalendarSelectControl
                        id="recurrence-monthly-ordinal"
                        value={monthlyOrdinal}
                        onChange={setMonthlyOrdinal}
                        className="w-36"
                        options={ordinalSelectOptions}
                      />
                      <CalendarSelectControl
                        id="recurrence-monthly-weekday"
                        value={monthlyWeekday}
                        onChange={setMonthlyWeekday}
                        className="w-36"
                        options={weekdayOptions}
                      />
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
                      <CalendarSelectControl
                        id="recurrence-yearly-month"
                        value={yearlyMonth}
                        onChange={setYearlyMonth}
                        className="w-36"
                        options={monthOptions}
                      />
                      <NumberInput value={startDay} onChange={() => undefined} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <RadioGroupItem id="yearly-weekday" value="weekday" />
                      <Label htmlFor="yearly-weekday">The</Label>
                      <CalendarSelectControl
                        id="recurrence-yearly-ordinal"
                        value={yearlyOrdinal}
                        onChange={setYearlyOrdinal}
                        className="w-36"
                        options={ordinalSelectOptions}
                      />
                      <CalendarSelectControl
                        id="recurrence-yearly-weekday"
                        value={yearlyWeekday}
                        onChange={setYearlyWeekday}
                        className="w-36"
                        options={weekdayOptions}
                      />
                      <span className="text-sm">of</span>
                      <CalendarSelectControl
                        id="recurrence-yearly-weekday-month"
                        value={yearlyWeekdayMonth}
                        onChange={setYearlyWeekdayMonth}
                        className="w-36"
                        options={monthOptions}
                      />
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

        <DialogFooter className="!flex-row flex-wrap justify-start gap-2 border-t px-4 py-3 sm:px-6 sm:py-4">
          <Button type="button" className="flex-1 sm:flex-none" onClick={handleSave}>
            Next
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1 sm:flex-none"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


