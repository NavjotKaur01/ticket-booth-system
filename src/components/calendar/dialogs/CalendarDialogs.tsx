import dayjs from "dayjs"
import type { CalendarEvent } from "@/types/calendar-event"
import type { RecurrenceState } from "@/types/recurrence"
import { AddReservationDialog as ReservationPageAddReservationDialog } from "@/features/reservations/add-reservation-dialog"

import AddEditPackageDialog from "./AddEditPackageDialog"
import AddShowDialog from "./AddShowDialog"
import AdjustAgeDialog from "./AdjustAgeDialog"
import AdjustHubDialog from "./AdjustHubDialog"
import AdjustPromoDialog from "./AdjustPromoDialog"
import AdjustSeatsDialog from "./AdjustSeatsDialog"
import CancelShowDialog from "./CancelShowDialog"
import EditComicDialog from "./EditComicDialog"
import MoveShowDialog from "./MoveShowDialog"
import PrivatePreSaleDialog from "./PrivatePreSaleDialog"
import ShowDetailHistoryDialog from "./ShowDetailHistoryDialog"
import ShowHistoryDialog from "./ShowHistoryDialog"
import PastDateAlertDialog from "./PastDateAlertDialog"
import RecurrenceDialog, { type RecurrenceFormValue } from "./RecurrenceDialog"

type CalendarDialogsProps = {
  isAddEditPackageOpen: boolean
  setIsAddEditPackageOpen: (open: boolean) => void
  packageEvent: CalendarEvent | null
  isAddReservationOpen: boolean
  setIsAddReservationOpen: (open: boolean) => void
  reservationEvent: CalendarEvent | null
  onAddReservationSaved?: () => void
  isAdjustAgeOpen: boolean
  setIsAdjustAgeOpen: (open: boolean) => void
  adjustAgeEvent: CalendarEvent | null
  onAdjustAgeSaved?: () => void
  isAdjustHubOpen: boolean
  setIsAdjustHubOpen: (open: boolean) => void
  adjustHubEvent: CalendarEvent | null
  isAdjustPromoOpen: boolean
  setIsAdjustPromoOpen: (open: boolean) => void
  adjustPromoEvent: CalendarEvent | null
  onAdjustPromoSaved?: () => void
  isAdjustSeatsOpen: boolean
  setIsAdjustSeatsOpen: (open: boolean) => void
  adjustSeatsEvent: CalendarEvent | null
  isCancelShowOpen: boolean
  setIsCancelShowOpen: (open: boolean) => void
  cancelShowEvent: CalendarEvent | null
  isEditComicOpen: boolean
  setIsEditComicOpen: (open: boolean) => void
  editComicEvent: CalendarEvent | null
  isEditShowOpen: boolean
  onEditShowOpenChange: (open: boolean) => void
  editShowRecurrence: RecurrenceState | null
  editShowEvent: CalendarEvent | null
  onEditShowSaved?: () => void
  isMoveShowOpen: boolean
  setIsMoveShowOpen: (open: boolean) => void
  moveShowEvent: CalendarEvent | null
  onMoveShowSaved?: () => void
  isPrivatePreSaleOpen: boolean
  setIsPrivatePreSaleOpen: (open: boolean) => void
  privatePreSaleEvent: CalendarEvent | null
  isShowHistoryOpen: boolean
  setIsShowHistoryOpen: (open: boolean) => void
  showHistoryEvent: CalendarEvent | null
  isShowDetailHistoryOpen: boolean
  setIsShowDetailHistoryOpen: (open: boolean) => void
  showDetailHistoryEvent: CalendarEvent | null
  isPastDateAlertOpen: boolean
  setIsPastDateAlertOpen: (open: boolean) => void
  isRecurrenceOpen: boolean
  setIsRecurrenceOpen: (open: boolean) => void
  recurrenceDate: Date | null
  recurrenceError?: string | null
  recurrenceState: RecurrenceState | null
  onRecurrenceSave: (value: RecurrenceFormValue) => void
  isAddShowOpen: boolean
  setIsAddShowOpen: (open: boolean) => void
  connectionString: string
  locationId: string
  username: string
  onAddShowSaved?: () => void
}

export default function CalendarDialogs({
  isAddEditPackageOpen,
  setIsAddEditPackageOpen,
  packageEvent,
  isAddReservationOpen,
  setIsAddReservationOpen,
  reservationEvent,
  onAddReservationSaved,
  isAdjustAgeOpen,
  setIsAdjustAgeOpen,
  adjustAgeEvent,
  onAdjustAgeSaved,
  isAdjustHubOpen,
  setIsAdjustHubOpen,
  adjustHubEvent,
  isAdjustPromoOpen,
  setIsAdjustPromoOpen,
  adjustPromoEvent,
  onAdjustPromoSaved,
  isAdjustSeatsOpen,
  setIsAdjustSeatsOpen,
  adjustSeatsEvent,
  isCancelShowOpen,
  setIsCancelShowOpen,
  cancelShowEvent,
  isEditComicOpen,
  setIsEditComicOpen,
  editComicEvent,
  isEditShowOpen,
  onEditShowOpenChange,
  editShowRecurrence,
  editShowEvent,
  onEditShowSaved,
  isMoveShowOpen,
  setIsMoveShowOpen,
  moveShowEvent,
  onMoveShowSaved,
  isPrivatePreSaleOpen,
  setIsPrivatePreSaleOpen,
  privatePreSaleEvent,
  isShowHistoryOpen,
  setIsShowHistoryOpen,
  showHistoryEvent,
  isShowDetailHistoryOpen,
  setIsShowDetailHistoryOpen,
  showDetailHistoryEvent,
  isPastDateAlertOpen,
  setIsPastDateAlertOpen,
  isRecurrenceOpen,
  setIsRecurrenceOpen,
  recurrenceDate,
  recurrenceError = null,
  recurrenceState,
  onRecurrenceSave,
  isAddShowOpen,
  setIsAddShowOpen,
  connectionString,
  locationId,
  username,
  onAddShowSaved,
}: CalendarDialogsProps) {
  return (
    <>
      <AddEditPackageDialog
        open={isAddEditPackageOpen}
        event={packageEvent}
        onOpenChange={setIsAddEditPackageOpen}
      />
      <ReservationPageAddReservationDialog
        open={isAddReservationOpen}
        onOpenChange={setIsAddReservationOpen}
        showDate={
          reservationEvent ? dayjs(reservationEvent.start).format("YYYY-MM-DD") : undefined
        }
        showTime={reservationEvent?.showId}
        onSaved={onAddReservationSaved}
      />
      <AdjustAgeDialog
        open={isAdjustAgeOpen}
        event={adjustAgeEvent}
        onOpenChange={setIsAdjustAgeOpen}
        onSave={onAdjustAgeSaved}
      />
      <AdjustHubDialog
        open={isAdjustHubOpen}
        event={adjustHubEvent}
        onOpenChange={setIsAdjustHubOpen}
      />
      <AdjustPromoDialog
        open={isAdjustPromoOpen}
        event={adjustPromoEvent}
        onOpenChange={setIsAdjustPromoOpen}
        onSave={onAdjustPromoSaved}
      />
      <AdjustSeatsDialog
        open={isAdjustSeatsOpen}
        event={adjustSeatsEvent}
        onOpenChange={setIsAdjustSeatsOpen}
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
        connectionName={connectionString}
        locationId={locationId}
        username={username}
      />
      <AddShowDialog
        open={isEditShowOpen}
        onOpenChange={onEditShowOpenChange}
        recurrence={editShowRecurrence}
        initialEvent={editShowEvent}
        connectionString={connectionString}
        locationId={locationId}
        username={username}
        title="Edit Show"
        onSaved={onEditShowSaved}
      />
      <MoveShowDialog
        open={isMoveShowOpen}
        event={moveShowEvent}
        onOpenChange={setIsMoveShowOpen}
        onMoved={onMoveShowSaved}
      />
      <PrivatePreSaleDialog
        open={isPrivatePreSaleOpen}
        event={privatePreSaleEvent}
        onOpenChange={setIsPrivatePreSaleOpen}
      />
      <ShowHistoryDialog
        open={isShowHistoryOpen}
        event={showHistoryEvent}
        onOpenChange={setIsShowHistoryOpen}
        connectionString={connectionString}
        locationId={locationId}
      />
      <ShowDetailHistoryDialog
        open={isShowDetailHistoryOpen}
        event={showDetailHistoryEvent}
        onOpenChange={setIsShowDetailHistoryOpen}
        connectionString={connectionString}
      />
      <PastDateAlertDialog
        open={isPastDateAlertOpen}
        onOpenChange={setIsPastDateAlertOpen}
      />
      <RecurrenceDialog
        open={isRecurrenceOpen}
        startDate={recurrenceDate}
        onOpenChange={setIsRecurrenceOpen}
        onSave={onRecurrenceSave}
        errorMessage={recurrenceError}
      />
      <AddShowDialog
        open={isAddShowOpen}
        onOpenChange={setIsAddShowOpen}
        recurrence={recurrenceState}
        connectionString={connectionString}
        locationId={locationId}
        username={username}
        onSaved={onAddShowSaved}
        onBack={() => {
          setIsAddShowOpen(false)
          setIsRecurrenceOpen(true)
        }}
      />
    </>
  )
}
