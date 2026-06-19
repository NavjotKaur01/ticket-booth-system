import { useCallback, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { reportPermissions } from "@/data/user-access-reports"
import { UserAccessDataTable } from "@/features/user-access/user-access-data-table"
import type { ReportPermission } from "@/types/user-access"

export function UserAccess() {
  const [permissions, setPermissions] =
    useState<ReportPermission[]>(reportPermissions)

  const handleToggle = useCallback(
    (id: string, role: "user" | "manager" | "admin", checked: boolean) => {
      setPermissions((current) =>
        current.map((item) =>
          item.id === id ? { ...item, [role]: checked } : item
        )
      )
    },
    []
  )

  function handleSave() {
    // Placeholder for API integration
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        User Access — Reports
      </h1>

      <PanelCard>
        <UserAccessDataTable data={permissions} onToggle={handleToggle} />

        <div className="border-t px-3 py-2">
          <Button type="button" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </PanelCard>
    </div>
  )
}
