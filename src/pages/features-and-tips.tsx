import { Plus } from "lucide-react"
import { useCallback, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { featureTips as initialRecords } from "@/data/feature-tips"
import { FeatureTipDialog } from "@/features/features-and-tips/feature-tip-dialog"
import { FeatureTipsDataTable } from "@/features/features-and-tips/feature-tips-data-table"
import type { FeatureTip } from "@/types/feature-tip"

export function FeaturesAndTips() {
  const [records, setRecords] = useState<FeatureTip[]>(initialRecords)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FeatureTip | null>(null)

  const openCreate = useCallback(() => {
    setEditingRecord(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((record: FeatureTip) => {
    setEditingRecord(record)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback((record: FeatureTip) => {
    setRecords((current) => current.filter((item) => item.id !== record.id))
  }, [])

  function handleSave(record: FeatureTip) {
    setRecords((current) => {
      const exists = current.some((item) => item.id === record.id)
      if (exists) {
        return current.map((item) => (item.id === record.id ? record : item))
      }
      return [...current, record]
    })
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        News, Features, and Tips
      </h1>

      <PanelCard>
        <div className="border-b bg-muted/30 px-3 py-2">
          <p className="text-center text-xs font-semibold tracking-wide text-foreground uppercase">
            News, Features, and Tips for Dashboard Home Page
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Drag a column header here to group by that column
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {records.length}
              </span>
            </p>
            <Button type="button" size="sm" className="gap-1.5" onClick={openCreate}>
              <Plus className="size-3.5" />
              New
            </Button>
          </div>
        </div>

        <FeatureTipsDataTable
          data={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PanelCard>

      <FeatureTipDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
        onSaved={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
