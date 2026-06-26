import dayjs from "dayjs"
import { FileDown, Plus, Printer, Zap } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { Button } from "@/components/ui/button"
import { checkInRecords } from "@/data/check-in"
import { getShowOptionsForDate } from "@/data/reservation"
import { CheckInTabBar } from "@/features/check-in/check-in-tab-bar"
import {
  CheckInTabs,
  type CheckInTab,
} from "@/features/check-in/check-in-tabs"
import { CheckInDataTable } from "@/features/check-in/data-table"
import { ExpressWalkupDialog } from "@/features/check-in/dialogs/express-walkup-dialog"
import { CheckInExpressPanel } from "@/features/check-in/express-panel"
import { CheckInSearchCriteria } from "@/features/check-in/search-criteria"
import { CheckInStatusLegend } from "@/features/check-in/status-legend"
import { CheckInToolbar } from "@/features/check-in/toolbar"
import { AddReservationDialog } from "@/features/reservations/add-reservation-dialog"
import { filterCheckInRecords } from "@/lib/filter-check-in"

export function CheckIn() {
  const [activeTab, setActiveTab] = useState<CheckInTab>("check-in")

  const [showDate] = useState(() => dayjs().format("YYYY-MM-DD"))
  const availableShows = useMemo(
    () => getShowOptionsForDate(showDate),
    [showDate]
  )
  const [showTime, setShowTime] = useState(availableShows[0]?.id ?? "")
  const [refreshValue, setRefreshValue] = useState("999")
  const [cancelled, setCancelled] = useState(false)
  const [displayCheckedIn, setDisplayCheckedIn] = useState(false)
  const [cancelledShow, setCancelledShow] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [expressWalkupOpen, setExpressWalkupOpen] = useState(false)

  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [ccLast4, setCcLast4] = useState("")
  const [tableNo, setTableNo] = useState("")
  const [phoneNo, setPhoneNo] = useState("")

  useEffect(() => {
    if (!availableShows.some((show) => show.id === showTime)) {
      setShowTime(availableShows[0]?.id ?? "")
    }
  }, [availableShows, showTime])

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
    <div className="space-y-3">
      <CheckInTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          activeTab === "check-in" ? (
            <>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="size-3.5" />
                Add Reservation
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={() => setExpressWalkupOpen(true)}
              >
                <Zap className="size-3.5" />
                Express Walkup
              </Button>
            </>
          ) : undefined
        }
      />

      <CheckInTabs
        activeTab={activeTab}
        checkInPanel={
          <div className="space-y-2">
            <CheckInToolbar
              showDate={showDate}
              onShowDateChange={() => undefined}
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
              shows={availableShows}
              disableShowDateChange
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
            </PanelCard>

            <PanelCard>
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
      <ExpressWalkupDialog
        open={expressWalkupOpen}
        onOpenChange={setExpressWalkupOpen}
        showDate={showDate}
        showTimeId={showTime}
        shows={availableShows}
      />
    </div>
  )
}

