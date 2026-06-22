import { Search, X } from "lucide-react"

import {
  createFilterSearchHandlers,
  FILTER_AREA_CLASS,
  FILTER_EMAIL_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_PHONE_CLASS,
  FILTER_ROW_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import type { CustomerSearchFilters } from "@/types/customer"

type CustomerSearchToolbarProps = {
  filters: CustomerSearchFilters
  onFilterChange: (field: keyof CustomerSearchFilters, value: string) => void
  onSearch: () => void
  onClear: () => void
}

export function CustomerSearchToolbar({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: CustomerSearchToolbarProps) {
  const { handleSubmit, handleInputKeyDown } = createFilterSearchHandlers(onSearch)

  return (
    <form className={FILTER_ROW_CLASS} onSubmit={handleSubmit}>
      <Input
        placeholder="Last Name"
        value={filters.lastName}
        onChange={(event) => onFilterChange("lastName", event.target.value)}
        onKeyDown={handleInputKeyDown}
        className={FILTER_INPUT_CLASS}
      />
      <Input
        placeholder="First Name"
        value={filters.firstName}
        onChange={(event) => onFilterChange("firstName", event.target.value)}
        onKeyDown={handleInputKeyDown}
        className={FILTER_INPUT_CLASS}
      />
      <Input
        placeholder="Email"
        value={filters.email}
        onChange={(event) => onFilterChange("email", event.target.value)}
        onKeyDown={handleInputKeyDown}
        className={FILTER_EMAIL_CLASS}
      />
      <Input
        placeholder="Area Code"
        value={filters.areaCode}
        onChange={(event) => onFilterChange("areaCode", event.target.value)}
        onKeyDown={handleInputKeyDown}
        className={FILTER_AREA_CLASS}
      />
      <Input
        placeholder="Phone1"
        value={filters.phone1}
        onChange={(event) => onFilterChange("phone1", event.target.value)}
        onKeyDown={handleInputKeyDown}
        className={FILTER_PHONE_CLASS}
      />
      <Input
        placeholder="Phone2"
        value={filters.phone2}
        onChange={(event) => onFilterChange("phone2", event.target.value)}
        onKeyDown={handleInputKeyDown}
        className={FILTER_PHONE_CLASS}
      />

      <div className="flex items-center gap-1.5">
        <IconActionButton
          label="Search"
          icon={Search}
          variant="default"
          type="submit"
        />
        <IconActionButton label="Clear" icon={X} onClick={onClear} />
      </div>
    </form>
  )
}
