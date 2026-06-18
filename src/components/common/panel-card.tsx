import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Card styling for page panels: no default vertical padding or gap. */
export const PANEL_CARD_CLASS = "gap-0 py-0"

type PanelCardProps = {
  children: ReactNode
  className?: string
}

/** Wrapper for toolbar + content panels used across pages. */
export function PanelCard({ children, className }: PanelCardProps) {
  return <Card className={cn(PANEL_CARD_CLASS, className)}>{children}</Card>
}
