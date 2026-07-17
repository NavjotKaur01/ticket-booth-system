import { useMemo } from "react"

import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation"
import { useAppSession } from "@/hooks/use-app-session"
import {
  canAccessAdministrator,
  canAccessVenueManager,
} from "@/lib/auth/user-rights"
import {
  readGiftCardNavVisible,
  readGiftCertificateNavVisible,
} from "@/lib/gift-nav-defaults"
import { useGetSystemDefaultsQuery } from "@/store/api/clubmanApi"
import type { NavItem, NavSubItem } from "@/types/navigation"

const GIFT_CARD_NAV_ID = "gift-cards"
const GIFT_CERTIFICATE_NAV_ID = "gift-certificate"
const ADMINISTRATOR_NAV_ID = "administrator"
const VENUE_MANAGER_NAV_ID = "venue-manager"

type NavVisibility = {
  giftCards: boolean
  giftCertificate: boolean
  administrator: boolean
  venueManager: boolean
}

function filterNavSubItems(
  items: NavSubItem[],
  visibility: NavVisibility
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
  visibility: NavVisibility
): NavItem[] {
  return items
    .map((item) => {
      if (item.id === ADMINISTRATOR_NAV_ID && !visibility.administrator) {
        return null
      }

      if (item.id === VENUE_MANAGER_NAV_ID && !visibility.venueManager) {
        return null
      }

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
  const { connectionName, locationId, isReady, userRight } = useAppSession()
  const { data: systemDefaults = [], isFetching } = useGetSystemDefaultsQuery(
    { connectionName, locationId },
    { skip: !isReady }
  )

  const navItems = useMemo(() => {
    const visibility: NavVisibility = {
      giftCards: readGiftCardNavVisible(systemDefaults),
      giftCertificate: readGiftCertificateNavVisible(systemDefaults),
      administrator: canAccessAdministrator(userRight),
      venueManager: canAccessVenueManager(userRight),
    }

    return filterNavItems(SIDEBAR_NAV_ITEMS, visibility)
  }, [systemDefaults, userRight])

  return {
    navItems,
    isLoading: isReady && isFetching && systemDefaults.length === 0,
  }
}
