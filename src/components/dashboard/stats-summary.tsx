import {
  CalendarDays,
  CalendarRange,
  Ticket,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { StatSummary } from "@/types/dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatsSummaryProps = {
  stats: StatSummary[]
}

const statIcons: Record<string, LucideIcon> = {
  yesterday: Ticket,
  today: TrendingUp,
  week: CalendarDays,
  month: CalendarRange,
}

const statStyles: Record<string, { bg: string; icon: string }> = {
  yesterday: {
    bg: "bg-sky-100 dark:bg-sky-950/40",
    icon: "text-sky-600 dark:text-sky-400",
  },
  today: {
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  week: {
    bg: "bg-violet-100 dark:bg-violet-950/40",
    icon: "text-violet-600 dark:text-violet-400",
  },
  month: {
    bg: "bg-orange-100 dark:bg-orange-950/40",
    icon: "text-orange-600 dark:text-orange-400",
  },
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <section
      aria-label="Ticket sales summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = statIcons[stat.id] ?? Ticket
        const style = statStyles[stat.id] ?? statStyles.yesterday

        return (
          <Card key={stat.id} className="py-0 transition-shadow hover:shadow-md">
            <CardContent className="p-3.5">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  style.bg
                )}
              >
                <Icon
                  className={cn("size-4", style.icon)}
                  strokeWidth={1.75}
                />
              </div>
              <p className="mt-2.5 text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums leading-none tracking-tight">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
