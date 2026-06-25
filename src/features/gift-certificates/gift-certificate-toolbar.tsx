import { Search, X } from "lucide-react"

import {
  FILTER_INPUT_CLASS,
  FILTER_ROW_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import type { GiftCertificateSearchFilters } from "@/types/gift-certificate"

type GiftCertificateToolbarProps = {
  filters: GiftCertificateSearchFilters
  onFilterChange: (
    field: keyof GiftCertificateSearchFilters,
    value: string
  ) => void
  onSearch: () => void
  onClear: () => void
}

export function GiftCertificateToolbar({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: GiftCertificateToolbarProps) {
  return (
    <div className={FILTER_ROW_CLASS}>
      <Input
        placeholder="Certificate No."
        value={filters.certificateNo}
        onChange={(event) =>
          onFilterChange("certificateNo", event.target.value)
        }
        className="h-9 w-full sm:w-52"
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
  )
}
