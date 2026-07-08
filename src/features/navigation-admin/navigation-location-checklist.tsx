import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type NavigationLocationChecklistProps = {
  locations: string[]
  selectedLocations: string[]
  onToggleLocation: (location: string, checked: boolean) => void
  className?: string
}

export function NavigationLocationChecklist({
  locations,
  selectedLocations,
  onToggleLocation,
  className,
}: NavigationLocationChecklistProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground">
        {selectedLocations.length} of {locations.length} locations selected
      </p>

      <div className="calendar-thin-scrollbar max-h-80 overflow-y-auto rounded-md border border-border p-2">
        <div className="grid gap-1 sm:grid-cols-2">
          {locations.map((location) => {
            const checked = selectedLocations.includes(location)
            const inputId = `nav-location-${location}`

            return (
              <label
                key={location}
                htmlFor={inputId}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  checked ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                )}
              >
                <Checkbox
                  id={inputId}
                  checked={checked}
                  onCheckedChange={(value) =>
                    onToggleLocation(location, value === true)
                  }
                />
                {location}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
