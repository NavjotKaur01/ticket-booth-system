import { LoaderCircle } from "lucide-react"
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
  createTicketPrintData,
  getMockTicketPrintData,
  printReservationTicket,
} from "@/services/ticket-print.service"
import { toastError, toastSuccess, getErrorMessage } from "@/lib/app-toast"
import type { Reservation } from "@/types/reservation"
import type { TicketPrintData } from "@/types/ticket-print"

/** Desktop ReservationPayment reprint popup display values (form + detail). */
export type ReprintTicketDialogDetails = {
  lastName: string
  firstName: string
  partySize: number
  /** Desktop CheckedIn from GetReservationDetailById. */
  checkedInCount: number
  totalAmount: number
  paidAmount: number
}

type ReprintTicketDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  showDate: string
  showLabel?: string
  locationName?: string
  /**
   * Desktop binds Party/Total/PaiedAmount from the payment form and
   * CheckedIn/Remaining from GetReservationDetailById. When provided, these
   * override the list-row mock ticket data for the popup display + button count.
   */
  details?: ReprintTicketDialogDetails | null
  /** Raise z-index / suppress base close when opened on top of another dialog. */
  nested?: boolean
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
      className="h-8 bg-white text-sm text-foreground"
    />
  )
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <label className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <span className="whitespace-nowrap text-xs font-medium text-foreground">
        {label}:
      </span>
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
  details = null,
  nested = false,
}: ReprintTicketDialogProps) {
  const [ticketData, setTicketData] = useState<TicketPrintData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    if (!open || !reservation) {
      setTicketData(null)
      setIsLoading(false)
      setIsPrinting(false)
      return
    }

    let isActive = true
    setIsLoading(true)
    setIsPrinting(false)

    getMockTicketPrintData({
      reservation,
      showDate,
      showLabel,
      locationName,
    })
      .then((result) => {
        if (!isActive) {
          return
        }

        // Desktop: Party/Total/Paid from payment form; CheckedIn from detail.
        if (details) {
          const partySize = Math.max(1, details.partySize)
          const checkedInCount = Math.max(
            0,
            Math.min(details.checkedInCount, partySize)
          )
          setTicketData(
            createTicketPrintData({
              reservationId: result.reservation.reservationId,
              firstName: details.firstName || result.customer.firstName,
              lastName: details.lastName || result.customer.lastName,
              partySize,
              checkedInCount,
              totalAmount: details.totalAmount,
              paidAmount: details.paidAmount,
              paymentType: result.reservation.paymentType,
              source: result.reservation.source,
              section: result.reservation.section,
              promotion: result.reservation.promotion,
              tables: result.reservation.tables,
              seatNumbers: result.reservation.seatNumbers,
              showDate,
              showLabel,
              locationName,
              qrValue: result.qrValue,
            })
          )
          return
        }

        setTicketData(result)
      })
      .catch((error: unknown) => {
        if (isActive) {
          toastError(
            getErrorMessage(error, "Failed to load re-print ticket data.")
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
  }, [details, locationName, open, reservation, showDate, showLabel])

  // Desktop ReprintTickets: buttons are 1..CheckedIn (not party size).
  const countOptions = useMemo(() => {
    const checkedIn = ticketData?.reservation.checkedInCount ?? 0
    return buildReprintCountOptions(Math.max(0, checkedIn))
  }, [ticketData?.reservation.checkedInCount])

  async function handlePrint(ticketCount: number) {
    if (!ticketData || isPrinting) {
      return
    }

    setIsPrinting(true)

    try {
      const didStart = await printReservationTicket({
        ticket: ticketData,
        ticketCount,
        isReprint: true,
      })

      if (!didStart) {
        toastError("Unable to start printing. Please try again.")
        return
      }

      toastSuccess("Ticket print started")
      onOpenChange(false)
    } catch (error) {
      toastError(
        getErrorMessage(error, "Unable to build the ticket QR. Please try again.")
      )
    } finally {
      setIsPrinting(false)
    }
  }

  const remainingCount = ticketData
    ? Math.max(
        0,
        ticketData.reservation.partySize - ticketData.reservation.checkedInCount
      )
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        nested={nested}
        className="max-w-[36rem] overflow-hidden rounded-md border border-border/70 p-0 sm:max-w-[36rem]"
      >
        <DialogHeader className="bg-[#155abb] px-4 py-2.5 text-primary-foreground">
          <DialogTitle className="text-base font-semibold text-white">
            Re-Print Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 bg-background px-3 py-3">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading ticket details...
            </div>
          ) : ticketData ? (
            <>
              <section className="rounded-sm border border-slate-200 p-2">
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  Customer Information
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <DetailField
                    label="Last Name"
                    value={ticketData.customer.lastName}
                    className="[&_input]:w-[9.5rem]"
                  />
                  <DetailField
                    label="First Name"
                    value={ticketData.customer.firstName}
                    className="[&_input]:w-[9.5rem]"
                  />
                </div>
              </section>

              <section className="rounded-sm border border-slate-200 p-2">
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  Reservation Details
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <DetailField
                    label="Number in Party"
                    value={String(ticketData.reservation.partySize)}
                    className="[&_input]:w-16"
                  />
                  <DetailField
                    label="Total Amount"
                    value={formatAmount(ticketData.reservation.totalAmount)}
                    className="[&_input]:w-24"
                  />
                  <DetailField
                    label="Paid Amount"
                    value={formatAmount(ticketData.reservation.paidAmount)}
                    className="[&_input]:w-24"
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-foreground">
                  <span>
                    Checked In: {ticketData.reservation.checkedInCount}
                  </span>
                  <span>Remaining: {remainingCount}</span>
                </div>
              </section>

              <section className="rounded-sm border border-slate-200 p-2">
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  Click the Number of Customer to Print on Ticket
                </h3>
                {countOptions.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {countOptions.map((count) => (
                      <Button
                        key={count}
                        type="button"
                        className="h-10 min-w-12 rounded-sm bg-[#155abb] px-3 text-sm font-semibold hover:bg-[#124a9a]"
                        onClick={() => void handlePrint(count)}
                        disabled={isPrinting}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No checked-in guests available to re-print.
                  </p>
                )}
              </section>
            </>
          ) : (
            <div className="min-h-40 rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-muted-foreground">
              Select a reservation to load ticket details.
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-4 py-3 sm:justify-center">
          <Button
            type="button"
            className="min-w-24 bg-[#155abb] hover:bg-[#124a9a]"
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
