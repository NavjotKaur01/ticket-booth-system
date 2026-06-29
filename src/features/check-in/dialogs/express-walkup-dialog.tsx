import { Info, LoaderCircle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { FormField, FormSection, ReadOnlyValue } from "@/components/forms/form-fields"
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
import { ComicInfoDialog } from "@/features/reservations/comic-info-dialog"
import { cn } from "@/lib/utils"
import {
  calculateExpressWalkupTotals,
  createExpressWalkupFormValues,
  getExpressWalkupDialogData,
  type ExpressWalkupDialogData,
  type ExpressWalkupFormValues,
  type ExpressWalkupTotals,
} from "@/features/check-in/service/express-walkup.service"
import type { ShowOption } from "@/types/reservation"

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
            {count} · ${total.toFixed(2)}
          </Button>
        )}
      )}
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
      <div className={SUMMARY_GRID}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <div className={TOTALS_GRID}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <div className={TOTAL_ACTION_GRID}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

type ExpressWalkupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showDate: string
  showTimeId: string
  shows?: ShowOption[]
}

export function ExpressWalkupDialog({
  open,
  onOpenChange,
  showDate,
  showTimeId,
  shows,
}: ExpressWalkupDialogProps) {
  const [dialogData, setDialogData] = useState<ExpressWalkupDialogData | null>(null)
  const [formValues, setFormValues] = useState<ExpressWalkupFormValues | null>(null)
  const [totals, setTotals] = useState<ExpressWalkupTotals | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isComicInfoOpen, setIsComicInfoOpen] = useState(false)
  const suppressNextParentCloseRef = useRef(false)

  useEffect(() => {
    if (!open) {
      setIsComicInfoOpen(false)
      return
    }

    let isActive = true
    setIsLoading(true)

    getExpressWalkupDialogData({ showDate, showTimeId, shows })
      .then((data) => {
        if (!isActive) {
          return
        }

        const nextForm = {
          ...createExpressWalkupFormValues(data),
          showTimeId,
        }
        setDialogData(data)
        setFormValues(nextForm)
        setTotals(
          calculateExpressWalkupTotals({
            formValues: nextForm,
            sectionOptions: data.sectionOptions,
          })
        )
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [open, showDate, showTimeId, shows])

  const selectedSection = useMemo(
    () =>
      dialogData?.sectionOptions.find(
        (option) => option.id === formValues?.sectionId
      ) ?? dialogData?.sectionOptions[0],
    [dialogData, formValues?.sectionId]
  )

  const selectedCount = Math.max(1, Number(formValues?.party) || 1)
  const originValue = dialogData?.originOptions[0]?.label ?? "Walkup"

  function updateField<K extends keyof ExpressWalkupFormValues>(
    field: K,
    value: ExpressWalkupFormValues[K]
  ) {
    setFormValues((current) => (current ? { ...current, [field]: value } : current))
  }

  function handleTicketCountSelect(count: number) {
    updateField("party", String(count))
    updateField("passes", String(count))
  }

  function handleCalculate() {
    if (!dialogData || !formValues) {
      return
    }

    setIsCalculating(true)
    window.setTimeout(() => {
      setTotals(
        calculateExpressWalkupTotals({
          formValues,
          sectionOptions: dialogData.sectionOptions,
        })
      )
      setIsCalculating(false)
    }, 120)
  }

  function handleExpressWalkupOpenChange(nextOpen: boolean) {
    if (!nextOpen && suppressNextParentCloseRef.current) {
      suppressNextParentCloseRef.current = false
      return
    }

    if (!nextOpen && isComicInfoOpen) {
      suppressNextParentCloseRef.current = true
      setIsComicInfoOpen(false)
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleExpressWalkupOpenChange}>
        <DialogContent
          showCloseButton
          className="flex max-h-[92vh] w-[96vw] max-w-[96vw] flex-col overflow-hidden p-0 sm:max-w-[92vw] xl:w-[88rem] xl:max-w-[88rem]"
        >
          <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
            <DialogTitle className="text-lg leading-snug font-normal">
              <span className="font-semibold text-foreground">
                {dialogData?.title ?? "Express Walkup"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto">
            {isLoading || !dialogData || !formValues || !totals ? (
              <WalkupDialogSkeleton />
            ) : (
              <div className="space-y-5 px-4 py-4">
                <FormSection title="Show Details" className="space-y-4">
                  <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[12rem_minmax(0,1.2fr)_minmax(0,1.2fr)_auto]">
                    <FormField label="Show Date">
                      <ReadOnlyValue value={dialogData.showDate} />
                    </FormField>

                    <FormField label="Show Time">
                      <ScrollSelectControl
                        id="express-walkup-show-time"
                        value={formValues.showTimeId}
                        onChange={(value) => updateField("showTimeId", value)}
                        options={dialogData.showTimeOptions.map((option) => ({
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
                        options={dialogData.sectionOptions.map((option) => ({
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

                <FormSection title="Click the number of tickets to reserve">
                  <TicketCountGrid
                    counts={dialogData.ticketCountOptions}
                    selectedCount={selectedCount}
                    ticketPrice={selectedSection?.price ?? 0}
                    onSelect={handleTicketCountSelect}
                  />
                </FormSection>

                <FormSection title="Reservation Details" className="space-y-4">
                  <div className={SUMMARY_GRID}>
                    <FormField label="Origin">
                      <ReadOnlyValue value={originValue} />
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
                        options={dialogData.promoOptions}
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
                      <ReadOnlyValue value={totals.taxes} />
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
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ComicInfoDialog
        open={isComicInfoOpen}
        onOpenChange={handleComicInfoOpenChange}
        stageName={dialogData?.comicStageName ?? ""}
        nested
      />
    </>
  )
}





