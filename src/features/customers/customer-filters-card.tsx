import { Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import {
  FILTER_AREA_CLASS,
  FILTER_EMAIL_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_PHONE_CLASS,
  FILTER_ROW_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import type { CustomerSearchFilters } from "@/types/customer"

type CustomerFiltersCardProps = {
  filters: CustomerSearchFilters
  onFilterChange: (field: keyof CustomerSearchFilters, value: string) => void
  onSearch: () => void
  onClear: () => void
}

export function CustomerFiltersCard({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: CustomerFiltersCardProps) {
  return (
    <PanelCard>
      <div className={FILTER_ROW_CLASS}>
        <Input
          placeholder="Last Name"
          value={filters.lastName}
          onChange={(event) => onFilterChange("lastName", event.target.value)}
          className={FILTER_INPUT_CLASS}
        />
        <Input
          placeholder="First Name"
          value={filters.firstName}
          onChange={(event) => onFilterChange("firstName", event.target.value)}
          className={FILTER_INPUT_CLASS}
        />
        <Input
          placeholder="Email"
          value={filters.email}
          onChange={(event) => onFilterChange("email", event.target.value)}
          className={FILTER_EMAIL_CLASS}
        />
        <Input
          placeholder="Area Code"
          value={filters.areaCode}
          onChange={(event) => onFilterChange("areaCode", event.target.value)}
          className={FILTER_AREA_CLASS}
        />
        <Input
          placeholder="Phone1"
          value={filters.phone1}
          onChange={(event) => onFilterChange("phone1", event.target.value)}
          className={FILTER_PHONE_CLASS}
        />
        <Input
          placeholder="Phone2"
          value={filters.phone2}
          onChange={(event) => onFilterChange("phone2", event.target.value)}
          className={FILTER_PHONE_CLASS}
        />

        <div className="flex items-center gap-1.5">
          <IconActionButton
            label="Search"
            icon={Search}
            variant="default"
            onClick={onSearch}
          />
          <IconActionButton label="Clear" icon={X} onClick={onClear} />
        </div>
      </div>
    </PanelCard>
  )
}
