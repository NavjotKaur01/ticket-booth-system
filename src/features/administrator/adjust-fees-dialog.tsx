import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import { updateShowAndPromotionFee } from "@/lib/api/adjust-fees"
import { buildUpdateShowAndPromotionFeeRequest } from "@/lib/build-update-show-and-promotion-fee-request"
import {
  formatAdjustFeeDefault,
  mapAdjustFeeDefaults,
} from "@/lib/map-adjust-fee-defaults"
import { useGetSystemDefaultsQuery } from "@/store/api/clubmanApi"
import {
  EMPTY_ADJUST_FEE_CHARGES,
  type AdjustFeeCharges,
} from "@/types/api/adjust-fees"

const FEE_ROWS = [
  { id: "dayOfShow", label: "Day of show" },
  { id: "phoneCharge", label: "Phone charge" },
  { id: "walkupCharge", label: "Walkup charge" },
  { id: "webCharge", label: "Web charge" },
] as const

type FeeRowId = (typeof FEE_ROWS)[number]["id"]

type AdjustFeesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdjustFeesDialog({ open, onOpenChange }: AdjustFeesDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const [charges, setCharges] = useState<AdjustFeeCharges>(EMPTY_ADJUST_FEE_CHARGES)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    data: systemDefaults = [],
    isLoading: loadingDefaults,
    isFetching: fetchingDefaults,
    error: defaultsError,
  } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !open || !isReady }
  )

  const defaults = useMemo(
    () => mapAdjustFeeDefaults(systemDefaults),
    [systemDefaults]
  )

  useEffect(() => {
    if (!open) return
    setCharges(EMPTY_ADJUST_FEE_CHARGES)
    setError(null)
    setSaving(false)
  }, [open])

  const defaultsBusy = loadingDefaults || fetchingDefaults
  const formDisabled = defaultsBusy || saving || !isReady

  async function handleSave() {
    if (!isReady || !connectionName || !locationId) {
      reportErrorMessage(setError, "Location is required before adjusting fees.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateShowAndPromotionFee(
        buildUpdateShowAndPromotionFeeRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          defaults,
          charges,
        })
      )
      toastSuccess("Fees updated")
      onOpenChange(false)
    } catch (saveError) {
      reportError(
        setError,
        saveError,
        "Unable to update show and promotion fees."
      )
    } finally {
      setSaving(false)
    }
  }

  function updateCharge(id: FeeRowId, value: string) {
    // Desktop TextBox_KeyDown allows digits; fees are decimal? — allow optional decimal.
    if (value !== "" && !/^\d{0,6}(\.\d{0,2})?$/.test(value)) return
    setCharges((current) => ({ ...current, [id]: value }))
  }

  const defaultByRow: Record<FeeRowId, number | null> = {
    dayOfShow: defaults.dayOfShow,
    phoneCharge: defaults.phoneCharge,
    walkupCharge: defaults.walkupCharge,
    webCharge: defaults.webCharge,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-lg flex-col overflow-hidden sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Adjust Fees</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This will adjust fees for all FUTURE shows(after today). Reservation
            will not be adjusted in the reservation changes.
          </p>

          {defaultsError ? (
            <p className="text-sm text-destructive">
              Unable to load fee defaults.
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-3 text-sm">
            <span className="font-medium text-foreground">Fees Type</span>
            <span className="font-medium text-foreground">Default</span>
            <span className="font-medium text-foreground">Fees</span>

            {FEE_ROWS.map((row) => (
              <div key={row.id} className="contents">
                <span className="text-foreground">{row.label}</span>
                <span className="min-w-16 text-center tabular-nums text-muted-foreground">
                  {defaultsBusy ? "…" : formatAdjustFeeDefault(defaultByRow[row.id])}
                </span>
                <Input
                  inputMode="decimal"
                  value={charges[row.id]}
                  disabled={formDisabled}
                  onChange={(event) => updateCharge(row.id, event.target.value)}
                  className="h-8 w-24"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={formDisabled}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
