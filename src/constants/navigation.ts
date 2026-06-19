import {
  BarChart3,
  Bookmark,
  Calendar,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  Ticket,
  User,
  UserCheck,
} from "lucide-react"

import { ROUTES } from "@/constants/routes"
import type { NavItem } from "@/types/navigation"

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
  {
    id: "administrator",
    label: "Administrator",
    href: "#",
    icon: Settings,
    items: [
      { id: "adjust-fees", label: "Adjust Fees", action: "adjust-fees" },
      { id: "comedians", label: "Comedians", href: ROUTES.performers },
      { id: "customer", label: "Customer", href: ROUTES.searchCustomer },
      { id: "marketing-filter", label: "Marketing Filter", href: ROUTES.marketingFilter },
      { id: "promotions", label: "Promotions", href: ROUTES.promotions },
      { id: "show-times", label: "Show Times", href: ROUTES.showTimes },
      {
        id: "pre-sale-private-show",
        label: "Pre-Sale Private Show",
        href: ROUTES.preSalePrivateShow,
      },
      { id: "system-defaults", label: "System Defaults", href: ROUTES.systemDefaults },
      { id: "user-access", label: "User Access", href: ROUTES.userAccess },
      { id: "user", label: "User", href: ROUTES.users },
    ],
  },
  {
    id: "ticketbooth",
    label: "Ticketbooth",
    href: "#",
    icon: Ticket,
    items: [
      { id: "business-contacts", label: "Business Contacts", href: ROUTES.businessContacts },
      { id: "comment-cards", label: "Comment Cards", href: ROUTES.commentCards },
      { id: "gift-cards", label: "Gift Cards", href: ROUTES.giftCards },
      { id: "gift-certificate", label: "Gift Certificate" },
    ],
  },
  { id: "reports", label: "Reports", href: ROUTES.reports, icon: BarChart3 },
  { id: "calendar", label: "Calendar", href: "#", icon: Calendar },
  { id: "reservations", label: "Reservations", href: ROUTES.reservations, icon: Bookmark },
  { id: "check-in", label: "Check-In", href: ROUTES.checkIn, icon: UserCheck },
  { id: "transactions", label: "Transactions", href: ROUTES.transactions, icon: Receipt },
  {
    id: "search",
    label: "Search",
    href: "#",
    icon: Search,
    items: [
      { id: "search-reservations", label: "Search", action: "search-reservations" },
      {
        id: "search-payments",
        label: "Search Payments",
        action: "search-payments",
      },
    ],
  },
  {
    id: "my-account",
    label: "My Account",
    href: "#",
    icon: User,
    items: [
      { id: "my-account", label: "My Account" },
      { id: "app-updates", label: "App Updates" },
      { id: "touch", label: "Touch", href: ROUTES.touch },
      { id: "ticket-default", label: "Ticket Default", href: ROUTES.ticketDefault },
      { id: "change-password", label: "Change Password", href: ROUTES.changePassword },
      { id: "open-log-folder", label: "Open Log Folder", action: "open-log-folder" },
      { id: "logout", label: "Logout" },
      { id: "exit", label: "Exit" },
    ],
  },
]

export const APP_VERSION = "2.0.0.127"
