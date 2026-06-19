import { Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import {
  FILTER_INPUT_CLASS,
  FILTER_ROW_CLASS,
  FILTER_SELECT_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { securityLevelOptions, userStatusOptions } from "@/data/users"
import type { AdminUserSearchFilters } from "@/types/user-admin"

type AdminUserFiltersCardProps = {
  filters: AdminUserSearchFilters
  onFilterChange: (field: keyof AdminUserSearchFilters, value: string) => void
  onSearch: () => void
  onClear: () => void
}

export function AdminUserFiltersCard({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: AdminUserFiltersCardProps) {
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
          placeholder="User Name"
          value={filters.userName}
          onChange={(event) => onFilterChange("userName", event.target.value)}
          className={FILTER_INPUT_CLASS}
        />

        <Select
          value={filters.securityLevel || undefined}
          onValueChange={(value) =>
            onFilterChange("securityLevel", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className={FILTER_SELECT_CLASS}>
            <SelectValue placeholder="Security Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {securityLevelOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.active || undefined}
          onValueChange={(value) =>
            onFilterChange("active", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className={FILTER_INPUT_CLASS}>
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {userStatusOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
