import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { domains as initialDomains } from "@/data/domains"
import { AddDomainDialog } from "@/features/domains/add-domain-dialog"
import { DomainDataTable } from "@/features/domains/domain-data-table"
import { EditDomainDialog } from "@/features/domains/edit-domain-dialog"
import type { Domain } from "@/types/domain"

export function Domains() {
  const [records, setRecords] = useState<Domain[]>(initialDomains)
  const [addOpen, setAddOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)

  const nextProcessingOrder = useMemo(
    () =>
      records.reduce(
        (maxOrder, record) => Math.max(maxOrder, record.processingOrder),
        0
      ) + 1,
    [records]
  )

  function handleCreate(domain: Domain) {
    setRecords((current) => [...current, domain])
  }

  function handleUpdate(domain: Domain) {
    setRecords((current) =>
      current.map((record) => (record.id === domain.id ? domain : record))
    )
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Domain Setup - Domains
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

        <DomainDataTable data={records} onEdit={setEditingDomain} />
      </PanelCard>

      <AddDomainDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={handleCreate}
        nextProcessingOrder={nextProcessingOrder}
      />

      <EditDomainDialog
        open={editingDomain !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDomain(null)
          }
        }}
        domain={editingDomain}
        onSaved={handleUpdate}
      />
    </div>
  )
}
