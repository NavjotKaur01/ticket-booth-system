import { cn } from "@/lib/utils"

export type SegmentedTab<T extends string> = {
  id: T
  label: string
}

type SegmentedTabListProps<T extends string> = {
  tabs: readonly SegmentedTab<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
  ariaLabel: string
  className?: string
}

/** Pill-style tab list used across dialogs and page-level views. */
export function SegmentedTabList<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  className,
}: SegmentedTabListProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex flex-wrap rounded-sm border border-border bg-muted/30 p-0.5",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors sm:px-4",
            activeTab === tab.id
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
