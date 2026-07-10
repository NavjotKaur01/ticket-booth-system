import { useMemo } from "react"

import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation"
import { useAppSession } from "@/hooks/use-app-session"
import {
  readGiftCardNavVisible,
  readGiftCertificateNavVisible,
} from "@/lib/gift-nav-defaults"
import { useGetSystemDefaultsQuery } from "@/store/api/clubmanApi"
import type { NavItem, NavSubItem } from "@/types/navigation"

const GIFT_CARD_NAV_ID = "gift-cards"
const GIFT_CERTIFICATE_NAV_ID = "gift-certificate"

function filterNavSubItems(
  items: NavSubItem[],
  visibility: { giftCards: boolean; giftCertificate: boolean }
): NavSubItem[] {
  return items
    .filter((item) => {
      if (item.hidden) {
        return false
      }

      if (item.id === GIFT_CARD_NAV_ID) {
        return visibility.giftCards
      }

      if (item.id === GIFT_CERTIFICATE_NAV_ID) {
        return visibility.giftCertificate
      }

      return true
    })
    .map((item) => {
      if (!item.items?.length) {
        return item
      }

      return {
        ...item,
        items: filterNavSubItems(item.items, visibility),
      }
    })
}

function filterNavItems(
  items: NavItem[],
  visibility: { giftCards: boolean; giftCertificate: boolean }
): NavItem[] {
  return items
    .map((item) => {
      if (!item.items?.length) {
        return item
      }

      const filteredItems = filterNavSubItems(item.items, visibility)
      if (filteredItems.length === 0) {
        return null
      }

      return {
        ...item,
        items: filteredItems,
      }
    })
    .filter((item): item is NavItem => item !== null)
}

export function useFilteredSidebarNav() {
  const { connectionName, locationId, isReady } = useAppSession()
  const { data: systemDefaults = [], isFetching } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !isReady }
  )

  const navItems = useMemo(() => {
    const visibility = {
      giftCards: readGiftCardNavVisible(systemDefaults),
      giftCertificate: readGiftCertificateNavVisible(systemDefaults),
    }

    return filterNavItems(SIDEBAR_NAV_ITEMS, visibility)
  }, [systemDefaults])

  return {
    navItems,
    isLoading: isReady && isFetching && systemDefaults.length === 0,
  }
}
