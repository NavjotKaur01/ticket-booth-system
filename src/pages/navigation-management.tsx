import { Plus } from "lucide-react"
import { useCallback, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { navigationManagementRecords as initialRecords } from "@/data/navigation-admin"
import { NavigationManagementDataTable } from "@/features/navigation-admin/navigation-management-data-table"
import { NavigationManagementDialog } from "@/features/navigation-admin/navigation-management-dialog"
import type { NavigationManagementRecord } from "@/types/navigation-admin"

export function NavigationManagement() {
  const [records, setRecords] = useState<NavigationManagementRecord[]>(initialRecords)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<NavigationManagementRecord | null>(null)

  const openCreate = useCallback(() => {
    setEditingRecord(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((record: NavigationManagementRecord) => {
    setEditingRecord(record)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback((record: NavigationManagementRecord) => {
    setRecords((current) => current.filter((item) => item.id !== record.id))
  }, [])

  function handleSave(record: NavigationManagementRecord) {
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
      <AdminPageTitle>Navigation Menu Management</AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar>
          <AdminPanelStats>
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {records.length}
            </span>
          </AdminPanelStats>
          <AdminPanelActions>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={openCreate}
            >
              <Plus className="size-3.5" />
              New
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <NavigationManagementDataTable
          data={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PanelCard>

      <NavigationManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
        onSaved={handleSave}
      />
    </AdminPageShell>
  )
}
