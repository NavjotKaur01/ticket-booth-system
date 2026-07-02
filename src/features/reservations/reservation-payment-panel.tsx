import { FormField } from '@/components/forms/form-fields'
import { ScrollSelectControl } from '@/components/common/scroll-select-control'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  EXPIRATION_MONTHS,
  getExpirationYears,
  getGiftAccountFieldLabel,
  getPaymentDetailLayout,
  RESERVATION_PAYMENT_TYPES,
  type ReservationPaymentType
} from '@/data/reservation-payment-options'
import {
  formatReservationMoney,
  parseReservationMoney
} from '@/lib/calculate-reservation-totals'
import { cn } from '@/lib/utils'
import type { ReservationPaymentFields } from '@/types/reservation-payment'

const COMPACT_INPUT = 'h-9 w-full text-sm'
const FIELD_LABEL = '[&_label]:mb-1 [&_label]:text-xs'
const FIELD_STACK = cn('w-full space-y-1.5', FIELD_LABEL)
const TYPE_PAIR_ROW = cn('grid w-full grid-cols-2 items-end gap-2', FIELD_LABEL)
const CARD_SECONDARY_ROW = cn('grid w-full items-end gap-2', FIELD_LABEL)

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
      <ScrollSelectControl
        id='payment-exp-month'
        value={expMonth}
        onChange={onExpMonthChange}
        className={COMPACT_INPUT}
        options={EXPIRATION_MONTHS.map(month => ({
          value: month,
          label: month.slice(0, 3)
        }))}
      />

      <ScrollSelectControl
        id='payment-exp-year'
        value={expYear}
        onChange={onExpYearChange}
        className={COMPACT_INPUT}
        options={years.map(year => ({
          value: year,
          label: year
        }))}
      />
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
      <ScrollSelectControl
        id='payment-type'
        value={paymentType}
        onChange={value =>
          onPaymentTypeChange(value as ReservationPaymentType)
        }
        className={COMPACT_INPUT}
        options={RESERVATION_PAYMENT_TYPES.map(option => ({
          value: option.id,
          label: option.label,
        }))}
      />
    </FormField>
  )
}

function PaymentAmountField ({
  value,
  onChange,
  disabled
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <FormField
      label='Payment Amount'
      htmlFor='payment-amount'
      className='min-w-0'
    >
      <Input
        id='payment-amount'
        value={value}
        onChange={event => onChange(event.target.value)}
        onBlur={event => {
          const parsed = parseReservationMoney(event.target.value)
          onChange(formatReservationMoney(parsed))
        }}
        className={cn(COMPACT_INPUT, 'tabular-nums')}
        inputMode='decimal'
        disabled={disabled}
      />
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
  fields: ReservationPaymentFields
  onFieldChange: <K extends keyof ReservationPaymentFields>(
    key: K,
    value: ReservationPaymentFields[K]
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
  paymentAmount,
  onPaymentAmountChange,
  fields,
  onFieldChange,
  paymentDisabled
}: {
  paymentType: ReservationPaymentType
  onPaymentTypeChange: (value: ReservationPaymentType) => void
  paymentAmount: string
  onPaymentAmountChange: (value: string) => void
  fields: ReservationPaymentFields
  onFieldChange: <K extends keyof ReservationPaymentFields>(
    key: K,
    value: ReservationPaymentFields[K]
  ) => void
  paymentDisabled?: boolean
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
          <PaymentAmountField
            value={paymentAmount}
            onChange={onPaymentAmountChange}
            disabled={paymentDisabled}
          />
        </div>

        <CreditCardNumberField
          value={fields.cardNumber}
          onChange={value => onFieldChange('cardNumber', value)}
        />

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
          <PaymentAmountField
            value={paymentAmount}
            onChange={onPaymentAmountChange}
            disabled={paymentDisabled}
          />
        </div>

        <CreditCardNumberField
          value={fields.cardNumber}
          onChange={value => onFieldChange('cardNumber', value)}
        />

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
          <PaymentAmountField
            value={paymentAmount}
            onChange={onPaymentAmountChange}
            disabled={paymentDisabled}
          />
        </div>

        <GiftAccountField
          paymentType={paymentType}
          value={fields.accountNumber}
          onChange={value => onFieldChange('accountNumber', value)}
        />

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
        <PaymentAmountField
          value={paymentAmount}
          onChange={onPaymentAmountChange}
          disabled={paymentDisabled}
        />
      </div>
    </div>
  )
}

export function ReservationPaymentActions ({
  onCancel,
  onSave,
  saveDisabled,
  saving = false,
  showReprint = false
}: {
  onCancel?: () => void
  onSave?: () => void
  saveDisabled?: boolean
  saving?: boolean
  showReprint?: boolean
}) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button
        type='button'
        size='sm'
        onClick={onSave}
        disabled={saveDisabled || saving}
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>
      <Button
        type='button'
        size='sm'
        variant='outline'
        onClick={onCancel}
      >
        Cancel
      </Button>
      {showReprint ? (
        <Button type='button' size='sm' variant='outline' className='ml-auto'>
          Re Print Ticket
        </Button>
      ) : null}
    </div>
  )
}

export function ReservationPaymentPanel ({
  paymentType,
  onPaymentTypeChange,
  paymentAmount,
  onPaymentAmountChange,
  fields,
  onFieldChange,
  paymentDisabled = false
}: {
  paymentType: ReservationPaymentType
  onPaymentTypeChange: (value: ReservationPaymentType) => void
  paymentAmount: string
  onPaymentAmountChange: (value: string) => void
  fields: ReservationPaymentFields
  onFieldChange: <K extends keyof ReservationPaymentFields>(
    key: K,
    value: ReservationPaymentFields[K]
  ) => void
  paymentDisabled?: boolean
}) {
  return (
    <div className='space-y-1.5 border-t border-border/50 pt-3'>
      <h3 className='text-sm font-semibold text-foreground'>
        Payment Information
      </h3>

      <div className='rounded-lg border border-border/60 p-2.5'>
        <PaymentFormFields
          paymentType={paymentType}
          onPaymentTypeChange={onPaymentTypeChange}
          paymentAmount={paymentAmount}
          onPaymentAmountChange={onPaymentAmountChange}
          fields={fields}
          onFieldChange={onFieldChange}
          paymentDisabled={paymentDisabled}
        />
      </div>
    </div>
  )
}
