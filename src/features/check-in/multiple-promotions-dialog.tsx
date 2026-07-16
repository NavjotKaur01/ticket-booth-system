import { Info } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  FormField,
  FormSection,
  ReadOnlyValue,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  calculateMultiplePromotionsTotals,
  formatMultiplePromotionsMoney,
  resolvePrimaryPromoFromRows,
  type MultiplePromotionRowState,
} from "@/features/check-in/service/multiple-promotions.service"
import { cn } from "@/lib/utils"
import type { ReservationPromo } from "@/types/reservation-promo"

const PARTY_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1)
const PROMOTION_ROW_COUNT = 5

function emptyRows(): MultiplePromotionRowState[] {
  return Array.from({ length: PROMOTION_ROW_COUNT }, () => ({
    promoId: "select",
    passes: 0,
  }))
}

function TotalsLine({
  label,
  value,
  info,
}: {
  label: string
  value: string
  info?: string | null
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        {label}
        {info ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground/60 hover:text-foreground"
                aria-label={`About ${label}`}
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{info}</TooltipContent>
          </Tooltip>
        ) : null}
      </span>
      <span className="shrink-0 font-medium tabular-nums">{value}</span>
    </div>
  )
}

function PartyNumberGrid({
  selected,
  onSelect,
}: {
  selected: number
  onSelect: (value: number) => void
}) {
  return (
    <div className="grid w-full grid-cols-5 gap-1.5">
      {PARTY_NUMBERS.map((num) => (
        <Button
          key={num}
          type="button"
          variant={selected === num ? "default" : "outline"}
          size="sm"
          className="h-8 min-w-0 px-0 tabular-nums"
          onClick={() => onSelect(num)}
        >
          {num}
        </Button>
      ))}
    </div>
  )
}

export type MultiplePromotionsConfirmPayload = {
  partyNumber: number
  primaryPromo: ReservationPromo | null
  rows: MultiplePromotionRowState[]
  total: number
}

type MultiplePromotionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promos: ReservationPromo[]
  sectionPrice: number
  walkUpFee?: number
  initialParty?: number
  onConfirm?: (payload: MultiplePromotionsConfirmPayload) => void
}

/** Desktop Express Multiple Promotions popup (live section + promos). */
export function MultiplePromotionsDialog({
  open,
  onOpenChange,
  promos,
  sectionPrice,
  walkUpFee = 0,
  initialParty = 1,
  onConfirm,
}: MultiplePromotionsDialogProps) {
  const [partyNumber, setPartyNumber] = useState(
    Math.max(1, Math.min(15, initialParty || 1))
  )
  const [rows, setRows] = useState<MultiplePromotionRowState[]>(emptyRows)

  const promosById = useMemo(() => {
    const map = new Map<string, ReservationPromo>()
    for (const promo of promos) {
      map.set(promo.id, promo)
    }
    return map
  }, [promos])

  useEffect(() => {
    if (!open) {
      return
    }

    setPartyNumber(Math.max(1, Math.min(15, initialParty || 1)))
    setRows(emptyRows())
  }, [initialParty, open])

  const totals = useMemo(
    () =>
      calculateMultiplePromotionsTotals({
        sectionPrice,
        walkUpFee,
        partyNumber,
        rows,
        promosById,
      }),
    [partyNumber, promosById, rows, sectionPrice, walkUpFee]
  )

  function handleConfirm() {
    onConfirm?.({
      partyNumber,
      primaryPromo: resolvePrimaryPromoFromRows(rows, promosById),
      rows,
      total: totals.total,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Multiple Promotions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <FormSection title="Party Number">
            <PartyNumberGrid
              selected={partyNumber}
              onSelect={setPartyNumber}
            />
          </FormSection>

          <FormSection title="Promotions">
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className={cn("space-y-2", index > 0 && "border-t pt-3")}
                >
                  <div className="grid gap-2 xl:grid-cols-10 xl:items-end">
                    <div className="xl:col-span-6">
                      <FormField label={index === 0 ? "Promotion" : ""}>
                        <Select
                          value={row.promoId || "select"}
                          onValueChange={(value) => {
                            setRows((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, promoId: value ?? "select" }
                                  : item
                              )
                            )
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">Select</SelectItem>
                            {promos.map((promo) => (
                              <SelectItem key={promo.id} value={promo.id}>
                                {promo.promotionName ||
                                  promo.promotionCode ||
                                  promo.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:col-span-4">
                      <FormField label="Passes">
                        <Input
                          type="number"
                          min={0}
                          max={15}
                          value={row.passes}
                          onChange={(event) => {
                            const next = Number.parseInt(event.target.value, 10)
                            setRows((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      passes: Number.isFinite(next)
                                        ? Math.max(0, Math.min(15, next))
                                        : 0,
                                    }
                                  : item
                              )
                            )
                          }}
                        />
                      </FormField>
                      <FormField label="Discount">
                        <ReadOnlyValue
                          value={formatMultiplePromotionsMoney(
                            totals.rows[index]?.discountAmount ?? 0
                          )}
                        />
                      </FormField>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Paid :{" "}
                    <span className="font-semibold text-foreground">
                      {totals.rows[index]?.paid ?? 0}
                    </span>
                    <span className="mx-3">Comp :</span>
                    <span className="font-semibold text-foreground">
                      {totals.rows[index]?.comp ?? 0}
                    </span>
                    <span className="mx-3">Disc :</span>
                    <span className="font-semibold text-foreground">
                      {totals.rows[index]?.disc ?? 0}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Reservation Details">
            <div className="rounded-lg border border-border/60 p-2.5">
              <div className="space-y-2.5 text-sm">
                <TotalsLine
                  label="Subtotal"
                  value={formatMultiplePromotionsMoney(totals.subtotal)}
                />
                <TotalsLine
                  label="Service Charge"
                  value={formatMultiplePromotionsMoney(totals.serviceCharge)}
                  info="Walk-up / section service charge"
                />
                <TotalsLine
                  label="Discount"
                  value={formatMultiplePromotionsMoney(totals.discount)}
                />
                <TotalsLine
                  label="Taxes"
                  value={formatMultiplePromotionsMoney(totals.taxes)}
                  info="Sales tax on this reservation"
                />
                <TotalsLine
                  label="Party Number"
                  value={String(totals.partyNumber)}
                />
                <TotalsLine
                  label="Price Per Ticket"
                  value={formatMultiplePromotionsMoney(totals.pricePerTicket)}
                />
                <TotalsLine
                  label="UnDiscount"
                  value={String(totals.unDiscount)}
                />
                <div className="space-y-2 border-t border-border/50 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">Total</span>
                    <span className="shrink-0 text-base font-bold tabular-nums">
                      {formatMultiplePromotionsMoney(totals.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
