import type { ReactNode } from "react"

import { SegmentedTabList } from "@/components/common/segmented-tab-list"

import type { CheckInTab } from "@/features/check-in/check-in-tabs"

const TABS = [
  { id: "check-in" as const, label: "Check-In" },
  { id: "reservation" as const, label: "Reservation" },
]

type CheckInTabBarProps = {
  activeTab: CheckInTab
  onTabChange: (tab: CheckInTab) => void
  actions?: ReactNode
}

export function CheckInTabBar({
  activeTab,
  onTabChange,
  actions,
}: CheckInTabBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <SegmentedTabList
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={onTabChange}
        ariaLabel="Check-in views"
      />
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
