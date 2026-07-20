import { FileDown, Info, Plus, Printer, Zap } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { ExportDataDialog } from "@/components/common/export-data-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckInDataTable } from "@/features/check-in/data-table"
import { AssignSeatsDialog } from "@/features/check-in/dialogs/assign-seats-dialog"
import { ExpressWalkupDialog } from "@/features/check-in/dialogs/express-walkup-dialog"
import type { ExpressWalkupPaymentSeed } from "@/features/check-in/service/express-walkup-payment.types"
import { PartialCheckInDialog } from "@/features/check-in/dialogs/partial-check-in-dialog"
import { ResendEmailDialog } from "@/features/check-in/dialogs/resend-email-dialog"
import { SplitPromoConfirmDialog } from "@/features/check-in/dialogs/split-promo-confirm-dialog"
import {
  CheckInExpressPanel,
  type ExpressPanelSalePayload,
} from "@/features/check-in/express-panel"
import { CheckInSearchCriteria } from "@/features/check-in/search-criteria"
import { CheckInStatusLegend } from "@/features/check-in/status-legend"
import { CheckInToolbar } from "@/features/check-in/toolbar"
import { AddReservationDialog } from "@/features/reservations/add-reservation-dialog"
import { CancelReservationDialog } from "@/features/reservations/cancel-reservation-dialog"
import { MoveReservationDialog } from "@/features/reservations/move-reservation-dialog"
import { ReservationCheckInPromoDialog } from "@/features/reservations/reservation-check-in-promo-dialog"
import {
  exportCheckInRecords,
  printCheckInList,
} from "@/features/check-in/check-in-export"
import { ReservationHistoryDialog } from "@/features/reservations/reservation-history-dialog"
import { ReservationNoteDialog } from "@/features/reservations/reservation-note-dialog"
import { SplitReservationDialog } from "@/features/reservations/split-reservation-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import { useCachedReservationShowData } from "@/hooks/use-cached-reservation-show-data"
import { useReservationData } from "@/hooks/use-reservation-data"
import { useShowDetailsByDate } from "@/hooks/use-show-details-by-date"
import { useSubmitInFlight } from "@/hooks/use-submit-in-flight"
import {
  resendReservationTicketEmail,
  updateCustomerEmail,
} from "@/lib/api/resend-reservation-ticket"
import {
  cancelReservation,
  fetchReservationDetailById,
  partialCheckIn,
  reservationCheckIn,
  revertCancelReservation,
  revertPartialCheckIn,
  revertReservationCheckIn,
  saveReservationNote,
} from "@/lib/api/reservations"
import { buildCancelReservationRequest } from "@/lib/build-cancel-reservation-request"
import { buildPartialCheckInRequest } from "@/lib/build-partial-check-in-request"
import { buildReservationCheckInRequest } from "@/lib/build-reservation-check-in-request"
import { buildReservationNoteRequest } from "@/lib/build-reservation-note-request"
import { buildRevertReservationCheckInRequest } from "@/lib/build-revert-reservation-check-in-request"
import { calculateReservationShowStats } from "@/lib/calculate-reservation-show-stats"
import { parseReservationMoney } from "@/lib/calculate-reservation-totals"
import { readBoothSeatDefault } from "@/lib/booth-seat-default"
import { writeStoredBoothSeatCount } from "@/lib/booth-seat-storage"
import {
  readAssignSeatsVisible,
  readExpressPanelVisible,
  readExpressPaymentMethodVisible,
  readExpressPosCcMode,
  readPaymentPrintDefaults,
  readPaymentTaxRate,
  readScannerCheckInVisible,
  readTaxWithServiceCharge,
} from "@/lib/check-in-defaults"
import type { ExportFormat } from "@/lib/export-table-data"
import { filterCheckInRecords } from "@/lib/filter-check-in"
import { mapReservationsToCheckInRecords } from "@/lib/map-check-in-record"
import { resolveReservationTotalSeats } from "@/lib/resolve-reservation-total-seats"
import { saveExpressWalkupReservation } from "@/lib/save-express-walkup-reservation"
import {
  isExpressShowDateAllowed,
  validateBookFixedPartyTables,
} from "@/features/check-in/service/express-panel-validation"
import {
  reportError,
  reportErrorMessage,
  toastError,
  toastSuccess,
  toastWarning,
} from "@/lib/app-toast"
import {
  needsPromoValidation,
  validateReservationCheckIn,
} from "@/lib/validate-reservation-check-in"
import {
  getMockTicketPrintData,
  printReservationTicket,
  printSignatureTicket,
} from "@/services/ticket-print.service"
import {
  clubmanApi,
  useGetShowDataQuery,
  useGetShowSectionsQuery,
  useGetSystemDefaultsQuery,
} from "@/store/api/clubmanApi"
import type { ReservationDetail } from "@/types/api/reservation-detail"
import type { CancelReservationPaymentRow } from "@/types/cancel-reservation-payment"
import type { CheckInRecord } from "@/types/check-in"
import type { Reservation } from "@/types/reservation"
import type { ReservationPromo } from "@/types/reservation-promo"

function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function checkInRecordToReservation(
  record: CheckInRecord,
  reservations: Reservation[]
): Reservation {
  const existing = reservations.find((row) => row.id === record.id)
  if (existing) {
    return existing
  }

  return {
    id: record.id,
    resStatus: record.resStatus,
    isCancelled: record.isCancelled,
    lastName: record.lastName,
    firstName: record.firstName,
    businessName: "",
    email: record.email,
    phoneNo: record.phoneNo,
    source: record.source,
    tables: record.tables,
    seatNo: record.seatNo,
    notes: record.notes,
    promo: record.promo,
    din: record.din,
    section: record.section,
    qty: record.qty,
    seated: record.seated,
    scanner: record.scanner,
    total: record.total,
    paid: record.paid,
    lastFourCardDigit: record.lastFourCardDigit,
    oldReservationId: record.oldReservationId,
    createdBy: record.createdBy,
    createdDt: record.createdDt,
    lastUpdateBy: record.lastUpdateBy,
    lastUpdateDt: record.lastUpdateDt,
  }
}

export function CheckIn() {
  const {
    credentials,
    connectionName,
    dbName,
    locationId,
    locationName,
    username,
    userRight,
    isReady,
  } = useAppSession()

  const [showDate] = useState(todayDateValue)
  const [showTime, setShowTime] = useState("")
  const [refreshValue, setRefreshValue] = useState("999")
  const [cancelled, setCancelled] = useState(false)
  const [displayCheckedIn, setDisplayCheckedIn] = useState(false)
  const [cancelledShow, setCancelledShow] = useState(false)

  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [ccLast4, setCcLast4] = useState("")
  const [tableNo, setTableNo] = useState("")
  const [phoneNo, setPhoneNo] = useState("")
  const [appliedSearch, setAppliedSearch] = useState({
    lastName: "",
    firstName: "",
    ccLast4: "",
    tableNo: "",
    phoneNo: "",
  })

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [expressWalkupOpen, setExpressWalkupOpen] = useState(false)
  const [expressWalkupPaymentSeed, setExpressWalkupPaymentSeed] =
    useState<ExpressWalkupPaymentSeed | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [checkInPromoOpen, setCheckInPromoOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [splitOpen, setSplitOpen] = useState(false)
  const [partialOpen, setPartialOpen] = useState(false)
  const [partialMode, setPartialMode] = useState<"check-in" | "unscan">(
    "check-in"
  )
  const [partialMaxCount, setPartialMaxCount] = useState(1)
  const [partialReservationId, setPartialReservationId] = useState("")
  const [partialError, setPartialError] = useState<string | null>(null)
  const [isPartialSubmitting, setIsPartialSubmitting] = useState(false)
  const [partialPartyNo, setPartialPartyNo] = useState(0)
  const [partialCheckedIn, setPartialCheckedIn] = useState(0)
  const [partialRemaining, setPartialRemaining] = useState(0)
  const [partialTotalAmount, setPartialTotalAmount] = useState("0.00")
  const [partialPaidAmount, setPartialPaidAmount] = useState("0.00")
  const [promoIntent, setPromoIntent] = useState<
    "check-in" | "partial-check-in" | null
  >(null)
  const [splitPromoOpen, setSplitPromoOpen] = useState(false)
  const [isSplitPromoSubmitting, setIsSplitPromoSubmitting] = useState(false)
  const [expressError, setExpressError] = useState<string | null>(null)
  const [isExpressSubmitting, setIsExpressSubmitting] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendOpen, setResendOpen] = useState(false)
  const [isResendSubmitting, setIsResendSubmitting] = useState(false)
  const [resendDialogError, setResendDialogError] = useState<string | null>(
    null
  )

  const [assignSeatsOpen, setAssignSeatsOpen] = useState(false)
  const [assignCheckInAfterSave, setAssignCheckInAfterSave] = useState(false)
  const [assignSeatsError, setAssignSeatsError] = useState<string | null>(null)
  const [isAssignSeatsSubmitting, setIsAssignSeatsSubmitting] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null)
  const [pendingCheckInDetail, setPendingCheckInDetail] =
    useState<ReservationDetail | null>(null)

  const [checkInError, setCheckInError] = useState<string | null>(null)
  const [isCheckingInReservation, setIsCheckingInReservation] = useState(false)
  const checkInSubmitGuard = useSubmitInFlight()
  const expressSubmitGuard = useSubmitInFlight()
  const resendSubmitGuard = useSubmitInFlight()
  const [cancelReservationError, setCancelReservationError] = useState<
    string | null
  >(null)
  const [uncancelReservationError, setUncancelReservationError] = useState<
    string | null
  >(null)
  const [isCancellingReservation, setIsCancellingReservation] = useState(false)
  const [isSavingReservationNote, setIsSavingReservationNote] = useState(false)
  const [saveReservationNoteError, setSaveReservationNoteError] = useState<
    string | null
  >(null)
  const [reservationPrintError, setReservationPrintError] = useState<
    string | null
  >(null)
  const [signaturePrintError, setSignaturePrintError] = useState<string | null>(
    null
  )

  const { shows, loading: showsLoading, refetch: refetchShows } =
    useShowDetailsByDate(
      connectionName,
      locationId,
      showDate,
      cancelledShow,
      isReady
    )

  const {
    reservations,
    loading: reservationsLoading,
    error: reservationsError,
    refresh: refreshReservations,
  } = useReservationData(
    connectionName,
    showTime,
    cancelled,
    Boolean(showTime) && isReady,
    refreshValue,
    displayCheckedIn,
    false
  )

  const { data: showSections = [], refetch: refetchShowSections } =
    useGetShowSectionsQuery(
      { connectionString: connectionName, showId: showTime },
      { skip: !connectionName || !showTime }
    )

  const { data: expressShowData } = useGetShowDataQuery(
    { connectionName, showId: showTime },
    { skip: !connectionName || !showTime }
  )
  const expressShowDataReady = expressShowData != null

  const { sections: expressSections, promoById } = useCachedReservationShowData({
    connectionName,
    locationId,
    showDate,
    showId: showTime,
    enabled: Boolean(showTime) && isReady && expressShowDataReady,
    // Desktop: NoPasses == "Y" → IsManager on GetPromotions
    isManager: expressShowData?.[0]?.NoPasses === "Y",
  })

  const expressPromos = useMemo(
    () => Array.from(promoById.values()),
    [promoById]
  )

  const { data: systemDefaults = [] } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !connectionName || !locationId }
  )

  const expressPaymentMethodVisible = useMemo(
    () => readExpressPaymentMethodVisible(systemDefaults),
    [systemDefaults]
  )
  const expressPosCcMode = useMemo(
    () => readExpressPosCcMode(systemDefaults),
    [systemDefaults]
  )
  const paymentTaxRate = useMemo(
    () => readPaymentTaxRate(systemDefaults),
    [systemDefaults]
  )
  const taxWithServiceCharge = useMemo(
    () => readTaxWithServiceCharge(systemDefaults),
    [systemDefaults]
  )

  const assignSeatsVisible = useMemo(
    () => readAssignSeatsVisible(systemDefaults),
    [systemDefaults]
  )

  const showScannerColumn = useMemo(
    () => readScannerCheckInVisible(systemDefaults),
    [systemDefaults]
  )

  const paymentPrintDefaults = useMemo(
    () => readPaymentPrintDefaults(systemDefaults),
    [systemDefaults]
  )

  const [getReservationDetail] =
    clubmanApi.useLazyGetReservationDetailByIdQuery()
  const [getReservationPrintProperties] =
    clubmanApi.useLazyGetReservationPrintPropertiesQuery()

  const boothSeatDefault = useMemo(
    () => readBoothSeatDefault(systemDefaults),
    [systemDefaults]
  )

  useEffect(() => {
    if (boothSeatDefault > 0 && locationId) {
      writeStoredBoothSeatCount(locationId, boothSeatDefault)
    }
  }, [boothSeatDefault, locationId])

  useEffect(() => {
    if (reservationsError) {
      toastError(reservationsError)
    }
  }, [reservationsError])

  useEffect(() => {
    if (showsLoading) {
      return
    }

    if (shows.length === 0) {
      setShowTime("")
      return
    }

    if (!shows.some((show) => show.id === showTime)) {
      setShowTime(shows[0].id)
    }
  }, [shows, showsLoading, showTime])

  const checkInRecords = useMemo(
    () => mapReservationsToCheckInRecords(reservations),
    [reservations]
  )

  const filteredRecords = useMemo(
    () => filterCheckInRecords(checkInRecords, appliedSearch),
    [appliedSearch, checkInRecords]
  )

  const totalSeatsCount = useMemo(
    () =>
      resolveReservationTotalSeats(
        locationId,
        credentials?.DefaultSeatCount ?? 0,
        boothSeatDefault,
        showSections
      ),
    [boothSeatDefault, credentials?.DefaultSeatCount, locationId, showSections]
  )

  const stats = useMemo(() => {
    const counts = calculateReservationShowStats(totalSeatsCount, reservations)

    return [
      { label: "Seats", value: counts.seats },
      { label: "Reservation", value: counts.reservation },
      { label: "Available", value: counts.available, highlight: true },
      { label: "Seated", value: counts.seated },
      { label: "Scanned", value: counts.scanned },
    ] as const
  }, [reservations, totalSeatsCount])

  const selectedShow = useMemo(
    () => shows.find((show) => show.id === showTime),
    [showTime, shows]
  )

  const expressShowDateTime = useMemo(() => {
    const raw = selectedShow?.showDateTime
    if (!raw) {
      return null
    }

    const parsed = new Date(raw)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [selectedShow?.showDateTime])

  const expressVisible = useMemo(
    () => readExpressPanelVisible(systemDefaults, expressShowDateTime),
    [expressShowDateTime, systemDefaults]
  )

  const selectedShowLabel = selectedShow?.label ?? ""
  const headliner = selectedShow?.headliner?.trim() || ""

  function resolveReservation(record: CheckInRecord) {
    return checkInRecordToReservation(record, reservations)
  }

  function applySearch() {
    setAppliedSearch({
      lastName,
      firstName,
      ccLast4,
      tableNo,
      phoneNo,
    })
  }

  function clearSearch() {
    setLastName("")
    setFirstName("")
    setCcLast4("")
    setTableNo("")
    setPhoneNo("")
    setAppliedSearch({
      lastName: "",
      firstName: "",
      ccLast4: "",
      tableNo: "",
      phoneNo: "",
    })
  }

  async function handleRefresh() {
    await Promise.all([
      refreshReservations(),
      refetchShowSections(),
      refetchShows(),
    ])
  }

  async function maybeAutoPrintAfterCheckIn(reservationId: string) {
    if (!paymentPrintDefaults.printAfterCheckIn) {
      return
    }

    let record = checkInRecords.find((row) => row.id === reservationId)
    if (!record) {
      const reservation =
        reservations.find((row) => row.id === reservationId) ??
        (selectedReservation?.id === reservationId
          ? selectedReservation
          : null)
      if (!reservation) {
        return
      }
      record = mapReservationsToCheckInRecords([reservation])[0]
    }
    if (!record) {
      return
    }

    const layout = paymentPrintDefaults.individualTickets
      ? "individual"
      : "combined"

    await handlePrintReservation(record, { layout, includeQr: true })

    if (!paymentPrintDefaults.printCashReceipt) {
      return
    }

    try {
      const detail = await fetchReservationDetailById({
        connectionName,
        reservationId,
      })
      const hasCash = (detail.PaymentList ?? []).some((payment) => {
        const code = (payment.PaymentTypeCode ?? "").trim().toUpperCase()
        const type = String(
          (payment as { PaymentType?: string }).PaymentType ?? ""
        )
          .trim()
          .toUpperCase()
        return (
          code === "PYMT01" || code.includes("CASH") || type.includes("CASH")
        )
      })
      if (hasCash) {
        await handlePrintReservation(record, { layout, includeQr: false })
      }
    } catch {
      // Auto-print cash receipt is best-effort after check-in.
    }
  }

  async function submitReservationCheckIn(reservationId: string) {
    await reservationCheckIn(
      buildReservationCheckInRequest({
        connectionName,
        reservationId,
        lastUpdateId: username,
      })
    )
    await refreshReservations()
    setCheckInPromoOpen(false)
    setPendingCheckInDetail(null)
    toastSuccess("Reservation checked in successfully")
    void maybeAutoPrintAfterCheckIn(reservationId)
  }

  async function handleCheckIn(record: CheckInRecord) {
    if (!isReady || record.isCancelled || isCheckingInReservation) {
      return
    }

    await checkInSubmitGuard.run(async () => {
      setIsCheckingInReservation(true)
      setCheckInError(null)
      setSelectedReservation(resolveReservation(record))

      try {
        const detail = await fetchReservationDetailById({
          connectionName,
          reservationId: record.id,
        })

        const validation = validateReservationCheckIn(detail)
        if (!validation.canCheckIn) {
          const message =
            validation.error ??
            "Amount due is greater than zero. Cannot Check-in."
          setWarningMessage(message)
          toastWarning(message)
          return
        }

        if (needsPromoValidation(detail)) {
          setPendingCheckInDetail(detail)
          setPromoIntent("check-in")
          setCheckInPromoOpen(true)
          return
        }

        await submitReservationCheckIn(record.id)
      } catch (requestError) {
        reportError(
          setCheckInError,
          requestError,
          "Failed to check in reservation"
        )
      } finally {
        setIsCheckingInReservation(false)
      }
    })
  }

  async function handleConfirmCheckInPromo() {
    if (promoIntent === "partial-check-in") {
      setCheckInPromoOpen(false)
      setPendingCheckInDetail(null)
      setPromoIntent(null)
      setPartialOpen(true)
      return
    }

    const reservationId =
      pendingCheckInDetail?.ReservationID?.trim() ??
      selectedReservation?.id ??
      ""

    if (!reservationId || !isReady) {
      return
    }

    setIsCheckingInReservation(true)
    setCheckInError(null)

    try {
      await submitReservationCheckIn(reservationId)
      setPromoIntent(null)
    } catch (requestError) {
      reportError(
        setCheckInError,
        requestError,
        "Failed to check in reservation"
      )
    } finally {
      setIsCheckingInReservation(false)
    }
  }

  async function handleUnCheckIn(record: CheckInRecord) {
    if (!isReady || record.isCancelled) {
      return
    }

    setCheckInError(null)

    try {
      await revertReservationCheckIn(
        buildRevertReservationCheckInRequest({
          connectionName,
          reservationId: record.id,
          lastUpdateId: username,
        })
      )
      await refreshReservations()
      toastSuccess("Check-in undone")
    } catch (requestError) {
      reportError(setCheckInError, requestError, "Failed to undo check-in")
    }
  }

  function openPartialCheckInPopup({
    reservation,
    party,
    checkedIn,
    remaining,
    total,
    paid,
  }: {
    reservation: Reservation
    party: number
    checkedIn: number
    remaining: number
    total: number
    paid: number
  }) {
    setSelectedReservation(reservation)
    setPartialReservationId(reservation.id)
    setPartialMode("check-in")
    setPartialMaxCount(Math.min(15, remaining))
    setPartialPartyNo(party)
    setPartialCheckedIn(checkedIn)
    setPartialRemaining(remaining)
    setPartialTotalAmount(total.toFixed(2))
    setPartialPaidAmount(paid.toFixed(2))
    setPartialError(null)
  }

  async function handlePartialCheckInOrSplit(record: CheckInRecord) {
    if (!isReady || record.isCancelled) {
      return
    }

    setCheckInError(null)
    setPartialError(null)

    try {
      const detail = await fetchReservationDetailById({
        connectionName,
        reservationId: record.id,
      })

      const party = detail.PartyNo ?? record.qty
      const checkedIn = detail.CheckedIn ?? record.seated

      if (party > 0 && party === checkedIn) {
        reportErrorMessage(
          setCheckInError,
          "Entire party already checked in. Cannot be split"
        )
        return
      }

      const total = detail.Total ?? parseReservationMoney(record.total)
      const paid =
        detail.ResPayments ?? parseReservationMoney(record.paid)

      const round = (value: number) => Math.round(value * 100) / 100
      const reservation = resolveReservation(record)

      if (round(total) === round(paid)) {
        const remaining = Math.max(0, party - checkedIn)
        if (remaining <= 0) {
          reportErrorMessage(
            setCheckInError,
            "Entire party already checked in. Cannot be split"
          )
          return
        }

        openPartialCheckInPopup({
          reservation,
          party,
          checkedIn,
          remaining,
          total,
          paid,
        })

        if (needsPromoValidation(detail)) {
          setPendingCheckInDetail(detail)
          setPromoIntent("partial-check-in")
          setCheckInPromoOpen(true)
          return
        }

        setPartialOpen(true)
        return
      }

      setSelectedReservation(reservation)

      if (detail.Promo?.trim()) {
        setSplitPromoOpen(true)
        return
      }

      setSplitOpen(true)
    } catch (requestError) {
      reportError(
        setCheckInError,
        requestError,
        "Failed to start partial check-in / split"
      )
    }
  }

  async function handleConfirmSplitPromo() {
    if (!selectedReservation || !isReady) {
      return
    }

    setIsSplitPromoSubmitting(true)
    setCheckInError(null)

    try {
      await reservationCheckIn(
        buildReservationCheckInRequest({
          connectionName,
          reservationId: selectedReservation.id,
          lastUpdateId: username,
        })
      )
      setSplitPromoOpen(false)
      setSplitOpen(true)
      toastSuccess("Checked in — continue with split")
    } catch (requestError) {
      reportError(
        setCheckInError,
        requestError,
        "Failed to continue split reservation"
      )
    } finally {
      setIsSplitPromoSubmitting(false)
    }
  }

  function handlePartialUnscan(record: CheckInRecord) {
    if (!isReady || record.isCancelled) {
      return
    }

    setCheckInError(null)
    setPartialError(null)

    if ((record.scanner ?? 0) <= 0) {
      reportErrorMessage(setCheckInError, "No party is scanned yet!")
      return
    }

    setSelectedReservation(resolveReservation(record))
    setPartialReservationId(record.id)
    setPartialMode("unscan")
    setPartialMaxCount(Math.min(15, record.scanner))
    setPartialPartyNo(record.qty)
    setPartialCheckedIn(record.seated)
    setPartialRemaining(0)
    setPartialTotalAmount(record.total)
    setPartialPaidAmount(record.paid)
    setPartialOpen(true)
  }

  async function handleConfirmPartial(count: number) {
    if (!partialReservationId || !isReady) {
      return
    }

    setIsPartialSubmitting(true)
    setPartialError(null)

    try {
      const request = buildPartialCheckInRequest({
        connectionName,
        reservationId: partialReservationId,
        partyNo: count,
      })

      if (partialMode === "check-in") {
        await partialCheckIn(request)
      } else {
        await revertPartialCheckIn(request)
      }

      setPartialOpen(false)
      await refreshReservations()
      toastSuccess(
        partialMode === "check-in"
          ? "Partial check-in saved"
          : "Partial unscan saved"
      )
    } catch (requestError) {
      reportError(
        setPartialError,
        requestError,
        "Failed to update partial check-in"
      )
    } finally {
      setIsPartialSubmitting(false)
    }
  }

  function handleQuickPay(record: CheckInRecord) {
    const total = parseReservationMoney(record.total)
    const paid = parseReservationMoney(record.paid)

    if (Math.round(total * 100) === Math.round(paid * 100)) {
      reportErrorMessage(setCheckInError, "No amount due. Cannot 'Quick Pay.'")
      return
    }

    setCheckInError(null)
    setSelectedReservation(resolveReservation(record))
    setAddOpen(false)
    setEditOpen(true)
  }

  function handleOpenResendTicket(record: CheckInRecord) {
    if (!isReady) {
      return
    }

    if (record.source !== "Web" && record.source !== "Phone") {
      reportErrorMessage(
        setResendError,
        "Resend Ticket is only available for WEB / PHONE-IN sources."
      )
      return
    }

    setResendError(null)
    setResendDialogError(null)
    setSelectedReservation(resolveReservation(record))
    setResendOpen(true)
  }

  async function handleConfirmResendTicket(payload: {
    email: string
    overwriteEmail: boolean
  }) {
    if (!selectedReservation || !isReady) {
      return
    }

    // Desktop: overwrite checked → ResendEmailText; unchecked → existing Email1.
    const existingEmail = selectedReservation.email?.trim() ?? ""
    const typedEmail = payload.email.trim()
    const email = payload.overwriteEmail
      ? typedEmail
      : typedEmail || existingEmail

    if (!email || !email.includes("@")) {
      reportErrorMessage(
        setResendDialogError,
        "Please enter valid email address. "
      )
      return
    }

    if (payload.overwriteEmail && !typedEmail) {
      reportErrorMessage(
        setResendDialogError,
        "Please enter valid email address. "
      )
      return
    }

    await resendSubmitGuard.run(async () => {
      setIsResendSubmitting(true)
      setResendDialogError(null)
      setResendError(null)

      try {
        // Desktop uses UserCredentials.DBName (not ConnectionName) in the URL.
        await resendReservationTicketEmail({
          reservationId: selectedReservation.id,
          locationId,
          email,
          dbName: dbName || connectionName,
        })

        // Desktop: UpdateCustomerEmail only when overwrite checkbox is checked.
        if (payload.overwriteEmail) {
          await updateCustomerEmail({
            connectionName,
            locationId,
            reservationId: selectedReservation.id,
            email,
          })
          await refreshReservations()
        }

        setResendOpen(false)
        toastSuccess("Ticket email sent")
      } catch (requestError) {
        reportError(
          setResendDialogError,
          requestError,
          "Failed to resend ticket email"
        )
      } finally {
        setIsResendSubmitting(false)
      }
    })
  }

  async function handleExpressSale(payload: ExpressPanelSalePayload) {
    if (!isReady) {
      return
    }

    if (!isExpressShowDateAllowed(showDate)) {
      setExpressError("Show Date can't be prior than today.")
      return
    }

    const fixedPartyError = validateBookFixedPartyTables({
      showSec: payload.section.showSec,
      party: payload.party,
    })
    if (fixedPartyError) {
      setExpressError(fixedPartyError.message)
      return
    }

    if (isExpressSubmitting) {
      return
    }

    await expressSubmitGuard.run(async () => {
      setIsExpressSubmitting(true)
      setExpressError(null)

      try {
        const { reservationIds } = await saveExpressWalkupReservation({
          connectionName,
          locationId,
          userRights: userRight,
          username,
          section: payload.section,
          party: payload.party,
          passes: payload.passes,
          promo: payload.promo,
          paymentType: payload.paymentType,
          paymentAmount: payload.paymentAmount,
          cardType: payload.cardType,
          isVip: expressShowData?.[0]?.VIP === "Y",
          showDate,
          taxRatePercent: paymentTaxRate,
          taxWithServiceCharge,
          // Desktop SaveSalesTransaction auto check-in for express cash/CC pad.
          checkInAfterSave: true,
        })

        const reservationId = reservationIds[0]
        if (reservationId) {
          void maybeAutoPrintAfterCheckIn(reservationId)
        }

        await refreshReservations()
        toastSuccess("Express sale saved")
      } catch (requestError) {
        reportError(setExpressError, requestError, "Failed to save express sale")
      } finally {
        setIsExpressSubmitting(false)
      }
    })
  }

  async function handleExpressWalkupQuickPay(payload: {
    showTimeId: string
    section: (typeof expressSections)[number]
    party: number
    passes: number
    promo: ReservationPromo | null
    dinner: boolean
    isVip: boolean
    paymentType: "cash" | "credit-card"
    paymentAmount: number
  }) {
    if (!isReady) {
      return
    }

    if (payload.showTimeId && payload.showTimeId !== showTime) {
      setShowTime(payload.showTimeId)
    }

    setIsExpressSubmitting(true)
    setExpressError(null)

    try {
      const shouldCheckIn = window.confirm("Check-In party?")

      const { reservationIds } = await saveExpressWalkupReservation({
        connectionName,
        locationId,
        userRights: userRight,
        username,
        section: payload.section,
        party: payload.party,
        passes: payload.passes,
        promo: payload.promo,
        paymentType: payload.paymentType,
        paymentAmount: payload.paymentAmount,
        dinner: payload.dinner,
        isVip: payload.isVip,
        showDate,
        taxRatePercent: paymentTaxRate,
        taxWithServiceCharge,
        checkInAfterSave: shouldCheckIn,
      })

      const reservationId = reservationIds[0]
      if (reservationId && shouldCheckIn) {
        void maybeAutoPrintAfterCheckIn(reservationId)
      }

      setExpressWalkupOpen(false)
      await refreshReservations()
      toastSuccess("Express walkup saved")
    } catch (requestError) {
      reportError(
        setExpressError,
        requestError,
        "Failed to save express walkup"
      )
    } finally {
      setIsExpressSubmitting(false)
    }
  }

  function handleExpressWalkupOpenPayment(seed: ExpressWalkupPaymentSeed) {
    if (seed.showTimeId && seed.showTimeId !== showTime) {
      setShowTime(seed.showTimeId)
    }

    setExpressWalkupPaymentSeed(seed)
    setExpressWalkupOpen(false)
    setAddOpen(true)
  }

  function handleExport(format: ExportFormat) {
    return exportCheckInRecords(filteredRecords, format, {
      filename: "check-in",
    })
  }

  function handlePrintList() {
    const didPrint = printCheckInList(filteredRecords)
    if (!didPrint) {
      reportErrorMessage(
        setReservationPrintError,
        filteredRecords.length === 0
          ? "No reservations to print."
          : "Unable to print the Check-in list."
      )
      return
    }
    toastSuccess("Check-in list sent to printer")
  }

  function handleOpenCancel(record: CheckInRecord) {
    setSelectedReservation(resolveReservation(record))
    setCancelReservationError(null)
    setCancelOpen(true)
  }

  async function handleUnCancel(record: CheckInRecord) {
    if (!isReady) {
      return
    }

    setUncancelReservationError(null)

    try {
      await revertCancelReservation(
        buildCancelReservationRequest({
          connectionName,
          locationId,
          reservationId: record.id,
          lastUpdateId: username,
        })
      )
      await refreshReservations()
      toastSuccess("Reservation uncanceled")
    } catch (requestError) {
      reportError(
        setUncancelReservationError,
        requestError,
        "Failed to uncancel reservation"
      )
    }
  }

  async function handleSaveCancelReservation({
    reservationNote,
    payments,
  }: {
    reservationNote: string
    payments: CancelReservationPaymentRow[]
  }) {
    if (!selectedReservation || !isReady) {
      return
    }

    setIsCancellingReservation(true)
    setCancelReservationError(null)

    try {
      await cancelReservation(
        buildCancelReservationRequest({
          connectionName,
          locationId,
          reservationId: selectedReservation.id,
          lastUpdateId: username,
          reservationNote,
          payments,
        })
      )
      setCancelOpen(false)
      setSelectedReservation(null)
      await refreshReservations()
      toastSuccess("Reservation cancelled")
    } catch (requestError) {
      reportError(
        setCancelReservationError,
        requestError,
        "Failed to cancel reservation"
      )
    } finally {
      setIsCancellingReservation(false)
    }
  }

  function handleOpenMove(record: CheckInRecord) {
    if (record.isCancelled) {
      return
    }

    setSelectedReservation(resolveReservation(record))
    setMoveOpen(true)
  }

  function handleOpenHistory(record: CheckInRecord) {
    setSelectedReservation(resolveReservation(record))
    setHistoryOpen(true)
  }

  function handleOpenNote(record: CheckInRecord) {
    setSelectedReservation(resolveReservation(record))
    setSaveReservationNoteError(null)
    setNoteOpen(true)
  }

  async function handleSaveReservationNote(note: string) {
    if (!selectedReservation || !isReady) {
      return
    }

    setIsSavingReservationNote(true)
    setSaveReservationNoteError(null)

    try {
      await saveReservationNote(
        buildReservationNoteRequest({
          connectionName,
          locationId,
          reservationId: selectedReservation.id,
          lastUpdateId: username,
          reservationNote: note,
        })
      )
      await refreshReservations()
      setNoteOpen(false)
      setSelectedReservation(null)
      toastSuccess("Note saved")
    } catch (requestError) {
      reportError(
        setSaveReservationNoteError,
        requestError,
        "Failed to save reservation note"
      )
    } finally {
      setIsSavingReservationNote(false)
    }
  }

  function handleOpenEdit(record: CheckInRecord) {
    if (record.isCancelled) {
      return
    }

    setSelectedReservation(resolveReservation(record))
    setEditOpen(true)
  }

  async function handlePrintReservation(
    record: CheckInRecord,
    {
      layout = "combined",
      includeQr = true,
    }: {
      layout?: "combined" | "individual"
      includeQr?: boolean
    } = {}
  ) {
    setReservationPrintError(null)
    const reservation = resolveReservation(record)

    try {
      const ticketData = await getMockTicketPrintData({
        reservation,
        showDate,
        showLabel: selectedShowLabel,
        locationName,
      })

      const didStart = await printReservationTicket({
        ticket: ticketData,
        ticketCount: ticketData.reservation.partySize,
        includeQr,
        layout,
      })

      if (!didStart) {
        throw new Error(
          "Unable to start printing. Please allow popups and try again."
        )
      }
      toastSuccess("Ticket print started")
    } catch (error) {
      reportError(
        setReservationPrintError,
        error,
        "Unable to start printing. Please try again."
      )
    }
  }

  async function handlePrintSignature(record: CheckInRecord) {
    setSignaturePrintError(null)
    setReservationPrintError(null)
    const reservation = resolveReservation(record)

    try {
      if (!connectionName) {
        throw new Error("Missing connection string")
      }

      const resDet = await getReservationDetail({
        connectionName,
        reservationId: reservation.id,
      }).unwrap()

      if (!resDet) {
        throw new Error("Reservation details not found.")
      }

      const paymentList = resDet.PaymentList || []
      const validPayments = paymentList.filter(
        (pymt) =>
          pymt.ReservationID === reservation.id &&
          (pymt.PaymentTypeCode?.trim() === "PYMT02" ||
            pymt.PaymentTypeCode?.trim() === "PYMT03" ||
            pymt.PaymentTypeCode?.trim() === "PYMT07") &&
          (pymt.PaymentStatusCode?.trim() === "PSTAT01" ||
            pymt.PaymentStatusCode?.trim() === "PSTAT21" ||
            pymt.PaymentStatusCode?.trim() === "PSTAT31")
      )

      const totalPay = validPayments.reduce(
        (sum, pymt) => sum + (pymt.Amount ?? 0),
        0
      )

      if (totalPay <= 0 || totalPay !== (resDet.Total ?? 0)) {
        reportErrorMessage(
          setSignaturePrintError,
          "No Credit Card payment found to print signature"
        )
        return
      }

      const printProperties = await getReservationPrintProperties({
        connectionName,
        reservationId: reservation.id,
      }).unwrap()

      const didStart = await printSignatureTicket(printProperties)
      if (!didStart) {
        throw new Error(
          "Unable to start printing. Please allow popups and try again."
        )
      }
      toastSuccess("Signature print started")
    } catch (error) {
      reportError(
        setSignaturePrintError,
        error,
        "Unable to print signature. Please try again."
      )
    }
  }

  function openAssignSeats(
    reservation: Reservation | null,
    checkInAfterSave: boolean
  ) {
    setSelectedReservation(reservation)
    setAssignCheckInAfterSave(checkInAfterSave)
    setAssignSeatsError(null)
    setAssignSeatsOpen(true)
  }

  async function handleOpenAssignSeatsAndCheckIn(record: CheckInRecord) {
    if (record.isCancelled) {
      return
    }

    // Desktop AssignSeatsAndCheckIn: unpaid → Warning, do not open dialog
    if (!isReady) {
      return
    }

    setCheckInError(null)
    try {
      const detail = await fetchReservationDetailById({
        connectionName,
        reservationId: record.id,
      })
      const validation = validateReservationCheckIn(detail)
      if (!validation.canCheckIn) {
        const message = validation.error?.includes("Amount due")
          ? "Amount due greater than zero, Cannot check in"
          : (validation.error ??
            "Amount due greater than zero, Cannot check in")
        setWarningMessage(message)
        toastWarning(message)
        return
      }
      openAssignSeats(resolveReservation(record), true)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Payment detail no found"
      setWarningMessage(message)
      toastError(message)
    }
  }

  function handleToolbarAssignSeats() {
    if (!showTime) {
      reportErrorMessage(setCheckInError, "Show does not exist")
      return
    }

    setCheckInError(null)
    openAssignSeats(selectedReservation, false)
  }

  async function handleSaveAssignSeats(payload: {
    result: {
      assignments: Array<{
        ReservationId: string
        TableNo: string
        SeatNo: number
      }>
      tableNumsByReservation: Array<{
        reservationId: string
        tableNums: string
      }>
    }
    checkInAfterSave: boolean
    reservationId: string | null
  }) {
    if (!isReady) {
      return
    }

    setIsAssignSeatsSubmitting(true)
    setAssignSeatsError(null)
    setCheckInError(null)

    try {
      await refreshReservations()

      const targetReservationId =
        payload.reservationId ??
        selectedReservation?.id ??
        payload.result.tableNumsByReservation[0]?.reservationId ??
        null

      if (!payload.checkInAfterSave || !targetReservationId) {
        setAssignSeatsOpen(false)
        toastSuccess("Seats assigned")
        return
      }

      const detail = await fetchReservationDetailById({
        connectionName,
        reservationId: targetReservationId,
      })
      const validation = validateReservationCheckIn(detail)
      if (!validation.canCheckIn) {
        setAssignSeatsOpen(false)
        const message = validation.error?.includes("Amount due")
          ? "Amount due greater than zero, Cannot check in"
          : (validation.error ??
            "Amount due greater than zero, Cannot check in")
        setWarningMessage(message)
        toastWarning(message)
        return
      }

      if (needsPromoValidation(detail)) {
        setPendingCheckInDetail(detail)
        setSelectedReservation(
          reservations.find((row) => row.id === targetReservationId) ??
            selectedReservation
        )
        setAssignSeatsOpen(false)
        setPromoIntent("check-in")
        setCheckInPromoOpen(true)
        return
      }

      await submitReservationCheckIn(targetReservationId)
      setAssignSeatsOpen(false)
    } catch (requestError) {
      reportError(setAssignSeatsError, requestError, "Failed to assign seats")
    } finally {
      setIsAssignSeatsSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Check-In
          </h1>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            Today
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => {
              setSelectedReservation(null)
              setEditOpen(false)
              setAddOpen(true)
            }}
          >
            <Plus className="size-3.5" />
            Add Reservation
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            onClick={() => {
              setExpressError(null)
              setExpressWalkupOpen(true)
            }}
          >
            <Zap className="size-3.5" />
            Express Walkup
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            type="button"
            onClick={handlePrintList}
          >
            <Printer className="size-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            type="button"
            onClick={() => setExportOpen(true)}
          >
            <FileDown className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      <CheckInToolbar
        showDate={showDate}
        onShowDateChange={() => undefined}
        showTime={showTime}
        onShowTimeChange={setShowTime}
        refreshValue={refreshValue}
        onRefreshValueChange={setRefreshValue}
        cancelled={cancelled}
        onCancelledChange={setCancelled}
        displayCheckedIn={displayCheckedIn}
        onDisplayCheckedInChange={setDisplayCheckedIn}
        cancelledShow={cancelledShow}
        onCancelledShowChange={setCancelledShow}
        shows={shows}
        disableShowDateChange
        headliner={headliner}
        stats={stats}
        isRefreshing={reservationsLoading || showsLoading}
        assignSeatsVisible={assignSeatsVisible}
        onAssignSeats={handleToolbarAssignSeats}
        onRefresh={() => {
          void handleRefresh()
        }}
      />

      <PanelCard>
        <CheckInSearchCriteria
          lastName={lastName}
          onLastNameChange={setLastName}
          firstName={firstName}
          onFirstNameChange={setFirstName}
          ccLast4={ccLast4}
          onCcLast4Change={setCcLast4}
          tableNo={tableNo}
          onTableNoChange={setTableNo}
          phoneNo={phoneNo}
          onPhoneNoChange={setPhoneNo}
          onSearch={applySearch}
          onClear={clearSearch}
        />
      </PanelCard>

      <PanelCard>
        <CheckInExpressPanel
          sections={expressSections}
          promos={expressPromos}
          showDate={showDate}
          taxRatePercent={paymentTaxRate}
          taxWithServiceCharge={taxWithServiceCharge}
          posCcMode={expressPosCcMode}
          visible={expressVisible}
          isSubmitting={isExpressSubmitting}
          error={expressError}
          onSale={handleExpressSale}
        />
      </PanelCard>

      <PanelCard>
        <CheckInStatusLegend recordCount={filteredRecords.length} />
        {(checkInError ||
          uncancelReservationError ||
          reservationsError ||
          reservationPrintError ||
          signaturePrintError ||
          resendError ||
          expressError) && (
          <div className="space-y-1 border-b px-2.5 py-2 text-sm text-destructive lg:px-3">
            {checkInError ? <p>{checkInError}</p> : null}
            {uncancelReservationError ? (
              <p>{uncancelReservationError}</p>
            ) : null}
            {reservationsError ? <p>{reservationsError}</p> : null}
            {reservationPrintError ? <p>{reservationPrintError}</p> : null}
            {signaturePrintError ? <p>{signaturePrintError}</p> : null}
            {resendError ? <p>{resendError}</p> : null}
            {expressError ? <p>{expressError}</p> : null}
          </div>
        )}
        <CheckInDataTable
          data={filteredRecords}
          loading={reservationsLoading}
          showScannerColumn={showScannerColumn}
          onSelectReservation={(record) => {
            setSelectedReservation(resolveReservation(record))
          }}
          onCancelReservation={handleOpenCancel}
          onUnCancelReservation={(record) => {
            void handleUnCancel(record)
          }}
          onCheckIn={(record) => {
            void handleCheckIn(record)
          }}
          onUnCheckIn={(record) => {
            void handleUnCheckIn(record)
          }}
          onPartialCheckInOrSplit={(record) => {
            void handlePartialCheckInOrSplit(record)
          }}
          onPartialUnscan={handlePartialUnscan}
          onQuickPay={handleQuickPay}
          onAssignSeatsAndCheckIn={(record) => {
            void handleOpenAssignSeatsAndCheckIn(record)
          }}
          onMoveReservation={handleOpenMove}
          onPrintTickets={(record) => {
            void handlePrintReservation(record, {
              layout: "combined",
              includeQr: true,
            })
          }}
          onPrintIndividualTickets={(record) => {
            void handlePrintReservation(record, {
              layout: "individual",
              includeQr: true,
            })
          }}
          onPrintReceipt={(record) => {
            void handlePrintReservation(record, {
              layout: "combined",
              includeQr: false,
            })
          }}
          onReservationHistory={handleOpenHistory}
          onAddNote={handleOpenNote}
          onEditReservation={handleOpenEdit}
          onPrintSignature={(record) => {
            void handlePrintSignature(record)
          }}
          onResendTicket={handleOpenResendTicket}
        />
      </PanelCard>

      <AddReservationDialog
        open={addOpen || editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddOpen(false)
            setEditOpen(false)
            setSelectedReservation(null)
            setExpressWalkupPaymentSeed(null)
          }
        }}
        onSaved={async () => {
          setExpressWalkupPaymentSeed(null)
          await refreshReservations()
        }}
        reservation={editOpen ? selectedReservation : null}
        showDate={showDate}
        showTime={expressWalkupPaymentSeed?.showTimeId || showTime}
        expressWalkupSeed={expressWalkupPaymentSeed}
      />

      <CancelReservationDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open)
          if (!open) {
            setSelectedReservation(null)
            setCancelReservationError(null)
            setIsCancellingReservation(false)
          }
        }}
        reservation={selectedReservation}
        connectionName={connectionName}
        showDate={showDate}
        showTime={selectedShow?.time}
        showHeadliner={selectedShow?.headliner}
        userRight={userRight}
        isSubmitting={isCancellingReservation}
        error={cancelReservationError}
        onSave={handleSaveCancelReservation}
      />

      <MoveReservationDialog
        open={moveOpen}
        onOpenChange={(open) => {
          setMoveOpen(open)
          if (!open) {
            setSelectedReservation(null)
          }
        }}
        reservation={selectedReservation}
        connectionName={connectionName}
        locationId={locationId}
        username={username}
        currentShowId={showTime}
        onMoved={async () => {
          await refreshReservations()
          toastSuccess("Reservation moved")
        }}
      />

      <ReservationHistoryDialog
        open={historyOpen}
        onOpenChange={(open) => {
          setHistoryOpen(open)
          if (!open) {
            setSelectedReservation(null)
          }
        }}
        reservation={selectedReservation}
        connectionName={connectionName}
      />

      <ReservationNoteDialog
        open={noteOpen}
        onOpenChange={(open) => {
          setNoteOpen(open)
          if (!open) {
            setSelectedReservation(null)
            setSaveReservationNoteError(null)
            setIsSavingReservationNote(false)
          }
        }}
        reservation={selectedReservation}
        connectionName={connectionName}
        isSubmitting={isSavingReservationNote}
        error={saveReservationNoteError}
        onSave={handleSaveReservationNote}
      />

      <ReservationCheckInPromoDialog
        open={checkInPromoOpen}
        onOpenChange={(open) => {
          setCheckInPromoOpen(open)
          if (!open) {
            setPendingCheckInDetail(null)
            setPromoIntent(null)
          }
        }}
        promo={
          pendingCheckInDetail?.Promo?.trim() ??
          selectedReservation?.promo ??
          ""
        }
        passes={pendingCheckInDetail?.NumPasses ?? 0}
        isSubmitting={isCheckingInReservation}
        onConfirm={() => {
          void handleConfirmCheckInPromo()
        }}
      />

      <ExpressWalkupDialog
        open={expressWalkupOpen}
        onOpenChange={setExpressWalkupOpen}
        connectionName={connectionName}
        locationId={locationId}
        username={username}
        showDate={showDate}
        showTimeId={showTime}
        shows={shows}
        isSubmitting={isExpressSubmitting}
        error={expressError}
        showExpressPayment={expressPaymentMethodVisible}
        taxRatePercent={paymentTaxRate}
        taxWithServiceCharge={taxWithServiceCharge}
        onShowTimeChange={setShowTime}
        onQuickPaySave={handleExpressWalkupQuickPay}
        onOpenReservationPayment={handleExpressWalkupOpenPayment}
      />

      <PartialCheckInDialog
        open={partialOpen}
        onOpenChange={setPartialOpen}
        mode={partialMode}
        lastName={selectedReservation?.lastName ?? ""}
        firstName={selectedReservation?.firstName ?? ""}
        partyNo={partialPartyNo}
        totalAmount={partialTotalAmount}
        paidAmount={partialPaidAmount}
        checkedIn={partialCheckedIn}
        remaining={partialRemaining}
        maxCount={partialMaxCount}
        isSubmitting={isPartialSubmitting}
        error={partialError}
        onConfirm={handleConfirmPartial}
      />

      <SplitPromoConfirmDialog
        open={splitPromoOpen}
        onOpenChange={(open) => {
          setSplitPromoOpen(open)
          if (!open) {
            setIsSplitPromoSubmitting(false)
          }
        }}
        isSubmitting={isSplitPromoSubmitting}
        onConfirm={handleConfirmSplitPromo}
      />

      <ResendEmailDialog
        open={resendOpen}
        onOpenChange={(open) => {
          setResendOpen(open)
          if (!open) {
            setResendDialogError(null)
            setIsResendSubmitting(false)
          }
        }}
        existingEmail={selectedReservation?.email ?? ""}
        isSubmitting={isResendSubmitting}
        error={resendDialogError}
        onResend={handleConfirmResendTicket}
      />

      <AssignSeatsDialog
        open={assignSeatsOpen}
        onOpenChange={(open) => {
          setAssignSeatsOpen(open)
          if (!open) {
            setAssignSeatsError(null)
            setIsAssignSeatsSubmitting(false)
          }
        }}
        connectionName={connectionName}
        locationId={locationId}
        showId={showTime}
        username={username}
        reservation={selectedReservation}
        checkInAfterSave={assignCheckInAfterSave}
        isSubmitting={isAssignSeatsSubmitting}
        error={assignSeatsError}
        onSaved={handleSaveAssignSeats}
      />

      <SplitReservationDialog
        open={splitOpen}
        onOpenChange={(open) => {
          setSplitOpen(open)
          if (!open && !editOpen) {
            setSelectedReservation(null)
          }
        }}
        reservation={selectedReservation}
        connectionName={connectionName}
        locationId={locationId}
        username={username}
        showDate={showDate}
        currentShowId={showTime}
        onSplit={async () => {
          await refreshReservations()
          toastSuccess("Reservation split")
        }}
      />

      <ExportDataDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
        excelDescription="Download an Excel workbook (.xlsx) of the Check-in list."
      />

      {/* Desktop Warning for unpaid Check-In / Assign Seats And Check-In */}
      <Dialog
        open={Boolean(warningMessage)}
        onOpenChange={(open) => {
          if (!open) {
            setWarningMessage(null)
          }
        }}
      >
        <DialogContent
          className="gap-0 overflow-hidden p-0 sm:max-w-md"
          showCloseButton={false}
        >
          <DialogHeader
            className="shrink-0 border-b px-4 py-2.5"
            style={{ backgroundColor: "#155abb" }}
          >
            <DialogTitle className="text-base font-semibold text-white">
              Warning
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 px-5 py-6">
            <Info className="mt-0.5 size-8 shrink-0 text-[#155abb]" />
            <DialogDescription className="pt-1 text-sm text-foreground">
              {warningMessage}
            </DialogDescription>
          </div>
          <DialogFooter className="border-t bg-[#f5f5f5] px-4 py-3 sm:justify-center">
            <Button
              type="button"
              className="h-9 min-w-20 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setWarningMessage(null)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
