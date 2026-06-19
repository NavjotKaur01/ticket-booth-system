import { ChevronLeft, ChevronRight, Ticket } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation"
import { ROUTES } from "@/constants/routes"
import { quickLinks } from "@/data/dashboard"
import { cn } from "@/lib/utils"
import type { NavItem, NavSubItemAction } from "@/types/navigation"
import type { UserSession } from "@/types/dashboard"

type AppSidebarProps = {
  session: UserSession
  collapsed: boolean
  onToggleCollapse: () => void
  onNavigate?: () => void
  onSubMenuAction?: (action: NavSubItemAction) => void
}

function isNavActive(pathname: string, href: string) {
  if (href === ROUTES.dashboard) return pathname === ROUTES.dashboard
  if (href.startsWith("/")) return pathname === href
  return false
}

function navButtonClassName(active: boolean, collapsed: boolean) {
  return cn(
    "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    collapsed && "justify-center px-2"
  )
}

function NavLinkItem({
  item,
  collapsed,
  active,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  const className = navButtonClassName(active, collapsed)

  const content = (
    <>
      <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  )

  const link = item.href.startsWith("/") ? (
    <Link to={item.href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  ) : (
    <a href={item.href} className={className}>
      {content}
    </a>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

function NavCollapsibleItem({
  item,
  collapsed,
  openMenuId,
  onOpenMenuChange,
  onNavigate,
  onSubMenuAction,
}: {
  item: NavItem
  collapsed: boolean
  openMenuId: string | null
  onOpenMenuChange: (id: string | null) => void
  onNavigate?: () => void
  onSubMenuAction?: (action: NavSubItemAction) => void
}) {
  const Icon = item.icon
  const isOpen = openMenuId === item.id

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={navButtonClassName(false, collapsed)}>
            <Icon className="size-4 shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => onOpenMenuChange(open ? item.id : null)}
      className="group/collapsible"
    >
      <CollapsibleTrigger asChild>
        <button type="button" className={navButtonClassName(false, collapsed)}>
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
          <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 space-y-0.5 border-l border-sidebar-border py-0.5 pl-2.5">
          {item.items?.map((subItem) =>
            subItem.href ? (
              <Link
                key={subItem.id}
                to={subItem.href}
                onClick={onNavigate}
                className="block rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {subItem.label}
              </Link>
            ) : (
              <button
                key={subItem.id}
                type="button"
                onClick={() => {
                  if (subItem.action) {
                    onSubMenuAction?.(subItem.action)
                  }
                  onNavigate?.()
                }}
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {subItem.label}
              </button>
            )
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function AppSidebar({
  session,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onSubMenuAction,
}: AppSidebarProps) {
  const { pathname } = useLocation()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-[width] duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <Link
        to={ROUTES.dashboard}
        onClick={onNavigate}
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border px-4 transition-colors hover:bg-accent/50",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Ticket className="size-5 shrink-0 text-primary" />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-bold text-foreground">ClubMan</p>
            <p className="truncate text-xs text-muted-foreground">
              {session.organization}
            </p>
          </div>
        )}
      </Link>

      {!collapsed && (
        <div className="shrink-0 border-b border-sidebar-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            Welcome {session.username}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Last login {session.lastLogin}
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        <nav className="space-y-0.5 px-3" aria-label="Main navigation">
          {SIDEBAR_NAV_ITEMS.map((item) =>
            item.items?.length ? (
              <NavCollapsibleItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                openMenuId={openMenuId}
                onOpenMenuChange={setOpenMenuId}
                onNavigate={onNavigate}
                onSubMenuAction={onSubMenuAction}
              />
            ) : (
              <NavLinkItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                active={isNavActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            )
          )}
        </nav>

        {!collapsed && (
          <>
            <Separator className="my-4" />
            <nav className="px-4" aria-label="Quick links">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Links
              </h2>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-lg border border-sidebar-border bg-background p-2.5 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
