import { useEffect, useState } from 'react'
import { FormField } from '@/components/forms/form-fields'
import { ScrollSelectControl } from '@/components/common/scroll-select-control'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  EXPIRATION_MONTHS,
  getGiftAccountFieldLabel,
  getPaymentDetailLayout,
  RESERVATION_PAYMENT_TYPES,
  type ReservationPaymentType
} from '@/data/reservation-payment-options'
import {
  formatReservationMoney,
  parseReservationMoney
} from '@/lib/calculate-reservation-totals'
import type { ReservationPaymentValidationErrors } from '@/lib/validate-reservation-payment'
import { cn } from '@/lib/utils'
import type { ReservationPaymentFields } from '@/types/reservation-payment'
import {
  detectCardBrand,
  getDetectedCardForBrand,
  getCardBrandCandidates,
  getCardBrandMaxLength,
  isCardBrandCandidate,
  type CardBrand
} from '@/lib/detect-card-brand'

const COMPACT_INPUT = 'h-9 w-full text-sm'
const FIELD_LABEL = '[&_label]:mb-1 [&_label]:text-xs'
const FIELD_STACK = cn('w-full space-y-1.5', FIELD_LABEL)
const TYPE_PAIR_ROW = cn('grid w-full grid-cols-2 items-end gap-2', FIELD_LABEL)
const ROTATING_CARD_BRANDS: CardBrand[] = [
  'DISCOVER',
  'JCB',
  'UNIONPAY',
  'MAESTRO'
]
const PRIMARY_CARD_BRANDS: CardBrand[] = ['VISA', 'MASTERCARD', 'AMEX']
const ERROR_FIELD_CLASS =
  'border border-destructive '
const ERROR_TEXT_CLASS = 'text-[11px] leading-tight text-destructive'

function getMonthNameFromNumber(month: string) {
  const monthIndex = Number(month) - 1

  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return ''
  }

  return EXPIRATION_MONTHS[monthIndex]
}

function getMonthNumberFromName(monthName: string) {
  const index = EXPIRATION_MONTHS.indexOf(
    monthName as (typeof EXPIRATION_MONTHS)[number]
  )

  if (index === -1) {
    return ''
  }

  return String(index + 1).padStart(2, '0')
}

function groupCardDigits(digits: string, groups: number[]) {
  const parts: string[] = []
  let cursor = 0

  for (const groupLength of groups) {
    if (cursor >= digits.length) break

    parts.push(digits.slice(cursor, cursor + groupLength))
    cursor += groupLength
  }

  if (cursor < digits.length) {
    parts.push(digits.slice(cursor))
  }

  return parts.filter(Boolean).join(' ')
}

function getCardNumberGroups(brand?: CardBrand | null) {
  if (brand === 'AMEX') {
    return [4, 6, 5]
  }

  return [4, 4, 4, 4, 3]
}

function formatCardNumber(
  value: string,
  maxLength = 19,
  brand?: CardBrand | null
) {
  const digits = value.replace(/\D/g, '').slice(0, maxLength)

  return groupCardDigits(digits, getCardNumberGroups(brand))
}

function getFormattedCardInputMaxLength(
  maxLength: number,
  brand?: CardBrand | null
) {
  return formatCardNumber('9'.repeat(maxLength), maxLength, brand).length
}

function formatExpiryInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

function getExpiryInputValue(expMonth: string, expYear: string) {
  if (!expMonth && expYear.length <= 4) {
    return formatExpiryInput(expYear)
  }

  const month = getMonthNumberFromName(expMonth)
  const year = expYear.slice(-2)

  if (!month || year.length !== 2) {
    return ''
  }

  return `${month} / ${year}`
}

function PaymentTypeField({
  paymentType,
  onPaymentTypeChange,
  error
}: {
  paymentType: ReservationPaymentType
  onPaymentTypeChange: (value: ReservationPaymentType) => void
  error?: string
}) {
  return (
    <FormField label='Payment Type' htmlFor='payment-type' className='min-w-0'>
      <ScrollSelectControl
        id='payment-type'
        value={paymentType}
        onChange={value =>
          onPaymentTypeChange(value as ReservationPaymentType)
        }
        className={cn(COMPACT_INPUT, error && ERROR_FIELD_CLASS)}
        options={RESERVATION_PAYMENT_TYPES.map(option => ({
          value: option.id,
          label: option.label,
        }))}
      />
      {error ? <p className={ERROR_TEXT_CLASS}>{error}</p> : null}
    </FormField>
  )
}

function PaymentAmountField({
  value,
  onChange,
  error
}: {
  value: string
  onChange: (value: string) => void
  error?: string
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
        className={cn(
          COMPACT_INPUT,
          'tabular-nums',
          error && ERROR_FIELD_CLASS
        )}
        inputMode='decimal'
        disabled={true}
      />
      {error ? <p className={ERROR_TEXT_CLASS}>{error}</p> : null}
    </FormField>
  )
}

/** SVG card brand logos — self-contained, no external network request */
function CardBrandLogo({ brand }: { brand: CardBrand }) {
  const getCardIcon = () => {
    switch (brand) {
      case 'VISA':
        return '/assets/cards/visa.svg'
      case 'MASTERCARD':
        return '/assets/cards/master-card.svg'
      case 'AMEX':
        return '/assets/cards/american-express.svg'
      case 'DISCOVER':
        return '/assets/cards/discover.svg'
      case 'JCB':
        return '/assets/cards/jcb.svg'
      case 'MAESTRO':
        return '/assets/cards/maestro.svg'
      case 'UNIONPAY':
        return '/assets/cards/unionpay.svg'
      default:
        return null
    }
  }

  const src = getCardIcon()
  if (!src) return null

  return (
    <img
      src={src}
      alt={`${brand} logo`}
      className='h-6 max-w-9 object-contain'
    />
  )
}

function CardBrandStrip({
  cardNumber,
  resolvedBrand
}: {
  cardNumber: string
  resolvedBrand: CardBrand | null
}) {
  const [rotatingIndex, setRotatingIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const detectedCard = resolvedBrand
    ? getDetectedCardForBrand(resolvedBrand)
    : null
  const candidates = detectedCard ? [] : getCardBrandCandidates(cardNumber)
  const invalidPrefix =
    !detectedCard &&
    cardNumber.replace(/\D/g, '').length > 0 &&
    candidates.length === 0
  const rotatingBrand = ROTATING_CARD_BRANDS[rotatingIndex]

  useEffect(() => {
    if (resolvedBrand) {
      return
    }

    let timeout: number | undefined
    const interval = window.setInterval(() => {
      setVisible(false)

      timeout = window.setTimeout(() => {
        setRotatingIndex(index => (index + 1) % ROTATING_CARD_BRANDS.length)
        setVisible(true)
      }, 300)
    }, 2000)

    return () => {
      window.clearInterval(interval)

      if (timeout) {
        window.clearTimeout(timeout)
      }
    }
  }, [resolvedBrand])

  return (
    <div className='pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1'>
      {invalidPrefix ? null : detectedCard ? (
        <span className='flex h-5 items-center transition-opacity duration-200'>
          <CardBrandLogo brand={detectedCard.brand} />
        </span>
      ) : (
        PRIMARY_CARD_BRANDS.map(brand => (
          <span
            key={brand}
            className={cn(
              'flex h-5 items-center transition-opacity duration-200',
              'opacity-100'
            )}
          >
            <CardBrandLogo brand={brand} />
          </span>
        ))
      )}
      {!detectedCard && !invalidPrefix ? (
        <span
          className={cn(
            'flex h-5 items-center transition-opacity duration-300',
            visible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <CardBrandLogo brand={rotatingBrand} />
        </span>
      ) : null}
    </div>
  )
}

function CreditCardNumberField({
  value,
  onChange,
  error
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [showLimitMessage, setShowLimitMessage] = useState(false)
  const [resolvedBrand, setResolvedBrand] = useState<CardBrand | null>(null)
  const effectiveBrand =
    resolvedBrand && isCardBrandCandidate(value, resolvedBrand)
      ? resolvedBrand
      : detectCardBrand(value)?.brand ?? null
  const maxCardDigits = getCardBrandMaxLength(value, effectiveBrand)
  const formattedValue = formatCardNumber(value, maxCardDigits, effectiveBrand)
  const digits = value.replace(/\D/g, '')
  const hasInvalidPrefix =
    digits.length > 0 &&
    !effectiveBrand &&
    getCardBrandCandidates(digits).length === 0

  return (
    <div className='relative min-w-0'>
      <div className='relative flex items-center'>
        <Input
          id='payment-card-number'
          value={formattedValue}
          onChange={event => {
            const rawValue = event.target.value.replace(/\D/g, '')
            const nextBrand =
              effectiveBrand && isCardBrandCandidate(rawValue, effectiveBrand)
                ? effectiveBrand
                : detectCardBrand(rawValue)?.brand ?? null
            const maxLength = getCardBrandMaxLength(rawValue, nextBrand)

            setResolvedBrand(nextBrand)

            if (rawValue.length > maxLength) {
              setShowLimitMessage(true)
            } else {
              setShowLimitMessage(false)
            }
            onChange(formatCardNumber(rawValue, maxLength, nextBrand))
          }}
          className={cn(
            'h-10 rounded-none border-0 px-3 text-sm tabular-nums shadow-none focus-visible:ring-0 rounded-t-lg',
            error && ERROR_FIELD_CLASS,
            effectiveBrand ? 'pr-16' : hasInvalidPrefix ? 'pr-3' : 'pr-36'
          )}
          autoComplete='cc-number'
          inputMode='numeric'
          maxLength={getFormattedCardInputMaxLength(
            maxCardDigits,
            effectiveBrand
          )}
          placeholder='1234 1234 1234 1234'
        />
        <CardBrandStrip cardNumber={value} resolvedBrand={effectiveBrand} />
      </div>
      {showLimitMessage && (
        <p className='absolute left-4 top-full mt-1 text-[10px] leading-tight text-destructive'>
          Cannot exceed {maxCardDigits} digits for this card
        </p>
      )}
      {error ? <p className={cn(ERROR_TEXT_CLASS, 'px-3 pb-1')}>{error}</p> : null}
    </div>
  )
}

function GiftAccountField({
  paymentType,
  value,
  onChange,
  error
}: {
  paymentType: ReservationPaymentType
  value: string
  onChange: (value: string) => void
  error?: string
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
        className={cn(COMPACT_INPUT, error && ERROR_FIELD_CLASS)}
      />
      {error ? <p className={ERROR_TEXT_CLASS}>{error}</p> : null}
    </FormField>
  )
}

function BillingAddressField({
  value,
  onChange,
  error
}: {
  value: string
  onChange: (value: string) => void
  error?: string
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
        className={cn(COMPACT_INPUT, error && ERROR_FIELD_CLASS)}
        autoComplete='street-address'
        placeholder='Billing address'
      />
      {error ? <p className={ERROR_TEXT_CLASS}>{error}</p> : null}
    </FormField>
  )
}

function CreditCardInformationField({
  fields,
  onFieldChange,
  showZip = false,
  validationErrors = {}
}: {
  fields: ReservationPaymentFields
  onFieldChange: <K extends keyof ReservationPaymentFields>(
    key: K,
    value: ReservationPaymentFields[K]
  ) => void
  showZip?: boolean
  validationErrors?: ReservationPaymentValidationErrors
}) {
  const detectedCard = detectCardBrand(fields.cardNumber)
  const cvvMaxLength = detectedCard?.brand === 'AMEX' ? 4 : 3

  const handleExpiryChange = (value: string) => {
    const formattedValue = formatExpiryInput(value)
    const digits = formattedValue.replace(/\D/g, '')
    const month = digits.slice(0, 2)
    const year = digits.slice(2, 4)
    const monthName = getMonthNameFromNumber(month)

    if (monthName && year.length === 2) {
      onFieldChange('expMonth', monthName)
      onFieldChange('expYear', `20${year}`)
      return
    }

    onFieldChange('expMonth', '')
    onFieldChange('expYear', digits)
  }

  return (
    <>
      <div className='space-y-1.5'>
        <label
          htmlFor='payment-card-number'
          className='text-xs font-medium text-foreground'
        >
          Card information
        </label>
        <div className='overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm'>
          <CreditCardNumberField
            value={fields.cardNumber}
            onChange={value => onFieldChange('cardNumber', value)}
            error={validationErrors.cardNumber}
          />

          <div className='grid grid-cols-2 border-t border-border/70'>
            <div>
              <Input
                id='payment-expiration'
                value={getExpiryInputValue(fields.expMonth, fields.expYear)}
                onChange={event => handleExpiryChange(event.target.value)}
                className={cn(
                  'h-10 rounded-none border-0 px-3 text-sm shadow-none focus-visible:ring-0',
                  validationErrors.expiration && ERROR_FIELD_CLASS
                )}
                autoComplete='cc-exp'
                inputMode='numeric'
                maxLength={7}
                placeholder='MM / YY'
              />
              {validationErrors.expiration ? (
                <p className={cn(ERROR_TEXT_CLASS, 'px-3 pb-1')}>
                  {validationErrors.expiration}
                </p>
              ) : null}
            </div>
            <div className='border-l border-border/70'>
              <Input
                id='payment-cvv'
                value={fields.cvv}
                onChange={event =>
                  onFieldChange(
                    'cvv',
                    event.target.value.replace(/\D/g, '').slice(0, cvvMaxLength)
                  )
                }
                className={cn(
                  'h-10 rounded-none border-0 px-3 text-sm shadow-none focus-visible:ring-0',
                  validationErrors.cvv && ERROR_FIELD_CLASS
                )}
                autoComplete='cc-csc'
                inputMode='numeric'
                maxLength={cvvMaxLength}
                placeholder='CVV'
              />
              {validationErrors.cvv ? (
                <p className={cn(ERROR_TEXT_CLASS, 'px-3 pb-1')}>
                  {validationErrors.cvv}
                </p>
              ) : null}
            </div>
          </div>

          {showZip ? (
            <div className='border-t border-border/70'>
              <Input
                id='payment-zip'
                value={fields.zipCode}
                onChange={event =>
                  onFieldChange(
                    'zipCode',
                    event.target.value.replace(/\D/g, '')
                  )
                }
                className={cn(
                  'h-10 rounded-none border-0 px-3 text-sm shadow-none focus-visible:ring-0',
                  validationErrors.zipCode && ERROR_FIELD_CLASS
                )}
                autoComplete='postal-code'
                inputMode='numeric'
                placeholder='ZIP / Postal code'
              />
              {validationErrors.zipCode ? (
                <p className={cn(ERROR_TEXT_CLASS, 'px-3 pb-1')}>
                  {validationErrors.zipCode}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className='border-t border-border/70'>
            <Input
              id='payment-billing-address'
              value={fields.billingAddress}
              onChange={event =>
                onFieldChange('billingAddress', event.target.value)
              }
              className={cn(
                'h-10 rounded-none border-0 px-3 text-sm shadow-none focus-visible:ring-0',
                validationErrors.billingAddress && ERROR_FIELD_CLASS
              )}
              autoComplete='street-address'
              placeholder='Billing address'
            />
            {validationErrors.billingAddress ? (
              <p className={cn(ERROR_TEXT_CLASS, 'px-3 pb-1')}>
                {validationErrors.billingAddress}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

function PaymentFormFields({
  paymentType,
  onPaymentTypeChange,
  paymentAmount,
  onPaymentAmountChange,
  fields,
  onFieldChange,
  validationErrors = {}
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
  validationErrors?: ReservationPaymentValidationErrors
}) {
  const layout = getPaymentDetailLayout(paymentType)

  if (layout === 'full-credit-card') {
    return (
      <div className={FIELD_STACK}>
        <div className={TYPE_PAIR_ROW}>
          <PaymentTypeField
            paymentType={paymentType}
            onPaymentTypeChange={onPaymentTypeChange}
            error={validationErrors.paymentType}
          />
          <PaymentAmountField
            value={paymentAmount}
            onChange={onPaymentAmountChange}
            error={validationErrors.paymentAmount}
          />
        </div>

        <CreditCardInformationField
          fields={fields}
          onFieldChange={onFieldChange}
          showZip
          validationErrors={validationErrors}
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
            error={validationErrors.paymentType}
          />
          <PaymentAmountField
            value={paymentAmount}
            onChange={onPaymentAmountChange}
            error={validationErrors.paymentAmount}
          />
        </div>

        <CreditCardInformationField
          fields={fields}
          onFieldChange={onFieldChange}
          validationErrors={validationErrors}
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
            error={validationErrors.paymentType}
          />
          <PaymentAmountField
            value={paymentAmount}
            onChange={onPaymentAmountChange}
            error={validationErrors.paymentAmount}
          />
        </div>

        <GiftAccountField
          paymentType={paymentType}
          value={fields.accountNumber}
          onChange={value => onFieldChange('accountNumber', value)}
          error={validationErrors.accountNumber}
        />

        <BillingAddressField
          value={fields.billingAddress}
          onChange={value => onFieldChange('billingAddress', value)}
          error={validationErrors.billingAddress}
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
          error={validationErrors.paymentType}
        />
        <PaymentAmountField
          value={paymentAmount}
          onChange={onPaymentAmountChange}
          error={validationErrors.paymentAmount}
        />
      </div>
    </div>
  )
}

export function ReservationPaymentActions({
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

export function ReservationPaymentPanel({
  paymentType,
  onPaymentTypeChange,
  paymentAmount,
  onPaymentAmountChange,
  fields,
  onFieldChange,
  paymentDisabled = false,
  validationErrors
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
  validationErrors?: ReservationPaymentValidationErrors
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
          validationErrors={validationErrors}
        />
      </div>
    </div>
  )
}
