import {
  Calculator,
  Contact,
  CreditCard,
  Info,
  Search,
  UserPlus,
  X,
} from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

import {
  AmountPill,
  FormField,
  FormSection,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  reservationShowMeta,
  sectionOptions,
  showOptions,
} from "@/data/reservation"
import { cn } from "@/lib/utils"
import type { SectionOption } from "@/types/reservation"

type AddReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COMPACT_INPUT = "h-8 text-xs"
const COMPACT_SELECT = "h-8 w-full min-w-0 text-xs"

const RESERVATION_TOTALS = [
  { label: "Sub", value: "$0.00" },
  { label: "Svc", value: "$0.00" },
  { label: "Disc", value: "$0.00" },
  { label: "Tax", value: "$0.00" },
  { label: "Total", value: "$0.00", emphasized: true },
] as const

function FormPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <FormSection title={title} className="space-y-1.5">
      <div className="rounded-md border border-border/60 bg-muted/10 p-2.5">
        {children}
      </div>
    </FormSection>
  )
}

function SectionChip({
  option,
  selected,
  onSelect,
}: {
  option: SectionOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors",
        selected
          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/20"
          : "border-border/60 bg-background text-foreground hover:bg-muted/40"
      )}
    >
      <span className="font-semibold">{option.name}</span>
      <span className="tabular-nums text-muted-foreground">{option.price}</span>
      <span className="text-muted-foreground">· {option.available}</span>
    </button>
  )
}

export function AddReservationDialog({
  open,
  onOpenChange,
}: AddReservationDialogProps) {
  const [searchType, setSearchType] = useState("customer")
  const [showDate, setShowDate] = useState(reservationShowMeta.showDateInput)
  const [showTime, setShowTime] = useState(showOptions[0]?.id ?? "")
  const [section, setSection] = useState(sectionOptions[0]?.id ?? "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider delayDuration={200}>
        <DialogContent
          showCloseButton
          className="flex max-h-[92vh] w-[min(96vw,56rem)] max-w-none flex-col overflow-hidden sm:max-w-none"
        >
          <DialogHeader className="shrink-0 gap-0.5 border-b px-4 py-2.5 pr-12">
            <DialogTitle className="text-base font-semibold text-foreground">
              Add Reservation
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {reservationShowMeta.comicName} · {reservationShowMeta.showDate}
            </p>
          </DialogHeader>

          <div className="space-y-2.5 overflow-y-auto px-4 py-3">
            <FormPanel title="Show Details">
              <div className="flex flex-wrap items-end gap-2">
                <FormField
                  label="Show Date"
                  htmlFor="add-show-date"
                  className="w-full min-w-0 sm:w-36"
                >
                  <Input
                    id="add-show-date"
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className={cn("w-full", COMPACT_INPUT)}
                  />
                </FormField>

                <FormField label="Show Time" className="min-w-0 flex-1 sm:max-w-52">
                  <Select value={showTime} onValueChange={setShowTime}>
                    <SelectTrigger className={COMPACT_SELECT}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {showOptions.map((show) => (
                        <SelectItem key={show.id} value={show.id}>
                          {show.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Section" className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {sectionOptions.map((opt) => (
                      <SectionChip
                        key={opt.id}
                        option={opt}
                        selected={section === opt.id}
                        onSelect={() => setSection(opt.id)}
                      />
                    ))}
                  </div>
                </FormField>

                <IconActionButton
                  label="Comic Info"
                  icon={Info}
                  variant="secondary"
                />
              </div>
            </FormPanel>

            <FormPanel title="Reservation Details">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_4.5rem_1fr_4.5rem]">
                  <FormField label="Origin" className="min-w-0">
                    <Select defaultValue="phone">
                      <SelectTrigger className={COMPACT_SELECT}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone-In</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="walkup">Walk-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Party">
                    <Input
                      type="number"
                      defaultValue={0}
                      min={0}
                      className={cn("px-1.5 text-center tabular-nums", COMPACT_INPUT)}
                    />
                  </FormField>

                  <FormField label="Promo" className="min-w-0">
                    <Select defaultValue="select">
                      <SelectTrigger className={COMPACT_SELECT}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Passes">
                    <Input
                      type="number"
                      defaultValue={1}
                      min={0}
                      className={cn("px-1.5 text-center tabular-nums", COMPACT_INPUT)}
                    />
                  </FormField>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {RESERVATION_TOTALS.map((item) => (
                      <AmountPill
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        emphasized={"emphasized" in item && item.emphasized}
                      />
                    ))}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap">
                      <Checkbox id="dinner" />
                      Dinner
                    </label>

                    <IconActionButton
                      label="Calculate Total"
                      icon={Calculator}
                      variant="default"
                    />
                  </div>
                </div>
              </div>
            </FormPanel>

            <FormPanel title="Customer & Search">
              <div className="flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1 space-y-2 sm:max-w-[calc(50%-0.25rem)]">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Last Name" className="min-w-0">
                      <Input className={cn("w-full", COMPACT_INPUT)} />
                    </FormField>
                    <FormField label="First Name" className="min-w-0">
                      <Input className={cn("w-full", COMPACT_INPUT)} />
                    </FormField>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    <RadioGroup
                      value={searchType}
                      onValueChange={setSearchType}
                      className="flex w-auto shrink-0 flex-row items-center gap-x-4"
                    >
                      <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap">
                        <RadioGroupItem value="customer" id="search-customer" />
                        Customer
                      </label>
                      <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap">
                        <RadioGroupItem value="business" id="search-business" />
                        Business
                      </label>
                    </RadioGroup>

                    <div className="h-4 w-px shrink-0 bg-border/60" />

                    <IconActionButton
                      label="Search"
                      icon={Search}
                      variant="default"
                    />
                    <IconActionButton label="Add Customer" icon={UserPlus} />
                    <IconActionButton label="Swipe Card" icon={CreditCard} />
                    <IconActionButton label="Clear" icon={X} variant="outline" />
                    <IconActionButton
                      label="Contact Lookup"
                      icon={Contact}
                      variant="secondary"
                    />
                  </div>
                </div>

                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:max-w-[calc(50%-0.25rem)]">
                  <FormField label="Phone No." className="min-w-0">
                    <Input
                      type="tel"
                      placeholder="(555) 000-0000"
                      className={cn("w-full", COMPACT_INPUT)}
                    />
                  </FormField>
                  <FormField label="Email" className="min-w-0">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className={cn("w-full", COMPACT_INPUT)}
                    />
                  </FormField>
                </div>
              </div>
            </FormPanel>

            <FormSection title="Notes / Request" className="space-y-1.5">
              <Textarea
                placeholder="Enter notes or special requests..."
                className="min-h-14 w-full resize-y text-xs"
              />
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t px-4 py-2.5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="button" size="sm">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </TooltipProvider>
    </Dialog>
  )
}
