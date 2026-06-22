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

const FORM_GRID_CLASS =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-end"

const COMPACT_FIELD_CLASS = "min-w-0 sm:max-w-[8rem] xl:max-w-none"

function FormPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <FormSection title={title} className="space-y-3">
      <div className="rounded-md border border-border/60 bg-muted/10 p-3">
        {children}
      </div>
    </FormSection>
  )
}

// Multi-step reservation form: show → booking → customer → notes.
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
          className="flex max-h-[92vh] w-[min(96vw,72rem)] max-w-none flex-col overflow-hidden sm:max-w-none"
        >
          <DialogHeader className="shrink-0 gap-1 border-b px-4 py-3 pr-12">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Add Reservation
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {reservationShowMeta.comicName} · {reservationShowMeta.showDate}
            </p>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto px-4 py-4">
            <FormPanel title="Show Details">
              <div className={FORM_GRID_CLASS}>
                <FormField label="Show Date" htmlFor="add-show-date" className="min-w-0">
                  <Input
                    id="add-show-date"
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="w-full"
                  />
                </FormField>

                <FormField label="Show Time" className="min-w-0">
                  <Select value={showTime} onValueChange={setShowTime}>
                    <SelectTrigger className="w-full min-w-0">
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

                <FormField label="Section" className="min-w-0 lg:col-span-1">
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger className="w-full min-w-0">
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

                <div className="flex min-w-0 items-end sm:col-span-2 xl:col-span-1 xl:justify-start">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 w-full gap-1.5 sm:w-auto"
                  >
                    <Info className="size-4" />
                    Comic Info
                  </Button>
                </div>
              </div>
            </FormPanel>

            <FormPanel title="Reservation Details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
                  <FormField label="Origin" className="min-w-0">
                    <Select defaultValue="phone">
                      <SelectTrigger className="w-full min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone-In</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="walkup">Walk-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Party" className={COMPACT_FIELD_CLASS}>
                    <Input type="number" defaultValue={0} min={0} className="w-full" />
                  </FormField>

                  <FormField label="Promo" className="min-w-0">
                    <Select defaultValue="select">
                      <SelectTrigger className="w-full min-w-0">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Passes" className={COMPACT_FIELD_CLASS}>
                    <Input type="number" defaultValue={1} min={0} className="w-full" />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
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
                  <FormField label="Total" className="col-span-2 md:col-span-1">
                    <ReadOnlyValue value="$0.00" />
                  </FormField>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox id="dinner" />
                    Dinner
                  </label>
                  <Button type="button" className="h-9 w-full gap-2 sm:w-auto">
                    <Calculator className="size-4" />
                    Calculate Total
                  </Button>
                </div>
              </div>
            </FormPanel>

            <FormPanel title="Customer Details">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <FormField label="Last Name" className="min-w-0">
                    <Input className="w-full" />
                  </FormField>
                  <FormField label="First Name" className="min-w-0">
                    <Input className="w-full" />
                  </FormField>
                  <FormField label="Phone No." className="min-w-0">
                    <Input
                      type="tel"
                      placeholder="(555) 000-0000"
                      className="w-full"
                    />
                  </FormField>
                  <FormField label="Email" className="min-w-0">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full"
                    />
                  </FormField>
                </div>

                <div className="flex justify-start sm:justify-end">
                  <IconActionButton
                    label="Contact Lookup"
                    icon={Contact}
                    variant="secondary"
                  />
                </div>
              </div>
            </FormPanel>

            <FormPanel title="Search Criteria">
              <div className="space-y-3">
                <RadioGroup
                  value={searchType}
                  onValueChange={setSearchType}
                  className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5"
                >
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <RadioGroupItem value="customer" id="search-customer" />
                    Customer
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <RadioGroupItem value="business" id="search-business" />
                    Business
                  </label>
                </RadioGroup>

                <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                  <IconActionButton
                    label="Search"
                    icon={Search}
                    variant="default"
                  />
                  <IconActionButton label="Add Customer" icon={UserPlus} />
                  <IconActionButton label="Swipe Card" icon={CreditCard} />
                  <IconActionButton label="Clear" icon={X} variant="outline" />
                </div>
              </div>
            </FormPanel>

            <FormSection title="Notes / Request" className="space-y-3">
              <Textarea
                placeholder="Enter notes or special requests..."
                className="min-h-20 w-full resize-y"
              />
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t px-4 py-3 sm:justify-end">
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
