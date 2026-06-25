import type { ReactNode } from "react"

export type CheckInTab = "check-in" | "reservation"

type CheckInTabsProps = {
  activeTab: CheckInTab
  checkInPanel: ReactNode
  reservationPanel: ReactNode
}

export function CheckInTabs({
  activeTab,
  checkInPanel,
  reservationPanel,
}: CheckInTabsProps) {
  return (
    <div role="tabpanel">
      {activeTab === "check-in" ? checkInPanel : reservationPanel}
    </div>
  )
}
