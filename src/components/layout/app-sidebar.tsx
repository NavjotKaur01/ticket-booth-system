import { ChevronLeft, ChevronRight, Ticket } from "lucide-react"

import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation"
import { quickLinks } from "@/data/dashboard-data"
import { ScrollArea } from "@/components/ui/scroll-area"
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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="size-4 shrink-0" />
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
        "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <a
        href="#"
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-4 transition-colors hover:bg-sidebar-accent",
          collapsed && "justify-center px-2"
        )}
      >
        <Ticket className="size-6 shrink-0 text-sidebar-primary" />
        {!collapsed && (
          <div className="ml-2.5 min-w-0">
            <p className="truncate text-sm font-bold">ClubMan</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {session.organization}
            </p>
          </div>
        )}
      </a>

      {!collapsed && (
        <div className="border-b border-sidebar-border px-4 py-3 text-xs">
          <p className="font-medium">Welcome {session.username}</p>
          <p className="mt-0.5 text-muted-foreground">
            Last login {session.lastLogin}
          </p>
        </div>
      )}

      <ScrollArea className="flex-1 py-3">
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
            <nav className="px-4 pb-2" aria-label="Quick links">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quick Links
              </h2>
              <ul className="space-y-1.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-lg border border-sidebar-border p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
