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
} from "@/components/reservations/reservation-form-fields"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from "@/data/reservation-data"

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
          <DialogHeader className="shrink-0 border-b px-6 pt-5 pb-4">
            <DialogTitle>Add Reservation</DialogTitle>
            <DialogDescription>
              {reservationShowMeta.comicName} · {reservationShowMeta.showDate}.
              Fill in the show, reservation, and customer details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 overflow-y-auto px-6 py-4">
            <FormSection title="Show Details">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField label="Show Date" htmlFor="add-show-date">
                  <Input
                    id="add-show-date"
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                  />
                </FormField>

                <FormField label="Show Time">
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

                <FormField label="Section">
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

                <FormField label="Comic">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full gap-2"
                  >
                    <Info className="size-4" />
                    Comic Info
                  </Button>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Reservation Details">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField label="Origin">
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
                <FormField label="Party">
                  <Input type="number" defaultValue={0} min={0} />
                </FormField>
                <FormField label="Promo">
                  <Select defaultValue="select">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Passes">
                  <Input type="number" defaultValue={1} min={0} />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <Button type="button" variant="secondary" className="gap-2">
                <Contact className="size-4" />
                Contact Lookup
              </Button>
            </FormSection>

            <FormSection title="Search Criteria">
              <RadioGroup
                value={searchType}
                onValueChange={setSearchType}
                className="flex w-auto flex-row flex-wrap items-center gap-x-5 gap-y-2"
              >
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <RadioGroupItem value="customer" id="search-customer" />
                  Customer
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
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
              <Textarea placeholder="Enter notes or special requests..." />
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-3">
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
