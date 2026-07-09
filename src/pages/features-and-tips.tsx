import { Plus } from "lucide-react"
import { useCallback, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
  ADMIN_SECTION_BANNER_CLASS,
  ADMIN_SECTION_BANNER_TEXT_CLASS,
} from "@/components/layout/admin-page"
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
    <AdminPageShell>
      <AdminPageTitle>News, Features, and Tips</AdminPageTitle>

      <PanelCard>
        <div className={ADMIN_SECTION_BANNER_CLASS}>
          <p className={ADMIN_SECTION_BANNER_TEXT_CLASS}>
            News, Features, and Tips for Dashboard Home Page
          </p>
        </div>

        <AdminPanelToolbar>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Drag a column header here to group by that column
          </p>
          <AdminPanelActions className="sm:ml-auto">
            <AdminPanelStats>
              Records:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {records.length}
              </span>
            </AdminPanelStats>
            <Button type="button" size="sm" className="gap-1.5" onClick={openCreate}>
              <Plus className="size-3.5" />
              New
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

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
    </AdminPageShell>
  )
}
