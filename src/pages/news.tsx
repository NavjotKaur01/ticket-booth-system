import { Plus } from "lucide-react"
import { useCallback, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { dashboardNewsItems as initialRecords } from "@/data/dashboard-news"
import { DashboardNewsDataTable } from "@/features/dashboard-news/dashboard-news-data-table"
import { DashboardNewsDialog } from "@/features/dashboard-news/dashboard-news-dialog"
import type { DashboardNewsItem } from "@/types/dashboard-news"

export function News() {
  const [records, setRecords] = useState<DashboardNewsItem[]>(initialRecords)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DashboardNewsItem | null>(null)

  const openCreate = useCallback(() => {
    setEditingRecord(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((record: DashboardNewsItem) => {
    setEditingRecord(record)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback((record: DashboardNewsItem) => {
    setRecords((current) => current.filter((item) => item.id !== record.id))
  }, [])

  function handleSave(record: DashboardNewsItem) {
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
        Dashboard News Management
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
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

        <DashboardNewsDataTable
          data={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PanelCard>

      <DashboardNewsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
        onSaved={handleSave}
      />
    </div>
  )
}
