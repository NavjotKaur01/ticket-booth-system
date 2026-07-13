import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { SystemDefaultsDataTable } from "@/features/system-defaults/system-defaults-data-table"
import { SystemDefaultsScreenFilter } from "@/features/system-defaults/system-defaults-screen-filter"
import { useAppSession } from "@/hooks/use-app-session"
import { updateSystemDefault } from "@/lib/api/system-defaults"
import { buildUpdateSystemDefaultRequest } from "@/lib/build-update-system-default-request"
import { filterSystemDefaults } from "@/lib/filter-system-defaults"
import {
  buildSystemDefaultScreenOptions,
  filterVisibleSystemDefaultItems,
  isSystemDefaultEditBlocked,
  mapSystemDefaults,
} from "@/lib/map-system-defaults"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetSystemDefaultsQuery } from "@/store/api/clubmanApi"
import {
  EMPTY_SYSTEM_DEFAULT_FILTERS,
  SYSTEM_DEFAULTS_SYSTEM_RIGHT,
  type SystemDefault,
} from "@/types/system-default"

const SYSTEM_DEFAULT_HIDDEN_ACTIONS = ["Delete", "Add"] as const

export function SystemDefaults() {
  const { connectionName, locationId, username, userRight, isReady } =
    useAppSession()
  const [filters, setFilters] = useState(EMPTY_SYSTEM_DEFAULT_FILTERS)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    data: apiDefaults = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !isReady || !connectionName || !locationId }
  )

  const records = useMemo(
    () =>
      mapSystemDefaults(
        filterVisibleSystemDefaultItems(apiDefaults, userRight)
      ),
    [apiDefaults, userRight]
  )

  const screenOptions = useMemo(
    () => buildSystemDefaultScreenOptions(records),
    [records]
  )

  const filteredRecords = useMemo(
    () => filterSystemDefaults(records, filters),
    [filters, records]
  )

  const canEditDescription =
    userRight.trim().toUpperCase() === SYSTEM_DEFAULTS_SYSTEM_RIGHT

  function handleOpenEdit(record: SystemDefault) {
    if (isSystemDefaultEditBlocked(record)) {
      setActionError("This system default cannot be edited.")
      return
    }
    setActionError(null)
    setEditingRecordId(record.id)
  }

  async function handleSaveValue(
    record: SystemDefault,
    value: string,
    description?: string
  ) {
    if (isSystemDefaultEditBlocked(record)) {
      setActionError("This system default cannot be edited.")
      setEditingRecordId(null)
      return
    }
    if (!value.trim()) {
      setActionError("Please enter a default value.")
      return
    }
    if (!isReady || !connectionName || !locationId) {
      setActionError("Location is required before updating a system default.")
      return
    }

    setSaving(true)
    setActionError(null)

    try {
      const updated = await updateSystemDefault(
        buildUpdateSystemDefaultRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          defaultId: record.id,
          defaultValue: value.trim(),
          description: description ?? record.description,
        })
      )
      if (!updated) {
        setActionError("Unable to update system default.")
        return
      }
      setEditingRecordId(null)
      await refetch()
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : getClubmanErrorMessage(saveError)
      )
    } finally {
      setSaving(false)
    }
  }

  const emptyMessage =
    isLoading || isFetching
      ? "Loading system defaults..."
      : "No record found"

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Applications Default Data
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <SystemDefaultsScreenFilter
            filters={filters}
            screenOptions={screenOptions}
            onScreenChange={(screen) => setFilters({ screen })}
          />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Double-Click
            to edit
          </p>
        </div>

        {error || actionError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {actionError || getClubmanErrorMessage(error)}
          </p>
        ) : null}

        <SystemDefaultsDataTable
          data={filteredRecords}
          emptyMessage={emptyMessage}
          hiddenActions={SYSTEM_DEFAULT_HIDDEN_ACTIONS}
          editingRecordId={saving ? null : editingRecordId}
          canEditDescription={canEditDescription}
          onEdit={handleOpenEdit}
          onCancelEdit={() => setEditingRecordId(null)}
          onSaveValue={(record, value, description) =>
            void handleSaveValue(record, value, description)
          }
        />
      </PanelCard>
    </div>
  )
}
