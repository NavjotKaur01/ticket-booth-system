import {
  Calculator,
  Contact,
  CreditCard,
  Info,
  Search,
  UserPlus,
  X,
} from "lucide-react"
import { useState } from "react"

import {
  FormField,
  FormSection,
  IconActionButton,
  ReadOnlyValue,
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

type AddReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Multi-step reservation form shown from the Reservations page.
 * Layout mirrors the legacy ClubMan booth workflow: show → booking → customer → notes.
 */
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
          className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden sm:max-w-5xl"
        >
          <DialogHeader className="shrink-0 gap-0 border-b px-4 pt-3 pb-2">
            <DialogTitle className="text-lg leading-snug font-normal">
              <span className="font-semibold text-foreground mr-2">
                Add Reservation
              </span>
              <span className="text-muted-foreground text-sm">
                {reservationShowMeta.comicName} · {reservationShowMeta.showDate}
                .
              </span>{" "}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto px-4 py-3">
            <FormSection title="Show Details">
              <div className="flex flex-wrap items-end gap-2">
                <FormField
                  label="Show Date"
                  htmlFor="add-show-date"
                  className="w-[10.5rem] shrink-0"
                >
                  <Input
                    id="add-show-date"
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                  />
                </FormField>

                <FormField label="Show Time" className="min-w-[9rem] flex-1">
                  <Select value={showTime} onValueChange={setShowTime}>
                    <SelectTrigger className="w-full">
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
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger className="w-full">
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

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5 px-3"
                >
                  <Info className="size-4" />
                  Comic Info
                </Button>
              </div>
            </FormSection>

            <FormSection title="Reservation Details">
              <div className="flex flex-wrap items-end gap-2">
                <FormField label="Origin" className="min-w-[7rem] flex-1">
                  <Select defaultValue="phone">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone-In</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="walkup">Walk-up</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Party" className="w-20 shrink-0">
                  <Input type="number" defaultValue={0} min={0} />
                </FormField>
                <FormField label="Promo" className="min-w-[7rem] flex-1">
                  <Select defaultValue="select">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <Input
                  type="number"
                  defaultValue={1}
                  min={0}
                  aria-label="Passes"
                  className="h-9 w-14 shrink-0 px-2"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <FormField label="Subtotal">
                  <ReadOnlyValue value="$0.00" />
                </FormField>
                <FormField label="Service Charge">
                  <ReadOnlyValue value="$0.00" />
                </FormField>
                <FormField label="Discount">
                  <ReadOnlyValue value="$0.00" />
                </FormField>
                <FormField label="Taxes">
                  <ReadOnlyValue value="$0.00" />
                </FormField>
                <FormField label="Total">
                  <ReadOnlyValue value="$0.00" />
                </FormField>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox id="dinner" />
                  Dinner
                </label>
                <Button type="button" className="gap-2">
                  <Calculator className="size-4" />
                  Calculate Total
                </Button>
              </div>
            </FormSection>

            <FormSection title="Customer Details">
              <div className="flex items-end gap-2">
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField label="Last Name">
                    <Input />
                  </FormField>
                  <FormField label="First Name">
                    <Input />
                  </FormField>
                  <FormField label="Phone No.">
                    <Input type="tel" placeholder="(555) 000-0000" />
                  </FormField>
                  <FormField label="Email">
                    <Input type="email" placeholder="name@example.com" />
                  </FormField>
                </div>
                <IconActionButton
                  label="Contact Lookup"
                  icon={Contact}
                  variant="secondary"
                />
              </div>
            </FormSection>

            <FormSection title="Search Criteria">
              <RadioGroup
                value={searchType}
                onValueChange={setSearchType}
                className="flex w-auto flex-row flex-wrap items-center gap-x-5 gap-y-2"
              >
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <RadioGroupItem value="customer" id="search-customer" />
                  Customer
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <RadioGroupItem value="business" id="search-business" />
                  Business
                </label>

                <div className="flex items-center gap-2">
                  <IconActionButton
                    label="Search"
                    icon={Search}
                    variant="default"
                  />
                  <IconActionButton label="Add Customer" icon={UserPlus} />
                  <IconActionButton label="Swipe Card" icon={CreditCard} />
                  <IconActionButton label="Clear" icon={X} variant="outline" />
                </div>
              </RadioGroup>
            </FormSection>

            <FormSection title="Notes / Request">
              <Textarea
                placeholder="Enter notes or special requests..."
                className="min-h-16 resize-y"
              />
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 border-t px-4 py-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="button">Continue</Button>
          </DialogFooter>
        </DialogContent>
      </TooltipProvider>
    </Dialog>
  )
}
