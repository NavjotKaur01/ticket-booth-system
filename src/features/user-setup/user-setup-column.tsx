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
    <section className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <h2 className="text-xs font-semibold text-foreground">{title}</h2>
        {headerRight}
      </div>
      <div className={cn("flex-1 p-4", contentClassName)}>{children}</div>
    </section>
  )
}
