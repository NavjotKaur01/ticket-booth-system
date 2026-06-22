import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useLocations } from "@/hooks/use-locations"
import { findLocationById } from "@/lib/api/locations"

type LocationSelectProps = {
  className?: string
}

export function LocationSelect({ className }: LocationSelectProps) {
  const { session, switchLocation } = useAuth()
  const { locations, loading, error } = useLocations(session?.clubSlug ?? "")
  const selectedId = session?.locationId ?? ""

  function handleChange(locationId: string) {
    const location = findLocationById(locationId, locations)
    if (location) {
      switchLocation(location)
    }
  }

  return (
    <div className={className}>
      <Select
        value={selectedId || undefined}
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
          />
        </SelectTrigger>
        <SelectContent align="end">
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
