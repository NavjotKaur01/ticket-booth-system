import type { StatSummary } from "@/types/dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatsSummaryProps = {
  stats: StatSummary[]
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <section
      aria-label="Ticket sales summary"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => (
        <Card key={stat.id} className="shadow-sm">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </h3>
            <p className="mt-2 text-4xl font-semibold tabular-nums">
              {stat.value}
            </p>
            <div
              className={cn(
                "mx-auto mt-3 h-1 w-full max-w-32 rounded-full",
                stat.accentClass
              )}
              aria-hidden="true"
            />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
