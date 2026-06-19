import { Search } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CustomerSearchFilters } from "@/types/customer"

type CustomerFiltersCardProps = {
  filters: CustomerSearchFilters
  onFilterChange: (field: keyof CustomerSearchFilters, value: string) => void
  onSearch: () => void
}

export function CustomerFiltersCard({
  filters,
  onFilterChange,
  onSearch,
}: CustomerFiltersCardProps) {
  return (
    <PanelCard>
      <div className="flex flex-col gap-3 p-3 xl:flex-row xl:items-end xl:gap-2">
        <Input
          placeholder="Last Name"
          value={filters.lastName}
          onChange={(event) => onFilterChange("lastName", event.target.value)}
          className="xl:max-w-36"
        />
        <Input
          placeholder="First Name"
          value={filters.firstName}
          onChange={(event) => onFilterChange("firstName", event.target.value)}
          className="xl:max-w-36"
        />
        <Input
          placeholder="Email"
          value={filters.email}
          onChange={(event) => onFilterChange("email", event.target.value)}
          className="min-w-0 flex-1"
        />
        <Input
          placeholder="Area Code"
          value={filters.areaCode}
          onChange={(event) => onFilterChange("areaCode", event.target.value)}
          className="xl:max-w-28"
        />
        <Input
          placeholder="Phone1"
          value={filters.phone1}
          onChange={(event) => onFilterChange("phone1", event.target.value)}
          className="xl:max-w-32"
        />
        <Input
          placeholder="Phone2"
          value={filters.phone2}
          onChange={(event) => onFilterChange("phone2", event.target.value)}
          className="xl:max-w-32"
        />

        <Button
          type="button"
          size="sm"
          className="gap-1.5 xl:ml-auto"
          onClick={onSearch}
        >
          <Search className="size-3.5" />
          Search
        </Button>
      </div>
    </PanelCard>
  )
}
