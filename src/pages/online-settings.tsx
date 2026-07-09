import { Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { onlineSettings as initialOnlineSettings } from "@/data/online-settings"
import { OnlineSettingDataTable } from "@/features/online-settings/online-setting-data-table"
import { OnlineSettingDialog } from "@/features/online-settings/online-setting-dialog"
import type { OnlineSetting } from "@/types/online-setting"

export function OnlineSettings() {
  const [records, setRecords] = useState<OnlineSetting[]>(initialOnlineSettings)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<OnlineSetting | null>(null)

  function handleSave(record: OnlineSetting) {
    setRecords((current) => {
      const exists = current.some((item) => item.id === record.id)
      if (exists) {
        return current.map((item) => (item.id === record.id ? record : item))
      }
      return [...current, record]
    })
  }

  function handleDelete(record: OnlineSetting) {
    setRecords((current) => current.filter((item) => item.id !== record.id))
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Online Settings Data
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {records.length}
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingRecord(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-3.5" />
            New
          </Button>
        </div>

        <OnlineSettingDataTable
          data={records}
          onEdit={(record) => {
            setEditingRecord(record)
            setDialogOpen(true)
          }}
          onDelete={handleDelete}
        />
      </PanelCard>

      <OnlineSettingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
        onSaved={handleSave}
      />
    </div>
  )
}
