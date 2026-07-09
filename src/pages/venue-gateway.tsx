import { Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { venueGateways as initialVenueGateways } from "@/data/venue-gateways"
import { AddVenueGatewayDialog } from "@/features/venue-gateway/add-venue-gateway-dialog"
import { EditVenueGatewayDialog } from "@/features/venue-gateway/edit-venue-gateway-dialog"
import { VenueGatewayDataTable } from "@/features/venue-gateway/venue-gateway-data-table"
import type { VenueGateway } from "@/types/venue-gateway"

export function VenueGateway() {
  const [records, setRecords] = useState<VenueGateway[]>(initialVenueGateways)
  const [addOpen, setAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<VenueGateway | null>(null)

  function handleCreate(record: VenueGateway) {
    setRecords((current) => [...current, record])
  }

  function handleUpdate(record: VenueGateway) {
    setRecords((current) =>
      current.map((item) => (item.id === record.id ? record : item))
    )
  }

  function handleDelete(record: VenueGateway) {
    setRecords((current) => current.filter((item) => item.id !== record.id))
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Venue Gateway Setup
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
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            New
          </Button>
        </div>

        <VenueGatewayDataTable
          data={records}
          onEdit={setEditingRecord}
          onDelete={handleDelete}
        />
      </PanelCard>

      <AddVenueGatewayDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={handleCreate}
      />

      <EditVenueGatewayDialog
        open={editingRecord !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRecord(null)
          }
        }}
        record={editingRecord}
        onSaved={handleUpdate}
      />
    </div>
  )
}
