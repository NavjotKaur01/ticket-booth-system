import * as React from "react"
import dayjs from "dayjs"
import { CalendarClock, Clock3, MapPin, Ticket, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CalendarEvent } from "@/data/calendarEvents"

const EDITOR_CONTENT_CLASS =
  "w-[min(28rem,calc(100vw-1.5rem))] max-h-[min(42rem,calc(100vh-1.5rem))] overflow-y-auto p-0"

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const minutes = index * 15
  const time = dayjs().startOf("day").add(minutes, "minute")
  return { value: time.format("HH:mm"), label: time.format("h:mm A") }
})

type EventDraft = {
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: string
  capacity: string
  sold: string
  comp: string
  cancelled: boolean
}

export type EventEditorTarget = {
  anchor: { x: number; y: number }
  side: "left" | "right"
  start: Date
  end: Date
  event?: CalendarEvent
}

type EventFormProps = {
  target: EventEditorTarget
  locations: string[]
  defaultLocation: string
  onCancel: () => void
  onSave: (event: CalendarEvent) => void
}

type CalendarEventEditorPopoverProps = {
  target: EventEditorTarget | null
  onOpenChange: (open: boolean) => void
  locations: string[]
  defaultLocation: string
  onSave: (event: CalendarEvent) => void
  onDismissOutside: () => void
}

function roundDurationToInterval(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  let duration = end.diff(start, "minute")
  if (duration <= 0) duration += 24 * 60
  return Math.max(15, Math.ceil(duration / 15) * 15)
}

function createDraft(
  target: EventEditorTarget,
  defaultLocation: string
): EventDraft {
  const start = dayjs(target.event?.start ?? target.start)
  const rawEnd = dayjs(target.event?.end ?? target.end)
  const duration = roundDurationToInterval(start, rawEnd)
  const end = start.add(duration, "minute")

  return {
    title: target.event?.title ?? "",
    date: start.format("YYYY-MM-DD"),
    startTime: start.format("HH:mm"),
    endTime: end.format("HH:mm"),
    location: target.event?.location ?? defaultLocation,
    status: target.event?.status ?? "d",
    capacity: String(target.event?.seats.capacity ?? 100),
    sold: String(target.event?.seats.sold ?? 0),
    comp: String(target.event?.seats.comp ?? 0),
    cancelled: target.event?.cancelled ?? false,
  }
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} mins`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  const hourLabel = `${hours} ${hours === 1 ? "hr" : "hrs"}`
  return remainder ? `${hourLabel} ${remainder} mins` : hourLabel
}

function EventDatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = dayjs(`${value}T00:00:00`).toDate()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-start bg-muted/60 px-3 font-normal"
        >
          <CalendarClock className="text-muted-foreground" />
          {dayjs(selectedDate).format("dddd, D MMMM")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-auto p-0"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return
            onChange(dayjs(date).format("YYYY-MM-DD"))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function EventForm({
  target,
  locations,
  defaultLocation,
  onCancel,
  onSave,
}: EventFormProps) {
  const titleId = React.useId()
  const [draft, setDraft] = React.useState<EventDraft>(() =>
    createDraft(target, defaultLocation)
  )
  const [error, setError] = React.useState("")

  const updateDraft = <Key extends keyof EventDraft>(
    key: Key,
    value: EventDraft[Key]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const startDateTime = dayjs(`${draft.date}T${draft.startTime}`)
  const currentEndDateTime = dayjs(`${draft.date}T${draft.endTime}`)
  const currentDuration = roundDurationToInterval(
    startDateTime,
    currentEndDateTime
  )

  const endOptions = Array.from({ length: 48 }, (_, index) => {
    const duration = (index + 1) * 15
    const end = startDateTime.add(duration, "minute")
    return {
      value: end.format("HH:mm"),
      label: `${end.format("h:mm A")} (${formatDuration(duration)})`,
    }
  })

  const handleStartTimeChange = (value: string) => {
    const nextStart = dayjs(`${draft.date}T${value}`)
    updateDraft("startTime", value)
    updateDraft(
      "endTime",
      nextStart.add(currentDuration, "minute").format("HH:mm")
    )
  }

  const handleSubmit = (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    const title = draft.title.trim()
    const start = dayjs(`${draft.date}T${draft.startTime}`)
    let end = dayjs(`${draft.date}T${draft.endTime}`)

    if (!title) {
      setError("Add an event title.")
      return
    }

    if (!start.isValid() || !end.isValid()) {
      setError("Choose a valid date and time.")
      return
    }

    if (!end.isAfter(start)) end = end.add(1, "day")

    const capacity = Math.max(0, Number(draft.capacity) || 0)
    const sold = Math.max(0, Number(draft.sold) || 0)
    const comp = Math.max(0, Number(draft.comp) || 0)

    if (sold + comp > capacity) {
      setError("Sold and comp seats cannot exceed capacity.")
      return
    }

    onSave({
      id: target.event?.id ?? Date.now(),
      title,
      performer: title,
      start: start.toDate(),
      end: end.toDate(),
      seats: { sold, comp, capacity },
      time: start.format("h:mmA"),
      status: draft.status.trim() || "d",
      cancelled: draft.cancelled,
      location: draft.location,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-start gap-3 border-b px-4 py-3">
        <CalendarClock className="mt-2 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <Label htmlFor={titleId} className="sr-only">
            Event title
          </Label>
          <Input
            id={titleId}
            value={draft.title}
            onChange={(inputEvent) => updateDraft("title", inputEvent.target.value)}
            placeholder="Add title"
            autoFocus
            className="h-11 rounded-none border-x-0 border-t-0 px-0 text-lg font-medium shadow-none focus-visible:ring-0"
          />
          <span className="mt-2 inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            Event
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onCancel}
          aria-label="Close event editor"
        >
          <X />
        </Button>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-[1.25rem_1fr] gap-3">
          <Clock3 className="mt-2 size-5 text-muted-foreground" />
          <div className="space-y-2">
            <EventDatePicker
              value={draft.date}
              onChange={(value) => updateDraft("date", value)}
            />
            <div className="grid grid-cols-[1fr_auto_1.25fr] items-center gap-2">
              <Select value={draft.startTime} onValueChange={handleStartTimeChange}>
                <SelectTrigger className="w-full bg-muted/60">
                  <SelectValue aria-label="Start time" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="max-h-64! w-(--radix-select-trigger-width)"
                >
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">-</span>
              <Select
                value={draft.endTime}
                onValueChange={(value) => updateDraft("endTime", value)}
              >
                <SelectTrigger className="w-full bg-muted/60">
                  <SelectValue aria-label="End time" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="max-h-64! w-(--radix-select-trigger-width)"
                >
                  {endOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1.25rem_1fr] items-center gap-3">
          <MapPin className="size-5 text-muted-foreground" />
          <Select
            value={draft.location}
            onValueChange={(value) => updateDraft("location", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Add location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-[1.25rem_1fr] gap-3">
          <Ticket className="mt-2 size-5 text-muted-foreground" />
          <div className="grid grid-cols-3 gap-2">
            <Label className="gap-1 text-xs text-muted-foreground">
              Capacity
              <Input
                type="number"
                min={0}
                value={draft.capacity}
                onChange={(inputEvent) => updateDraft("capacity", inputEvent.target.value)}
              />
            </Label>
            <Label className="gap-1 text-xs text-muted-foreground">
              Sold
              <Input
                type="number"
                min={0}
                value={draft.sold}
                onChange={(inputEvent) => updateDraft("sold", inputEvent.target.value)}
              />
            </Label>
            <Label className="gap-1 text-xs text-muted-foreground">
              Comp
              <Input
                type="number"
                min={0}
                value={draft.comp}
                onChange={(inputEvent) => updateDraft("comp", inputEvent.target.value)}
              />
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-[1.25rem_1fr] items-center gap-3">
          <span aria-hidden="true" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={draft.cancelled}
                onCheckedChange={(checked) =>
                  updateDraft("cancelled", checked === true)
                }
              />
              Cancelled
            </Label>
            <Input
              value={draft.status}
              onChange={(inputEvent) => updateDraft("status", inputEvent.target.value)}
              aria-label="Event status"
              placeholder="Status"
              className="w-24"
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 border-t px-4 py-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

export function CalendarEventEditorPopover({
  target,
  onOpenChange,
  locations,
  defaultLocation,
  onSave,
  onDismissOutside,
}: CalendarEventEditorPopoverProps) {
  const handleSave = (event: CalendarEvent) => {
    onSave(event)
    onOpenChange(false)
  }

  return (
    <Popover open={target !== null} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-40 size-px"
          style={{ left: target?.anchor.x ?? 0, top: target?.anchor.y ?? 0 }}
        />
      </PopoverAnchor>
      {target ? (
        <PopoverContent
          data-calendar-event-editor="true"
          side={target.side}
          align="start"
          sideOffset={10}
          className={EDITOR_CONTENT_CLASS}
          onPointerDownOutside={(outsideEvent) => {
            const outsideTarget = outsideEvent.target as Element
            if (outsideTarget.closest('[data-calendar-overflow="true"]')) {
              outsideEvent.preventDefault()
              return
            }
            onDismissOutside()
          }}
        >
          <EventForm
            key={`${target.event?.id ?? "new"}-${target.start.getTime()}-${target.end.getTime()}`}
            target={target}
            locations={locations}
            defaultLocation={defaultLocation}
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
          />
        </PopoverContent>
      ) : null}
    </Popover>
  )
}
