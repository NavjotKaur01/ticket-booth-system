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
  onAddEditPackageAfterClose?: () => void
  isAddReservationOpen: boolean
  setIsAddReservationOpen: (open: boolean) => void
  reservationEvent: CalendarEvent | null
  onAddReservationSaved?: () => void
  onAddReservationAfterClose?: () => void
  isAdjustAgeOpen: boolean
  setIsAdjustAgeOpen: (open: boolean) => void
  adjustAgeEvent: CalendarEvent | null
  onAdjustAgeSaved?: () => void
  onAdjustAgeAfterClose?: () => void
  isAdjustHubOpen: boolean
  setIsAdjustHubOpen: (open: boolean) => void
  adjustHubEvent: CalendarEvent | null
  onAdjustHubAfterClose?: () => void
  isAdjustPromoOpen: boolean
  setIsAdjustPromoOpen: (open: boolean) => void
  adjustPromoEvent: CalendarEvent | null
  onAdjustPromoSaved?: () => void
  onAdjustPromoAfterClose?: () => void
  isAdjustSeatsOpen: boolean
  setIsAdjustSeatsOpen: (open: boolean) => void
  adjustSeatsEvent: CalendarEvent | null
  onAdjustSeatsAfterClose?: () => void
  isCancelShowOpen: boolean
  setIsCancelShowOpen: (open: boolean) => void
  cancelShowEvent: CalendarEvent | null
  onCancelShowAfterClose?: () => void
  isEditComicOpen: boolean
  setIsEditComicOpen: (open: boolean) => void
  editComicEvent: CalendarEvent | null
  onEditComicAfterClose?: () => void
  isEditShowOpen: boolean
  onEditShowOpenChange: (open: boolean) => void
  editShowRecurrence: RecurrenceState | null
  editShowEvent: CalendarEvent | null
  onEditShowSaved?: () => void
  onEditShowAfterClose?: () => void
  isMoveShowOpen: boolean
  setIsMoveShowOpen: (open: boolean) => void
  moveShowEvent: CalendarEvent | null
  onMoveShowSaved?: () => void
  onMoveShowAfterClose?: () => void
  isPrivatePreSaleOpen: boolean
  setIsPrivatePreSaleOpen: (open: boolean) => void
  privatePreSaleEvent: CalendarEvent | null
  onPrivatePreSaleSaved?: () => void | Promise<void>
  onPrivatePreSaleAfterClose?: () => void
  isShowHistoryOpen: boolean
  setIsShowHistoryOpen: (open: boolean) => void
  showHistoryEvent: CalendarEvent | null
  onShowHistoryAfterClose?: () => void
  isShowDetailHistoryOpen: boolean
  setIsShowDetailHistoryOpen: (open: boolean) => void
  showDetailHistoryEvent: CalendarEvent | null
  onShowDetailHistoryAfterClose?: () => void
  isPastDateAlertOpen: boolean
  setIsPastDateAlertOpen: (open: boolean) => void
  calendarActionError?: string | null
  onPastDateAlertAfterClose?: () => void
  isRecurrenceOpen: boolean
  setIsRecurrenceOpen: (open: boolean) => void
  recurrenceDate: Date | null
  recurrenceError?: string | null
  recurrenceState: RecurrenceState | null
  onRecurrenceSave: (value: RecurrenceFormValue) => void
  onRecurrenceAfterClose?: () => void
  isAddShowOpen: boolean
  setIsAddShowOpen: (open: boolean) => void
  connectionString: string
  locationId: string
  username: string
  onAddShowSaved?: () => void
  onAddShowAfterClose?: () => void
}

export default function CalendarDialogs({
  isAddEditPackageOpen,
  setIsAddEditPackageOpen,
  packageEvent,
  onAddEditPackageAfterClose,
  isAddReservationOpen,
  setIsAddReservationOpen,
  reservationEvent,
  onAddReservationSaved,
  onAddReservationAfterClose,
  isAdjustAgeOpen,
  setIsAdjustAgeOpen,
  adjustAgeEvent,
  onAdjustAgeSaved,
  onAdjustAgeAfterClose,
  isAdjustHubOpen,
  setIsAdjustHubOpen,
  adjustHubEvent,
  onAdjustHubAfterClose,
  isAdjustPromoOpen,
  setIsAdjustPromoOpen,
  adjustPromoEvent,
  onAdjustPromoSaved,
  onAdjustPromoAfterClose,
  isAdjustSeatsOpen,
  setIsAdjustSeatsOpen,
  adjustSeatsEvent,
  onAdjustSeatsAfterClose,
  isCancelShowOpen,
  setIsCancelShowOpen,
  cancelShowEvent,
  onCancelShowAfterClose,
  isEditComicOpen,
  setIsEditComicOpen,
  editComicEvent,
  onEditComicAfterClose,
  isEditShowOpen,
  onEditShowOpenChange,
  editShowRecurrence,
  editShowEvent,
  onEditShowSaved,
  onEditShowAfterClose,
  isMoveShowOpen,
  setIsMoveShowOpen,
  moveShowEvent,
  onMoveShowSaved,
  onMoveShowAfterClose,
  isPrivatePreSaleOpen,
  setIsPrivatePreSaleOpen,
  privatePreSaleEvent,
  onPrivatePreSaleSaved,
  onPrivatePreSaleAfterClose,
  isShowHistoryOpen,
  setIsShowHistoryOpen,
  showHistoryEvent,
  onShowHistoryAfterClose,
  isShowDetailHistoryOpen,
  setIsShowDetailHistoryOpen,
  showDetailHistoryEvent,
  onShowDetailHistoryAfterClose,
  isPastDateAlertOpen,
  setIsPastDateAlertOpen,
  calendarActionError,
  onPastDateAlertAfterClose,
  isRecurrenceOpen,
  setIsRecurrenceOpen,
  recurrenceDate,
  recurrenceError = null,
  recurrenceState,
  onRecurrenceSave,
  onRecurrenceAfterClose,
  isAddShowOpen,
  setIsAddShowOpen,
  connectionString,
  locationId,
  username,
  onAddShowSaved,
  onAddShowAfterClose,
}: CalendarDialogsProps) {
  return (
    <>
      <AddEditPackageDialog
        open={isAddEditPackageOpen}
        event={packageEvent}
        onOpenChange={setIsAddEditPackageOpen}
        onAfterClose={onAddEditPackageAfterClose}
      />
      <ReservationPageAddReservationDialog
        open={isAddReservationOpen}
        onOpenChange={setIsAddReservationOpen}
        showDate={
          reservationEvent ? dayjs(reservationEvent.start).format("YYYY-MM-DD") : undefined
        }
        showTime={reservationEvent?.showId}
        onSaved={onAddReservationSaved}
        onAfterClose={onAddReservationAfterClose}
      />
      <AdjustAgeDialog
        open={isAdjustAgeOpen}
        event={adjustAgeEvent}
        onOpenChange={setIsAdjustAgeOpen}
        onSave={onAdjustAgeSaved}
        onAfterClose={onAdjustAgeAfterClose}
      />
      <AdjustHubDialog
        open={isAdjustHubOpen}
        event={adjustHubEvent}
        onOpenChange={setIsAdjustHubOpen}
        onAfterClose={onAdjustHubAfterClose}
      />
      <AdjustPromoDialog
        open={isAdjustPromoOpen}
        event={adjustPromoEvent}
        onOpenChange={setIsAdjustPromoOpen}
        onSave={onAdjustPromoSaved}
        onAfterClose={onAdjustPromoAfterClose}
      />
      <AdjustSeatsDialog
        open={isAdjustSeatsOpen}
        event={adjustSeatsEvent}
        onOpenChange={setIsAdjustSeatsOpen}
        onAfterClose={onAdjustSeatsAfterClose}
      />
      <CancelShowDialog
        open={isCancelShowOpen}
        event={cancelShowEvent}
        onOpenChange={setIsCancelShowOpen}
        onAfterClose={onCancelShowAfterClose}
      />
      <EditComicDialog
        open={isEditComicOpen}
        event={editComicEvent}
        onOpenChange={setIsEditComicOpen}
        onAfterClose={onEditComicAfterClose}
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
        onAfterClose={onEditShowAfterClose}
      />
      <MoveShowDialog
        open={isMoveShowOpen}
        event={moveShowEvent}
        onOpenChange={setIsMoveShowOpen}
        onMoved={onMoveShowSaved}
        onAfterClose={onMoveShowAfterClose}
      />
      <PrivatePreSaleDialog
        open={isPrivatePreSaleOpen}
        event={privatePreSaleEvent}
        onOpenChange={setIsPrivatePreSaleOpen}
        onSaved={onPrivatePreSaleSaved}
        onAfterClose={onPrivatePreSaleAfterClose}
      />
      <ShowHistoryDialog
        open={isShowHistoryOpen}
        event={showHistoryEvent}
        onOpenChange={setIsShowHistoryOpen}
        onAfterClose={onShowHistoryAfterClose}
        connectionString={connectionString}
        locationId={locationId}
      />
      <ShowDetailHistoryDialog
        open={isShowDetailHistoryOpen}
        event={showDetailHistoryEvent}
        onOpenChange={setIsShowDetailHistoryOpen}
        onAfterClose={onShowDetailHistoryAfterClose}
        connectionString={connectionString}
      />
      <PastDateAlertDialog
        open={isPastDateAlertOpen}
        onOpenChange={setIsPastDateAlertOpen}
        message={calendarActionError}
        onAfterClose={onPastDateAlertAfterClose}
      />
      <RecurrenceDialog
        key={recurrenceDate?.getTime() ?? "empty"}
        open={isRecurrenceOpen}
        startDate={recurrenceDate}
        onOpenChange={setIsRecurrenceOpen}
        onSave={onRecurrenceSave}
        errorMessage={recurrenceError}
        onAfterClose={onRecurrenceAfterClose}
      />
      <AddShowDialog
        open={isAddShowOpen}
        onOpenChange={setIsAddShowOpen}
        recurrence={recurrenceState}
        connectionString={connectionString}
        locationId={locationId}
        username={username}
        onSaved={onAddShowSaved}
        onAfterClose={onAddShowAfterClose}
        onBack={() => {
          setIsAddShowOpen(false)
          setIsRecurrenceOpen(true)
        }}
      />
    </>
  )
}
