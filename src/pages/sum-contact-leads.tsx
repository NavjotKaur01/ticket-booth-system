import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelStats,
  AdminPanelToolbar,
  ADMIN_SECTION_BANNER_CLASS,
  ADMIN_SECTION_BANNER_TEXT_CLASS,
} from "@/components/layout/admin-page"
import { sumContactLeads as initialRecords } from "@/data/sum-contact-leads"
import { SumContactLeadDataTable } from "@/features/sum-contact-leads/sum-contact-lead-data-table"
import { useAppSession } from "@/hooks/use-app-session"
import type { SumContactLead } from "@/types/sum-contact-lead"

export function SumContactLeads() {
  const { locationId, locationName } = useAppSession()
  const [records, setRecords] = useState<SumContactLead[]>(initialRecords)

  const pageTitle = `${locationName || "Standupmedia"} Website Contact US Leads`

  useEffect(() => {
    if (!locationId) {
      return
    }

    setRecords((current) => {
      const usesPlaceholderLocation = current.every(
        (row) => row.locationId === "standupmedia"
      )

      if (!usesPlaceholderLocation) {
        return current
      }

      return current.map((row) =>
        row.locationId === "standupmedia" ? { ...row, locationId } : row
      )
    })
  }, [locationId])

  const filteredRecords = useMemo(() => {
    if (!locationId) {
      return records
    }

    return records.filter((row) => row.locationId === locationId)
  }, [locationId, records])

  return (
    <AdminPageShell>
      <AdminPageTitle>{pageTitle}</AdminPageTitle>

      <PanelCard>
        <div className={ADMIN_SECTION_BANNER_CLASS}>
          <p className={ADMIN_SECTION_BANNER_TEXT_CLASS}>{pageTitle}</p>
        </div>

        <AdminPanelToolbar>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Drag a column header here to group by that column
          </p>
          <AdminPanelStats className="sm:ml-auto sm:text-right">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredRecords.length}
            </span>
          </AdminPanelStats>
        </AdminPanelToolbar>

        <SumContactLeadDataTable data={filteredRecords} />
      </PanelCard>
    </AdminPageShell>
  )
}
