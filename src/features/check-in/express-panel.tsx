import { Plus } from "lucide-react"
import { useState } from "react"

import {
  FormField,
  FormSection,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sectionOptions } from "@/data/reservation"
import { MultiplePromotionsDialog } from "@/features/check-in/multiple-promotions-dialog"
import { cn } from "@/lib/utils"

/** Quick-select ticket quantities (1–15) for cash or card payment. */
const PAYMENT_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1)

/** Calculated amounts — read-only until a sale is processed. */
const TOTAL_FIELDS = [
  { label: "SubTot", value: "$0.00" },
  { label: "SVC", value: "$0.00" },
  { label: "Disc", value: "$0.00" },
  { label: "Tax", value: "$0.00" },
  { label: "Total", value: "$0.00" },
] as const

type PaymentGridProps = {
  label: string
  selected: number | null
  onSelect: (value: number) => void
}

/** Number pad for selecting party size / payment amount (1–15 tickets). */
function PaymentGrid({
  label,
  selected,
  onSelect,
  className,
}: PaymentGridProps & { className?: string }) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="grid grid-cols-5 gap-1">
        {PAYMENT_NUMBERS.map((num) => (
          <Button
            key={num}
            type="button"
            variant={selected === num ? "default" : "outline"}
            size="xs"
            className="h-7 min-w-0 px-0 text-[11px] tabular-nums"
            onClick={() => onSelect(num)}
          >
            {num}
          </Button>
        ))}
      </div>
    </div>
  )
}

/** Single read-only total field (SubTot, SVC, etc.). */
function CompactTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-[10px] font-medium text-muted-foreground">
        {label}
      </p>
      <div className="flex h-7 items-center rounded-md bg-muted/50 px-2 text-xs font-semibold tabular-nums">
        {value}
      </div>
    </div>
  )
}

/**
 * Express walk-up panel — sell tickets on the spot without a reservation.
 * Staff pick section, promo, passes, then tap a cash/credit quantity grid.
 * Totals appear below the payment grids once calculated.
 */
export function CheckInExpressPanel() {
  const [section, setSection] = useState(sectionOptions[0]?.id ?? "")
  const [passes, setPasses] = useState("1")
  const [cashAmount, setCashAmount] = useState<number | null>(null)
  const [creditAmount, setCreditAmount] = useState<number | null>(null)
  const [promotionsOpen, setPromotionsOpen] = useState(false)

  return (
    <div className="bg-muted/15 px-2.5 py-2 lg:px-3">
      <FormSection title="Express" className="space-y-2">
        <div className="flex flex-col gap-3 xl:grid xl:grid-cols-10 xl:items-start xl:gap-4">
          {/* Column 1 — 60% */}
          <div className="grid gap-2 sm:grid-cols-2 xl:col-span-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.75fr)]">
            <FormField label="Section" className="sm:col-span-2 xl:col-span-1">
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Promo">
              <Select defaultValue="select">
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Passes">
              <div className="flex gap-1">
                <Input
                  type="number"
                  min={1}
                  value={passes}
                  onChange={(e) => setPasses(e.target.value)}
                  className="h-8 flex-1 text-xs"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setPromotionsOpen(true)}
                >
                  <Plus className="size-3.5" />
                  <span className="sr-only">Multiple promotions</span>
                </Button>
              </div>
            </FormField>
          </div>

          {/* Column 2 — 40% */}
          <div className="flex min-w-0 flex-col gap-3 xl:col-span-4">
            <div className="grid grid-cols-2 gap-2">
              <PaymentGrid
                label="Cash"
                selected={cashAmount}
                onSelect={setCashAmount}
              />
              <PaymentGrid
                label="Credit Card"
                selected={creditAmount}
                onSelect={setCreditAmount}
              />
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {TOTAL_FIELDS.map((field) => (
                <CompactTotal
                  key={field.label}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <MultiplePromotionsDialog
        open={promotionsOpen}
        onOpenChange={setPromotionsOpen}
      />
    </div>
  )
}
