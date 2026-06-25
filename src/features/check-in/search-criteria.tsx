import { Search, X } from "lucide-react"

import { IconActionButton } from "@/components/forms/form-fields"
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
    <div className="flex flex-col gap-2.5 px-3 py-2.5 md:flex-row md:items-center md:gap-3">
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <Input
          value={lastName}
          onChange={(event) => onLastNameChange(event.target.value)}
          placeholder="Last Name"
          className="h-8 min-w-0 text-xs"
        />
        <Input
          value={firstName}
          onChange={(event) => onFirstNameChange(event.target.value)}
          placeholder="First Name"
          className="h-8 min-w-0 text-xs"
        />
        <Input
          value={ccLast4}
          onChange={(event) => onCcLast4Change(event.target.value)}
          placeholder="CC Last4"
          maxLength={4}
          className="h-8 min-w-0 text-xs"
        />
        <Input
          value={tableNo}
          onChange={(event) => onTableNoChange(event.target.value)}
          placeholder="Table No"
          className="h-8 min-w-0 text-xs"
        />
        <Input
          type="tel"
          value={phoneNo}
          onChange={(event) => onPhoneNoChange(event.target.value)}
          placeholder="Phone No."
          className="h-8 min-w-0 text-xs sm:col-span-2 md:col-span-1"
        />
      </div>

      <TooltipProvider delayDuration={200}>
        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <IconActionButton label="Search" icon={Search} variant="default" />
          <IconActionButton
            label="Clear"
            icon={X}
            variant="outline"
            onClick={onClear}
          />
        </div>
      </TooltipProvider>
    </div>
  )
}
