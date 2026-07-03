import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { systemDefaults as initialSystemDefaults } from "@/data/system-defaults"
import { SystemDefaultsDataTable } from "@/features/system-defaults/system-defaults-data-table"
import { SystemDefaultsScreenFilter } from "@/features/system-defaults/system-defaults-screen-filter"
import { useAppSession } from "@/hooks/use-app-session"
import { filterSystemDefaults } from "@/lib/filter-system-defaults"
import { EMPTY_SYSTEM_DEFAULT_FILTERS, type SystemDefault } from "@/types/system-default"

const SYSTEM_DEFAULT_HIDDEN_ACTIONS = ["Delete", "Add"] as const

export function SystemDefaults() {
  const { username } = useAppSession()
  const [records, setRecords] = useState(initialSystemDefaults)
  const [filters, setFilters] = useState(EMPTY_SYSTEM_DEFAULT_FILTERS)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)

  const filteredRecords = useMemo(
    () => filterSystemDefaults(records, filters),
    [filters, records]
  )

  function handleOpenEdit(record: SystemDefault) {
    setEditingRecordId(record.id)
  }

  function handleSaveValue(record: SystemDefault, value: string) {
    setRecords((currentRecords) =>
      currentRecords.map((currentRecord) =>
        currentRecord.id === record.id
          ? {
              ...currentRecord,
              defaultValue: value,
              lastUpdateId: username || currentRecord.lastUpdateId,
              lastUpdateDt: new Date().toLocaleString(),
            }
          : currentRecord
      )
    )
    setEditingRecordId(null)
  }

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
          editingRecordId={editingRecordId}
          onEdit={handleOpenEdit}
          onCancelEdit={() => setEditingRecordId(null)}
          onSaveValue={handleSaveValue}
        />
      </PanelCard>
    </div>
  )
}
