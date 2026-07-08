import { ChevronLeft, ChevronRight, Ticket } from "lucide-react"
import { useEffect, useState } from "react"
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
import { ROUTES } from "@/constants/routes"
import { quickLinks } from "@/data/dashboard"
import { useAppSession } from "@/hooks/use-app-session"
import { useFilteredSidebarNav } from "@/hooks/use-filtered-sidebar-nav"
import { cn } from "@/lib/utils"
import type { NavItem, NavSubItem, NavSubItemAction } from "@/types/navigation"
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

function hasActiveSubItem(pathname: string, item: NavSubItem): boolean {
  if (item.href && isNavActive(pathname, item.href)) {
    return true
  }

  return item.items?.some((childItem) => hasActiveSubItem(pathname, childItem)) ?? false
}

function getParentMenuIdForPath(
  pathname: string,
  navItems: NavItem[]
): string | null {
  for (const item of navItems) {
    if (item.items?.some((subItem) => hasActiveSubItem(pathname, subItem))) {
      return item.id
    }
  }
  return null
}

function getActiveSubMenuId(pathname: string, items: NavSubItem[]): string | null {
  for (const item of items) {
    if (item.items?.length && hasActiveSubItem(pathname, item)) {
      return item.id
    }
  }
  return null
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

function subItemButtonClassName(active: boolean, depth: number) {
  return cn(
    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors",
    depth === 0 ? "text-xs font-medium" : "text-xs",
    active
      ? "text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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

function NavSubTreeList({
  items,
  pathname,
  depth,
  onNavigate,
  onSubMenuAction,
}: {
  items: NavSubItem[]
  pathname: string
  depth: number
  onNavigate?: () => void
  onSubMenuAction?: (action: NavSubItemAction) => void
}) {
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(() =>
    getActiveSubMenuId(pathname, items)
  )

  useEffect(() => {
    const activeSubMenuId = getActiveSubMenuId(pathname, items)
    if (activeSubMenuId) {
      setOpenSubMenuId(activeSubMenuId)
    }
  }, [pathname, items])

  return (
    <>
      {items.map((subItem) => (
        <NavSubTreeItem
          key={subItem.id}
          item={subItem}
          pathname={pathname}
          depth={depth}
          openSubMenuId={openSubMenuId}
          onOpenSubMenuChange={setOpenSubMenuId}
          onNavigate={onNavigate}
          onSubMenuAction={onSubMenuAction}
        />
      ))}
    </>
  )
}

function NavSubTreeItem({
  item,
  pathname,
  depth,
  openSubMenuId,
  onOpenSubMenuChange,
  onNavigate,
  onSubMenuAction,
}: {
  item: NavSubItem
  pathname: string
  depth: number
  openSubMenuId?: string | null
  onOpenSubMenuChange?: (id: string | null) => void
  onNavigate?: () => void
  onSubMenuAction?: (action: NavSubItemAction) => void
}) {
  const hasChildren = Boolean(item.items?.length)
  const active = hasActiveSubItem(pathname, item)
  const usesAccordion = hasChildren && onOpenSubMenuChange !== undefined
  const [isOpen, setIsOpen] = useState(active)
  const expanded = usesAccordion ? openSubMenuId === item.id : isOpen

  useEffect(() => {
    if (!active) {
      return
    }

    if (usesAccordion && onOpenSubMenuChange) {
      onOpenSubMenuChange(item.id)
      return
    }

    setIsOpen(true)
  }, [active, item.id, onOpenSubMenuChange, usesAccordion])

  function handleOpenChange(open: boolean) {
    if (usesAccordion && onOpenSubMenuChange) {
      onOpenSubMenuChange(open ? item.id : null)
      return
    }

    setIsOpen(open)
  }

  if (hasChildren) {
    return (
      <Collapsible
        open={expanded}
        onOpenChange={handleOpenChange}
        className="group/sub-collapsible"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={subItemButtonClassName(active, depth)}
          >
            <span className="truncate">{item.label}</span>
            <ChevronRight className="ml-auto size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={cn(
              "space-y-0.5 border-l border-sidebar-border py-0.5",
              depth === 0 ? "ml-3.5 pl-2.5" : "ml-4 pl-2.5"
            )}
          >
            <NavSubTreeList
              items={item.items ?? []}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
              onSubMenuAction={onSubMenuAction}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  if (item.href) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={subItemButtonClassName(active, depth)}
      >
        <span className="truncate">{item.label}</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (item.action) {
          onSubMenuAction?.(item.action)
        }
        onNavigate?.()
      }}
      className={cn(subItemButtonClassName(false, depth), "w-full")}
    >
      <span className="truncate">{item.label}</span>
    </button>
  )
}

function NavCollapsibleItem({
  item,
  collapsed,
  pathname,
  openMenuId,
  onOpenMenuChange,
  onNavigate,
  onSubMenuAction,
}: {
  item: NavItem
  collapsed: boolean
  pathname: string
  openMenuId: string | null
  onOpenMenuChange: (id: string | null) => void
  onNavigate?: () => void
  onSubMenuAction?: (action: NavSubItemAction) => void
}) {
  const Icon = item.icon
  const isOpen = openMenuId === item.id
  const hasActiveChild = item.items?.some((subItem) => hasActiveSubItem(pathname, subItem))

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
        <button
          type="button"
          className={navButtonClassName(hasActiveChild ?? false, collapsed)}
        >
          <Icon
            className={cn(
              "size-4 shrink-0",
              hasActiveChild && "text-primary"
            )}
          />
          <span className="truncate">{item.label}</span>
          <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 space-y-0.5 border-l border-sidebar-border py-0.5 pl-2.5">
          <NavSubTreeList
            items={item.items ?? []}
            pathname={pathname}
            depth={0}
            onNavigate={onNavigate}
            onSubMenuAction={onSubMenuAction}
          />
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
  const { locSName } = useAppSession()
  const { navItems } = useFilteredSidebarNav()
  const [openMenuId, setOpenMenuId] = useState<string | null>(() =>
    getParentMenuIdForPath(pathname, navItems)
  )

  useEffect(() => {
    const parentMenuId = getParentMenuIdForPath(pathname, navItems)
    if (parentMenuId) {
      setOpenMenuId(parentMenuId)
    }
  }, [pathname, navItems])

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
              {locSName || session.locationName}
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
          {navItems.map((item) =>
            item.items?.length ? (
              <NavCollapsibleItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
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
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        onClick={onNavigate}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </a>
                    )}
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

