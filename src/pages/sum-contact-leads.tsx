import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
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
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {pageTitle}
      </h1>

      <PanelCard>
        <div className="border-b bg-muted/30 px-3 py-2">
          <p className="text-center text-xs font-semibold tracking-wide text-foreground uppercase">
            {pageTitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Drag a column header here to group by that column
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {filteredRecords.length}
            </span>
          </p>
        </div>

        <SumContactLeadDataTable data={filteredRecords} />
      </PanelCard>
    </div>
  )
}
