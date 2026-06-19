import { useState } from "react"

import { GiftCardActionDialog } from "@/features/gift-cards/gift-card-action-dialog"
import { GiftCardActionGrid } from "@/features/gift-cards/gift-card-action-grid"
import type { GiftCardAction } from "@/types/gift-card"

export function GiftCards() {
  const [activeAction, setActiveAction] = useState<GiftCardAction | null>(null)

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Gift Cards
      </h1>

      <GiftCardActionGrid onSelectAction={setActiveAction} />

      <GiftCardActionDialog
        action={activeAction}
        onOpenChange={(open) => {
          if (!open) setActiveAction(null)
        }}
      />
    </div>
  )
}
