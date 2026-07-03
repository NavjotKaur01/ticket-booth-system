import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { systemDefaults } from "@/data/system-defaults"
import { SystemDefaultsDataTable } from "@/features/system-defaults/system-defaults-data-table"
import { SystemDefaultsScreenFilter } from "@/features/system-defaults/system-defaults-screen-filter"
import { filterSystemDefaults } from "@/lib/filter-system-defaults"
import { EMPTY_SYSTEM_DEFAULT_FILTERS } from "@/types/system-default"

const SYSTEM_DEFAULT_HIDDEN_ACTIONS = ["Delete"] as const

export function SystemDefaults() {
  const [filters, setFilters] = useState(EMPTY_SYSTEM_DEFAULT_FILTERS)

  const filteredRecords = useMemo(
    () => filterSystemDefaults(systemDefaults, filters),
    [filters]
  )

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Defaults
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <SystemDefaultsScreenFilter
            filters={filters}
            onScreenChange={(screen) => setFilters({ screen })}
          />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Double-Click
            to edit
          </p>
        </div>

        <SystemDefaultsDataTable
          data={filteredRecords}
          hiddenActions={SYSTEM_DEFAULT_HIDDEN_ACTIONS}
        />
      </PanelCard>
    </div>
  )
}
