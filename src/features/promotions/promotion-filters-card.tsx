import { Search, X } from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import {
  FILTER_EMAIL_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_ROW_INNER_CLASS,
  FILTER_SELECT_CLASS,
  IconActionButton,
} from "@/components/forms/form-fields"
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
        <div className={FILTER_ROW_INNER_CLASS}>
          <Input
            placeholder="Promotion Name"
            value={filters.promotionName}
            onChange={(event) =>
              onFilterChange("promotionName", event.target.value)
            }
            className={FILTER_EMAIL_CLASS}
          />
          <Input
            placeholder="Promotion Code"
            value={filters.promotionCode}
            onChange={(event) =>
              onFilterChange("promotionCode", event.target.value)
            }
            className={FILTER_INPUT_CLASS}
          />
          <Select
            value={filters.promoScope}
            onValueChange={(value) => onFilterChange("promoScope", value)}
          >
            <SelectTrigger className={FILTER_SELECT_CLASS}>
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
