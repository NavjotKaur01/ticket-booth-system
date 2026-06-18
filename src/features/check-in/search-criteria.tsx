import { CreditCard, Search, Wallet, X } from "lucide-react"

import {
  FormField,
  FormSection,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"

type CheckInSearchCriteriaProps = {
  lastName: string
  onLastNameChange: (value: string) => void
  firstName: string
  onFirstNameChange: (value: string) => void
  ccLast4: string
  onCcLast4Change: (value: string) => void
  tableNo: string
  onTableNoChange: (value: string) => void
  phoneNo: string
  onPhoneNoChange: (value: string) => void
  onClear: () => void
}

// Booth reservation lookup by name, card last 4, table, or phone.
export function CheckInSearchCriteria({
  lastName,
  onLastNameChange,
  firstName,
  onFirstNameChange,
  ccLast4,
  onCcLast4Change,
  tableNo,
  onTableNoChange,
  phoneNo,
  onPhoneNoChange,
  onClear,
}: CheckInSearchCriteriaProps) {
  return (
    <div className="border-b px-2.5 py-2 lg:px-3">
      <FormSection title="Search Criteria" className="space-y-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
          {/* Guest lookup fields — any combination can be used */}
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <FormField label="Last Name" className="min-w-0">
              <Input
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                className="h-8 text-xs"
              />
            </FormField>
            <FormField label="First Name" className="min-w-0">
              <Input
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                className="h-8 text-xs"
              />
            </FormField>
            <FormField label="CC Last4" className="min-w-0">
              <Input
                value={ccLast4}
                onChange={(e) => onCcLast4Change(e.target.value)}
                maxLength={4}
                className="h-8 text-xs"
              />
            </FormField>
            <FormField label="Table No" className="min-w-0">
              <Input
                value={tableNo}
                onChange={(e) => onTableNoChange(e.target.value)}
                className="h-8 text-xs"
              />
            </FormField>
            <FormField label="Phone No." className="min-w-0">
              <Input
                type="tel"
                value={phoneNo}
                onChange={(e) => onPhoneNoChange(e.target.value)}
                className="h-8 text-xs"
              />
            </FormField>
          </div>

          {/* Booth hardware actions — labels shown on hover via tooltip */}
          <TooltipProvider delayDuration={200}>
            <div className="flex shrink-0 items-center gap-1.5 lg:pb-1">
              <IconActionButton label="Search" icon={Search} variant="default" />
              <IconActionButton
                label="Clear"
                icon={X}
                variant="outline"
                onClick={onClear}
              />
              <IconActionButton
                label="Swipe Card"
                icon={CreditCard}
                variant="outline"
              />
              <IconActionButton
                label="Cash Drawer"
                icon={Wallet}
                variant="outline"
              />
            </div>
          </TooltipProvider>
        </div>
      </FormSection>
    </div>
  )
}
