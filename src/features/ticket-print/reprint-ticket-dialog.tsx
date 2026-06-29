import { LoaderCircle, QrCode } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  buildReprintCountOptions,
  getMockTicketPrintData,
  printReservationTicket,
} from "@/services/ticket-print.service"
import type { Reservation } from "@/types/reservation"
import type { TicketPrintData } from "@/types/ticket-print"

type ReprintTicketDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  showDate: string
  showLabel?: string
  locationName?: string
}

function formatAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function ReadOnlyInput({ value }: { value: string }) {
  return (
    <Input
      value={value}
      readOnly
      className="h-9 bg-muted/20 text-sm text-foreground"
    />
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <ReadOnlyInput value={value} />
    </label>
  )
}

export function ReprintTicketDialog({
  open,
  onOpenChange,
  reservation,
  showDate,
  showLabel,
  locationName,
}: ReprintTicketDialogProps) {
  const [ticketData, setTicketData] = useState<TicketPrintData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [printError, setPrintError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !reservation) {
      setTicketData(null)
      setIsLoading(false)
      setIsPrinting(false)
      setPrintError(null)
      return
    }

    let isActive = true
    setIsLoading(true)
    setIsPrinting(false)
    setPrintError(null)

    getMockTicketPrintData({
      reservation,
      showDate,
      showLabel,
      locationName,
    })
      .then((result) => {
        if (isActive) {
          setTicketData(result)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setPrintError(
            error instanceof Error
              ? error.message
              : "Failed to load re-print ticket data."
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [locationName, open, reservation, showDate, showLabel])

  const countOptions = useMemo(
    () => buildReprintCountOptions(ticketData?.reservation.partySize ?? 1),
    [ticketData?.reservation.partySize]
  )

  async function handlePrint(ticketCount: number) {
    if (!ticketData || isPrinting) {
      return
    }

    setIsPrinting(true)
    setPrintError(null)

    try {
      const didStart = await printReservationTicket({
        ticket: ticketData,
        ticketCount,
        isReprint: true,
      })

      if (!didStart) {
        setPrintError("Unable to start printing. Please try again.")
        return
      }

      onOpenChange(false)
    } catch (error) {
      setPrintError(
        error instanceof Error
          ? error.message
          : "Unable to build the ticket QR. Please try again."
      )
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[46rem] overflow-hidden rounded-md border border-border/70 p-0 sm:max-w-[46rem]"
      >
        <DialogHeader className="bg-blue-700 px-5 py-3 text-primary-foreground">
          <DialogTitle className="text-xl font-semibold text-white">
            Re-Print Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 bg-background px-4 py-4">
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading ticket details...
            </div>
          ) : ticketData ? (
            <>
              <section className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
                <h3 className="text-sm font-medium text-foreground">
                  Customer Information
                </h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <DetailField
                    label="Last Name"
                    value={ticketData.customer.lastName}
                  />
                  <DetailField
                    label="First Name"
                    value={ticketData.customer.firstName}
                  />
                </div>
              </section>

              <section className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
                <h3 className="text-sm font-medium text-foreground">
                  Reservation Details
                </h3>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <DetailField
                    label="Number in Party"
                    value={String(ticketData.reservation.partySize)}
                  />
                  <DetailField
                    label="Total Amount"
                    value={formatAmount(ticketData.reservation.totalAmount)}
                  />
                  <DetailField
                    label="Paid Amount"
                    value={formatAmount(ticketData.reservation.paidAmount)}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-foreground">
                  <span>Checked In: {ticketData.reservation.checkedInCount}</span>
                  <span>Remaining: {ticketData.reservation.remainingCount}</span>
                  <span>Section: {ticketData.reservation.section}</span>
                </div>
              </section>

              <section className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
                <h3 className="text-sm font-medium text-foreground">
                  Click the Number of Customer to Print on Ticket
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {countOptions.map((count) => (
                    <Button
                      key={count}
                      type="button"
                      className="h-11 min-w-16 rounded-sm bg-blue-700 px-5 text-base font-semibold hover:bg-blue-800"
                      onClick={() => void handlePrint(count)}
                      disabled={isPrinting}
                    >
                      {count}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-muted-foreground">
                  <QrCode className="mt-0.5 size-4 shrink-0 text-slate-500" />
                  <div className="space-y-1">
                    <p>QR value for now: {ticketData.qrValue}</p>
                    <p>The clicked number changes the ticket quantity printed on the slip, not the number of pages.</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="min-h-48 rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-muted-foreground">
              Select a reservation to load ticket details.
            </div>
          )}

          {printError ? (
            <p className="text-sm text-destructive">{printError}</p>
          ) : null}
        </div>

        <DialogFooter className="border-t px-4 py-3 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-w-28"
            onClick={() => onOpenChange(false)}
            disabled={isPrinting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
