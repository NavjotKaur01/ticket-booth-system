import { useEffect, useState } from 'react'

import { FormField } from '@/components/forms/form-fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  EXPIRATION_MONTHS,
  getExpirationYears,
  getGiftAccountFieldLabel,
  getPaymentDetailLayout,
  RESERVATION_PAYMENT_TYPES,
  type ReservationPaymentType
} from '@/data/reservation-payment-options'
import { cn } from '@/lib/utils'

const COMPACT_INPUT = 'h-9 w-full text-sm'
const FIELD_LABEL = '[&_label]:mb-1 [&_label]:text-xs'
const FIELD_STACK = cn('w-full space-y-1.5', FIELD_LABEL)
const TYPE_PAIR_ROW = cn('grid w-full grid-cols-2 items-end gap-2', FIELD_LABEL)
const CARD_SECONDARY_ROW = cn('grid w-full items-end gap-2', FIELD_LABEL)

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
    cardNumber: '',
    cvv: '',
    expMonth: EXPIRATION_MONTHS[0],
    expYear: String(new Date().getFullYear()),
    billingAddress: '',
    zipCode: '',
    accountNumber: ''
  }
}

function ExpirationFields ({
  expMonth,
  expYear,
  onExpMonthChange,
  onExpYearChange
}: {
  expMonth: string
  expYear: string
  onExpMonthChange: (value: string) => void
  onExpYearChange: (value: string) => void
}) {
  const years = getExpirationYears()

  return (
    <div className='grid w-full grid-cols-2 gap-2'>
      <Select value={expMonth} onValueChange={onExpMonthChange}>
        <SelectTrigger
          id='payment-exp-month'
          className={COMPACT_INPUT}
          aria-label='Expiration month'
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
          id='payment-exp-year'
          className={COMPACT_INPUT}
          aria-label='Expiration year'
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

function PaymentTypeField ({
  paymentType,
  onPaymentTypeChange
}: {
  paymentType: ReservationPaymentType
  onPaymentTypeChange: (value: ReservationPaymentType) => void
}) {
  return (
    <FormField label='Payment Type' htmlFor='payment-type' className='min-w-0'>
      <Select
        value={paymentType}
        onValueChange={value =>
          onPaymentTypeChange(value as ReservationPaymentType)
        }
      >
        <SelectTrigger id='payment-type' className={COMPACT_INPUT}>
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
  )
}

function CreditCardNumberField ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <FormField
      label='Credit Card Number'
      htmlFor='payment-card-number'
      className='min-w-0'
    >
      <Input
        id='payment-card-number'
        value={value}
        onChange={event => onChange(event.target.value)}
        className={COMPACT_INPUT}
        autoComplete='cc-number'
      />
    </FormField>
  )
}

function GiftAccountField ({
  paymentType,
  value,
  onChange
}: {
  paymentType: ReservationPaymentType
  value: string
  onChange: (value: string) => void
}) {
  return (
    <FormField
      label={getGiftAccountFieldLabel(paymentType)}
      htmlFor='payment-account-number'
      className='min-w-0'
    >
      <Input
        id='payment-account-number'
        value={value}
        onChange={event => onChange(event.target.value)}
        className={COMPACT_INPUT}
      />
    </FormField>
  )
}

function BillingAddressField ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <FormField
      label='Billing Address'
      htmlFor='payment-billing-address'
      className='w-full'
    >
      <Input
        id='payment-billing-address'
        value={value}
        onChange={event => onChange(event.target.value)}
        className={COMPACT_INPUT}
        autoComplete='street-address'
      />
    </FormField>
  )
}

function CreditCardSecondaryRow ({
  fields,
  onFieldChange,
  showZip = false
}: {
  fields: PaymentFieldState
  onFieldChange: <K extends keyof PaymentFieldState>(
    key: K,
    value: PaymentFieldState[K]
  ) => void
  showZip?: boolean
}) {
  return (
    <div
      className={cn(
        CARD_SECONDARY_ROW,
        showZip
          ? 'grid-cols-[minmax(0,0.55fr)_minmax(0,1.35fr)_minmax(0,0.65fr)]'
          : 'grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)]'
      )}
    >
      <FormField label='CVV' htmlFor='payment-cvv' className='min-w-0'>
        <Input
          id='payment-cvv'
          value={fields.cvv}
          onChange={event => onFieldChange('cvv', event.target.value)}
          className={COMPACT_INPUT}
          autoComplete='cc-csc'
        />
      </FormField>

      <FormField
        label='Expiration'
        htmlFor='payment-exp-month'
        className='min-w-0'
      >
        <ExpirationFields
          expMonth={fields.expMonth}
          expYear={fields.expYear}
          onExpMonthChange={value => onFieldChange('expMonth', value)}
          onExpYearChange={value => onFieldChange('expYear', value)}
        />
      </FormField>

      {showZip ? (
        <FormField label='Zip' htmlFor='payment-zip' className='min-w-0'>
          <Input
            id='payment-zip'
            value={fields.zipCode}
            onChange={event => onFieldChange('zipCode', event.target.value)}
            className={COMPACT_INPUT}
            autoComplete='postal-code'
          />
        </FormField>
      ) : null}
    </div>
  )
}

function PaymentFormFields ({
  paymentType,
  onPaymentTypeChange,
  fields,
  onFieldChange
}: {
  paymentType: ReservationPaymentType
  onPaymentTypeChange: (value: ReservationPaymentType) => void
  fields: PaymentFieldState
  onFieldChange: <K extends keyof PaymentFieldState>(
    key: K,
    value: PaymentFieldState[K]
  ) => void
}) {
  const layout = getPaymentDetailLayout(paymentType)

  if (layout === 'full-credit-card') {
    return (
      <div className={FIELD_STACK}>
        <div className={TYPE_PAIR_ROW}>
          <PaymentTypeField
            paymentType={paymentType}
            onPaymentTypeChange={onPaymentTypeChange}
          />
          <CreditCardNumberField
            value={fields.cardNumber}
            onChange={value => onFieldChange('cardNumber', value)}
          />
        </div>

        <CreditCardSecondaryRow
          fields={fields}
          onFieldChange={onFieldChange}
          showZip
        />

        <BillingAddressField
          value={fields.billingAddress}
          onChange={value => onFieldChange('billingAddress', value)}
        />
      </div>
    )
  }

  if (layout === 'compact-credit-card') {
    return (
      <div className={FIELD_STACK}>
        <div className={TYPE_PAIR_ROW}>
          <PaymentTypeField
            paymentType={paymentType}
            onPaymentTypeChange={onPaymentTypeChange}
          />
          <CreditCardNumberField
            value={fields.cardNumber}
            onChange={value => onFieldChange('cardNumber', value)}
          />
        </div>

        <CreditCardSecondaryRow fields={fields} onFieldChange={onFieldChange} />

        <BillingAddressField
          value={fields.billingAddress}
          onChange={value => onFieldChange('billingAddress', value)}
        />
      </div>
    )
  }

  if (layout === 'gift-account') {
    return (
      <div className={FIELD_STACK}>
        <div className={TYPE_PAIR_ROW}>
          <PaymentTypeField
            paymentType={paymentType}
            onPaymentTypeChange={onPaymentTypeChange}
          />
          <GiftAccountField
            paymentType={paymentType}
            value={fields.accountNumber}
            onChange={value => onFieldChange('accountNumber', value)}
          />
        </div>

        <BillingAddressField
          value={fields.billingAddress}
          onChange={value => onFieldChange('billingAddress', value)}
        />
      </div>
    )
  }

  return (
    <div className={FIELD_STACK}>
      <div className={TYPE_PAIR_ROW}>
        <PaymentTypeField
          paymentType={paymentType}
          onPaymentTypeChange={onPaymentTypeChange}
        />
        <BillingAddressField
          value={fields.billingAddress}
          onChange={value => onFieldChange('billingAddress', value)}
        />
      </div>
    </div>
  )
}

export function ReservationPaymentActions ({
  onCancel
}: {
  onCancel?: () => void
}) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button' size='sm'>
        Save
      </Button>
      <Button
        type='button'
        size='sm'
        variant='outline'
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type='button' size='sm' variant='outline' className='ml-auto'>
        Re Print Ticket
      </Button>
    </div>
  )
}

export function ReservationPaymentPanel ({ amountDue }: { amountDue: string }) {
  const [paymentType, setPaymentType] = useState<ReservationPaymentType>('cash')
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
    <div className='space-y-1.5 border-t border-border/50 pt-3'>
      <h3 className='text-sm font-semibold text-foreground'>
        Payment Information
      </h3>

      <div className='rounded-lg border border-border/60 p-2.5'>
        <PaymentFormFields
          paymentType={paymentType}
          onPaymentTypeChange={setPaymentType}
          fields={fields}
          onFieldChange={updateField}
        />
      </div>
    </div>
  )
}
