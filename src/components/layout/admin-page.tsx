import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export const ADMIN_PAGE_CLASS = "min-w-0 space-y-3"

export const ADMIN_PAGE_TITLE_CLASS =
  "text-xl font-semibold tracking-tight text-foreground break-words"

export const ADMIN_PANEL_TOOLBAR_CLASS =
  "flex flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-2"

export const ADMIN_PANEL_STATS_CLASS = "min-w-0 text-xs text-muted-foreground"

export const ADMIN_PANEL_ACTIONS_CLASS =
  "flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end"

export const ADMIN_SPLIT_PANEL_2COL_CLASS =
  "grid min-w-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0"

export const ADMIN_SPLIT_PANEL_NAV_CLASS =
  "grid min-w-0 divide-y lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:divide-x lg:divide-y-0"

export const ADMIN_SECTION_BANNER_CLASS = "border-b bg-muted/30 px-3 py-2"

export const ADMIN_SECTION_BANNER_TEXT_CLASS =
  "text-center text-xs font-semibold tracking-wide text-foreground sm:text-left"

type AdminPageShellProps = {
  children: ReactNode
  className?: string
}

export function AdminPageShell({ children, className }: AdminPageShellProps) {
  return <div className={cn(ADMIN_PAGE_CLASS, className)}>{children}</div>
}

type AdminPageTitleProps = {
  children: ReactNode
  className?: string
}

export function AdminPageTitle({ children, className }: AdminPageTitleProps) {
  return <h1 className={cn(ADMIN_PAGE_TITLE_CLASS, className)}>{children}</h1>
}

type AdminPanelToolbarProps = {
  children: ReactNode
  className?: string
}

export function AdminPanelToolbar({ children, className }: AdminPanelToolbarProps) {
  return <div className={cn(ADMIN_PANEL_TOOLBAR_CLASS, className)}>{children}</div>
}

type AdminPanelActionsProps = {
  children: ReactNode
  className?: string
}

export function AdminPanelActions({ children, className }: AdminPanelActionsProps) {
  return <div className={cn(ADMIN_PANEL_ACTIONS_CLASS, className)}>{children}</div>
}

type AdminPanelStatsProps = {
  children: ReactNode
  className?: string
}

export function AdminPanelStats({ children, className }: AdminPanelStatsProps) {
  return <p className={cn(ADMIN_PANEL_STATS_CLASS, className)}>{children}</p>
}
