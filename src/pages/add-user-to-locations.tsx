import { Search } from "lucide-react"
import { useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { Input } from "@/components/ui/input"
import { UserLocationAssignCard } from "@/features/user-setup/user-location-assign-card"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"
import { userSetupLocations, userSetupUsers } from "@/data/user-setup"
import { cn } from "@/lib/utils"

type UserFilter = "all" | "assigned" | "unassigned"

const FILTER_OPTIONS: { value: UserFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "assigned", label: "Assigned" },
  { value: "unassigned", label: "Unassigned" },
]

export function AddUserToLocations() {
  const [userLocations, setUserLocations] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(userSetupUsers.map((user) => [user, []]))
  )
  const [userSearch, setUserSearch] = useState("")
  const [userFilter, setUserFilter] = useState<UserFilter>("all")
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  const assignedUserCount = useMemo(
    () =>
      userSetupUsers.filter((user) => (userLocations[user]?.length ?? 0) > 0).length,
    [userLocations]
  )

  const totalAssignments = useMemo(
    () =>
      Object.values(userLocations).reduce(
        (total, locations) => total + locations.length,
        0
      ),
    [userLocations]
  )

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()

    return userSetupUsers.filter((user) => {
      const assignedCount = userLocations[user]?.length ?? 0

      if (userFilter === "assigned" && assignedCount === 0) return false
      if (userFilter === "unassigned" && assignedCount > 0) return false
      if (!query) return true

      return user.toLowerCase().includes(query)
    })
  }, [userFilter, userLocations, userSearch])

  function handleSave(user: string, locations: string[]) {
    const previousCount = userLocations[user]?.length ?? 0
    const nextCount = locations.length

    setUserLocations((current) => ({
      ...current,
      [user]: locations,
    }))

    setMessageVariant("success")
    if (nextCount > previousCount) {
      setMessage(
        `Assigned ${nextCount - previousCount} location(s) to ${user}.`
      )
      return
    }

    if (nextCount < previousCount) {
      setMessage(
        `Removed ${previousCount - nextCount} location(s) from ${user}.`
      )
      return
    }

    setMessage(`Updated location assignments for ${user}.`)
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>Administration - Add User to Location(s)</AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar>
          <AdminPanelStats>
            <span className="font-semibold tabular-nums text-foreground">
              {assignedUserCount}
            </span>{" "}
            of{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {userSetupUsers.length}
            </span>{" "}
            users assigned
            {" · "}
            <span className="font-semibold tabular-nums text-foreground">
              {totalAssignments}
            </span>{" "}
            total location assignments
          </AdminPanelStats>

          <AdminPanelActions>
            <div className="relative w-full sm:w-56">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search users..."
                className="h-9 pl-8"
              />
            </div>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <div className="flex flex-wrap gap-1.5 border-b px-3 py-2 sm:px-4">
          {FILTER_OPTIONS.map((option) => {
            const active = userFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setUserFilter(option.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="p-3 sm:p-4">
          {filteredUsers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                No users match your search
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a different filter or clear the search.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-2">
              {filteredUsers.map((user) => (
                <UserLocationAssignCard
                  key={user}
                  userName={user}
                  assignedLocations={userLocations[user] ?? []}
                  allLocations={userSetupLocations}
                  onSave={(locations) => handleSave(user, locations)}
                />
              ))}
            </div>
          )}
        </div>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>
    </AdminPageShell>
  )
}
