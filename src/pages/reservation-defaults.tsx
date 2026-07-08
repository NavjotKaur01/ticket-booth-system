import { Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { reservationDefaults as initialReservationDefaults } from "@/data/reservation-defaults"
import { ReservationDefaultDataTable } from "@/features/reservation-defaults/reservation-default-data-table"
import { ReservationDefaultDialog } from "@/features/reservation-defaults/reservation-default-dialog"
import type { ReservationDefault } from "@/types/reservation-default"

export function ReservationDefaults() {
  const [records, setRecords] = useState<ReservationDefault[]>(
    initialReservationDefaults
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ReservationDefault | null>(null)

  function handleSave(record: ReservationDefault) {
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
        Reservation Defaults Data
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

        <ReservationDefaultDataTable
          data={records}
          onEdit={(record) => {
            setEditingRecord(record)
            setDialogOpen(true)
          }}
        />
      </PanelCard>

      <ReservationDefaultDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editingRecord}
        onSaved={handleSave}
      />
    </div>
  )
}
