import { useCallback, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { navigationDropdownParents as initialParents } from "@/data/navigation-admin"
import { NavigationDropDownItemDialog } from "@/features/navigation-admin/navigation-dropdown-item-dialog"
import { NavigationDropdownList } from "@/features/navigation-admin/navigation-dropdown-list"
import type {
  NavigationDropDownItem,
  NavigationDropdownParent,
} from "@/types/navigation-admin"

export function NavigationDropDowns() {
  const [parents, setParents] = useState<NavigationDropdownParent[]>(initialParents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeParentId, setActiveParentId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<NavigationDropDownItem | null>(null)

  const totalDropDowns = useMemo(
    () => parents.reduce((count, parent) => count + parent.dropDowns.length, 0),
    [parents]
  )

  const openCreate = useCallback((parentId: string) => {
    setActiveParentId(parentId)
    setEditingItem(null)
    setDialogOpen(true)
  }, [])

  const openEdit = useCallback((parentId: string, item: NavigationDropDownItem) => {
    setActiveParentId(parentId)
    setEditingItem(item)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback((parentId: string, itemId: string) => {
    setParents((current) =>
      current.map((parent) =>
        parent.id === parentId
          ? {
              ...parent,
              dropDowns: parent.dropDowns.filter((item) => item.id !== itemId),
            }
          : parent
      )
    )
  }, [])

  function handleSave(item: NavigationDropDownItem) {
    if (!activeParentId) return

    setParents((current) =>
      current.map((parent) => {
        if (parent.id !== activeParentId) return parent

        const exists = parent.dropDowns.some((entry) => entry.id === item.id)
        if (exists) {
          return {
            ...parent,
            dropDowns: parent.dropDowns.map((entry) =>
              entry.id === item.id ? item : entry
            ),
          }
        }

        return {
          ...parent,
          dropDowns: [...parent.dropDowns, item],
        }
      })
    )
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>Drop Downs Management</AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar>
          <AdminPanelStats>
            Navigation items:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {parents.length}
            </span>
            {" · "}
            Drop downs:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {totalDropDowns}
            </span>
          </AdminPanelStats>
        </AdminPanelToolbar>

        <NavigationDropdownList
          parents={parents}
          onAddDropDown={openCreate}
          onEditDropDown={openEdit}
          onDeleteDropDown={handleDelete}
        />
      </PanelCard>

      <NavigationDropDownItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSaved={handleSave}
      />
    </AdminPageShell>
  )
}
