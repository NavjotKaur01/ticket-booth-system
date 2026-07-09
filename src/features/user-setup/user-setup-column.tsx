import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type UserSetupColumnProps = {
  title: string
  children: ReactNode
  headerRight?: ReactNode
  className?: string
  contentClassName?: string
}

/** Column header + body for split-panel user setup layouts. */
export function UserSetupColumn({
  title,
  children,
  headerRight,
  className,
  contentClassName,
}: UserSetupColumnProps) {
  return (
    <section className={cn("flex min-h-0 min-w-0 flex-col", className)}>
      <div className="flex flex-col gap-1 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-4">
        <h2 className="min-w-0 text-xs font-semibold text-foreground">{title}</h2>
        {headerRight}
      </div>
      <div className={cn("min-w-0 flex-1 p-3 sm:p-4", contentClassName)}>{children}</div>
    </section>
  )
}
