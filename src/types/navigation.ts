import type { LucideIcon } from "lucide-react"

export type NavSubItem = {
  id: string
  label: string
  href?: string
}

export type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  items?: NavSubItem[]
}
