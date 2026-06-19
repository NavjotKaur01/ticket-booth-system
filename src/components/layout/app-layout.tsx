import type { ReactNode } from "react"
import { useState } from "react"
import { Outlet } from "react-router-dom"

import { AppFooter } from "@/components/layout/app-footer"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AdjustFeesDialog } from "@/features/administrator/adjust-fees-dialog"
import { cn } from "@/lib/utils"
import type { NavSubItemAction } from "@/types/navigation"
import type { UserSession } from "@/types/dashboard"

type AppLayoutProps = {
  session: UserSession
  children?: ReactNode
}

function handleSubMenuAction(
  action: NavSubItemAction,
  setAdjustFeesOpen: (open: boolean) => void
) {
  if (action === "adjust-fees") {
    setAdjustFeesOpen(true)
  }
}

export function AppLayout({ session }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [adjustFeesOpen, setAdjustFeesOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full shrink-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300"
        )}
      >
        <AppSidebar
          session={session}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onNavigate={() => setMobileOpen(false)}
          onSubMenuAction={(action) =>
            handleSubMenuAction(action, setAdjustFeesOpen)
          }
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdjustFeesDialog
          open={adjustFeesOpen}
          onOpenChange={setAdjustFeesOpen}
        />
        <AppHeader
          session={session}
          onMenuClick={() => setMobileOpen((prev) => !prev)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] p-3 lg:p-4">
            <Outlet />
          </div>
        </main>

        <AppFooter organization={session.organization} />
      </div>
    </div>
  )
}
