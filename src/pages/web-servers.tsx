import { Plus } from "lucide-react"
import { useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { webServers as initialWebServers } from "@/data/web-servers"
import { AddWebServerDialog } from "@/features/web-servers/add-web-server-dialog"
import { EditWebServerDialog } from "@/features/web-servers/edit-web-server-dialog"
import { WebServerDataTable } from "@/features/web-servers/web-server-data-table"
import type { WebServer } from "@/types/web-server"

export function WebServers() {
  const [records, setRecords] = useState<WebServer[]>(initialWebServers)
  const [addOpen, setAddOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<WebServer | null>(null)

  function handleCreate(server: WebServer) {
    setRecords((current) => [...current, server])
  }

  function handleUpdate(server: WebServer) {
    setRecords((current) =>
      current.map((record) => (record.id === server.id ? server : record))
    )
  }

  function handleDelete(server: WebServer) {
    setRecords((current) => current.filter((record) => record.id !== server.id))
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Domain Setup - Web Servers
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

        <WebServerDataTable
          data={records}
          onEdit={setEditingServer}
          onDelete={handleDelete}
        />
      </PanelCard>

      <AddWebServerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={handleCreate}
      />

      <EditWebServerDialog
        open={editingServer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingServer(null)
          }
        }}
        server={editingServer}
        onSaved={handleUpdate}
      />
    </div>
  )
}
