import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type UserSetupActionBarProps = {
  children: ReactNode
  className?: string
}

export function UserSetupActionBar({ children, className }: UserSetupActionBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 border-t px-3 py-2",
        className
      )}
    >
      {children}
    </div>
  )
}
