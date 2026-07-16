import { FileEdit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { SegmentedTabList } from "@/components/common/segmented-tab-list"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AddCustomerDialog } from "@/features/customers/add-customer-dialog"
import { reportError } from "@/lib/app-toast"
import { getCustomerById } from "@/lib/api/customers"
import { mapApiCustomerToDetails } from "@/lib/map-api-customer-to-form"
import type { Customer } from "@/types/customer"
import type { CustomerDetails } from "@/types/customer-details"
import type { CustomerFormValues } from "@/types/customer-form"

const CUSTOMER_DETAIL_TABS = [
  { id: "client-info" as const, label: "Client Info" },
  { id: "additional-info" as const, label: "Additional Info" },
]

const DETAIL_ROW = "grid gap-x-10 gap-y-5 sm:grid-cols-3"
const DETAIL_COLUMNS = "grid gap-x-10 sm:grid-cols-3"

type CustomerDetailTab = (typeof CUSTOMER_DETAIL_TABS)[number]["id"]

type CustomerDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  connectionName: string
  locationId: string
  lastUpdateId: string
  onBuyCertificate?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
  onCustomerSaved?: (form: CustomerFormValues) => Promise<void> | void
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

function DetailNotes({ value }: { value: string }) {
  const trimmed = value.trim()

  return (
    <div className="text-sm leading-relaxed">
      <p className="font-semibold text-foreground">Customer Notes:</p>
      {trimmed ? (
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{trimmed}</p>
      ) : null}
    </div>
  )
}

function DetailCheckboxRow({ details }: { details: CustomerDetails }) {
  const items = [
    { id: "banned", label: "Banned", checked: details.banned },
    { id: "no-call", label: "No Call", checked: details.noCall },
    { id: "inactive", label: "Inactive", checked: details.inactive },
    { id: "opt-out", label: "Opt out (ECM)", checked: details.optOutEcm },
  ] as const

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((item) => (
        <label
          key={item.id}
          className="flex cursor-default items-center gap-1.5 text-sm text-foreground"
        >
          <Checkbox checked={item.checked} disabled className="size-3.5" />
          {item.label}
        </label>
      ))}
    </div>
  )
}

function ClientInfoPanel({ details }: { details: CustomerDetails }) {
  return (
    <div className="space-y-5">
      <div className={DETAIL_ROW}>
        <DetailItem label="Name" value={details.name} />
        <DetailItem label="Email" value={details.email} />
        <DetailItem label="Phone" value={details.phone} />
      </div>

      <div className={DETAIL_ROW}>
        <DetailItem label="Alt Phone" value={details.altPhone1} />
        <DetailItem label="Alt Phone" value={details.altPhone2} />
      </div>

      <div className={DETAIL_ROW}>
        <DetailItem label="Address1" value={details.address1} />
        <DetailItem label="Address2" value={details.address2} />
      </div>
    </div>
  )
}

function AdditionalInfoPanel({ details }: { details: CustomerDetails }) {
  return (
    <div className={DETAIL_COLUMNS}>
      <div className="space-y-5">
        <DetailItem label="DOB" value={details.dob} />
        <DetailItem label="Anniversary date" value={details.anniversaryDate} />
        <DetailCheckboxRow details={details} />
        <DetailNotes value={details.notes} />
      </div>

      <div className="space-y-5">
        <DetailItem label="Status" value={details.status} />
        <DetailItem label="Divorced" value={details.divorced} />
      </div>

      <div className="space-y-5">
        <DetailItem label="Marital Status" value={details.maritalStatus} />
      </div>
    </div>
  )
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
  connectionName,
  locationId,
  lastUpdateId,
  onBuyCertificate,
  onDelete,
  onCustomerSaved,
}: CustomerDetailsDialogProps) {
  const [activeTab, setActiveTab] =
    useState<CustomerDetailTab>("client-info")
  const [editOpen, setEditOpen] = useState(false)
  const [details, setDetails] = useState<CustomerDetails | null>(null)
  const [detailsVersion, setDetailsVersion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !customer) {
      setActiveTab("client-info")
      setEditOpen(false)
      setDetails(null)
      setLoading(false)
      setError(null)
      return
    }

    const customerId = customer.id
    let cancelled = false

    async function loadDetails() {
      setLoading(true)
      setError(null)

      try {
        const data = await getCustomerById({
          connectionName,
          locationId,
          customerId,
        })

        if (!cancelled) {
          setDetails(mapApiCustomerToDetails(data))
        }
      } catch (requestError) {
        if (!cancelled) {
          setDetails(null)
          reportError(
            setError,
            requestError,
            "Unable to load customer details."
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
  }, [open, customer, connectionName, locationId, detailsVersion])

  async function handleNestedSave(form: CustomerFormValues) {
    await onCustomerSaved?.(form)
    setDetailsVersion((current) => current + 1)
  }

  return (
    <>
      <Dialog open={open && customer != null} onOpenChange={onOpenChange}>
        {customer ? (
          <DialogContent
            showCloseButton
            className="flex max-h-[88vh] max-w-4xl flex-col overflow-hidden p-0 sm:max-w-4xl"
          >
            <DialogHeader className="shrink-0 gap-0 border-b px-4 py-2.5 pr-12">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:pr-2">
                <DialogTitle className="text-base font-semibold text-foreground">
                  Customer Details
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {onBuyCertificate ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onBuyCertificate(customer)}
                    >
                      Buy Certificate
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setEditOpen(true)}
                  >
                    <FileEdit className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onDelete?.(customer)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading customer details...
                </p>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : details ? (
                <div className="space-y-4">
                  <SegmentedTabList
                    tabs={CUSTOMER_DETAIL_TABS}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    ariaLabel="Customer detail sections"
                  />

                  <div role="tabpanel" id={`customer-panel-${activeTab}`}>
                    {activeTab === "client-info" ? (
                      <ClientInfoPanel details={details} />
                    ) : (
                      <AdditionalInfoPanel details={details} />
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter className="shrink-0 border-t px-4 py-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      <AddCustomerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        nested
        onBack={() => setEditOpen(false)}
        customer={customer}
        connectionName={connectionName}
        locationId={locationId}
        lastUpdateId={lastUpdateId}
        onSaved={handleNestedSave}
      />
    </>
  )
}
