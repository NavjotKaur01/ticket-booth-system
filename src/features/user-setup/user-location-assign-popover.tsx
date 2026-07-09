import { Search } from "lucide-react"
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

type UserLocationAssignPopoverProps = {
  userName: string
  locations: string[]
  assignedLocations: string[]
  onSave: (assignedLocations: string[]) => void
  triggerLabel?: string
}

export function UserLocationAssignPopover({
  userName,
  locations,
  assignedLocations,
  onSave,
  triggerLabel = "Assign",
}: UserLocationAssignPopoverProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [draftSelection, setDraftSelection] = useState<string[]>(assignedLocations)

  useEffect(() => {
    if (open) {
      setDraftSelection(assignedLocations)
      setSearch("")
    }
  }, [assignedLocations, open])

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return locations
    return locations.filter((location) =>
      location.toLowerCase().includes(query)
    )
  }, [locations, search])

  const hasChanges = useMemo(() => {
    if (draftSelection.length !== assignedLocations.length) return true
    return draftSelection.some(
      (location) => !assignedLocations.includes(location)
    )
  }, [assignedLocations, draftSelection])

  function toggleLocation(location: string, checked: boolean) {
    setDraftSelection((current) =>
      checked
        ? [...current, location]
        : current.filter((item) => item !== location)
    )
  }

  function toggleAllVisible() {
    const allVisibleSelected = filteredLocations.every((location) =>
      draftSelection.includes(location)
    )

    setDraftSelection((current) => {
      if (allVisibleSelected) {
        return current.filter((location) => !filteredLocations.includes(location))
      }

      return Array.from(new Set([...current, ...filteredLocations]))
    })
  }

  function handleSave() {
    onSave(draftSelection)
    setOpen(false)
  }

  const selectedCount = draftSelection.length
  const allVisibleSelected =
    filteredLocations.length > 0 &&
    filteredLocations.every((location) => draftSelection.includes(location))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" className="h-7 shrink-0 px-2.5 text-xs">
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Assign locations</p>
          <p className="truncate text-xs text-muted-foreground">{userName}</p>
        </div>

        <div className="space-y-2 p-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search locations..."
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
              disabled={filteredLocations.length === 0}
            >
              {allVisibleSelected ? "Clear shown" : "Select shown"}
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {selectedCount} selected
            </span>
          </div>

          <div className="calendar-thin-scrollbar max-h-56 space-y-0.5 overflow-y-auto rounded-md border border-border p-1.5">
            {filteredLocations.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No locations match your search.
              </p>
            ) : (
              filteredLocations.map((location) => {
                const checked = draftSelection.includes(location)
                const inputId = `assign-${userName}-${location}`

                return (
                  <label
                    key={location}
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
                        toggleLocation(location, value === true)
                      }
                    />
                    <span className="truncate text-sm font-normal">{location}</span>
                  </label>
                )
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-3 py-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={!hasChanges}>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
