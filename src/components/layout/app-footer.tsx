import { Ticket } from "lucide-react"

import { cn } from "@/lib/utils"

type AppFooterProps = {
  locationName: string
  className?: string
}

export function AppFooter({ locationName, className }: AppFooterProps) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })

  return (
    <footer
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2 border-t border-border bg-background px-4 py-2 text-[11px] text-muted-foreground lg:px-6",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Ticket className="size-3" aria-hidden="true" />
        <span>powered by standupmedia</span>
      </div>
      <span className="hidden sm:inline">·</span>
      <span className="flex-1 text-center sm:text-left">
        © standupmedia, Inc. All rights reserved.
      </span>
      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <span>{today}</span>
        <span className="font-semibold text-foreground">{locationName}</span>
      </div>
    </footer>
  )
}
