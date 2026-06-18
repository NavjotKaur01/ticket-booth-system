import { FileDown, Printer } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { checkInRecords } from "@/data/check-in"
import { showOptions } from "@/data/reservation"
import {
  CheckInTabs,
  type CheckInTab,
} from "@/features/check-in/check-in-tabs"
import { CheckInDataTable } from "@/features/check-in/data-table"
import { CheckInExpressPanel } from "@/features/check-in/express-panel"
import { CheckInSearchCriteria } from "@/features/check-in/search-criteria"
import { CheckInStatusLegend } from "@/features/check-in/status-legend"
import { CheckInToolbar } from "@/features/check-in/toolbar"
import { AddReservationDialog } from "@/features/reservations/add-reservation-dialog"
import { filterCheckInRecords } from "@/lib/filter-check-in"

/**
 * Check-In page — door/booth workflow for the active show.
 *
 * Two tabs:
 * - Check-In    — toolbar, search, express walk-up
 * - Reservation — guest list and status legend
 */
export function CheckIn() {
  const [activeTab, setActiveTab] = useState<CheckInTab>("check-in")

  // --- Show context (which performance is being checked in) ---
  const [showDate, setShowDate] = useState("2026-06-18")
  const [showTime, setShowTime] = useState(showOptions[0]?.id ?? "")
  const [refreshValue, setRefreshValue] = useState("999")
  const [cancelled, setCancelled] = useState(false)
  const [displayCheckedIn, setDisplayCheckedIn] = useState(false)
  const [cancelledShow, setCancelledShow] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  // --- Search criteria for finding an existing reservation ---
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [ccLast4, setCcLast4] = useState("")
  const [tableNo, setTableNo] = useState("")
  const [phoneNo, setPhoneNo] = useState("")

  const filteredRecords = useMemo(
    () =>
      filterCheckInRecords(checkInRecords, {
        lastName,
        firstName,
        ccLast4,
        tableNo,
        phoneNo,
      }),
    [lastName, firstName, ccLast4, tableNo, phoneNo]
  )

  function clearSearch() {
    setLastName("")
    setFirstName("")
    setCcLast4("")
    setTableNo("")
    setPhoneNo("")
  }

  return (
    <div className="space-y-2">
      <CheckInTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        checkInPanel={
          <div className="space-y-2">
            <CheckInToolbar
              showDate={showDate}
              onShowDateChange={setShowDate}
              showTime={showTime}
              onShowTimeChange={setShowTime}
              refreshValue={refreshValue}
              onRefreshValueChange={setRefreshValue}
              cancelled={cancelled}
              onCancelledChange={setCancelled}
              displayCheckedIn={displayCheckedIn}
              onDisplayCheckedInChange={setDisplayCheckedIn}
              cancelledShow={cancelledShow}
              onCancelledShowChange={setCancelledShow}
              onAddReservation={() => setAddOpen(true)}
            />

            <PanelCard>
              <CheckInSearchCriteria
                lastName={lastName}
                onLastNameChange={setLastName}
                firstName={firstName}
                onFirstNameChange={setFirstName}
                ccLast4={ccLast4}
                onCcLast4Change={setCcLast4}
                tableNo={tableNo}
                onTableNoChange={setTableNo}
                phoneNo={phoneNo}
                onPhoneNoChange={setPhoneNo}
                onClear={clearSearch}
              />
              <CheckInExpressPanel />
            </PanelCard>
          </div>
        }
        reservationPanel={
          <PanelCard>
            <div className="flex items-center justify-end gap-2 border-b px-2.5 py-2 lg:px-3">
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Printer className="size-3.5" />
                Print
              </Button>
              <Button size="sm" className="h-8 gap-1.5">
                <FileDown className="size-3.5" />
                Export
              </Button>
            </div>
            <CheckInStatusLegend recordCount={filteredRecords.length} />
            <CheckInDataTable data={filteredRecords} />
          </PanelCard>
        }
      />

      <AddReservationDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
