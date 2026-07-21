import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatReservationMoney } from '@/lib/calculate-reservation-totals'

import { multiplePromosDiscCalculation } from '@/lib/multiple-promo-calculation'

export type MultiplePromotionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promoOptions: { label: string; value: string }[]
  initialSubtotal: number
  initialSvc: number
  initialDisc: number
  initialTaxes: number
  initialTotal: number
  initialParty: number
  initialPromos?: { promoId: string; passes: number; discount: number }[]
  onConfirm: (promos: { promoId: string; passes: number; discount: number }[]) => void
  nested?: boolean
  promoById: Map<string, any>
  unitPrice: number
  serviceChargePerTicket: number
  taxRate: number
  originCode: string
  baseClubFee: number
  baseDayOfShowFee: number
  isDayOfShow?: boolean
}

type PromoRow = {
  promoId: string
  passes: number
  discount: number
  paid: number
  comp: number
  disc: number
}



export function MultiplePromotionsDialog({
  open,
  onOpenChange,
  promoOptions,
  initialSubtotal,
  initialSvc,
  initialDisc,
  initialTaxes,
  initialTotal,
  initialParty,
  onConfirm,
  nested = false,
  promoById,
  unitPrice,
  taxRate,
  originCode,
  baseClubFee,
  baseDayOfShowFee,
  isDayOfShow = false,
  initialPromos = []
}: MultiplePromotionsDialogProps) {
  const [rows, setRows] = useState<PromoRow[]>(() => {
    const defaultRows = Array.from({ length: 5 }).map(() => ({
      promoId: 'none',
      passes: 0,
      discount: 0,
      paid: 0,
      comp: 0,
      disc: 0
    }))
    
    initialPromos.forEach((p, i) => {
      if (i < 5) {
        defaultRows[i] = {
          ...defaultRows[i],
          promoId: p.promoId,
          passes: p.passes,
          discount: p.discount,
        }
      }
    })
    
    return defaultRows
  })
  const [party, setParty] = useState(initialParty)

  const derivedSubtotal = unitPrice * party;
  let derivedSvc = 0; // Will be replaced by multiple promos
  let derivedDisc = 0;

  let remainingParty = party;
  const derivedRows = rows.map(r => {
    const promo = promoById.get(r.promoId) || null
    if (!promo || r.promoId === 'none' || r.passes <= 0 || remainingParty <= 0) {
      return { ...r, discount: 0, paid: 0, comp: 0, disc: 0 }
    }

    const result = multiplePromosDiscCalculation({
      promo,
      party: remainingParty,
      pass: r.passes,
      showPrice: unitPrice,
      originCode,
      baseClubFee,
      baseDayOfShowFee,
      isDayOfShow
    })

    remainingParty -= result.promoParty
    derivedSvc += result.promoServiceChargeDiff
    derivedDisc += result.discount

    return { 
      ...r, 
      discount: result.discount,
      paid: result.tixPaid,
      comp: result.tixComp,
      disc: result.tixDisc 
    }
  })

  // Desktop: multi-promo SVC REPLACES the base club SVC entirely.
  // derivedSvc is already the sum of promo differentials (iPromoParty × (promoFee − clubFee)).
  // Uncovered tickets get NO club SVC add-back per desktop multi-promo behavior.
  // promoFee > clubFee → positive SVC; promoFee < clubFee → negative SVC (reduces total).


  const taxable = Math.max(0, derivedSubtotal + derivedSvc - derivedDisc)
  // taxRate is desktop lblTaxes percent (e.g. 8.875).
  const derivedTaxes = (taxable * taxRate) / 100
  const derivedTotal = taxable + derivedTaxes

  // Remove the old state for subtotal, svc, disc, taxes, total, and just use derived values.
  // Wait, I can still allow manual overwrite by keeping the state, but we should sync it!
  const [subtotal, setSubtotal] = useState(initialSubtotal)
  const [svc, setSvc] = useState(initialSvc)
  const [disc, setDisc] = useState(initialDisc)
  const [taxes, setTaxes] = useState(initialTaxes)
  const [total, setTotal] = useState(initialTotal)

  useEffect(() => {
    if (open) {
      setSubtotal(derivedSubtotal)
      setSvc(derivedSvc)
      setDisc(derivedDisc)
      setTaxes(derivedTaxes)
      setTotal(derivedTotal)
    }
  }, [open, derivedSubtotal, derivedSvc, derivedDisc, derivedTaxes, derivedTotal])

  function updateRow(index: number, updates: Partial<PromoRow>) {
    setRows(current => {
      const next = [...current]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested={nested}
        className='max-w-[700px] p-0 overflow-hidden'
        showCloseButton
      >
        <DialogHeader className='shrink-0 flex-row items-center justify-between gap-4 border-b px-4 py-3'>
          <DialogTitle className='text-base font-semibold text-foreground'>
            Multiple Promotions Confirmation
          </DialogTitle>
        </DialogHeader>

        <div className='p-4'>
          <fieldset className='rounded border border-border/60 p-3 pt-4 relative mt-2'>
            <legend className='absolute -top-2.5 left-2 bg-background px-1 text-[11px] text-muted-foreground'>
              Promotions
            </legend>
            <div className='flex flex-col gap-4 divide-y divide-border/40'>
              {derivedRows.map((row, index) => (
                <div key={index} className={index > 0 ? 'pt-4' : ''}>
                  <div className='grid grid-cols-[1fr_auto_auto] items-center gap-4'>
                    <Select
                      value={row.promoId}
                      onValueChange={val => updateRow(index, { promoId: val })}
                    >
                      <SelectTrigger className='h-8 w-full text-sm bg-white'>
                        <SelectValue placeholder='Select Promo' />
                      </SelectTrigger>
                      <SelectContent>
                        {promoOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium text-foreground whitespace-nowrap'>Passes:</span>
                      <Input
                        type='number'
                        className='h-8 w-16 text-center text-sm bg-white'
                        value={row.passes || ''}
                        onChange={e => updateRow(index, { passes: Number(e.target.value) || 0 })}
                      />
                    </div>
                    
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium text-foreground whitespace-nowrap'>Discount:</span>
                      <Input
                        readOnly
                        className='h-8 w-24 text-sm bg-white'
                        value={formatReservationMoney(row.discount)}
                      />
                    </div>
                  </div>
                  
                  <div className='mt-2 flex items-center justify-end gap-6 text-[13px] px-2'>
                    <div className='flex gap-1.5'>
                      <span className='text-muted-foreground'>Paid:</span>
                      <span className='font-medium'>{row.paid}</span>
                    </div>
                    <div className='flex gap-1.5'>
                      <span className='text-muted-foreground'>Comp:</span>
                      <span className='font-medium'>{row.comp}</span>
                    </div>
                    <div className='flex gap-1.5'>
                      <span className='text-muted-foreground'>Disc:</span>
                      <span className='font-medium'>{row.disc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className='rounded border border-border/60 p-3 pt-4 relative mt-4'>
            <legend className='absolute -top-2.5 left-2 bg-background px-1 text-[11px] text-muted-foreground'>
              Reservation Details
            </legend>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4'>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-muted-foreground w-16 text-right'>Subtotal:</span>
                <Input
                  className='h-8 flex-1 text-sm bg-white'
                  value={formatReservationMoney(subtotal)}
                  onChange={e => {
                    const val = Number(e.target.value.replace(/[^0-9.-]+/g,""))
                    if (!isNaN(val)) setSubtotal(val)
                  }}
                />
              </div>
              
              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-muted-foreground w-12 text-right'>SVC:</span>
                <Input
                  className='h-8 flex-1 text-sm bg-white'
                  value={formatReservationMoney(svc)}
                  onChange={e => {
                    const val = Number(e.target.value.replace(/[^0-9.-]+/g,""))
                    if (!isNaN(val)) setSvc(val)
                  }}
                />
              </div>
              
              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-muted-foreground w-12 text-right'>Disc:</span>
                <Input
                  className='h-8 flex-1 text-sm bg-white'
                  value={formatReservationMoney(disc)}
                  onChange={e => {
                    const val = Number(e.target.value.replace(/[^0-9.-]+/g,""))
                    if (!isNaN(val)) setDisc(val)
                  }}
                />
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-muted-foreground w-16 text-right'>Taxes:</span>
                <Input
                  className='h-8 flex-1 text-sm bg-white'
                  value={formatReservationMoney(taxes)}
                  onChange={e => {
                    const val = Number(e.target.value.replace(/[^0-9.-]+/g,""))
                    if (!isNaN(val)) setTaxes(val)
                  }}
                />
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-muted-foreground w-12 text-right'>Total:</span>
                <Input
                  className='h-8 flex-1 text-sm bg-white font-semibold'
                  value={formatReservationMoney(total)}
                  onChange={e => {
                    const val = Number(e.target.value.replace(/[^0-9.-]+/g,""))
                    if (!isNaN(val)) setTotal(val)
                  }}
                />
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-muted-foreground w-12 text-right'>Party:</span>
                <Input
                  type='number'
                  className='h-8 flex-1 text-center text-sm bg-white'
                  value={party}
                  onChange={e => setParty(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </fieldset>
        </div>

        <DialogFooter className='shrink-0 border-t bg-muted/15 px-4 py-3 sm:justify-end'>
          <Button
            type='button'
            size='sm'
            className='w-32'
            onClick={() => {
              const activeRows = derivedRows
                .filter(r => r.promoId !== 'none' && r.passes > 0)
                .map(r => ({ promoId: r.promoId, passes: r.passes, discount: r.discount }))
              onConfirm(activeRows)
              onOpenChange(false)
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
