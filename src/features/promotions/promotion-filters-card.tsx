import { Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { IconActionButton } from "@/components/forms/form-fields"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { promotionScopeOptions } from "@/data/promotions"
import type { PromotionFilters } from "@/types/promotion"

type PromotionFiltersCardProps = {
  filters: PromotionFilters
  onFilterChange: <K extends keyof PromotionFilters>(
    key: K,
    value: PromotionFilters[K]
  ) => void
  onSearch: () => void
  onClear: () => void
}

export function PromotionFiltersCard({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: PromotionFiltersCardProps) {
  return (
    <PanelCard>
      <div className="space-y-3 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <Input
            placeholder="Promotion Name"
            value={filters.promotionName}
            onChange={(event) =>
              onFilterChange("promotionName", event.target.value)
            }
            className="min-w-0 w-full basis-full sm:basis-auto sm:max-w-48 sm:flex-1"
          />
          <Input
            placeholder="Promotion Code"
            value={filters.promotionCode}
            onChange={(event) =>
              onFilterChange("promotionCode", event.target.value)
            }
            className="min-w-0 w-full basis-full sm:basis-auto sm:max-w-44 sm:flex-1"
          />
          <Select
            value={filters.promoScope}
            onValueChange={(value) => onFilterChange("promoScope", value)}
          >
            <SelectTrigger className="w-full sm:w-40 sm:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {promotionScopeOptions.map((option) => (
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
            <IconActionButton
              label="Clear"
              icon={X}
              variant="outline"
              onClick={onClear}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
          <Checkbox
            checked={filters.displayExpired}
            onCheckedChange={(value) =>
              onFilterChange("displayExpired", value === true)
            }
          />
          Display Expired Promotions
        </label>
      </div>
    </PanelCard>
  )
}
