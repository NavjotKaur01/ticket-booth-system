import { PanelCard } from "@/components/common/panel-card"
import { domainLocationGroups } from "@/data/domain-locations"
import { DomainLocationList } from "@/features/locations/domain-location-list"

export function Locations() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Domain Setup - Locations
      </h1>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Domains:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {domainLocationGroups.length}
            </span>
          </p>
        </div>

        <DomainLocationList groups={domainLocationGroups} />
      </PanelCard>
    </div>
  )
}
