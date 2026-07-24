import { Plus } from "lucide-react"
import { useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { AddPreSaleDialog } from "@/features/pre-sale/add-pre-sale-dialog"
import { PreSaleDataTable } from "@/features/pre-sale/pre-sale-data-table"
import { useAppSession } from "@/hooks/use-app-session"
import { usePrivateShowLinks } from "@/hooks/use-private-show-links"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { deletePrivateShowLink } from "@/lib/api/private-show-links"
import { buildDeletePrivateShowLinkRequest } from "@/lib/build-private-show-link-request"
import { copyTextToClipboard } from "@/lib/export-table-data"
import type { PreSaleRecord } from "@/types/pre-sale"

export function PreSalePrivateShow() {
  const { connectionName, locationId, isReady } = useAppSession()
  const { records, loading, error, refresh } = usePrivateShowLinks({
    connectionName,
    locationId,
    enabled: isReady,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<PreSaleRecord | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  async function handleSaved() {
    setActionError(null)
    await refresh()
    toastSuccess("Private show link saved")
  }

  async function handleCopy(record: PreSaleRecord) {
    const link = record.privateLink.trim()
    if (!link) {
      reportErrorMessage(setActionError, "No private link available to copy.")
      return
    }

    try {
      await copyTextToClipboard(link)
      setActionError(null)
      toastSuccess("Private link copied")
    } catch (copyError) {
      reportError(setActionError, copyError, "Unable to copy private link.")
    }
  }

  async function handleConfirmDelete() {
    if (!deletingRecord) return

    if (!isReady || !connectionName || !locationId) {
      reportErrorMessage(
        setActionError,
        "Location is required before deleting a private show link."
      )
      setDeletingRecord(null)
      return
    }

    setDeleting(true)
    setActionError(null)
    try {
      await deletePrivateShowLink(
        buildDeletePrivateShowLinkRequest({
          connectionName,
          locationId,
          privateKeyId: deletingRecord.id,
        })
      )
      setDeletingRecord(null)
      await refresh()
      toastSuccess("Private show link deleted")
    } catch (deleteError) {
      reportError(setActionError, deleteError, "Unable to delete private show link.")
    } finally {
      setDeleting(false)
    }
  }

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
            Add
          </Button>
        </div>

        {error || actionError ? (
          <p className="px-3 py-2 text-sm text-destructive">
            {error || actionError}
          </p>
        ) : null}

        <PreSaleDataTable
          data={records}
          emptyMessage={loading ? "Loading private show links..." : "No record found"}
          onCopy={(record) => void handleCopy(record)}
          onDelete={setDeletingRecord}
        />
      </PanelCard>

      <AddPreSaleDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={handleSaved}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingRecord)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeletingRecord(null)
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
        title="Delete Private Show Link"
        description="Are you sure you want to delete?"
        confirmLabel="Yes"
        cancelLabel="No"
        isPending={deleting}
      />
    </div>
  )
}
