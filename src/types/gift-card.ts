export type GiftCardAction =
  | "check-balance"
  | "activate"
  | "add-funds"
  | "deactivate"
  | "replace"

export const GIFT_CARD_ACTIONS: { id: GiftCardAction; label: string }[] = [
  { id: "check-balance", label: "Check Balance" },
  { id: "activate", label: "Activate" },
  { id: "add-funds", label: "Add Funds" },
  { id: "deactivate", label: "Deactivate" },
  { id: "replace", label: "Replace" },
]

export type GiftCardFormState = {
  amount: string
  account: string
  fromAccount: string
  toAccount: string
}

export const EMPTY_GIFT_CARD_FORM: GiftCardFormState = {
  amount: "0",
  account: "",
  fromAccount: "",
  toAccount: "",
}
