import type { CSSProperties, ReactNode } from "react"
import { useState } from "react"
import { Outlet } from "react-router-dom"

import { AppFooter } from "@/components/layout/app-footer"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AdjustFeesDialog } from "@/features/administrator/adjust-fees-dialog"
import { PaymentHistoryDialog } from "@/features/search/payment-history-dialog"
import { SearchReservationDialog } from "@/features/search/search-reservation-dialog"
import { useAppSession } from "@/hooks/use-app-session"
import { usePrefetchDashboard } from "@/hooks/use-prefetch-dashboard"
import { cn } from "@/lib/utils"
import type { NavSubItemAction } from "@/types/navigation"
import type { UserSession } from "@/types/dashboard"

type AppLayoutProps = {
  session: UserSession
  children?: ReactNode
}

function handleSubMenuAction(
  action: NavSubItemAction,
  setAdjustFeesOpen: (open: boolean) => void,
  setSearchReservationOpen: (open: boolean) => void,
  setPaymentHistoryOpen: (open: boolean) => void
) {
  if (action === "adjust-fees") {
    setAdjustFeesOpen(true)
    return
  }

  if (action === "search-reservations") {
    setSearchReservationOpen(true)
    return
  }

  if (action === "search-payments") {
    setPaymentHistoryOpen(true)
  }
}

export function AppLayout({ session }: AppLayoutProps) {
  const { locSName } = useAppSession()
  usePrefetchDashboard()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [adjustFeesOpen, setAdjustFeesOpen] = useState(false)
  const [searchReservationOpen, setSearchReservationOpen] = useState(false)
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false)

  const sidebarWidth = sidebarCollapsed ? "4.25rem" : "16rem"

  return (
    <div
      className="flex min-h-dvh bg-muted"
      style={{ "--app-sidebar-width": sidebarWidth } as CSSProperties}
    >
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
          "fixed inset-y-0 left-0 z-50 h-full shrink-0",
          "lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:self-start",
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
            handleSubMenuAction(
              action,
              setAdjustFeesOpen,
              setSearchReservationOpen,
              setPaymentHistoryOpen
            )
          }
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col pb-10">
        <AdjustFeesDialog
          open={adjustFeesOpen}
          onOpenChange={setAdjustFeesOpen}
        />
        <SearchReservationDialog
          open={searchReservationOpen}
          onOpenChange={setSearchReservationOpen}
        />
        <PaymentHistoryDialog
          open={paymentHistoryOpen}
          onOpenChange={setPaymentHistoryOpen}
        />
        <AppHeader
          session={session}
          onMenuClick={() => setMobileOpen((prev) => !prev)}
        />

        <main className="flex-1">
          <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-4 md:px-5 lg:p-4">
            <Outlet />
          </div>
        </main>
      </div>

      <AppFooter
        locationName={locSName || session.locationName}
        className="fixed inset-x-0 bottom-0 z-20 lg:left-(--app-sidebar-width)"
      />
    </div>
  )
}
