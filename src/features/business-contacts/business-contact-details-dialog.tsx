import { FileEdit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { reportError } from "@/lib/app-toast"
import { getBusinessContactById } from "@/lib/api/business-contacts"
import type { ApiBusinessContactItem } from "@/types/api/business-contact"
import type { BusinessContact } from "@/types/business-contact"

type BusinessContactDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: BusinessContact | null
  connectionName: string
  locationId: string
  onEdit?: (contact: BusinessContact) => void
  onDelete?: (contact: BusinessContact) => void
}

function DetailItem({ label, value }: { label: string; value: string }) {
  const trimmed = value.trim()

  return (
    <p className="text-sm leading-relaxed">
      <span className="font-semibold text-foreground">{label}:</span>
      {trimmed ? (
        <span className="ml-2 text-muted-foreground">{trimmed}</span>
      ) : null}
    </p>
  )
}

function formatPhone(item: ApiBusinessContactItem) {
  const parts = [item.AreaCode, item.Phone1, item.Phone2]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)

  return parts.join("-")
}

function formatFax(item: ApiBusinessContactItem) {
  const parts = [item.FaxAreaCode, item.FaxPhone1, item.FaxPhone2]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)

  if (parts.length > 0) {
    return parts.join("-")
  }

  return item.Fax?.trim() ?? ""
}

export function BusinessContactDetailsDialog({
  open,
  onOpenChange,
  contact,
  connectionName,
  locationId,
  onEdit,
  onDelete,
}: BusinessContactDetailsDialogProps) {
  const [details, setDetails] = useState<ApiBusinessContactItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !contact) {
      setDetails(null)
      setLoading(false)
      setError(null)
      return
    }

    const businessId = contact.id
    let cancelled = false

    async function loadDetails() {
      setLoading(true)
      setError(null)

      try {
        const data = await getBusinessContactById({
          connectionName,
          locationId,
          businessId,
        })

        if (!cancelled) {
          setDetails(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setDetails(null)
          reportError(
            setError,
            requestError,
            "Unable to load business contact details."
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDetails()

    return () => {
      cancelled = true
    }
  }, [open, contact, connectionName, locationId])

  const contactName = [details?.LastName, details?.FirstName]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(" ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              Business Detail Page
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading business contact details...
            </p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : details ? (
            <div className="space-y-4 rounded-md border p-4">
              <p className="text-sm font-semibold text-foreground">Client Info</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Business Name"
                  value={details.BusinessName ?? ""}
                />
                <DetailItem
                  label="Web Address"
                  value={details.HTTP ?? ""}
                />
                <DetailItem label="Name" value={contactName} />
                <DetailItem label="Email" value={details.Email1 ?? ""} />
                <DetailItem label="Phone" value={formatPhone(details)} />
                <DetailItem label="Fax" value={formatFax(details)} />
                <DetailItem
                  label="Address"
                  value={details.Addr1 ?? ""}
                />
                <DetailItem
                  label="Address2"
                  value={details.Addr2 ?? ""}
                />
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2 sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!contact}
              onClick={() => contact && onEdit?.(contact)}
            >
              <FileEdit className="size-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={!contact}
              onClick={() => contact && onDelete?.(contact)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
