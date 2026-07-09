import { Save } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelActions,
  AdminPanelStats,
  AdminPanelToolbar,
  ADMIN_SPLIT_PANEL_NAV_CLASS,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import {
  navigationExcludedLocations,
  navigationMenuTree,
} from "@/data/navigation-admin"
import {
  findNavigationMenuLabel,
  NavigationMenuTree,
} from "@/features/navigation-admin/navigation-menu-tree"
import { NavigationLocationChecklist } from "@/features/navigation-admin/navigation-location-checklist"
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

  function toggleLocation(location: string, checked: boolean) {
    setSelectedLocations((current) =>
      checked ? [...current, location] : current.filter((item) => item !== location)
    )
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
            <Button type="button" size="sm" className="gap-1.5" onClick={handleUpdate}>
              <Save className="size-3.5" />
              Update
            </Button>
          </AdminPanelActions>
        </AdminPanelToolbar>

        <div className={ADMIN_SPLIT_PANEL_NAV_CLASS}>
          <UserSetupColumn title="Navigation Menu" contentClassName="p-3">
            <NavigationMenuTree
              nodes={navigationMenuTree}
              selectedId={selectedMenuId}
              onSelect={handleSelectMenu}
            />
          </UserSetupColumn>

          <UserSetupColumn title="Locations" contentClassName="p-3">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="border-b bg-muted/50 px-3 py-2">
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  Locations
                </span>
              </div>
              <div className="p-3">
                <NavigationLocationChecklist
                  locations={navigationExcludedLocations}
                  selectedLocations={selectedLocations}
                  onToggleLocation={toggleLocation}
                />
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
