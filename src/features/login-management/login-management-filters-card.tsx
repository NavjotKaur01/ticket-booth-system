import { Search } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import {
  createFilterSearchHandlers,
  FILTER_EMAIL_CLASS,
  FILTER_INPUT_CLASS,
  FormField,
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
        className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={handleSubmit}
      >
        <FormField label="Customer Email" htmlFor="login-mgmt-email">
          <Input
            id="login-mgmt-email"
            value={filters.email}
            onChange={(event) => onFilterChange("email", event.target.value)}
            onKeyDown={handleInputKeyDown}
            className={FILTER_EMAIL_CLASS}
          />
        </FormField>

        <FormField label="Customer First Name" htmlFor="login-mgmt-first-name">
          <Input
            id="login-mgmt-first-name"
            value={filters.firstName}
            onChange={(event) => onFilterChange("firstName", event.target.value)}
            onKeyDown={handleInputKeyDown}
            className={FILTER_INPUT_CLASS}
          />
        </FormField>

        <FormField label="Customer Last Name" htmlFor="login-mgmt-last-name">
          <Input
            id="login-mgmt-last-name"
            value={filters.lastName}
            onChange={(event) => onFilterChange("lastName", event.target.value)}
            onKeyDown={handleInputKeyDown}
            className={FILTER_INPUT_CLASS}
          />
        </FormField>

        <div className="flex items-end">
          <IconActionButton
            label="Search"
            icon={Search}
            variant="default"
            type="submit"
          />
        </div>
      </form>
    </PanelCard>
  )
}
