import { FileDown, Printer } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { checkInRecords } from "@/data/check-in"
import { showOptions } from "@/data/reservation"
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
 * Layout (top → bottom):
 * 1. Toolbar  — show context, actions, live seat counts
 * 2. Work panel — search existing guests + express walk-up sale
 * 3. Table    — status legend + guest list
 */
export function CheckIn() {
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
    <div className="space-y-2.5">
      {/* Page header with output actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Check In
        </h1>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Printer className="size-3.5" />
            Print
          </Button>
          <Button size="sm" className="h-8 gap-1.5">
            <FileDown className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Show filters, booth actions, and live seat counts */}
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

      {/* Search existing guests (top) + express walk-up sale (bottom) */}
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

      {/* Guest list with status legend */}
      <PanelCard>
        <CheckInStatusLegend recordCount={filteredRecords.length} />
        <CheckInDataTable data={filteredRecords} />
      </PanelCard>

      <AddReservationDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
