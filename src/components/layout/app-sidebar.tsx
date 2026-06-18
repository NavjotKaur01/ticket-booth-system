import { ChevronLeft, ChevronRight, Ticket } from "lucide-react"

import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation"
import { quickLinks } from "@/data/dashboard-data"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"
import type { UserSession } from "@/types/dashboard"

type AppSidebarProps = {
  session: UserSession
  collapsed: boolean
  onToggleCollapse: () => void
  activeItemId?: string
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
}) {
  const Icon = item.icon

  const link = (
    <a
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
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

export function AppSidebar({
  session,
  collapsed,
  onToggleCollapse,
  activeItemId = "dashboard",
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-[width] duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <a
        href="#"
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
      </a>

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
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              collapsed={collapsed}
              active={item.id === activeItemId}
            />
          ))}
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
