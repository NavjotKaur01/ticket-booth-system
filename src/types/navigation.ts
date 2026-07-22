import type { LucideIcon } from "lucide-react"

export type NavSubItemAction =
  | "adjust-fees"
  | "search-reservations"
  | "search-payments"
  | "change-password"
  | "ticket-default"

export type NavSubItem = {
  id: string
  label: string
  href?: string
  action?: NavSubItemAction
  items?: NavSubItem[]
  hidden?: boolean
}

export type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  items?: NavSubItem[]
}
