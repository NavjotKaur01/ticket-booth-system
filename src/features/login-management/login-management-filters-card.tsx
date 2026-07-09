import { Search } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import {
  createFilterSearchHandlers,
  FILTER_EMAIL_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import type { CustomerLoginSearchFilters } from "@/types/customer-login"

type LoginManagementFiltersCardProps = {
  filters: CustomerLoginSearchFilters
  onFilterChange: (field: keyof CustomerLoginSearchFilters, value: string) => void
  onSearch: () => void
}

export function LoginManagementFiltersCard({
  filters,
  onFilterChange,
  onSearch,
}: LoginManagementFiltersCardProps) {
  const { handleSubmit, handleInputKeyDown } = createFilterSearchHandlers(onSearch)

  return (
    <PanelCard>
      <form
        className={`${FILTER_ROW_INNER_CLASS} border-b px-3 py-3`}
        onSubmit={handleSubmit}
      >
        <Input
          placeholder="Customer Email"
          value={filters.email}
          onChange={(event) => onFilterChange("email", event.target.value)}
          onKeyDown={handleInputKeyDown}
          className={FILTER_EMAIL_CLASS}
        />
        <Input
          placeholder="Customer First Name"
          value={filters.firstName}
          onChange={(event) => onFilterChange("firstName", event.target.value)}
          onKeyDown={handleInputKeyDown}
          className={FILTER_INPUT_CLASS}
        />
        <Input
          placeholder="Customer Last Name"
          value={filters.lastName}
          onChange={(event) => onFilterChange("lastName", event.target.value)}
          onKeyDown={handleInputKeyDown}
          className={FILTER_INPUT_CLASS}
        />

        <IconActionButton
          label="Search"
          icon={Search}
          variant="default"
          type="submit"
        />
      </form>
    </PanelCard>
  )
}
