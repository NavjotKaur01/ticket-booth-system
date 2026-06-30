import type { GiftOfLaughterRecord } from "@/types/gift-of-laughter"

const MOCK_GIFT_OF_LAUGHTER = new Map<string, GiftOfLaughterRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "gol-1",
        locationId: "standupmedia",
        giftType: "Gift Certificate",
        senderFirstName: "Michael",
        senderLastName: "Reed",
        senderEmail: "michael.reed@example.com",
        receiverFirstName: "Sarah",
        receiverLastName: "Chen",
        receiverAddress: "42 Comedy Lane, Albany, NY 12203",
        receiverEmail: "sarah.chen@example.com",
        shippedBy: "Email",
        originalAmount: 150,
        remainingBalance: 150,
        dateCreated: "2026-03-10",
        transId: "GOL-2400310",
      },
      {
        id: "gol-2",
        locationId: "standupmedia",
        giftType: "Gift of Laughter",
        senderFirstName: "Emily",
        senderLastName: "Brooks",
        senderEmail: "emily.brooks@example.com",
        receiverFirstName: "Daniel",
        receiverLastName: "Price",
        receiverAddress: "118 River Street, Troy, NY 12180",
        receiverEmail: "daniel.price@example.com",
        shippedBy: "USPS",
        originalAmount: 200,
        remainingBalance: 75,
        dateCreated: "2026-02-18",
        transId: "GOL-2400218",
      },
      {
        id: "gol-3",
        locationId: "standupmedia",
        giftType: "Gift Certificate",
        senderFirstName: "Laura",
        senderLastName: "Nguyen",
        senderEmail: "laura.nguyen@example.com",
        receiverFirstName: "Chris",
        receiverLastName: "Morgan",
        receiverAddress: "9 Park Avenue, Schenectady, NY 12305",
        receiverEmail: "chris.morgan@example.com",
        shippedBy: "Pickup",
        originalAmount: 100,
        remainingBalance: 0,
        dateCreated: "2026-01-05",
        transId: "GOL-2400105",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-gol-1",
        locationId: "venue-b",
        giftType: "Gift of Laughter",
        senderFirstName: "Alex",
        senderLastName: "Turner",
        senderEmail: "alex.turner@example.com",
        receiverFirstName: "Jamie",
        receiverLastName: "Lee",
        receiverAddress: "500 Main Street, Venue B",
        receiverEmail: "jamie.lee@example.com",
        shippedBy: "Email",
        originalAmount: 125,
        remainingBalance: 125,
        dateCreated: "2026-03-01",
        transId: "GOL-VB-001",
      },
    ],
  ],
])

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function normalizeLookupValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function cloneRows(rows: GiftOfLaughterRecord[]) {
  return rows.map((row) => ({ ...row }))
}

function resolveTemplateKey(locationLabel?: string) {
  const normalized = normalizeLookupValue(locationLabel || "")

  if (normalized === "standupmedia") {
    return "standupmedia"
  }

  if (normalized === "venue b") {
    return "venue-b"
  }

  return null
}

function getRowsForLocation(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_GIFT_OF_LAUGHTER.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_GIFT_OF_LAUGHTER.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
    transId: `${row.transId}-${locationId.slice(0, 4).toUpperCase()}`,
  }))
}

export async function getGiftOfLaughterByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<GiftOfLaughterRecord[]> {
  await wait(180)
  return getRowsForLocation(locationId, locationLabel)
}
