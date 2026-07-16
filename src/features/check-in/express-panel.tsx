import { PlusCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FormField, FormSection } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProcessPaymentDialog } from "@/features/check-in/dialogs/process-payment-dialog"
import { SalesTransactionDialog } from "@/features/check-in/dialogs/sales-transaction-dialog"
import { MultiplePromotionsDialog } from "@/features/check-in/multiple-promotions-dialog"
import { PaymentNumberFieldset } from "@/features/check-in/payment-number-fieldset"
import {
  calculateExpressPanelTotalsFromSection,
  EXPRESS_POS_CARD_TYPES,
  type ExpressPaymentType,
  type ExpressPosCardTypeKey,
} from "@/features/check-in/service/express-panel.service"
import {
  isExpressShowDateAllowed,
  validateBookFixedPartyTables,
} from "@/features/check-in/service/express-panel-validation"
import { cn } from "@/lib/utils"
import type { ReservationPaymentType } from "@/data/reservation-payment-options"
import type { ReservationPromo } from "@/types/reservation-promo"
import type { ReservationSectionOption } from "@/types/reservation"

const SELECT_TRIGGER_CLASS = "h-8 w-full min-w-0 text-xs"

type ActiveTransaction = {
  paymentType: ExpressPaymentType
  quantity: number
  cardTypeLookup?: string
}

export type ExpressPanelSalePayload = {
  section: ReservationSectionOption
  promo: ReservationPromo | null
  party: number
  passes: number
  paymentType: ReservationPaymentType
  paymentAmount: number
  cardType?: string
}

type CheckInExpressPanelProps = {
  sections: ReservationSectionOption[]
  promos: ReservationPromo[]
  showDate?: string
  taxRatePercent?: number
  taxWithServiceCharge?: string
  /** Desktop cmdPOScc=Y — V/MC/AE/D + 1–10, save as POS. */
  posCcMode?: boolean
  visible?: boolean
  isSubmitting?: boolean
  error?: string | null
  onSale: (payload: ExpressPanelSalePayload) => void | Promise<void>
}

export function CheckInExpressPanel({
  sections,
  promos,
  showDate,
  taxRatePercent = 0,
  taxWithServiceCharge,
  posCcMode = false,
  visible = true,
  isSubmitting = false,
  error = null,
  onSale,
}: CheckInExpressPanelProps) {
  const [sectionId, setSectionId] = useState("")
  const [promoId, setPromoId] = useState("none")
  const [passes, setPasses] = useState("1")
  const [party, setParty] = useState(0)
  const [cashNumber, setCashNumber] = useState<number | null>(null)
  const [cardNumber, setCardNumber] = useState<number | null>(null)
  const [posCardType, setPosCardType] = useState<ExpressPosCardTypeKey | null>(
    null
  )
  const [activeTransaction, setActiveTransaction] =
    useState<ActiveTransaction | null>(null)
  const [paymentDueOverride, setPaymentDueOverride] = useState<number | null>(
    null
  )
  const [multiplePromotionsOpen, setMultiplePromotionsOpen] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  /** Desktop WPFMessageBox-style Alert (BookFixedPartyTables / past date / POS type). */
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!sections.length) {
      setSectionId("")
      return
    }

    if (!sections.some((section) => section.id === sectionId)) {
      setSectionId(sections[0].id)
    }
  }, [sectionId, sections])

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === sectionId) ?? null,
    [sectionId, sections]
  )

  const selectedPromo = useMemo(() => {
    if (promoId === "none") {
      return null
    }

    return promos.find((promo) => promo.id === promoId) ?? null
  }, [promoId, promos])

  const passQuantity = Math.max(0, Number(passes) || 0)
  // Desktop: pad click sets Party; Passes field is independent for promo math.
  const displayParty = party > 0 ? party : 0
  const previewTotals = useMemo(
    () =>
      calculateExpressPanelTotalsFromSection({
        sectionPrice: selectedSection?.showPrice ?? 0,
        walkUpFee: selectedSection?.walkUpFee ?? 0,
        dayOfShowFee: selectedSection?.dayOfShowFee ?? 0,
        showDate,
        quantity: displayParty,
        passes: passQuantity,
        promo: selectedPromo,
        taxRatePercent,
        taxWithServiceCharge,
      }),
    [
      displayParty,
      passQuantity,
      selectedPromo,
      selectedSection,
      showDate,
      taxRatePercent,
      taxWithServiceCharge,
    ]
  )
  const transactionTotals = useMemo(
    () =>
      calculateExpressPanelTotalsFromSection({
        sectionPrice: selectedSection?.showPrice ?? 0,
        walkUpFee: selectedSection?.walkUpFee ?? 0,
        dayOfShowFee: selectedSection?.dayOfShowFee ?? 0,
        showDate,
        quantity: activeTransaction?.quantity ?? 0,
        passes: passQuantity || activeTransaction?.quantity || 0,
        promo: selectedPromo,
        taxRatePercent,
        taxWithServiceCharge,
      }),
    [
      activeTransaction?.quantity,
      passQuantity,
      selectedPromo,
      selectedSection,
      showDate,
      taxRatePercent,
      taxWithServiceCharge,
    ]
  )

  const salePaymentDue = paymentDueOverride ?? transactionTotals.paymentDue
  const salePaymentAmountLabel =
    paymentDueOverride != null
      ? `$${paymentDueOverride.toFixed(2)}`
      : transactionTotals.total

  if (!visible) {
    return null
  }

  function clearPadSelection() {
    setCashNumber(null)
    setCardNumber(null)
    setActiveTransaction(null)
    setPaymentDueOverride(null)
  }

  function handlePaymentSelect(
    paymentType: ExpressPaymentType,
    quantity: number
  ) {
    if (!selectedSection) {
      setAlertMessage("Please select show section first")
      return
    }

    if (!isExpressShowDateAllowed(showDate)) {
      // Desktop SaveSalesTransaction / CashPayment date guard.
      setAlertMessage("Show Date can't be prior than today.")
      clearPadSelection()
      return
    }

    if (paymentType === "POS-Credit Card" && !posCardType) {
      setAlertMessage("Please select credit card type first")
      return
    }

    // Desktop BookFixedPartyTables — Alert + stop (no Sales Transaction).
    const fixedPartyError = validateBookFixedPartyTables({
      showSec: selectedSection.showSec,
      party: quantity,
    })
    if (fixedPartyError) {
      setAlertMessage(fixedPartyError.message)
      setParty(fixedPartyError.requiredParty)
      clearPadSelection()
      return
    }

    setLocalError(null)
    setPaymentDueOverride(null)
    // Desktop CashPayment / ExpressCreditCard / POSCreditCard set Party only.
    setParty(quantity)

    if (paymentType === "Cash") {
      setCashNumber(quantity)
      setCardNumber(null)
    } else {
      setCardNumber(quantity)
      setCashNumber(null)
    }

    const cardLookup =
      paymentType === "POS-Credit Card"
        ? EXPRESS_POS_CARD_TYPES.find((item) => item.key === posCardType)
            ?.lookupCode
        : undefined

    // Desktop Cash → opens Sales Transaction popup (Issalestransactionpopup).
    setActiveTransaction({
      paymentType,
      quantity,
      cardTypeLookup: cardLookup,
    })
  }

  async function handleSalesTransactionOk(_tenderedAmount: number) {
    if (!selectedSection || !activeTransaction) {
      return
    }

    // Desktop SaveSalesTransaction / SavePOSTypePayment persist PaymentAmount = Total.
    const due = salePaymentDue
    const paymentType: ReservationPaymentType =
      activeTransaction.paymentType === "Cash"
        ? "cash"
        : activeTransaction.paymentType === "POS-Credit Card"
          ? "pos"
          : "credit-card"

    try {
      await onSale({
        section: selectedSection,
        promo: selectedPromo,
        party: activeTransaction.quantity,
        passes: Math.max(1, passQuantity || activeTransaction.quantity),
        paymentType,
        paymentAmount: due,
        cardType: activeTransaction.cardTypeLookup,
      })
      // Desktop after SaveSalesTransaction: Party = 0, promo reset.
      clearPadSelection()
      setParty(0)
      setPasses("1")
      setPromoId("none")
      setLocalError(null)
    } catch {
      clearPadSelection()
    }
  }

  return (
    <>
      <div className="px-3 py-3">
        <FormSection title="Express" className="space-y-3">
          {error || localError ? (
            <p className="text-sm text-destructive">{error || localError}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-start">
            <div className="min-w-0 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <FormField label="Section" className="min-w-0">
                  <Select value={sectionId} onValueChange={setSectionId}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Promo" className="min-w-0">
                  <Select value={promoId} onValueChange={setPromoId}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select promo code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select promo code</SelectItem>
                      {promos.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.promotionName || opt.promotionCode || opt.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Passes" className="w-full max-w-[8.5rem]">
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    value={passes}
                    onChange={(event) => {
                      setPasses(event.target.value)
                      clearPadSelection()
                    }}
                    className="h-8 min-w-0 flex-1 text-center text-xs tabular-nums"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label="Open multiple promotions"
                    onClick={() => setMultiplePromotionsOpen(true)}
                    disabled={
                      isSubmitting ||
                      Boolean(selectedSection?.restrictPromoForSection)
                    }
                    title={
                      selectedSection?.restrictPromoForSection
                        ? "Multiple promotions are disabled for this section"
                        : "Add multiple promotions"
                    }
                  >
                    <PlusCircle className="size-4" />
                  </Button>
                </div>
              </FormField>
            </div>

            <div className="min-w-0">
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <PaymentNumberFieldset
                  label="Cash"
                  selected={cashNumber}
                  disabled={isSubmitting}
                  onSelect={(value) => handlePaymentSelect("Cash", value)}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  {posCcMode ? (
                    <div className="flex flex-wrap gap-1.5">
                      {EXPRESS_POS_CARD_TYPES.map((card) => (
                        <Button
                          key={card.key}
                          type="button"
                          variant={
                            posCardType === card.key ? "default" : "outline"
                          }
                          className="h-8 min-w-10 rounded-sm px-2 text-xs font-semibold"
                          disabled={isSubmitting}
                          onClick={() => {
                            setPosCardType(card.key)
                            setLocalError(null)
                          }}
                        >
                          {card.label}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-sm px-2 text-xs font-semibold"
                        disabled={isSubmitting}
                        onClick={() => {
                          setPosCardType(null)
                          setCardNumber(null)
                          setActiveTransaction(null)
                        }}
                      >
                        CLR
                      </Button>
                    </div>
                  ) : null}
                  <PaymentNumberFieldset
                    label="Credit Card"
                    selected={cardNumber}
                    maxNumber={posCcMode ? 10 : 15}
                    disabled={isSubmitting}
                    onSelect={(value) =>
                      handlePaymentSelect(
                        posCcMode ? "POS-Credit Card" : "Credit Card",
                        value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-md border border-border/60 bg-background p-3">
              <div className="space-y-2">
                {[
                  { label: "Subtotal", value: previewTotals.subtotal },
                  {
                    label: "Service Charge",
                    value: previewTotals.serviceCharge,
                  },
                  { label: "Discount", value: previewTotals.discount },
                  { label: "Tax", value: previewTotals.tax },
                ].map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {line.value}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "mt-3 border-t border-border/60 pt-3",
                  "flex items-end justify-between gap-3"
                )}
              >
                <span className="text-sm font-semibold text-foreground">
                  TOTAL
                </span>
                <span className="text-xl leading-none font-bold tabular-nums text-primary sm:text-2xl">
                  {previewTotals.total}
                </span>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {activeTransaction ? (
        activeTransaction.paymentType === "Cash" ||
        activeTransaction.paymentType === "POS-Credit Card" ? (
          <SalesTransactionDialog
            key={`${activeTransaction.paymentType}-${activeTransaction.quantity}-${salePaymentDue}`}
            open
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                clearPadSelection()
              }
            }}
            paymentType={activeTransaction.paymentType}
            paymentDue={salePaymentDue}
            amountLocked={activeTransaction.paymentType === "POS-Credit Card"}
            onOk={(paymentAmount) => {
              void handleSalesTransactionOk(paymentAmount)
            }}
          />
        ) : (
          <ProcessPaymentDialog
            key={`${activeTransaction.paymentType}-${activeTransaction.quantity}-${salePaymentDue}`}
            open
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                clearPadSelection()
              }
            }}
            quantity={activeTransaction.quantity}
            paymentAmount={salePaymentAmountLabel}
            onOk={() => {
              void handleSalesTransactionOk(salePaymentDue)
            }}
          />
        )
      ) : null}

      <ConfirmDialog
        open={Boolean(alertMessage)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setAlertMessage(null)
          }
        }}
        title="Alert"
        description={alertMessage ?? ""}
        confirmLabel="OK"
        hideCancel
        onConfirm={() => setAlertMessage(null)}
      />

      <MultiplePromotionsDialog
        open={multiplePromotionsOpen}
        onOpenChange={setMultiplePromotionsOpen}
        promos={promos}
        sectionPrice={selectedSection?.showPrice ?? 0}
        walkUpFee={selectedSection?.walkUpFee ?? 0}
        dayOfShowFee={selectedSection?.dayOfShowFee ?? 0}
        showDate={showDate}
        taxRatePercent={taxRatePercent}
        taxWithServiceCharge={taxWithServiceCharge}
        initialParty={Math.max(1, party || passQuantity || 1)}
        onConfirm={(payload) => {
          setParty(payload.partyNumber)
          setPromoId(payload.primaryPromo?.id ?? "none")
          setLocalError(null)

          if (!selectedSection) {
            return
          }

          if (!isExpressShowDateAllowed(showDate)) {
            setLocalError("Show Date can't be prior than today.")
            return
          }

          const fixedPartyError = validateBookFixedPartyTables({
            showSec: selectedSection.showSec,
            party: payload.partyNumber,
          })
          if (fixedPartyError) {
            setLocalError(fixedPartyError.message)
            setParty(fixedPartyError.requiredParty)
            return
          }

          // Desktop multi-promo OK continues into payment; open Cash tender next.
          setPaymentDueOverride(payload.total)
          setCashNumber(payload.partyNumber)
          setCardNumber(null)
          setActiveTransaction({
            paymentType: "Cash",
            quantity: payload.partyNumber,
          })
        }}
      />
    </>
  )
}
