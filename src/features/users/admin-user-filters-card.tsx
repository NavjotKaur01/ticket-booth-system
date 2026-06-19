import { Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { IconActionButton } from "@/components/forms/form-fields"
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
          placeholder="User Name"
          value={filters.userName}
          onChange={(event) => onFilterChange("userName", event.target.value)}
          className="xl:max-w-36"
        />

        <Select
          value={filters.securityLevel || undefined}
          onValueChange={(value) =>
            onFilterChange("securityLevel", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full xl:max-w-40">
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
          <SelectTrigger className="w-full xl:max-w-32">
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
    </PanelCard>
  )
}
