import type { FoodMenuCategory, FoodMenuPdf } from "@/types/food-menu"

const MOCK_FOOD_MENU_CATEGORIES = new Map<string, FoodMenuCategory[]>([
  [
    "standupmedia",
    [
      {
        id: "cat-1",
        locationId: "standupmedia",
        menuName: "Sandwiches",
        menuOrder: 1,
        active: true,
      },
      {
        id: "cat-2",
        locationId: "standupmedia",
        menuName: "Drinks",
        menuOrder: 2,
        active: true,
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-cat-1",
        locationId: "venue-b",
        menuName: "Small Plates",
        menuOrder: 1,
        active: true,
      },
      {
        id: "vb-cat-2",
        locationId: "venue-b",
        menuName: "Cocktails",
        menuOrder: 2,
        active: true,
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "vc-cat-1",
        locationId: "venue-c",
        menuName: "Bar Menu",
        menuOrder: 1,
        active: true,
      },
    ],
  ],
])

const MOCK_FOOD_MENU_PDFS = new Map<string, FoodMenuPdf[]>([
  [
    "standupmedia",
    [
      {
        id: "pdf-1",
        locationId: "standupmedia",
        name: "Main Menu",
        description: "Primary dine-in menu for club tables.",
        fileName: "standupmedia-main-menu.pdf",
        imageLabel: "Main menu hero image",
      },
      {
        id: "pdf-2",
        locationId: "standupmedia",
        name: "Drinks Menu",
        description: "Bar and beverage menu for weekend shows.",
        fileName: "standupmedia-drinks-menu.pdf",
        imageLabel: "Drinks menu poster",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-pdf-1",
        locationId: "venue-b",
        name: "Late Night Menu",
        description: "Short late-night snack menu.",
        fileName: "venue-b-late-night.pdf",
        imageLabel: "Late night menu artwork",
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "vc-pdf-1",
        locationId: "venue-c",
        name: "Weekend Specials",
        description: "Weekend specials flyer.",
        fileName: "venue-c-weekend-specials.pdf",
        imageLabel: "Weekend specials image",
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

function cloneCategories(rows: FoodMenuCategory[]) {
  return rows.map((row) => ({ ...row }))
}

function clonePdfs(rows: FoodMenuPdf[]) {
  return rows.map((row) => ({ ...row }))
}

function getTemplateKeyFromLabel(locationLabel?: string) {
  const normalized = normalizeLookupValue(locationLabel || "")

  if (normalized === "standupmedia") {
    return "standupmedia"
  }

  if (normalized === "venue b") {
    return "venue-b"
  }

  if (normalized === "venue c") {
    return "venue-c"
  }

  return null
}

export async function getFoodMenuCategoriesByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<FoodMenuCategory[]> {
  await wait(180)

  const byId = MOCK_FOOD_MENU_CATEGORIES.get(locationId)
  if (byId) {
    return cloneCategories(byId)
  }

  const templateKey = getTemplateKeyFromLabel(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_FOOD_MENU_CATEGORIES.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

export async function getFoodMenuPdfsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<FoodMenuPdf[]> {
  await wait(180)

  const byId = MOCK_FOOD_MENU_PDFS.get(locationId)
  if (byId) {
    return clonePdfs(byId)
  }

  const templateKey = getTemplateKeyFromLabel(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_FOOD_MENU_PDFS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}
