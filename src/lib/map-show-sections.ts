import {
  formatSectionDesktopPrice,
  formatSectionOptionLabel
} from '@/data/reservation'
import type { ShowSectionItem } from '@/types/api/show-sections'
import type { ReservationSectionOption } from '@/types/reservation'

function sectionTone(name: string): ReservationSectionOption['tone'] {
  return name.toLowerCase().includes('vip') ? 'vip' : 'regular'
}

export function mapShowSectionsToOptions(
  sections: ShowSectionItem[]
): ReservationSectionOption[] {
  return sections.map(section => {
    const name = section.LookupSDesc?.trim() || 'Section'
    const priceValue = section.ShowPrice ?? 0
    let priceMultiplier = 1
    const secCode = section.ShowSec?.trim().toUpperCase() ?? ''
    if (['SECT12', 'SECT16', 'SECT15', 'SECT05'].includes(secCode)) {
      priceMultiplier = 2
    } else if (['SECT13', 'SECT17'].includes(secCode)) {
      priceMultiplier = 4
    } else if (['SECT10'].includes(secCode)) {
      priceMultiplier = 6
    }

    const effectivePriceValue = priceValue * priceMultiplier
    const price = formatSectionDesktopPrice(
      effectivePriceValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    )

    const seats = section.ShowSeats ?? 0
    const available = section.ShowSectionAvialiableSeats ?? 0
    const label = formatSectionOptionLabel({
      price,
      name,
      seats,
      available
    })

    return {
      id: section.ShowDetID,
      label,
      price,
      priceMultiplier,
      name,
      seats,
      available,
      tone: sectionTone(name),
      showId: section.ShowID,
      showDetId: section.ShowDetID,
      showSec: section.ShowSec,
      showPrice: priceValue,
      showDinner: section.ShowDinner?.trim().toUpperCase() ?? 'N',
      dayOfShowFee: section.DayOfShowCharge ?? 0,
      phoneInFee: section.PhoneCharge ?? 0,
      walkUpFee: section.WalkupCharge ?? 0,
      webFee: section.WebCharge ?? 0,
      // Desktop AdjustSeatModel section SVC (used when ShowSectionFee / Use Section Fee = Y)
      phoneSvcCharge: section.PhoneSvcCharge ?? 0,
      walkupSvcCharge: section.WalkupSvcCharge ?? 0,
      webSvcCharge: section.WebSvcCharge ?? 0,
      restrictPromoForSection:
        (section.RestrictPromoForSection ?? section.ShowDetRestrictPromo ?? "")
          .trim()
          .toUpperCase() === "Y",
    }
  })
}
