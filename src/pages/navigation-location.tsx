import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  navigationExcludedLocations,
  navigationMenuTree,
} from "@/data/navigation-admin"
import {
  findNavigationMenuLabel,
  NavigationMenuTree,
} from "@/features/navigation-admin/navigation-menu-tree"
import { MultiSelect } from "@/components/forms/multi-select"
import { UserSetupColumn } from "@/features/user-setup/user-setup-column"
import { UserSetupFeedback } from "@/features/user-setup/user-setup-feedback"

export function NavigationLocation() {
  const [selectedMenuId, setSelectedMenuId] = useState("home")
  const [excludedMap, setExcludedMap] = useState<Record<string, string[]>>(() => ({
    home: [...navigationExcludedLocations],
  }))
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success")

  const selectedMenuLabel = useMemo(
    () => findNavigationMenuLabel(navigationMenuTree, selectedMenuId),
    [selectedMenuId]
  )

  const excludedLocations = useMemo(
    () => excludedMap[selectedMenuId] ?? [],
    [excludedMap, selectedMenuId]
  )

  useEffect(() => {
    setSelectedLocations(excludedMap[selectedMenuId] ?? [])
  }, [excludedMap, selectedMenuId])

  function handleSelectMenu(id: string) {
    setSelectedMenuId(id)
    setMessage(null)
  }

  function toggleAllLocations() {
    setSelectedLocations((current) =>
      current.length === navigationExcludedLocations.length
        ? []
        : [...navigationExcludedLocations]
    )
    setMessage(null)
  }

  function handleUpdate() {
    setExcludedMap((current) => ({
      ...current,
      [selectedMenuId]: selectedLocations,
    }))
    setMessageVariant("success")
    setMessage(
      `Updated locations not using navigation menu for "${selectedMenuLabel}".`
    )
  }

  return (
    <AdminPageShell>
      <AdminPageTitle>
        Administration - Locations NOT to use Navigation Menu(s)
      </AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar>
          <AdminPanelStats>
            Menu:{" "}
            <span className="font-semibold text-foreground">{selectedMenuLabel}</span>
            {" · "}
            Excluded:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {excludedLocations.length}
            </span>
            {" · "}
            Selected:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {selectedLocations.length}
            </span>
          </AdminPanelStats>

          <AdminPanelActions>
            <Button type="button" variant="outline" size="sm" onClick={toggleAllLocations}>
              Toggle All Locations
            </Button>
            <Button type="button" size="sm" onClick={handleUpdate}>
              Update
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <div className="border-b px-3 py-3 sm:px-4">
          <div className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,24rem)] sm:items-center">
            <Label htmlFor="navigation-locations" className="text-xs font-medium text-foreground">
              Locations
            </Label>
            <MultiSelect
              id="navigation-locations"
              options={navigationExcludedLocations}
              selected={selectedLocations}
              onChange={(locations) => {
                setSelectedLocations(locations)
                setMessage(null)
              }}
              placeholder="Select locations"
              searchPlaceholder="Search locations..."
              emptyMessage="No locations match your search."
              itemNoun="locations"
            />
          </div>
        </div>

        <UserSetupColumn title="Navigation Menu" contentClassName="p-3">
          <NavigationMenuTree
            nodes={navigationMenuTree}
            selectedId={selectedMenuId}
            onSelect={handleSelectMenu}
          />
        </UserSetupColumn>

        {message ? (
          <UserSetupFeedback message={message} variant={messageVariant} />
        ) : null}
      </PanelCard>
    </AdminPageShell>
  )
}
