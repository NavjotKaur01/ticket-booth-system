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
  { id: "administrator", label: "Administrator", href: "#", icon: Settings },
  { id: "ticketbooth", label: "Ticketbooth", href: "#", icon: Ticket },
  { id: "reports", label: "Reports", href: "#", icon: BarChart3 },
  { id: "calendar", label: "Calendar", href: "#", icon: Calendar },
  { id: "reservations", label: "Reservations", href: ROUTES.reservations, icon: Bookmark },
  { id: "check-in", label: "Check-In", href: ROUTES.checkIn, icon: UserCheck },
  { id: "transactions", label: "Transactions", href: "#", icon: Receipt },
  { id: "search", label: "Search", href: "#", icon: Search },
  { id: "my-account", label: "My Account", href: "#", icon: User },
]

export const APP_VERSION = "2.0.0.127"
