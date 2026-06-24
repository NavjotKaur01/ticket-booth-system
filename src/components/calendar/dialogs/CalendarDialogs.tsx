import type { CalendarEvent } from "@/data/calendarEvents"

import AddEditPackageDialog from "./AddEditPackageDialog"
import AddShowDialog from "./AddShowDialog"
import PastDateAlertDialog from "./PastDateAlertDialog"
import RecurrenceDialog from "./RecurrenceDialog"

type CalendarDialogsProps = {
  isAddEditPackageOpen: boolean
  setIsAddEditPackageOpen: (open: boolean) => void
  packageEvent: CalendarEvent | null
  isPastDateAlertOpen: boolean
  setIsPastDateAlertOpen: (open: boolean) => void
  isRecurrenceOpen: boolean
  setIsRecurrenceOpen: (open: boolean) => void
  recurrenceDate: Date | null
  isAddShowOpen: boolean
  setIsAddShowOpen: (open: boolean) => void
}

export default function CalendarDialogs({
  isAddEditPackageOpen,
  setIsAddEditPackageOpen,
  packageEvent,
  isPastDateAlertOpen,
  setIsPastDateAlertOpen,
  isRecurrenceOpen,
  setIsRecurrenceOpen,
  recurrenceDate,
  isAddShowOpen,
  setIsAddShowOpen,
}: CalendarDialogsProps) {
  return (
    <>
      <AddEditPackageDialog
        open={isAddEditPackageOpen}
        event={packageEvent}
        onOpenChange={setIsAddEditPackageOpen}
      />
      <PastDateAlertDialog
        open={isPastDateAlertOpen}
        onOpenChange={setIsPastDateAlertOpen}
      />
      <RecurrenceDialog
        open={isRecurrenceOpen}
        startDate={recurrenceDate}
        onOpenChange={setIsRecurrenceOpen}
        onSave={() => setIsAddShowOpen(true)}
      />
      <AddShowDialog
        open={isAddShowOpen}
        onOpenChange={setIsAddShowOpen}
        onBack={() => {
          setIsAddShowOpen(false)
          setIsRecurrenceOpen(true)
        }}
      />
    </>
  )
}
