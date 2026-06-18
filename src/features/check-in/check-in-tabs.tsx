import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type CheckInTab = "check-in" | "reservation"

const TABS: { id: CheckInTab; label: string }[] = [
  { id: "check-in", label: "Check-In" },
  { id: "reservation", label: "Reservation" },
]

type CheckInTabsProps = {
  activeTab: CheckInTab
  onTabChange: (tab: CheckInTab) => void
  checkInPanel: ReactNode
  reservationPanel: ReactNode
}

/** Switches between booth check-in tools and the reservation guest list. */
export function CheckInTabs({
  activeTab,
  onTabChange,
  checkInPanel,
  reservationPanel,
}: CheckInTabsProps) {
  return (
    <div className="space-y-2">
      <div
        role="tablist"
        aria-label="Check-in views"
        className="inline-flex rounded-sm border border-border bg-muted/30 p-0.5"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-sm px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === "check-in" ? checkInPanel : reservationPanel}
      </div>
    </div>
  )
}
