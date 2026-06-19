export const touchSectionOptions = [
  { id: "vip-meet", label: "$ 59.00 VIP Meet" },
  { id: "regular", label: "$ 29.00 Regular" },
] as const

export type TouchSectionId = (typeof touchSectionOptions)[number]["id"]
