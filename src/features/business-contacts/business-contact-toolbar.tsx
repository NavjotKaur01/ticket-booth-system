import { Search, X } from "lucide-react"

import { IconActionButton } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import type { BusinessContactSearchFilters } from "@/types/business-contact"

type BusinessContactToolbarProps = {
  filters: BusinessContactSearchFilters
  onFilterChange: (
    field: keyof BusinessContactSearchFilters,
    value: string
  ) => void
  onSearch: () => void
  onClear: () => void
}

export function BusinessContactToolbar({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: BusinessContactToolbarProps) {
  return (
    <div className="flex flex-col gap-3 p-3 xl:flex-row xl:items-end xl:gap-2">
      <Input
        placeholder="Business Name"
        value={filters.businessName}
        onChange={(event) =>
          onFilterChange("businessName", event.target.value)
        }
        className="min-w-0 flex-1"
      />
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

      <div className="flex items-center gap-1.5 xl:ml-auto">
        <IconActionButton
          label="Search"
          icon={Search}
          variant="default"
          onClick={onSearch}
        />
        <IconActionButton label="Clear" icon={X} onClick={onClear} />
      </div>
    </div>
  )
}
