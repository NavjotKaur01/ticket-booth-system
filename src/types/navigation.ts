import type { LucideIcon } from "lucide-react"

export type NavSubItemAction =
  | "adjust-fees"
  | "search-reservations"
  | "search-payments"

export type NavSubItem = {
  id: string
  label: string
  href?: string
  action?: NavSubItemAction
}

export type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  items?: NavSubItem[]
}
