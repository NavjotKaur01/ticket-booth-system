import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useAppSession } from "@/hooks/use-app-session"
import { useLocations } from "@/hooks/use-locations"
import { findLocationById } from "@/lib/api/locations"

type LocationSelectProps = {
  className?: string
}

export function LocationSelect({ className }: LocationSelectProps) {
  const { switchLocation } = useAuth()
  const { clubSlug, locationId, locSName } = useAppSession()
  const { locations, loading, error } = useLocations(clubSlug)

  function handleChange(nextLocationId: string) {
    const location = findLocationById(nextLocationId, locations)
    if (location) {
      switchLocation(location)
    }
  }

  function getLocationLabel(location: (typeof locations)[number]) {
    return location.shortName || location.label || location.id
  }

  const selectedLocation =
    locations.find((location) => location.id === locationId) ?? null

  return (
    <div className={className}>
      <Select
        value={locationId || undefined}
        onValueChange={handleChange}
        disabled={loading || locations.length === 0}
      >
        <SelectTrigger className="h-8 w-full min-w-[9rem] bg-background sm:min-w-[11rem]">
          <SelectValue
            placeholder={
              loading
                ? "Loading..."
                : error
                  ? "Location unavailable"
                  : "Select location"
            }
          >
            {selectedLocation
              ? getLocationLabel(selectedLocation)
              : locSName || undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {getLocationLabel(location)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
