import { LoaderCircle, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { ShowDateField } from '@/components/common/show-date-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import { ReservationPaymentPanel } from '@/features/reservations/reservation-payment-panel'
import { useReservationDetail } from '@/hooks/use-reservation-detail'
import {
  buildMoveReservationRequest,
  calculateMoveReservationDifference,
  calculateMoveReservationTotals,
  getMoveOrigAmounts,
  isPastShowDate,
  validateMoveReservationSection
} from '@/lib/build-move-reservation-request'
import { formatReservationMoney, parseReservationMoney } from '@/lib/calculate-reservation-totals'
import {
  calculateSvcBase,
  mapOriginToCode,
} from '@/lib/calculate-svc-base'
import { fetchUpcomingShowDetails, moveReservation } from '@/lib/api/reservations'
import {
  reportError,
  reportErrorMessage,
  toastSuccess,
} from '@/lib/app-toast'
import { alertDialog } from '@/lib/app-dialog'
import {
  readPaymentTaxRate,
  readTaxWithServiceCharge,
} from '@/lib/check-in-defaults'
import { normalizeTaxPercent } from '@/lib/build-split-reservation-request'
import { mapReservationSourceToOrigin } from '@/lib/reservation-edit'
import {
  getFirstReservationPaymentError,
  validateReservationPaymentFields,
  type ReservationPaymentValidationErrors
} from '@/lib/validate-reservation-payment'
import {
  filterUpcomingShowsByDate,
  getActiveUpcomingShows,
  toIsoShowDate
} from '@/lib/map-upcoming-show-details'
import { mapShowDetailsToOptions } from '@/lib/map-show-details'
import { mapShowSectionsToOptions } from '@/lib/map-show-sections'
import { cn } from '@/lib/utils'
import {
  useGetShowDataQuery,
  useGetShowSectionsQuery,
  useGetSystemDefaultsQuery,
} from '@/store/api/clubmanApi'
import {
  createEmptyReservationPaymentFields,
  type ReservationPaymentFields
} from '@/types/reservation-payment'
import type { Reservation, ReservationSectionOption } from '@/types/reservation'
import type { ShowDetailsByDateItem } from '@/types/api/show-details'

/** Desktop MoveReservation.xaml table-section visibility (BookTableSecVisibility). */
const TABLE_SECTION_CODES = new Set([
  'SECT12',
  'SECT16',
  'SECT13',
  'SECT17',
  'SECT10',
  'SECT15',
  'SECT05',
])

const READONLY_FIELD_CLASS =
  'h-9 cursor-default border-slate-200 bg-slate-100/80 text-muted-foreground shadow-none focus-visible:border-slate-200 focus-visible:ring-0'

/** Desktop section combo: `$ price Name Seats: n` (Available is a separate field). */
function formatMoveSectionLabel(section: ReservationSectionOption) {
  return `${section.price} ${section.name} Seats: ${section.seats}`
}

function formatShowDateShort(dateValue: string) {
  const iso = toIsoShowDate(dateValue) || dateValue
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}/${date.getFullYear()}`
}

function formatDifferenceMoney(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    currencySign: 'accounting',
  })
}

/** Desktop Move Origin combo shows "Phone-In" / "Walk-Up" / "Web". */
function formatMoveOriginLabel(source: string | null | undefined) {
  const normalized = source?.trim().toLowerCase() ?? ''
  if (!normalized || normalized === 'phone' || normalized === 'phone-in') {
    return 'Phone-In'
  }
  if (
    normalized === 'walkup' ||
    normalized === 'walk-up' ||
    normalized === 'walk up'
  ) {
    return 'Walk-Up'
  }
  if (normalized === 'web') {
    return 'Web'
  }
  return source!.trim()
}

type MoveReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  connectionName: string
  locationId: string
  username: string
  currentShowId: string
  onMoved?: () => void | Promise<void>
}

function pickDefaultMoveSection(
  sections: ReservationSectionOption[],
  preferredShowDetId?: string | null,
  preferredSecCode?: string | null
) {
  if (sections.length === 0) {
    return null
  }

  const preferredId = preferredShowDetId?.trim()
  if (preferredId) {
    const byDetId = sections.find(
      section =>
        section.id === preferredId || section.showDetId === preferredId
    )
    if (byDetId) {
      return byDetId
    }
  }

  const preferredSec = preferredSecCode?.trim().toUpperCase()
  if (preferredSec) {
    const bySec = sections.find(
      section => section.showSec.trim().toUpperCase() === preferredSec
    )
    if (bySec) {
      return bySec
    }
  }

  // Desktop RefreshShowSectionInMoveReservation looks up "Regular".
  return (
    sections.find(section => section.name.trim().toLowerCase() === 'regular') ??
    sections[0]
  )
}

function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function SectionCard({
  title,
  children,
  className,
  readOnly: _readOnly = false,
}: {
  title: string
  children: ReactNode
  className?: string
  readOnly?: boolean
}) {
  return (
    <section
      className={cn(
        'rounded-md border border-slate-200 bg-slate-50/60 p-3',
        className
      )}
    >
      <div className='flex items-center justify-between gap-3'>
        <h3 className='text-sm font-medium text-foreground'>{title}</h3>
      </div>
      <div className='mt-3'>{children}</div>
    </section>
  )
}

function MoneyField({
  label,
  value,
  className,
  readOnlyTone = false,
}: {
  label: string
  value: number
  className?: string
  readOnlyTone?: boolean
}) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <span className='text-xs font-medium text-foreground'>{label}</span>
      <Input
        readOnly
        value={formatReservationMoney(value)}
        className={cn(
          'h-9 bg-white text-sm shadow-xs',
          readOnlyTone && READONLY_FIELD_CLASS
        )}
      />
    </div>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className='block text-xs font-semibold text-foreground'>{children}</span>
  )
}

export function MoveReservationDialog({
  open,
  onOpenChange,
  reservation,
  connectionName,
  locationId,
  username,
  currentShowId,
  onMoved
}: MoveReservationDialogProps) {
  const reservationId = reservation?.id ?? ''
  const { detail, loading: detailLoading, error: detailError } = useReservationDetail(
    connectionName,
    reservationId,
    open && Boolean(reservationId)
  )

  const { data: rawSystemDefaults } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !open || !connectionName || !locationId }
  )

  const systemDefaults = useMemo(() => {
    if (!rawSystemDefaults) {
      return {} as Record<string, string | null | undefined>
    }
    return rawSystemDefaults.reduce(
      (acc, curr) => {
        if (curr.Field) {
          acc[curr.Field] = curr.DefValue
        }
        return acc
      },
      {} as Record<string, string | null | undefined>
    )
  }, [rawSystemDefaults])

  const systemTaxPercent = useMemo(() => {
    const fromDefaults = rawSystemDefaults
      ? readPaymentTaxRate(rawSystemDefaults)
      : Number(systemDefaults?.lblTaxes || 0)
    return normalizeTaxPercent(fromDefaults)
  }, [rawSystemDefaults, systemDefaults?.lblTaxes])

  const taxWithServiceCharge =
    readTaxWithServiceCharge(rawSystemDefaults ?? []) ??
    systemDefaults?.lblTaxWithServiceCharge ??
    undefined

  const [upcomingShows, setUpcomingShows] = useState<ShowDetailsByDateItem[]>([])
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [upcomingError, setUpcomingError] = useState<string | null>(null)
  // Desktop DatePicker style always shows "Select Show Date" text, but Show Time /
  // Section / Available / With Move load from the current reservation show.
  const [destinationDate, setDestinationDate] = useState('')
  const [destinationShowId, setDestinationShowId] = useState('')
  const [destinationSectionId, setDestinationSectionId] = useState('')
  const [hasPickedMoveDate, setHasPickedMoveDate] = useState(false)
  const [dinner, setDinner] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [paymentValidationErrors, setPaymentValidationErrors] =
    useState<ReservationPaymentValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chargeConfirmOpen, setChargeConfirmOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentType, setPaymentType] =
    useState<ReservationPaymentType>('credit-card')
  const [paymentFields, setPaymentFields] = useState<ReservationPaymentFields>(
    () => createEmptyReservationPaymentFields()
  )
  const [displayedMoveTotals, setDisplayedMoveTotals] = useState({
    subtotal: 0,
    serviceCharge: 0,
    discount: 0,
    taxes: 0,
    total: 0,
  })
  const [displayedDifference, setDisplayedDifference] = useState(0)
  const lastNoShowAlertDateRef = useRef('')

  const originShowId = detail?.ShowId?.trim() || currentShowId
  const party = detail?.PartyNo ?? reservation?.qty ?? 0
  const origParty = detail?.OrigPartyNo ?? party
  const passes = detail?.NumPasses ?? 0
  const promotionCode = detail?.Promo?.trim() ?? reservation?.promo.trim() ?? ''
  const origin = reservation ? mapReservationSourceToOrigin(reservation.source) : 'phone'
  const reservationNotes =
    detail?.ReservationNotes?.trim() ??
    detail?.Note?.trim() ??
    reservation?.notes.trim() ??
    ''
  const reservationSectionCode = detail?.ResSec ?? ''
  const isVip = detail?.VIP?.trim().toUpperCase() === 'Y'
  const isTableReservation = TABLE_SECTION_CODES.has(
    reservationSectionCode.trim().toUpperCase()
  )
  const originLabel = formatMoveOriginLabel(
    detail?.LookupSDescSource || reservation?.source
  )
  const partyOrTableLabel = isTableReservation ? 'Table :' : 'Party :'
  const partyOrTableValue = String(party || '')

  const origSubTotal = detail?.SubTotal ?? 0
  const origServiceCharge = detail?.SVC ?? 0
  const { origTotal, origDiscount } = useMemo(
    () =>
      getMoveOrigAmounts({
        total:
          detail?.Total ??
          parseReservationMoney(reservation?.total ?? '0'),
        discount: detail?.Discount ?? 0,
        paymentList: detail?.PaymentList,
      }),
    [detail?.Discount, detail?.PaymentList, detail?.Total, reservation?.total]
  )
  const origTaxes = detail?.SalesTax ?? 0

  const activeUpcomingShows = useMemo(
    () => getActiveUpcomingShows(upcomingShows),
    [upcomingShows]
  )

  const originUpcomingShow = useMemo(
    () =>
      activeUpcomingShows.find(show => show.ShowId === originShowId) ?? null,
    [activeUpcomingShows, originShowId]
  )

  const showsForShowTimeCombo = useMemo(() => {
    let shows: ShowDetailsByDateItem[] = []

    // After the user picks a date (or dbl-clicks upcoming), filter to that day.
    if (hasPickedMoveDate && destinationDate) {
      shows = filterUpcomingShowsByDate(activeUpcomingShows, destinationDate)
    } else if (originUpcomingShow) {
      // Desktop ShowDetails on open = shows for the current reservation day.
      const originDate = toIsoShowDate(originUpcomingShow.ShowDate)
      shows = originDate
        ? filterUpcomingShowsByDate(activeUpcomingShows, originDate)
        : activeUpcomingShows.filter(show => show.ShowId === originShowId)
    } else if (originShowId) {
      shows = activeUpcomingShows.filter(show => show.ShowId === originShowId)
    }

    // Keep the reservation's current show visible even if inactive in the active list.
    if (
      originShowId &&
      !hasPickedMoveDate &&
      !shows.some(show => show.ShowId === originShowId)
    ) {
      const originFromAll = upcomingShows.find(
        show => show.ShowId === originShowId
      )
      if (originFromAll) {
        shows = [originFromAll, ...shows]
      }
    }

    return shows
  }, [
    activeUpcomingShows,
    destinationDate,
    hasPickedMoveDate,
    originShowId,
    originUpcomingShow,
    upcomingShows,
  ])

  const destinationShowOptions = useMemo(
    () => mapShowDetailsToOptions(showsForShowTimeCombo),
    [showsForShowTimeCombo]
  )

  const selectedDestinationShowId =
    destinationShowOptions.find(show => show.id === destinationShowId)?.id ??
    destinationShowOptions.find(show => show.id === originShowId)?.id ??
    destinationShowOptions[0]?.id ??
    (destinationShowId || '')

  const { data: showDataPayload } = useGetShowDataQuery(
    { connectionName, showId: selectedDestinationShowId },
    {
      skip: !open || !connectionName || !selectedDestinationShowId,
    }
  )

  const { data: destinationSectionsRaw = [], isFetching: sectionsLoading } =
    useGetShowSectionsQuery(
      {
        connectionString: connectionName,
        showId: selectedDestinationShowId
      },
      {
        skip: !open || !connectionName || !selectedDestinationShowId
      }
    )

  // Avoid stale RTK section cache when no destination show is selected yet.
  const destinationSections = useMemo(() => {
    if (!selectedDestinationShowId) {
      return []
    }
    return mapShowSectionsToOptions(destinationSectionsRaw)
  }, [destinationSectionsRaw, selectedDestinationShowId])

  const selectedSection = useMemo(
    () =>
      destinationSections.find(section => section.id === destinationSectionId) ??
      pickDefaultMoveSection(
        destinationSections,
        detail?.ShowDetID,
        detail?.ResSec
      ),
    [
      destinationSectionId,
      destinationSections,
      detail?.ResSec,
      detail?.ShowDetID,
    ]
  )

  const moveTotals = useMemo(() => {
    if (!selectedDestinationShowId || !selectedSection || party <= 0) {
      return {
        subtotal: 0,
        serviceCharge: 0,
        discount: 0,
        taxes: 0,
        total: 0
      }
    }

    const showData =
      Array.isArray(showDataPayload) && showDataPayload.length > 0
        ? showDataPayload[0]
        : null
    const selectedSectionId = selectedSection.id.trim().toLowerCase()
    const sectionData = Array.isArray(showDataPayload)
      ? showDataPayload.find(
        row => row.ShowDetID?.trim().toLowerCase() === selectedSectionId
      )
      : null

    // Desktop CalculateServiceCharge: show/section fees × party (no table multiplier).
    // Prefer GetShowData section SVC; fall back to GetShowSections *SvcCharge
    // (same fields desktop SelectedSection.WalkupSvcCharge uses).
    let baseSvcAmount = 0
    const svcShowDate =
      destinationDate ||
      toIsoShowDate(originUpcomingShow?.ShowDate ?? '') ||
      todayDateValue()
    const sectionSvcFees = {
      phoneSvcCharge: selectedSection.phoneSvcCharge,
      walkupSvcCharge: selectedSection.walkupSvcCharge,
      webSvcCharge: selectedSection.webSvcCharge,
    }
    if (showData) {
      baseSvcAmount = calculateSvcBase({
        originCode: mapOriginToCode(origin),
        partySize: party,
        showDate: svcShowDate,
        reservationCreatedDate: reservation?.createdDt ?? null,
        showData,
        sectionData,
        sectionSvcFees,
        excludePhoneDayOfShow: systemDefaults?.txtDayOfShow2 === 'Y',
        excludeWebDayOfShow: systemDefaults?.txtDayOfShow3 === 'Y',
      })
    } else {
      // No GetShowData: mirror desktop section-override when section SVC present.
      const hasSectionSvc =
        selectedSection.phoneSvcCharge > 0 ||
        selectedSection.walkupSvcCharge > 0 ||
        selectedSection.webSvcCharge > 0
      const fee =
        origin === 'phone'
          ? hasSectionSvc
            ? selectedSection.phoneSvcCharge
            : selectedSection.phoneInFee
          : origin === 'walkup'
            ? hasSectionSvc
              ? selectedSection.walkupSvcCharge
              : selectedSection.walkUpFee
            : hasSectionSvc
              ? selectedSection.webSvcCharge
              : selectedSection.webFee
      baseSvcAmount = fee * party
    }

    const totals = calculateMoveReservationTotals({
      sectionShowPrice: selectedSection.showPrice,
      party,
      origDiscount,
      baseSvcAmount,
      systemTaxRate: systemTaxPercent,
      taxWithServiceCharge,
      ccFeePercent: Number(systemDefaults?.cboCC || 0),
    })

    // Desktop same-show move: preserve the stored historic SVC exactly.
    // The original SVC was calculated at reservation-creation time under
    // whatever show settings existed then (e.g. UseSectionFee=OFF → $0).
    // Re-running CalculateServiceCharge today (when UseSectionFee may now
    // be ON) would wrongly inflate the charge for historic reservations.
    // The SVCDiff delta approach is insufficient: when both origServiceCharge
    // and formulaAtLoad are $0, svcDiff=0 so the guard fires no correction
    // and the freshly-recalculated amount ($110) leaks through unchanged.
    if (
      selectedDestinationShowId &&
      originShowId &&
      selectedDestinationShowId === originShowId
    ) {
      const svcDelta = origServiceCharge - totals.serviceCharge
      return {
        ...totals,
        serviceCharge: origServiceCharge,
        total: Math.round((totals.total + svcDelta) * 100) / 100,
      }
    }

    return totals
  }, [
    destinationDate,
    origDiscount,
    origServiceCharge,
    origin,
    originShowId,
    originUpcomingShow?.ShowDate,
    party,
    reservation?.createdDt,
    selectedDestinationShowId,
    selectedSection,
    showDataPayload,
    systemDefaults?.cboCC,
    systemDefaults?.txtDayOfShow2,
    systemDefaults?.txtDayOfShow3,
    systemTaxPercent,
    taxWithServiceCharge,
  ])

  const { difference, isPayable, chargeAmount } = useMemo(() => {
    if (!selectedDestinationShowId || !selectedSection) {
      return { difference: 0, isPayable: false, chargeAmount: 0 }
    }
    return calculateMoveReservationDifference(origTotal, moveTotals.total)
  }, [
    moveTotals.total,
    origTotal,
    selectedDestinationShowId,
    selectedSection,
  ])

  function applyMoveTotalsDisplay() {
    setDisplayedMoveTotals(moveTotals)
    setDisplayedDifference(difference)
  }

  useEffect(() => {
    if (!open) {
      return
    }
    // Desktop recalcs when show/section selection changes; keep charge math live.
    applyMoveTotalsDisplay()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync display from current memo values
  }, [open, moveTotals, difference])

  useEffect(() => {
    if (!open) {
      setUpcomingShows([])
      setUpcomingError(null)
      setDestinationDate('')
      setDestinationShowId('')
      setDestinationSectionId('')
      setHasPickedMoveDate(false)
      setDinner(false)
      setSubmitError(null)
      setIsSubmitting(false)
      setChargeConfirmOpen(false)
      setPaymentDialogOpen(false)
      setPaymentType('credit-card')
      setPaymentFields(createEmptyReservationPaymentFields())
      setDisplayedMoveTotals({
        subtotal: 0,
        serviceCharge: 0,
        discount: 0,
        taxes: 0,
        total: 0,
      })
      setDisplayedDifference(0)
      lastNoShowAlertDateRef.current = ''
      return
    }

    if (!connectionName || !locationId) {
      return
    }

    let isCurrent = true
    setUpcomingLoading(true)
    setUpcomingError(null)
    setDestinationDate('')
    setHasPickedMoveDate(false)
    // Desktop seeds Show Time / Section from the current reservation show.
    setDestinationShowId(currentShowId || '')
    setDestinationSectionId('')

    fetchUpcomingShowDetails({
      connectionString: connectionName,
      locationId,
      startDateIso: todayDateValue()
    })
      .then(shows => {
        if (isCurrent) {
          setUpcomingShows(shows)
        }
      })
      .catch(error => {
        if (isCurrent) {
          reportError(
            setUpcomingError,
            error,
            'Failed to load upcoming shows'
          )
        }
      })
      .finally(() => {
        if (isCurrent) {
          setUpcomingLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [connectionName, currentShowId, locationId, open])

  useEffect(() => {
    if (!open || !detail) {
      return
    }

    setDinner(detail.Dinner?.trim().toUpperCase() === 'Y')
  }, [detail, open])

  // Seed Show Date from origin show once (desktop defaults to reservation's date).
  // Do not overwrite after the user picks a move date.
  useEffect(() => {
    if (!open || hasPickedMoveDate || destinationDate) {
      return
    }
    const originIso = toIsoShowDate(originUpcomingShow?.ShowDate ?? '')
    if (originIso) {
      setDestinationDate(originIso)
    }
  }, [destinationDate, hasPickedMoveDate, open, originUpcomingShow?.ShowDate])

  // Seed Show Time from reservation show once (desktop GetMoveReservationInfo).
  // Do not overwrite after the user changes show time or picks a move date.
  useEffect(() => {
    if (!open || hasPickedMoveDate) {
      return
    }

    const detailShowId = detail?.ShowId?.trim()
    if (!detailShowId) {
      return
    }

    setDestinationShowId(prev =>
      !prev || prev === currentShowId ? detailShowId : prev
    )
  }, [currentShowId, detail?.ShowId, hasPickedMoveDate, open])

  useEffect(() => {
    if (!open || !hasPickedMoveDate || !destinationDate) {
      return
    }

    if (!destinationShowOptions.some(show => show.id === destinationShowId)) {
      const preferred =
        destinationShowOptions.find(show => show.id !== originShowId) ??
        destinationShowOptions[0]
      setDestinationShowId(preferred?.id ?? '')
    }
  }, [
    destinationDate,
    destinationShowId,
    destinationShowOptions,
    hasPickedMoveDate,
    open,
    originShowId,
  ])

  // Desktop RefreshShowSectionInMoveReservation:
  // "Show detail not found please select other date show."
  useEffect(() => {
    if (!open || !hasPickedMoveDate || !destinationDate || upcomingLoading) {
      return
    }

    if (destinationShowOptions.length > 0) {
      if (lastNoShowAlertDateRef.current === destinationDate) {
        lastNoShowAlertDateRef.current = ''
      }
      return
    }

    if (lastNoShowAlertDateRef.current === destinationDate) {
      return
    }

    lastNoShowAlertDateRef.current = destinationDate
    void alertDialog({
      title: 'Alter',
      description: 'Show detail not found please select other date show.',
      confirmLabel: 'OK',
    })
  }, [
    destinationDate,
    destinationShowOptions.length,
    hasPickedMoveDate,
    open,
    upcomingLoading,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    if (!selectedDestinationShowId) {
      if (destinationSectionId) {
        setDestinationSectionId('')
      }
      return
    }

    if (!destinationSections.some(section => section.id === destinationSectionId)) {
      setDestinationSectionId(
        pickDefaultMoveSection(
          destinationSections,
          // Prefer reservation section only while still on the origin show.
          selectedDestinationShowId === originShowId ? detail?.ShowDetID : null,
          selectedDestinationShowId === originShowId ? detail?.ResSec : null
        )?.id ?? ''
      )
    }
  }, [
    destinationSectionId,
    destinationSections,
    detail?.ResSec,
    detail?.ShowDetID,
    open,
    originShowId,
    selectedDestinationShowId,
  ])

  function validateMoveSelection(section: ReservationSectionOption | null) {
    if (!section || !selectedDestinationShowId) {
      return 'Invalid show selected. Please select show date and time to move reservation to.'
    }

    if (selectedDestinationShowId === originShowId) {
      return 'You can not move reservation to same show please choose another date.'
    }

    const moveDate =
      destinationDate ||
      toIsoShowDate(
        activeUpcomingShows.find(
          show => show.ShowId === selectedDestinationShowId
        )?.ShowDate ?? ''
      )

    if (moveDate && isPastShowDate(moveDate)) {
      return 'Can not move reservation of past days.'
    }

    const sectionError = validateMoveReservationSection({
      reservationSectionCode,
      destinationSectionCode: section.showSec
    })

    if (sectionError) {
      return sectionError
    }

    return null
  }

  async function submitMoveReservation({
    includePayment,
    isPaymentWindowRequest = false,
    appendMovedNoChangesNote = false
  }: {
    includePayment: boolean
    isPaymentWindowRequest?: boolean
    appendMovedNoChangesNote?: boolean
  }) {
    if (!reservation || !selectedSection) {
      return
    }

    const validationError = validateMoveSelection(selectedSection)
    if (validationError) {
      reportErrorMessage(setSubmitError, validationError)
      return
    }

    if (includePayment) {
      const nextPaymentErrors = validateReservationPaymentFields({
        paymentType,
        fields: paymentFields,
        paymentAmount: formatReservationMoney(chargeAmount),
        paymentRequired: true,
        disallowCash: origin === 'phone'
      })
      const paymentError = getFirstReservationPaymentError(nextPaymentErrors)

      if (paymentError) {
        setPaymentValidationErrors(nextPaymentErrors)
        reportErrorMessage(setSubmitError, paymentError)
        return
      }
    }

    setIsSubmitting(true)
    setPaymentValidationErrors({})
    setSubmitError(null)

    try {
      await moveReservation(
        buildMoveReservationRequest({
          connectionName,
          locationId,
          reservationId: reservation.id,
          lastUpdateId: username,
          selectedSection,
          origin,
          party,
          origParty,
          passes,
          promotionCode,
          reservationNotes,
          dinner,
          isVip,
          extraAmount: includePayment ? chargeAmount : 0,
          isExtraAmountPayable: includePayment,
          isPaymentWindowRequest,
          appendMovedNoChangesNote,
          paymentType: includePayment ? paymentType : undefined,
          paymentFields: includePayment ? paymentFields : undefined
        })
      )

      setChargeConfirmOpen(false)
      setPaymentDialogOpen(false)
      onOpenChange(false)
      await onMoved?.()
      toastSuccess('Reservation moved')
    } catch (error) {
      reportError(setSubmitError, error, 'Failed to move reservation')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleMoveClick() {
    const validationError = validateMoveSelection(selectedSection)
    if (validationError) {
      reportErrorMessage(setSubmitError, validationError)
      return
    }

    if (isPayable && chargeAmount > 0) {
      setSubmitError(null)
      setChargeConfirmOpen(true)
      return
    }

    void submitMoveReservation({ includePayment: false })
  }

  function handleOpenPaymentDialog() {
    setChargeConfirmOpen(false)
    setPaymentDialogOpen(true)
  }

  function handleDoNotCharge() {
    void submitMoveReservation({
      includePayment: false,
      appendMovedNoChangesNote: true
    })
  }

  function handleSelectUpcomingShow(show: ShowDetailsByDateItem) {
    const isoDate = toIsoShowDate(show.ShowDate)
    if (isoDate) {
      setDestinationDate(isoDate)
      setHasPickedMoveDate(true)
    }
    setDestinationShowId(show.ShowId)
    setDestinationSectionId('')
    setSubmitError(null)
  }

  const isLoading = detailLoading || upcomingLoading
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          disableOutsideDismiss
          showCloseButton={false}
          className='flex max-h-[90vh] max-w-5xl flex-col overflow-hidden p-0 sm:max-w-5xl'
        >
          <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Move Reservation
            </DialogTitle>
            <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
              <X className='size-4' />
              <span className='sr-only'>Close</span>
            </DialogClose>
          </DialogHeader>

          <div className='min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4'>
            {isLoading ? (
              <div className='flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground'>
                <LoaderCircle className='size-4 animate-spin' />
                Loading reservation details...
              </div>
            ) : null}

            {!isLoading && (detailError || upcomingError) ? (
              <p className='text-sm text-destructive'>
                {detailError ?? upcomingError}
              </p>
            ) : null}

            {!isLoading ? (
              <>
                <SectionCard title='Reservation Details' readOnly>
                  <div className='flex flex-wrap items-end gap-x-4 gap-y-3'>
                    <div className='w-[7.5rem] space-y-1'>
                      <FieldLabel>Origin :</FieldLabel>
                      <Input
                        readOnly
                        value={originLabel}
                        aria-label='Origin (read only)'
                        className={READONLY_FIELD_CLASS}
                      />
                    </div>

                    <div className='w-[5.5rem] space-y-1'>
                      <FieldLabel>{partyOrTableLabel}</FieldLabel>
                      <Input
                        readOnly
                        value={partyOrTableValue}
                        className={READONLY_FIELD_CLASS}
                      />
                    </div>

                    <div className='min-w-[10rem] max-w-[14rem] flex-1 space-y-1'>
                      <FieldLabel>Promo Code</FieldLabel>
                      <Input
                        readOnly
                        value={promotionCode || 'None'}
                        aria-label='Promo Code (read only)'
                        className={READONLY_FIELD_CLASS}
                      />
                    </div>
                  </div>

                  <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
                    <MoneyField label='Subtotal' value={origSubTotal} readOnlyTone />
                    <MoneyField
                      label='Service Charge'
                      value={origServiceCharge}
                      readOnlyTone
                    />
                    <MoneyField label='Discount' value={origDiscount} readOnlyTone />
                    <MoneyField label='Taxes' value={origTaxes} readOnlyTone />
                    <MoneyField label='Total' value={origTotal} readOnlyTone />
                  </div>
                </SectionCard>

                <SectionCard title='Select a Show'>
                  <div className='grid gap-3 lg:grid-cols-[minmax(0,11rem)_minmax(0,5rem)_minmax(0,1fr)_auto] lg:items-end'>
                    <div className='space-y-1'>
                      <FieldLabel>Show Date</FieldLabel>
                      <ShowDateField
                        showDate={destinationDate}
                        onShowDateChange={value => {
                          setDestinationDate(value)
                          setHasPickedMoveDate(true)
                          setDestinationShowId('')
                          setDestinationSectionId('')
                          setSubmitError(null)
                        }}
                        placeholder='Select a date'
                        className='w-full'
                      />
                    </div>

                    <div className='space-y-1 lg:col-start-2 lg:col-span-2'>
                      <FieldLabel>Show Time</FieldLabel>
                      <Select
                        value={selectedDestinationShowId || undefined}
                        onValueChange={value => {
                          setDestinationShowId(value)
                          setDestinationSectionId('')
                          setSubmitError(null)
                        }}
                        disabled={destinationShowOptions.length === 0}
                      >
                        <SelectTrigger className='h-9 w-full min-w-[16rem] bg-white shadow-xs'>
                          <SelectValue placeholder='Select show time' />
                        </SelectTrigger>
                        <SelectContent>
                          {destinationShowOptions.map(show => (
                            <SelectItem key={show.id} value={show.id}>
                              {show.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex h-9 items-center gap-2 self-end text-sm'>
                      <Checkbox
                        checked={dinner}
                        disabled
                        className='cursor-default border-slate-300 bg-slate-100 opacity-100 disabled:cursor-default disabled:opacity-100'
                      />
                      Dinner
                    </div>
                  </div>

                  <div className='mt-4 grid gap-3 lg:grid-cols-[minmax(0,5rem)_minmax(0,1fr)_auto] lg:items-end'>
                    <div className='space-y-1 lg:col-span-2'>
                      <FieldLabel>Section:</FieldLabel>
                      <Select
                        value={selectedSection?.id ?? ''}
                        onValueChange={value => {
                          setDestinationSectionId(value)
                          setSubmitError(null)
                        }}
                        disabled={
                          !selectedDestinationShowId ||
                          sectionsLoading ||
                          destinationSections.length === 0
                        }
                      >
                        <SelectTrigger className='h-9 w-full bg-white shadow-xs'>
                          <SelectValue placeholder='Select section' />
                        </SelectTrigger>
                        <SelectContent>
                          {destinationSections.map(section => (
                            <SelectItem key={section.id} value={section.id}>
                              {formatMoveSectionLabel(section)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex items-center gap-2 self-end'>
                      <span className='shrink-0 text-xs font-semibold text-foreground'>
                        Available :
                      </span>
                      <Input
                        readOnly
                        value={
                          selectedDestinationShowId && selectedSection
                            ? String(selectedSection.available ?? 0)
                            : ''
                        }
                        className='h-9 w-24 bg-white shadow-xs'
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title='Reservation Details ( With Move )'>
                  <div className='grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end'>
                    <MoneyField
                      label='Subtotal'
                      value={displayedMoveTotals.subtotal}
                    />
                    <MoneyField
                      label='Service Charge'
                      value={displayedMoveTotals.serviceCharge}
                    />
                    <MoneyField
                      label='Discount'
                      value={displayedMoveTotals.discount}
                    />
                    <Button
                      type='button'
                      size='sm'
                      className='h-9 self-end bg-emerald-600 text-white hover:bg-emerald-700'
                      onClick={() => {
                        applyMoveTotalsDisplay()
                        setSubmitError(null)
                      }}
                    >
                      Re-Calculate Total
                    </Button>
                  </div>

                  <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                    <MoneyField label='Taxes' value={displayedMoveTotals.taxes} />
                    <MoneyField label='Total' value={displayedMoveTotals.total} />
                  </div>
                </SectionCard>

                <section className='rounded-md border border-slate-200 bg-white'>
                  <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-3 py-2'>
                    <p className='text-xs text-muted-foreground'>
                      Upcoming Shows : ( DblClick show to move to )
                    </p>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-semibold text-foreground'>
                        Difference :
                      </span>
                      <Input
                        readOnly
                        value={formatDifferenceMoney(displayedDifference)}
                        className={cn(
                          'h-9 w-32 bg-white text-sm shadow-xs',
                          displayedDifference > 0 && 'font-medium text-destructive'
                        )}
                      />
                    </div>
                  </div>

                  <div className='max-h-52 overflow-auto'>
                    <table className='min-w-full w-full border-collapse text-sm'>
                      <thead>
                        <tr className='border-b border-slate-200 bg-muted/40 text-left text-xs font-semibold text-foreground'>
                          <th className='h-10 px-3 py-2'>Show Date</th>
                          <th className='h-10 px-3 py-2'>Show Time</th>
                          <th className='h-10 px-3 py-2'>Comic Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeUpcomingShows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              className='px-3 py-8 text-center text-muted-foreground'
                            >
                              No upcoming shows found.
                            </td>
                          </tr>
                        ) : (
                          activeUpcomingShows.map(show => {
                            const showOption = mapShowDetailsToOptions([show])[0]
                            const isSelected =
                              show.ShowId === selectedDestinationShowId

                            return (
                              <tr
                                key={show.ShowId}
                                className={cn(
                                  'cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-muted/30',
                                  isSelected && 'bg-primary/5'
                                )}
                                onDoubleClick={() => handleSelectUpcomingShow(show)}
                              >
                                <td className='px-3 py-2.5'>
                                  {formatShowDateShort(show.ShowDate)}
                                </td>
                                <td className='px-3 py-2.5'>
                                  {showOption?.time ?? show.ShowTim}
                                </td>
                                <td className='px-3 py-2.5'>
                                  {showOption?.headliner ??
                                    show.HeadlinerName ??
                                    '—'}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {submitError ? (
                  <p className='text-sm text-destructive'>{submitError}</p>
                ) : null}
              </>
            ) : null}
          </div>

          <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-start'>
            <Button
              type='button'
              size='sm'
              onClick={handleMoveClick}
              disabled={isLoading || isSubmitting || !selectedSection}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='size-4 animate-spin' />
                  Moving...
                </>
              ) : (
                'Move'
              )}
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={chargeConfirmOpen} onOpenChange={setChargeConfirmOpen}>
        <DialogContent
          showCloseButton={false}
          className='flex max-w-md flex-col overflow-hidden p-0 sm:max-w-md'
        >
          <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Moveable Show Charge
            </DialogTitle>
            <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
              <X className='size-4' />
              <span className='sr-only'>Close</span>
            </DialogClose>
          </DialogHeader>

          <div className='px-4 py-5'>
            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium text-foreground'>
                Payment Amount
              </span>
              <Input
                readOnly
                value={formatReservationMoney(chargeAmount)}
                className='h-9 max-w-40 bg-white shadow-xs'
              />
            </div>

            {submitError ? (
              <p className='mt-4 text-sm text-destructive'>{submitError}</p>
            ) : null}
          </div>

          <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-center sm:gap-3'>
            <Button
              type='button'
              size='sm'
              onClick={handleOpenPaymentDialog}
              disabled={isSubmitting}
            >
              Charge
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={handleDoNotCharge}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='size-4 animate-spin' />
                  Moving...
                </>
              ) : (
                'Do not charge'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className='flex max-h-[82vh] max-w-lg flex-col overflow-hidden p-0 sm:max-w-lg'
        >
          <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
            <DialogTitle className='text-base font-semibold text-foreground'>
              Payment
            </DialogTitle>
            <DialogClose className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none'>
              <X className='size-4' />
              <span className='sr-only'>Close</span>
            </DialogClose>
          </DialogHeader>

          <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4'>
            <div className='space-y-1.5'>
              <span className='text-sm font-medium text-foreground'>
                Payment Amount
              </span>
              <Input
                readOnly
                value={formatReservationMoney(chargeAmount)}
                className='bg-white shadow-xs'
              />
            </div>

            <ReservationPaymentPanel
              paymentType={paymentType}
              onPaymentTypeChange={value => {
                setPaymentType(value)
                setPaymentFields(createEmptyReservationPaymentFields())
                setPaymentValidationErrors({})
                setSubmitError(null)
              }}
              paymentAmount={formatReservationMoney(chargeAmount)}
              onPaymentAmountChange={() => undefined}
              fields={paymentFields}
              onFieldChange={(key, value) => {
                setPaymentFields(current => ({ ...current, [key]: value }))
                setPaymentValidationErrors({})
                setSubmitError(null)
              }}
              paymentDisabled
              validationErrors={paymentValidationErrors}
            />

            {submitError && Object.keys(paymentValidationErrors).length === 0 ? (
              <p className='text-sm text-destructive'>{submitError}</p>
            ) : null}
          </div>

          <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-start'>
            <Button
              type='button'
              size='sm'
              onClick={() =>
                void submitMoveReservation({
                  includePayment: true,
                  isPaymentWindowRequest: true
                })
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='size-4 animate-spin' />
                  Charging...
                </>
              ) : (
                'Charge'
              )}
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setPaymentDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
