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

const SHOW_DETAILS_GRID_CLASS =
  "grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-[10.5rem_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"

const RESERVATION_ROW_GRID_CLASS =
  "grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)_3.5rem] lg:items-end"

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
          className="flex max-h-[92vh] w-[calc(100%-1rem)] max-w-5xl flex-col overflow-hidden sm:w-[calc(100%-2rem)]"
        >
          <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
            <DialogTitle className="text-lg leading-snug font-normal">
              <span className="mr-2 block font-semibold text-foreground sm:inline">
                Add Reservation
              </span>
              <span className="block text-sm text-muted-foreground sm:inline">
                {reservationShowMeta.comicName} · {reservationShowMeta.showDate}.
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto px-4 py-3">
            <FormSection title="Show Details">
              <div className={SHOW_DETAILS_GRID_CLASS}>
                <FormField
                  label="Show Date"
                  htmlFor="add-show-date"
                  className="min-w-0 min-[480px]:max-w-[10.5rem]"
                >
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

                <FormField label="Section" className="min-w-0">
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

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 w-full gap-1.5 px-3 min-[480px]:w-auto lg:justify-self-start"
                >
                  <Info className="size-4" />
                  Comic Info
                </Button>
              </div>
            </FormSection>

            <FormSection title="Reservation Details">
              <div className={RESERVATION_ROW_GRID_CLASS}>
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
                <FormField label="Party" className="min-w-0">
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
                <FormField label="Passes" className="min-w-0">
                  <Input
                    type="number"
                    defaultValue={1}
                    min={0}
                    className="w-full"
                  />
                </FormField>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox id="dinner" />
                  Dinner
                </label>
                <Button type="button" className="w-full gap-2 sm:w-auto">
                  <Calculator className="size-4" />
                  Calculate Total
                </Button>
              </div>
            </FormSection>

            <FormSection title="Customer Details">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
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
                <div className="flex shrink-0 items-end">
                  <IconActionButton
                    label="Contact Lookup"
                    icon={Contact}
                    variant="secondary"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Search Criteria">
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
                <RadioGroup
                  value={searchType}
                  onValueChange={setSearchType}
                  className="flex flex-row flex-wrap items-center gap-x-5 gap-y-2"
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

                <div className="flex flex-wrap items-center gap-2">
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
            </FormSection>

            <FormSection title="Notes / Request">
              <Textarea
                placeholder="Enter notes or special requests..."
                className="min-h-16 w-full resize-y"
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
