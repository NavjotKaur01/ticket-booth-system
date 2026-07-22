import type { ReactNode } from "react"
import { useState } from "react"
import { Outlet } from "react-router-dom"

import { AppFooter } from "@/components/layout/app-footer"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AdjustFeesDialog } from "@/features/administrator/adjust-fees-dialog"
import { ChangePasswordDialog } from "@/features/change-password/change-password-dialog"
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
  setPaymentHistoryOpen: (open: boolean) => void,
  setChangePasswordOpen: (open: boolean) => void
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
    return
  }

  if (action === "change-password") {
    setChangePasswordOpen(true)
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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden bg-muted">
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
            handleSubMenuAction(
              action,
              setAdjustFeesOpen,
              setSearchReservationOpen,
              setPaymentHistoryOpen,
              setChangePasswordOpen
            )
          }
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
        <ChangePasswordDialog
          open={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
        />
        <AppHeader
          session={session}
          onMenuClick={() => setMobileOpen((prev) => !prev)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full min-h-0 max-w-[1600px] flex-col px-3 py-3 sm:px-4 md:px-5 lg:p-4">
            <Outlet />
          </div>
        </main>

        <AppFooter locationName={locSName || session.locationName} />
      </div>
    </div>
  )
}
