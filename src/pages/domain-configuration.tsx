import { Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { domainConfigurations as initialDomainConfigurations } from "@/data/domain-configurations"
import { AddDomainConfigurationDialog } from "@/features/domain-configuration/add-domain-configuration-dialog"
import { DomainConfigurationDataTable } from "@/features/domain-configuration/domain-configuration-data-table"
import { EditDomainConfigurationDialog } from "@/features/domain-configuration/edit-domain-configuration-dialog"
import type { DomainConfiguration } from "@/types/domain-configuration"

export function DomainConfigurationPage() {
  const [records, setRecords] = useState<DomainConfiguration[]>(
    initialDomainConfigurations
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DomainConfiguration | null>(null)

  function handleCreate(record: DomainConfiguration) {
    setRecords((current) => [...current, record])
  }

  function handleUpdate(record: DomainConfiguration) {
    setRecords((current) =>
      current.map((item) => (item.id === record.id ? record : item))
    )
  }

  function handleDelete(record: DomainConfiguration) {
    setRecords((current) => current.filter((item) => item.id !== record.id))
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Domain Setup - Domain Configuration
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

        <DomainConfigurationDataTable
          data={records}
          onEdit={setEditingRecord}
          onDelete={handleDelete}
        />
      </PanelCard>

      <AddDomainConfigurationDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={handleCreate}
      />

      <EditDomainConfigurationDialog
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
