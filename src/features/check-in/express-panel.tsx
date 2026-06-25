import { useState } from "react"

import { FormField, FormSection } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaymentNumberFieldset } from "@/features/check-in/payment-number-fieldset"
import { promoOptions, sectionOptions } from "@/data/reservation"
import { cn } from "@/lib/utils"

const SUMMARY_LINES = [
  { label: "Subtotal", value: "$0.00" },
  { label: "Service Charge", value: "$0.00" },
  { label: "Discount", value: "$0.00" },
  { label: "Tax", value: "$0.00" },
] as const

const SELECT_TRIGGER_CLASS = "h-8 w-full min-w-0 text-xs"

export function CheckInExpressPanel() {
  const [section, setSection] = useState(sectionOptions[0]?.id ?? "")
  const [promo, setPromo] = useState("none")
  const [passes, setPasses] = useState("1")
  const [cashNumber, setCashNumber] = useState<number | null>(null)
  const [cardNumber, setCardNumber] = useState<number | null>(null)

  return (
    <div className="px-3 py-3">
      <FormSection title="Express" className="space-y-3">
        {/*
          < xl:   stack — inputs, payment grids, summary
          xl+:   3 equal columns side by side
        */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-start">
          <div className="min-w-0 space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <FormField label="Section" className="min-w-0">
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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

              <FormField label="Promo" className="min-w-0">
                <Select value={promo} onValueChange={setPromo}>
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Select promo code" />
                  </SelectTrigger>
                  <SelectContent>
                    {promoOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Passes" className="w-full max-w-[6.5rem]">
              <Input
                type="number"
                min={1}
                value={passes}
                onChange={(event) => setPasses(event.target.value)}
                className="h-8 text-center text-xs tabular-nums"
              />
            </FormField>
          </div>

          <div className="min-w-0">
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              <PaymentNumberFieldset
                label="Cash"
                selected={cashNumber}
                onSelect={setCashNumber}
              />
              <PaymentNumberFieldset
                label="Credit Card"
                selected={cardNumber}
                onSelect={setCardNumber}
              />
            </div>
          </div>

          <div className="min-w-0 rounded-md border border-border/60 bg-background p-3">
            <div className="space-y-2">
              {SUMMARY_LINES.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {line.value}
                  </span>
                </div>
              ))}
            </div>
            <div
              className={cn(
                "mt-3 border-t border-border/60 pt-3",
                "flex items-end justify-between gap-3"
              )}
            >
              <span className="text-sm font-semibold text-foreground">TOTAL</span>
              <span className="text-xl leading-none font-bold tabular-nums text-primary sm:text-2xl">
                $0.00
              </span>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  )
}
