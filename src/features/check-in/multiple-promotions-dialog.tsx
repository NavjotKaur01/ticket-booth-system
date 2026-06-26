import { Info } from "lucide-react"
import { useState } from "react"

import {
  FormField,
  FormSection,
  ReadOnlyValue,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { cn } from "@/lib/utils"

const PARTY_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1)

const PROMO_OPTIONS = [
  { id: "select", label: "Select" },
  { id: "admit2", label: "Admit2" },
  { id: "admit4", label: "Admit4" },
  { id: "buy1get1", label: "Buy1Get1" },
] as const

const PROMOTION_ROWS = Array.from({ length: 5 }, (_, i) => i)

const RESERVATION_LINE_META = [
  { key: "sub", label: "Subtotal", info: null },
  {
    key: "svc",
    label: "Service Charge",
    info: "Service charge applied per ticket",
  },
  { key: "disc", label: "Discount", info: null },
  { key: "tax", label: "Taxes", info: "Sales tax on this reservation" },
] as const

const DEFAULT_RESERVATION_TOTALS = {
  subtotal: "$0.00",
  serviceCharge: "$0.00",
  discount: "$0.00",
  taxes: "$0.00",
  total: "$0.00",
  pricePerTicket: "$10.00",
  unDiscount: "0",
} as const

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

function MultiplePromotionsReservationDetails({
  partyNumber,
}: {
  partyNumber: number | null
}) {
  const lineValues: Record<
    (typeof RESERVATION_LINE_META)[number]["key"],
    string
  > = {
    sub: DEFAULT_RESERVATION_TOTALS.subtotal,
    svc: DEFAULT_RESERVATION_TOTALS.serviceCharge,
    disc: DEFAULT_RESERVATION_TOTALS.discount,
    tax: DEFAULT_RESERVATION_TOTALS.taxes,
  }

  return (
    <div className="rounded-lg border border-border/60 p-2.5">
      <div className="space-y-2.5 text-sm">
        {RESERVATION_LINE_META.map((line) => (
          <TotalsLine
            key={line.key}
            label={line.label}
            value={lineValues[line.key]}
            info={line.info}
          />
        ))}

        <TotalsLine
          label="Party Number"
          value={partyNumber === null ? "0" : String(partyNumber)}
        />
        <TotalsLine
          label="Price Per Ticket"
          value={DEFAULT_RESERVATION_TOTALS.pricePerTicket}
        />
        <TotalsLine
          label="UnDiscount"
          value={DEFAULT_RESERVATION_TOTALS.unDiscount}
        />

        <div className="space-y-2 border-t border-border/50 pt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold">Total</span>
            <span className="shrink-0 text-base font-bold tabular-nums">
              {DEFAULT_RESERVATION_TOTALS.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

type MultiplePromotionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (partyNumber: number | null) => void
}

/** Party-size picker (1–15) — matches the desktop booth app. */
function PartyNumberGrid({
  selected,
  onSelect,
}: {
  selected: number | null
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

/** One promo row: select + passes/discount + paid/comp/disc summary. */
function PromotionRow({ showDivider }: { showDivider: boolean }) {
  return (
    <div className={cn("space-y-2", showDivider && "border-t pt-3")}>
      <div className="grid gap-2 xl:grid-cols-10 xl:items-end">
        <div className="xl:col-span-6">
          <Select defaultValue="select">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {PROMO_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:col-span-4">
          <FormField label="Passes">
            <Input type="number" defaultValue={0} min={0} />
          </FormField>
          <FormField label="Discount">
            <ReadOnlyValue value="$0.00" />
          </FormField>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Paid : <span className="font-semibold text-foreground">0</span>
        <span className="mx-3">Comp :</span>
        <span className="font-semibold text-foreground">0</span>
        <span className="mx-3">Disc :</span>
        <span className="font-semibold text-foreground">0</span>
      </p>
    </div>
  )
}

// Split a party across up to five promotions before express checkout.
export function MultiplePromotionsDialog({
  open,
  onOpenChange,
  onConfirm,
}: MultiplePromotionsDialogProps) {
  const [partyNumber, setPartyNumber] = useState<number | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setPartyNumber(null)
    }
    onOpenChange(nextOpen)
  }

  function handleConfirm() {
    onConfirm?.(partyNumber)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              Multiple Promotions
            </span>
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
              {PROMOTION_ROWS.map((index) => (
                <PromotionRow key={index} showDivider={index > 0} />
              ))}
            </div>
          </FormSection>

          <FormSection title="Reservation Details">
            <MultiplePromotionsReservationDetails partyNumber={partyNumber} />
          </FormSection>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
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
