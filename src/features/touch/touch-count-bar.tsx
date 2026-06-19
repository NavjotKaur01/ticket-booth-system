import { Search } from "lucide-react"

import { StatsBar } from "@/components/common/stats-bar"
import { IconActionButton } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TouchShow } from "@/types/touch"

type TouchCountBarProps = {
  show: TouchShow
  seatValue: string
  onSeatValueChange: (value: string) => void
  onSearch: () => void
}

export function TouchCountBar({
  show,
  seatValue,
  onSeatValueChange,
  onSearch,
}: TouchCountBarProps) {
  const statItems = [
    { label: "Reservation", value: show.reservation },
    { label: "Available", value: show.available },
    { label: "Seated", value: show.seated },
  ]

  return (
    <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="touch-seat-count" className="text-xs font-medium">
            Seat
          </Label>
          <Input
            id="touch-seat-count"
            inputMode="numeric"
            value={seatValue}
            onChange={(event) => onSeatValueChange(event.target.value)}
            className="h-9 w-20 tabular-nums"
          />
        </div>

        <StatsBar items={statItems} />
      </div>

      <IconActionButton
        label="Search"
        icon={Search}
        variant="default"
        onClick={onSearch}
      />
    </div>
  )
}
