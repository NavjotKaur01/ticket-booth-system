import { Search, X } from "lucide-react"

import {
  FILTER_EMAIL_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_ROW_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
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
    <div className={FILTER_ROW_CLASS}>
      <Input
        placeholder="Business Name"
        value={filters.businessName}
        onChange={(event) =>
          onFilterChange("businessName", event.target.value)
        }
        className={FILTER_EMAIL_CLASS}
      />
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

      <div className="flex items-center gap-1.5 sm:ml-auto">
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
