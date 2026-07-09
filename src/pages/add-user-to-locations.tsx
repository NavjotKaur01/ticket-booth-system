import { Check, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
  ADMIN_SPLIT_PANEL_2COL_CLASS,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { UserSetupColumn } from "@/features/user-setup/user-setup-column"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import { userSetupLocations, userSetupUsers } from "@/data/user-setup"
import { cn } from "@/lib/utils"

export function AddUserToLocations() {
  const [selectedLocation, setSelectedLocation] = useState(userSetupLocations[3])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [assignedUsers, setAssignedUsers] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(userSetupLocations.map((location) => [location, []]))
  )
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  const locationAssignments = useMemo(
    () => assignedUsers[selectedLocation] ?? [],
    [assignedUsers, selectedLocation]
  )

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()
    if (!query) return userSetupUsers
    return userSetupUsers.filter((userName) =>
      userName.toLowerCase().includes(query)
    )
  }, [userSearch])

  function toggleUser(userName: string, checked: boolean) {
    setSelectedUsers((current) =>
      checked
        ? [...current, userName]
        : current.filter((item) => item !== userName)
    )
  }

  function toggleAllUsers() {
    const visibleUsers = filteredUsers
    const allVisibleSelected = visibleUsers.every((userName) =>
      selectedUsers.includes(userName)
    )

    setSelectedUsers((current) => {
      if (allVisibleSelected) {
        return current.filter((userName) => !visibleUsers.includes(userName))
      }

      return Array.from(new Set([...current, ...visibleUsers]))
    })
  }

  function addSelected() {
    if (selectedUsers.length === 0) {
      setMessageVariant("error")
      setMessage("Select at least one user to add.")
      return
    }

    const count = selectedUsers.length
    setAssignedUsers((current) => ({
      ...current,
      [selectedLocation]: Array.from(
        new Set([...(current[selectedLocation] ?? []), ...selectedUsers])
      ),
    }))
    setSelectedUsers([])
    setMessageVariant("success")
    setMessage(`Added ${count} user(s) to ${selectedLocation}.`)
  }

  function removeSelected() {
    if (selectedUsers.length === 0) {
      setMessageVariant("error")
      setMessage("Select at least one user to remove.")
      return
    }

    const count = selectedUsers.length
    setAssignedUsers((current) => ({
      ...current,
      [selectedLocation]: (current[selectedLocation] ?? []).filter(
        (userName) => !selectedUsers.includes(userName)
      ),
    }))
    setSelectedUsers([])
    setMessageVariant("success")
    setMessage(`Removed ${count} user(s) from ${selectedLocation}.`)
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>Administration - Add User to Location(s)</AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar>
          <AdminPanelStats>
            Location:{" "}
            <span className="font-semibold text-foreground">{selectedLocation}</span>
            {" · "}
            Assigned:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {locationAssignments.length}
            </span>
            {" · "}
            Selected:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {selectedUsers.length}
            </span>
          </AdminPanelStats>

          <AdminPanelActions>
            <Button type="button" variant="outline" size="sm" onClick={toggleAllUsers}>
              Toggle All Users
            </Button>
            <Button type="button" size="sm" onClick={addSelected}>
              Add Selected
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={removeSelected}>
              Remove Selected
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <div className={ADMIN_SPLIT_PANEL_2COL_CLASS}>
          <UserSetupColumn title="Location">
            <div className="calendar-thin-scrollbar max-h-96 space-y-1 overflow-y-auto">
              {userSetupLocations.map((location) => {
                const active = location === selectedLocation
                const count = assignedUsers[location]?.length ?? 0

                return (
                  <button
                    key={location}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(location)
                      setSelectedUsers([])
                      setMessage(null)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "border-primary/30 bg-primary/10 font-medium text-primary"
                        : "border-transparent hover:bg-muted/40"
                    )}
                  >
                    <span className="truncate">{location}</span>
                    {count > 0 ? (
                      <span className="ml-2 shrink-0 text-xs tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </UserSetupColumn>

          <UserSetupColumn
            title="Users"
            headerRight={
              <span className="text-xs tabular-nums text-muted-foreground">
                {filteredUsers.length} shown
              </span>
            }
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users..."
                  className="h-9 pl-8"
                />
              </div>

              <div className="calendar-thin-scrollbar max-h-96 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {filteredUsers.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    No users match your search.
                  </p>
                ) : (
                  filteredUsers.map((userName) => {
                    const checked = selectedUsers.includes(userName)
                    const assigned = locationAssignments.includes(userName)
                    const inputId = `location-user-${userName}`

                    return (
                      <label
                        key={userName}
                        htmlFor={inputId}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
                          checked ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        <Checkbox
                          id={inputId}
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleUser(userName, value === true)
                          }
                        />
                        <span
                          className={cn(
                            "flex-1 text-sm font-normal",
                            assigned && "font-medium text-primary"
                          )}
                        >
                          {userName}
                        </span>
                        {assigned ? (
                          <Check className="size-3.5 shrink-0 text-primary" />
                        ) : null}
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          </UserSetupColumn>
        </div>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>
    </AdminPageShell>
  )
}
