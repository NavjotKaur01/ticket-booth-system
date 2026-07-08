import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { clubReservationSettings as initialClubReservationSettings } from "@/data/club-reservation-settings"
import { ClubReservationSettingDataTable } from "@/features/club-reservation-settings/club-reservation-setting-data-table"
import { ClubReservationSettingDialog } from "@/features/club-reservation-settings/club-reservation-setting-dialog"
import type { ClubReservationSetting } from "@/types/club-reservation-setting"

export function ClubReservationSettings() {
  const [records, setRecords] = useState<ClubReservationSetting[]>(
    initialClubReservationSettings
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ClubReservationSetting | null>(null)

  function handleSave(record: ClubReservationSetting) {
    setRecords((current) =>
      current.map((item) => (item.id === record.id ? record : item))
    )
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Club Settings
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {records.length}
            </span>
          </p>
        </div>

        <ClubReservationSettingDataTable
          data={records}
          onEdit={(record) => {
            setEditingRecord(record)
            setDialogOpen(true)
          }}
        />
      </PanelCard>

      <ClubReservationSettingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
        onSaved={handleSave}
      />
    </div>
  )
}
