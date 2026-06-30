export type FoodMenuCategory = {
  id: string
  locationId: string
  menuName: string
  menuOrder: number
  active: boolean
}

export type FoodMenuPdf = {
  id: string
  locationId: string
  name: string
  description: string
  fileName: string
  imageLabel: string
}
