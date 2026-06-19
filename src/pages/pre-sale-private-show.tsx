import { Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { preSaleRecords } from "@/data/pre-sale"
import { AddPreSaleDialog } from "@/features/pre-sale/add-pre-sale-dialog"
import { PreSaleDataTable } from "@/features/pre-sale/pre-sale-data-table"

export function PreSalePrivateShow() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Private Pre-sale Setup
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Records:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {preSaleRecords.length}
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        <PreSaleDataTable data={preSaleRecords} />
      </PanelCard>

      <AddPreSaleDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
