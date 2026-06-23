import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import {
  FormField,
  ReadOnlyValue,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  EXPIRATION_MONTHS,
  getExpirationYears,
  getGiftAccountFieldLabel,
  getPaymentDetailLayout,
  getPaymentDetailSectionTitle,
  RESERVATION_PAYMENT_TYPES,
  type ReservationPaymentType,
} from "@/data/reservation-payment-options"
import { cn } from "@/lib/utils"

const COMPACT_INPUT = "h-8 w-full text-xs"
const DETAIL_LABEL =
  "mb-1 block text-[11px] font-medium text-muted-foreground"
const FIELD_LABEL = "[&_label]:mb-0.5 [&_label]:text-[11px]"

type PaymentFieldState = {
  paymentAmount: string
  cardNumber: string
  cvv: string
  expMonth: string
  expYear: string
  billingAddress: string
  zipCode: string
  accountNumber: string
}

function createEmptyPaymentFields (amountDue: string): PaymentFieldState {
  return {
    paymentAmount: amountDue,
    cardNumber: "",
    cvv: "",
    expMonth: EXPIRATION_MONTHS[0],
    expYear: String(new Date().getFullYear()),
    billingAddress: "",
    zipCode: "",
    accountNumber: "",
  }
}

function PaymentDetailBlock ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className={cn("space-y-1.5 border-t border-border/50 pt-2", FIELD_LABEL)}>
      <span className={DETAIL_LABEL}>{title}</span>
      {children}
    </div>
  )
}

function ExpirationFields ({
  expMonth,
  expYear,
  onExpMonthChange,
  onExpYearChange,
}: {
  expMonth: string
  expYear: string
  onExpMonthChange: (value: string) => void
  onExpYearChange: (value: string) => void
}) {
  const years = getExpirationYears()

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <Select value={expMonth} onValueChange={onExpMonthChange}>
        <SelectTrigger
          id="payment-exp-month"
          className={COMPACT_INPUT}
          aria-label="Expiration month"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EXPIRATION_MONTHS.map(month => (
            <SelectItem key={month} value={month}>
              {month.slice(0, 3)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={expYear} onValueChange={onExpYearChange}>
        <SelectTrigger
          id="payment-exp-year"
          className={COMPACT_INPUT}
          aria-label="Expiration year"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FullCreditCardFields ({
  fields,
  onFieldChange,
}: {
  fields: PaymentFieldState
  onFieldChange: <K extends keyof PaymentFieldState>(
    key: K,
    value: PaymentFieldState[K]
  ) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[minmax(0,1fr)_4rem] gap-1.5">
        <FormField label="Credit Card Number" htmlFor="payment-card-number">
          <Input
            id="payment-card-number"
            value={fields.cardNumber}
            onChange={event => onFieldChange("cardNumber", event.target.value)}
            className={COMPACT_INPUT}
            autoComplete="cc-number"
          />
        </FormField>

        <FormField label="CVV" htmlFor="payment-cvv">
          <Input
            id="payment-cvv"
            value={fields.cvv}
            onChange={event => onFieldChange("cvv", event.target.value)}
            className={COMPACT_INPUT}
            autoComplete="cc-csc"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3.5rem] gap-1.5">
        <FormField label="Expiration" htmlFor="payment-exp-month">
          <ExpirationFields
            expMonth={fields.expMonth}
            expYear={fields.expYear}
            onExpMonthChange={value => onFieldChange("expMonth", value)}
            onExpYearChange={value => onFieldChange("expYear", value)}
          />
        </FormField>

        <FormField label="Billing Address" htmlFor="payment-billing-address">
          <Input
            id="payment-billing-address"
            value={fields.billingAddress}
            onChange={event =>
              onFieldChange("billingAddress", event.target.value)
            }
            className={COMPACT_INPUT}
            autoComplete="street-address"
          />
        </FormField>

        <FormField label="Zip" htmlFor="payment-zip">
          <Input
            id="payment-zip"
            value={fields.zipCode}
            onChange={event => onFieldChange("zipCode", event.target.value)}
            className={COMPACT_INPUT}
            autoComplete="postal-code"
          />
        </FormField>
      </div>
    </div>
  )
}

function CompactCreditCardFields ({
  fields,
  onFieldChange,
}: {
  fields: PaymentFieldState
  onFieldChange: <K extends keyof PaymentFieldState>(
    key: K,
    value: PaymentFieldState[K]
  ) => void
}) {
  return (
    <div className="space-y-1.5">
      <FormField label="Credit Card Number" htmlFor="payment-card-number">
        <Input
          id="payment-card-number"
          value={fields.cardNumber}
          onChange={event => onFieldChange("cardNumber", event.target.value)}
          className={COMPACT_INPUT}
          autoComplete="cc-number"
        />
      </FormField>

      <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-1.5">
        <FormField label="CVV" htmlFor="payment-cvv">
          <Input
            id="payment-cvv"
            value={fields.cvv}
            onChange={event => onFieldChange("cvv", event.target.value)}
            className={COMPACT_INPUT}
            autoComplete="cc-csc"
          />
        </FormField>

        <FormField label="Expiration" htmlFor="payment-exp-month">
          <ExpirationFields
            expMonth={fields.expMonth}
            expYear={fields.expYear}
            onExpMonthChange={value => onFieldChange("expMonth", value)}
            onExpYearChange={value => onFieldChange("expYear", value)}
          />
        </FormField>
      </div>
    </div>
  )
}

function GiftAccountField ({
  paymentType,
  value,
  onChange,
}: {
  paymentType: ReservationPaymentType
  value: string
  onChange: (value: string) => void
}) {
  return (
    <FormField
      label={getGiftAccountFieldLabel(paymentType)}
      htmlFor="payment-account-number"
    >
      <Input
        id="payment-account-number"
        value={value}
        onChange={event => onChange(event.target.value)}
        className={COMPACT_INPUT}
      />
    </FormField>
  )
}

function PaymentDetailFields ({
  paymentType,
  fields,
  onFieldChange,
}: {
  paymentType: ReservationPaymentType
  fields: PaymentFieldState
  onFieldChange: <K extends keyof PaymentFieldState>(
    key: K,
    value: PaymentFieldState[K]
  ) => void
}) {
  const layout = getPaymentDetailLayout(paymentType)
  const sectionTitle = getPaymentDetailSectionTitle(paymentType)

  if (layout === "none" || !sectionTitle) {
    return null
  }

  return (
    <PaymentDetailBlock title={sectionTitle}>
      {layout === "full-credit-card" ? (
        <FullCreditCardFields fields={fields} onFieldChange={onFieldChange} />
      ) : null}

      {layout === "compact-credit-card" ? (
        <CompactCreditCardFields
          fields={fields}
          onFieldChange={onFieldChange}
        />
      ) : null}

      {layout === "gift-account" ? (
        <GiftAccountField
          paymentType={paymentType}
          value={fields.accountNumber}
          onChange={value => onFieldChange("accountNumber", value)}
        />
      ) : null}
    </PaymentDetailBlock>
  )
}

function PaymentPrimaryFields ({
  paymentType,
  amountDue,
  fields,
  onPaymentTypeChange,
  onFieldChange,
}: {
  paymentType: ReservationPaymentType
  amountDue: string
  fields: PaymentFieldState
  onPaymentTypeChange: (value: ReservationPaymentType) => void
  onFieldChange: <K extends keyof PaymentFieldState>(
    key: K,
    value: PaymentFieldState[K]
  ) => void
}) {
  return (
    <div className={cn("space-y-1.5", FIELD_LABEL)}>
      <FormField label="Payment Type" htmlFor="payment-type">
        <Select
          value={paymentType}
          onValueChange={value =>
            onPaymentTypeChange(value as ReservationPaymentType)
          }
        >
          <SelectTrigger id="payment-type" className={COMPACT_INPUT}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESERVATION_PAYMENT_TYPES.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-1.5">
        <FormField label="Payment Amount" htmlFor="payment-amount">
          <Input
            id="payment-amount"
            value={fields.paymentAmount}
            onChange={event =>
              onFieldChange("paymentAmount", event.target.value)
            }
            className={cn(COMPACT_INPUT, "tabular-nums")}
          />
        </FormField>

        <FormField label="Amount Due" htmlFor="payment-amount-due">
          <ReadOnlyValue
            value={amountDue}
            className="h-8 px-2 text-xs"
          />
        </FormField>
      </div>
    </div>
  )
}

function PaymentActions () {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2">
      <Button type="button" size="sm" className="h-8">
        Save
      </Button>
      <Button type="button" size="sm" variant="link" className="h-8 px-2">
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="ml-auto h-8"
      >
        Re Print Ticket
      </Button>
    </div>
  )
}

export function ReservationPaymentPanel ({
  amountDue,
}: {
  amountDue: string
}) {
  const [paymentType, setPaymentType] =
    useState<ReservationPaymentType>("cash")
  const [fields, setFields] = useState<PaymentFieldState>(() =>
    createEmptyPaymentFields(amountDue)
  )

  useEffect(() => {
    setFields(createEmptyPaymentFields(amountDue))
  }, [paymentType, amountDue])

  function updateField<K extends keyof PaymentFieldState> (
    key: K,
    value: PaymentFieldState[K]
  ) {
    setFields(current => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-1.5 border-t border-border/50 pt-3">
      <h3 className="text-xs font-semibold text-foreground">
        Payment Information
      </h3>

      <div className="space-y-2 rounded-lg border border-border/60 p-2.5">
        <PaymentPrimaryFields
          paymentType={paymentType}
          amountDue={amountDue}
          fields={fields}
          onPaymentTypeChange={setPaymentType}
          onFieldChange={updateField}
        />

        <PaymentDetailFields
          paymentType={paymentType}
          fields={fields}
          onFieldChange={updateField}
        />

        <PaymentActions />
      </div>
    </div>
  )
}
