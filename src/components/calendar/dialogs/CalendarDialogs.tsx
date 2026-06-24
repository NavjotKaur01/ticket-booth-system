import type { CalendarEvent } from "@/data/calendarEvents"

import AddEditPackageDialog from "./AddEditPackageDialog"
import AddReservationDialog from "./AddReservationDialog"
import AdjustAgeDialog from "./AdjustAgeDialog"
import AdjustHubDialog from "./AdjustHubDialog"
import CancelShowDialog from "./CancelShowDialog"
import EditComicDialog from "./EditComicDialog"
import AddShowDialog from "./AddShowDialog"
import PastDateAlertDialog from "./PastDateAlertDialog"
import RecurrenceDialog from "./RecurrenceDialog"

type CalendarDialogsProps = {
  isAddEditPackageOpen: boolean
  setIsAddEditPackageOpen: (open: boolean) => void
  packageEvent: CalendarEvent | null
  isAddReservationOpen: boolean
  setIsAddReservationOpen: (open: boolean) => void
  reservationEvent: CalendarEvent | null
  isAdjustAgeOpen: boolean
  setIsAdjustAgeOpen: (open: boolean) => void
  adjustAgeEvent: CalendarEvent | null
  isAdjustHubOpen: boolean
  setIsAdjustHubOpen: (open: boolean) => void
  adjustHubEvent: CalendarEvent | null
  isCancelShowOpen: boolean
  setIsCancelShowOpen: (open: boolean) => void
  cancelShowEvent: CalendarEvent | null
  isEditComicOpen: boolean
  setIsEditComicOpen: (open: boolean) => void
  editComicEvent: CalendarEvent | null
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
  isAddReservationOpen,
  setIsAddReservationOpen,
  reservationEvent,
  isAdjustAgeOpen,
  setIsAdjustAgeOpen,
  adjustAgeEvent,
  isAdjustHubOpen,
  setIsAdjustHubOpen,
  adjustHubEvent,
  isCancelShowOpen,
  setIsCancelShowOpen,
  cancelShowEvent,
  isEditComicOpen,
  setIsEditComicOpen,
  editComicEvent,
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
      <AddReservationDialog
        open={isAddReservationOpen}
        event={reservationEvent}
        onOpenChange={setIsAddReservationOpen}
      />
      <AdjustAgeDialog
        open={isAdjustAgeOpen}
        event={adjustAgeEvent}
        onOpenChange={setIsAdjustAgeOpen}
      />
      <AdjustHubDialog
        open={isAdjustHubOpen}
        event={adjustHubEvent}
        onOpenChange={setIsAdjustHubOpen}
      />
      <CancelShowDialog
        open={isCancelShowOpen}
        event={cancelShowEvent}
        onOpenChange={setIsCancelShowOpen}
      />
      <EditComicDialog
        open={isEditComicOpen}
        event={editComicEvent}
        onOpenChange={setIsEditComicOpen}
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
