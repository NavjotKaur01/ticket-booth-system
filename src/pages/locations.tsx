import { PanelCard } from "@/components/common/panel-card"
import {
  AdminPageShell,
  AdminPageTitle,
  AdminPanelStats,
  AdminPanelToolbar,
} from "@/components/layout/admin-page"
import { domainLocationGroups } from "@/data/domain-locations"
import { DomainLocationList } from "@/features/locations/domain-location-list"

const totalLocations = domainLocationGroups.reduce(
  (count, group) => count + group.locations.length,
  0
)

export function Locations() {
  return (
    <AdminPageShell>
      <AdminPageTitle>Domain Setup - Locations</AdminPageTitle>

      <PanelCard>
        <AdminPanelToolbar className="py-2">
          <AdminPanelStats>
            Domains:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {domainLocationGroups.length}
            </span>
            {" · "}
            Locations:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {totalLocations}
            </span>
          </AdminPanelStats>
        </AdminPanelToolbar>

        <DomainLocationList groups={domainLocationGroups} />
      </PanelCard>
    </AdminPageShell>
  )
}
