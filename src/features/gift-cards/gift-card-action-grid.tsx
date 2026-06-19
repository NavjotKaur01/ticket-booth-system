import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  Ban,
  CircleDollarSign,
  CreditCard,
  PlusCircle,
} from "lucide-react"

import { PanelCard } from "@/components/common/panel-card"
import { cn } from "@/lib/utils"
import { GIFT_CARD_ACTIONS, type GiftCardAction } from "@/types/gift-card"

const ACTION_META: Record<
  GiftCardAction,
  { icon: LucideIcon; description: string; iconBg: string; iconColor: string }
> = {
  "check-balance": {
    icon: CircleDollarSign,
    description: "View remaining balance on a card",
    iconBg: "bg-sky-100 dark:bg-sky-950/40",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  activate: {
    icon: CreditCard,
    description: "Activate a new gift card",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  "add-funds": {
    icon: PlusCircle,
    description: "Add money to an existing card",
    iconBg: "bg-violet-100 dark:bg-violet-950/40",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  deactivate: {
    icon: Ban,
    description: "Disable a gift card account",
    iconBg: "bg-orange-100 dark:bg-orange-950/40",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  replace: {
    icon: ArrowLeftRight,
    description: "Transfer balance to a new card",
    iconBg: "bg-rose-100 dark:bg-rose-950/40",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
}

type GiftCardActionGridProps = {
  onSelectAction: (action: GiftCardAction) => void
}

export function GiftCardActionGrid({ onSelectAction }: GiftCardActionGridProps) {
  return (
    <PanelCard>
      <div className="border-b px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Select an action to manage gift cards.
        </p>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
        {GIFT_CARD_ACTIONS.map((action) => {
          const meta = ACTION_META[action.id]
          const Icon = meta.icon

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectAction(action.id)}
              className={cn(
                "group flex min-h-[7.5rem] flex-col rounded-lg border border-border/60 bg-background p-3.5 text-left",
                "transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                  meta.iconBg,
                  "group-hover:scale-105"
                )}
              >
                <Icon className={cn("size-4", meta.iconColor)} strokeWidth={1.75} />
              </div>

              <span className="mt-3 text-sm font-semibold text-foreground">
                {action.label}
              </span>
              <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {meta.description}
              </span>
            </button>
          )
        })}
      </div>
    </PanelCard>
  )
}
