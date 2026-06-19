import { useEffect, useState } from "react"

import { FormField } from "@/components/forms/form-fields"
import { PrefixedInput } from "@/components/forms/prefixed-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GiftCardAccountFields } from "@/features/gift-cards/gift-card-account-fields"
import {
  EMPTY_GIFT_CARD_FORM,
  type GiftCardAction,
  type GiftCardFormState,
} from "@/types/gift-card"

type GiftCardActionDialogProps = {
  action: GiftCardAction | null
  onOpenChange: (open: boolean) => void
}

const ACTION_CONFIG: Record<
  GiftCardAction,
  { title: string; submitLabel: string; showAmount: boolean; accountCount: 1 | 2 }
> = {
  "check-balance": {
    title: "Balance Request",
    submitLabel: "Check Balance",
    showAmount: false,
    accountCount: 1,
  },
  activate: {
    title: "Gift Card",
    submitLabel: "Activate",
    showAmount: true,
    accountCount: 1,
  },
  "add-funds": {
    title: "Gift Card Add Funds",
    submitLabel: "Add Funds",
    showAmount: true,
    accountCount: 1,
  },
  deactivate: {
    title: "Deactivate Card",
    submitLabel: "Deactivate",
    showAmount: false,
    accountCount: 1,
  },
  replace: {
    title: "Replace Card",
    submitLabel: "Replace",
    showAmount: false,
    accountCount: 2,
  },
}

export function GiftCardActionDialog({
  action,
  onOpenChange,
}: GiftCardActionDialogProps) {
  const [form, setForm] = useState<GiftCardFormState>(EMPTY_GIFT_CARD_FORM)
  const open = action !== null
  const config = action ? ACTION_CONFIG[action] : null

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_GIFT_CARD_FORM)
    }
  }, [open])

  function updateField<K extends keyof GiftCardFormState>(
    field: K,
    value: GiftCardFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit() {
    onOpenChange(false)
  }

  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-lg flex-col overflow-hidden sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">{config.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-4 py-3">
          {config.showAmount && (
            <FormField label="Enter Dollar Amount" htmlFor="gift-card-amount">
              <PrefixedInput
                id="gift-card-amount"
                value={form.amount}
                onChange={(value) => updateField("amount", value)}
                inputClassName="w-28"
              />
            </FormField>
          )}

          {config.accountCount === 1 ? (
            <GiftCardAccountFields
              accountId="gift-card-account"
              value={form.account}
              onChange={(value) => updateField("account", value)}
            />
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">From Account</p>
                <GiftCardAccountFields
                  accountId="gift-card-from-account"
                  value={form.fromAccount}
                  onChange={(value) => updateField("fromAccount", value)}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">To Account</p>
                <GiftCardAccountFields
                  accountId="gift-card-to-account"
                  value={form.toAccount}
                  onChange={(value) => updateField("toAccount", value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2 sm:justify-end">
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {config.submitLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
