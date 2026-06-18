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
  yesterday: { bg: "bg-sky-100", icon: "text-sky-600" },
  today: { bg: "bg-emerald-100", icon: "text-emerald-600" },
  week: { bg: "bg-violet-100", icon: "text-violet-600" },
  month: { bg: "bg-orange-100", icon: "text-orange-600" },
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <section
      aria-label="Ticket sales summary"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = statIcons[stat.id] ?? Ticket
        const style = statStyles[stat.id] ?? statStyles.yesterday

        return (
          <Card
            key={stat.id}
            className="rounded-xl border-0 bg-card py-0 shadow-sm ring-0 transition-shadow hover:shadow-md"
          >
            <CardContent className="p-5">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  style.bg
                )}
              >
                <Icon
                  className={cn("size-5", style.icon)}
                  strokeWidth={1.75}
                />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1.5 text-[1.625rem] font-bold tabular-nums leading-none tracking-tight">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
