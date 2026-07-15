import { Info, LoaderCircle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import {
  FormField,
  FormSection,
  ReadOnlyValue,
} from "@/components/forms/form-fields"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ProcessPaymentDialog } from "@/features/check-in/dialogs/process-payment-dialog"
import { SalesTransactionDialog } from "@/features/check-in/dialogs/sales-transaction-dialog"
import { ComicInfoDialog } from "@/features/reservations/comic-info-dialog"
import {
  buildExpressWalkupTitle,
  calculateExpressWalkupTotals,
  createExpressWalkupFormValues,
  EXPRESS_WALKUP_TICKET_COUNTS,
  formatExpressWalkupShowDate,
  type ExpressWalkupFormValues,
  type ExpressWalkupTotals,
} from "@/features/check-in/service/express-walkup.service"
import type { ExpressPaymentType } from "@/features/check-in/service/express-panel.service"
import { useCachedReservationShowData } from "@/hooks/use-cached-reservation-show-data"
import type { ComicInfo } from "@/data/comedian-info"
import {
  isUsableComicId,
  mapApiComedianToComicInfo,
} from "@/lib/map-comedian-info"
import { cn } from "@/lib/utils"
import {
  useDeleteComedianImageMutation,
  useGetComedianInfoQuery,
  useUpdateComedianImageMutation,
  useUpdateComedianMutation,
} from "@/store/api/clubmanApi"
import type { ReservationPromo } from "@/types/reservation-promo"
import type {
  ReservationSectionOption,
  ShowOption,
} from "@/types/reservation"

const TICKET_GRID_CLASS =
  "grid grid-cols-[repeat(auto-fit,minmax(8.75rem,1fr))] gap-2"
const SUMMARY_GRID = "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
const TOTALS_GRID = "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
const TOTAL_ACTION_GRID = "grid gap-3 md:grid-cols-2"

function TicketCountGrid({
  counts,
  selectedCount,
  ticketPrice,
  onSelect,
}: {
  counts: number[]
  selectedCount: number
  ticketPrice: number
  onSelect: (count: number) => void
}) {
  return (
    <div className={TICKET_GRID_CLASS}>
      {counts.map((count) => {
        const total = ticketPrice * count
        const isSelected = selectedCount === count

        return (
          <Button
            key={count}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-11 rounded-md px-3 text-sm leading-tight whitespace-normal tabular-nums",
              "justify-center text-center",
              !isSelected && "bg-muted/20 hover:bg-muted/40"
            )}
            onClick={() => onSelect(count)}
          >
            {count} -${total.toFixed(2)}
          </Button>
        )
      })}
    </div>
  )
}

function WalkupDialogSkeleton() {
  return (
    <div className="space-y-4 px-4 py-4">
      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[12rem_minmax(0,1.2fr)_minmax(0,1.2fr)_auto]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-28" />
      <div className={TICKET_GRID_CLASS}>
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}

export type ExpressWalkupContinuePayload = {
  showTimeId: string
  section: ReservationSectionOption
  party: number
  passes: number
  promo: ReservationPromo | null
  dinner: boolean
  paymentType: "cash" | "credit-card"
  paymentAmount: number
}

type ExpressWalkupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  username: string
  showDate: string
  showTimeId: string
  shows?: ShowOption[]
  isSubmitting?: boolean
  error?: string | null
  onContinue?: (payload: ExpressWalkupContinuePayload) => void | Promise<void>
  onShowTimeChange?: (showTimeId: string) => void
}

export function ExpressWalkupDialog({
  open,
  onOpenChange,
  connectionName,
  locationId,
  username,
  showDate,
  showTimeId,
  shows = [],
  isSubmitting = false,
  error = null,
  onContinue,
  onShowTimeChange,
}: ExpressWalkupDialogProps) {
  const [formValues, setFormValues] = useState<ExpressWalkupFormValues | null>(
    null
  )
  const [totals, setTotals] = useState<ExpressWalkupTotals | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isComicInfoOpen, setIsComicInfoOpen] = useState(false)
  const [paymentStep, setPaymentStep] = useState<ExpressPaymentType | null>(
    null
  )
  const suppressNextParentCloseRef = useRef(false)

  const selectedShowTimeId = formValues?.showTimeId || showTimeId

  const {
    sections,
    sectionsLoading,
    promoById,
    promoLoading,
  } = useCachedReservationShowData({
    connectionName,
    locationId,
    showDate,
    showId: selectedShowTimeId,
    enabled: open && Boolean(connectionName && locationId && selectedShowTimeId),
  })

  const promos = useMemo(() => Array.from(promoById.values()), [promoById])

  const selectedShow = useMemo(
    () => shows.find((show) => show.id === selectedShowTimeId) ?? shows[0],
    [selectedShowTimeId, shows]
  )

  const comicId = selectedShow?.comicId ?? ""
  const canLoadComic = isUsableComicId(comicId)

  const {
    data: comedianInfo,
    isLoading: isComicLoading,
    isFetching: isComicFetching,
    refetch: refetchComic,
  } = useGetComedianInfoQuery(
    { connectionName, comicId },
    {
      skip:
        !isComicInfoOpen || !canLoadComic || !connectionName,
    }
  )
  const [updateComedian] = useUpdateComedianMutation()
  const [updateComedianImage] = useUpdateComedianImageMutation()
  const [deleteComedianImage] = useDeleteComedianImageMutation()

  const mappedComicInfo = useMemo(() => {
    if (!comedianInfo) {
      return null
    }

    return mapApiComedianToComicInfo(
      comedianInfo,
      selectedShow?.headliner ?? ""
    )
  }, [comedianInfo, selectedShow?.headliner])

  const selectedSection = useMemo(() => {
    if (!formValues) {
      return sections[0] ?? null
    }

    return (
      sections.find((section) => section.id === formValues.sectionId) ??
      sections[0] ??
      null
    )
  }, [formValues, sections])

  const selectedPromo = useMemo(() => {
    if (!formValues || formValues.promoId === "none") {
      return null
    }

    return promoById.get(formValues.promoId) ?? null
  }, [formValues, promoById])

  const selectedCount = Math.max(1, Number(formValues?.party) || 1)
  const isLoading = open && (sectionsLoading || promoLoading || !formValues)

  useEffect(() => {
    if (!open) {
      setFormValues(null)
      setTotals(null)
      setPaymentStep(null)
      setIsComicInfoOpen(false)
      return
    }

    setFormValues((current) => {
      if (current) {
        return current
      }

      return createExpressWalkupFormValues({ showTimeId, sections: [] })
    })
  }, [open, showTimeId])

  useEffect(() => {
    if (!open || !formValues) {
      return
    }

    if (sections.length === 0) {
      return
    }

    const sectionStillValid = sections.some(
      (section) => section.id === formValues.sectionId
    )

    if (!sectionStillValid) {
      setFormValues((current) =>
        current
          ? {
              ...current,
              sectionId: sections[0].id,
            }
          : current
      )
    }
  }, [formValues, open, sections])

  useEffect(() => {
    if (!open || !formValues || sections.length === 0) {
      return
    }

    setTotals(
      calculateExpressWalkupTotals({
        formValues,
        sections,
        promo: selectedPromo,
      })
    )
  }, [formValues, open, sections, selectedPromo])

  function updateField<K extends keyof ExpressWalkupFormValues>(
    field: K,
    value: ExpressWalkupFormValues[K]
  ) {
    setFormValues((current) =>
      current ? { ...current, [field]: value } : current
    )
  }

  function handleShowTimeChange(value: string) {
    updateField("showTimeId", value)
    onShowTimeChange?.(value)
  }

  function handleTicketCountSelect(count: number) {
    updateField("party", String(count))
    updateField("passes", String(count))
  }

  function handleCalculate() {
    if (!formValues || sections.length === 0) {
      return
    }

    setIsCalculating(true)
    window.setTimeout(() => {
      setTotals(
        calculateExpressWalkupTotals({
          formValues,
          sections,
          promo: selectedPromo,
        })
      )
      setIsCalculating(false)
    }, 80)
  }

  function handleExpressWalkupOpenChange(nextOpen: boolean) {
    if (!nextOpen && suppressNextParentCloseRef.current) {
      suppressNextParentCloseRef.current = false
      return
    }

    if (!nextOpen && (isComicInfoOpen || paymentStep)) {
      suppressNextParentCloseRef.current = true
      setIsComicInfoOpen(false)
      setPaymentStep(null)
      return
    }

    onOpenChange(nextOpen)
  }

  function handleComicInfoOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      suppressNextParentCloseRef.current = true
    }

    setIsComicInfoOpen(nextOpen)
  }

  function handlePaymentOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      suppressNextParentCloseRef.current = true
      setPaymentStep(null)
    }
  }

  async function completePayment() {
    if (!formValues || !selectedSection || !totals) {
      return
    }

    const party = Math.max(1, Number(formValues.party) || 1)
    const passes = Math.max(0, Number(formValues.passes) || 0)

    await Promise.resolve(
      onContinue?.({
        showTimeId: formValues.showTimeId || showTimeId,
        section: selectedSection,
        party,
        passes: passes || party,
        promo: selectedPromo,
        dinner: formValues.dinner,
        paymentType: paymentStep === "Credit Card" ? "credit-card" : "cash",
        paymentAmount: totals.paymentDue,
      })
    )

    setPaymentStep(null)
  }

  function handleContinue(paymentType: ExpressPaymentType) {
    if (!formValues || !selectedSection || !totals) {
      return
    }

    const nextTotals = calculateExpressWalkupTotals({
      formValues,
      sections,
      promo: selectedPromo,
    })
    setTotals(nextTotals)
    setPaymentStep(paymentType)
  }

  const title = buildExpressWalkupTitle(selectedShow, showDate)
  const comicStageName =
    mappedComicInfo?.stageName ||
    selectedShow?.headliner?.trim() ||
    selectedShow?.label?.replace(/^\d{1,2}:\d{2}\s*(AM|PM)\s*/i, "").trim() ||
    ""

  return (
    <>
      <Dialog open={open} onOpenChange={handleExpressWalkupOpenChange}>
        <DialogContent
          showCloseButton
          className="flex max-h-[92vh] w-[96vw] max-w-[96vw] flex-col overflow-hidden p-0 sm:max-w-[92vw] xl:w-[88rem] xl:max-w-[88rem]"
        >
          <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
            <DialogTitle className="text-lg leading-snug font-normal">
              <span className="font-semibold text-foreground">{title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto">
            {isLoading || !formValues || !totals ? (
              <WalkupDialogSkeleton />
            ) : (
              <div className="space-y-5 px-4 py-4">
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}

                <FormSection title="Show Details" className="space-y-4">
                  <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[12rem_minmax(0,1.2fr)_minmax(0,1.2fr)_auto]">
                    <FormField label="Show Date">
                      <ReadOnlyValue value={formatExpressWalkupShowDate(showDate)} />
                    </FormField>

                    <FormField label="Show Time">
                      <ScrollSelectControl
                        id="express-walkup-show-time"
                        value={formValues.showTimeId}
                        onChange={handleShowTimeChange}
                        options={shows.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                        className="text-sm"
                      />
                    </FormField>

                    <FormField label="Section">
                      <ScrollSelectControl
                        id="express-walkup-section"
                        value={formValues.sectionId}
                        onChange={(value) => updateField("sectionId", value)}
                        options={sections.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                        className="text-sm"
                      />
                    </FormField>

                    <div className="flex items-end lg:justify-start 2xl:justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                        onClick={() => setIsComicInfoOpen(true)}
                      >
                        <Info className="size-4" />
                        Comic Info
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[auto_12rem] sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <Checkbox
                        id="express-walkup-dinner"
                        checked={formValues.dinner}
                        onCheckedChange={(checked) =>
                          updateField("dinner", checked === true)
                        }
                      />
                      Dinner
                    </label>

                    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <div className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {selectedSection?.available ?? 0}
                      </div>
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Click the Number of ticket to reserve:">
                  <TicketCountGrid
                    counts={EXPRESS_WALKUP_TICKET_COUNTS}
                    selectedCount={selectedCount}
                    ticketPrice={selectedSection?.showPrice ?? 0}
                    onSelect={handleTicketCountSelect}
                  />
                </FormSection>

                <FormSection title="Reservation Details" className="space-y-4">
                  <div className={SUMMARY_GRID}>
                    <FormField label="Origin">
                      <ReadOnlyValue value="Walkup" />
                    </FormField>

                    <FormField label="Party">
                      <Input
                        type="number"
                        min={1}
                        value={formValues.party}
                        onChange={(event) =>
                          updateField("party", event.target.value)
                        }
                        className="h-9 text-sm tabular-nums"
                      />
                    </FormField>

                    <FormField label="Promo">
                      <ScrollSelectControl
                        id="express-walkup-promo"
                        value={formValues.promoId}
                        onChange={(value) => updateField("promoId", value)}
                        options={[
                          { value: "none", label: "Select" },
                          ...promos.map((promo) => ({
                            value: promo.id,
                            label:
                              promo.promotionName ||
                              promo.promotionCode ||
                              promo.id,
                          })),
                        ]}
                        className="text-sm"
                      />
                    </FormField>

                    <FormField label="Passes">
                      <Input
                        type="number"
                        min={0}
                        value={formValues.passes}
                        onChange={(event) =>
                          updateField("passes", event.target.value)
                        }
                        className="h-9 text-sm tabular-nums"
                      />
                    </FormField>
                  </div>

                  <div className={TOTALS_GRID}>
                    <FormField label="Subtotal">
                      <ReadOnlyValue value={totals.subtotal} />
                    </FormField>
                    <FormField label="Service Charge">
                      <ReadOnlyValue value={totals.serviceCharge} />
                    </FormField>
                    <FormField label="Discount">
                      <ReadOnlyValue value={totals.discount} />
                    </FormField>
                    <FormField label="Taxes">
                      <ReadOnlyValue value={totals.tax} />
                    </FormField>
                  </div>

                  <div className={TOTAL_ACTION_GRID}>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        className="h-9 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={handleCalculate}
                        disabled={isCalculating}
                      >
                        {isCalculating ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin" />
                            Calculating
                          </>
                        ) : (
                          "Calculate Total"
                        )}
                      </Button>
                    </div>

                    <FormField label="Total">
                      <ReadOnlyValue
                        value={totals.total}
                        className="bg-primary/5 font-semibold text-primary"
                      />
                    </FormField>
                  </div>
                </FormSection>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !formValues || !selectedSection}
                onClick={() => handleContinue("Credit Card")}
              >
                Credit Card
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || !formValues || !selectedSection}
                onClick={() => handleContinue("Cash")}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ComicInfoDialog
        open={isComicInfoOpen}
        onOpenChange={handleComicInfoOpenChange}
        comic={mappedComicInfo}
        stageName={comicStageName}
        nested
        layout="flat"
        title="Edit Comedian"
        isLoading={
          isComicLoading ||
          isComicFetching ||
          (canLoadComic && !mappedComicInfo)
        }
        onSave={
          mappedComicInfo && canLoadComic
            ? async (values: ComicInfo) => {
                await updateComedian({
                  connectionName,
                  locationId,
                  username,
                  comicId,
                  form: values,
                }).unwrap()
                refetchComic()
              }
            : undefined
        }
        onChangeImage={
          canLoadComic
            ? async (base64Image: string) => {
                await updateComedianImage({
                  connectionName,
                  locationId,
                  username,
                  comicId,
                  base64Image,
                }).unwrap()
                refetchComic()
              }
            : undefined
        }
        onDeleteImage={
          canLoadComic
            ? async () => {
                await deleteComedianImage({
                  connectionName,
                  comicId,
                }).unwrap()
                refetchComic()
              }
            : undefined
        }
      />

      {paymentStep === "Cash" && totals ? (
        <SalesTransactionDialog
          open
          onOpenChange={handlePaymentOpenChange}
          paymentType="Cash"
          paymentDue={totals.paymentDue}
          onOk={() => {
            void completePayment()
          }}
        />
      ) : null}

      {paymentStep === "Credit Card" && totals ? (
        <ProcessPaymentDialog
          open
          onOpenChange={handlePaymentOpenChange}
          quantity={selectedCount}
          paymentAmount={totals.total}
          onOk={() => {
            void completePayment()
          }}
        />
      ) : null}
    </>
  )
}
