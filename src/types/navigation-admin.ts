export type NavigationManagementRecord = {
  id: string
  menu: string
  navigationUrl: string
  level: number
  order: number
  active: "Y" | "N"
  updatedBy: string
  parentMenu: string
}

export type NavigationManagementFormValues = {
  menu: string
  navigationUrl: string
  level: string
  order: string
  active: "Y" | "N"
  updatedBy: string
  parentMenu: string
}

export const EMPTY_NAVIGATION_MANAGEMENT_FORM: NavigationManagementFormValues = {
  menu: "",
  navigationUrl: "",
  level: "0",
  order: "10",
  active: "Y",
  updatedBy: "",
  parentMenu: "",
}

export type NavigationDropdownRecord = {
  id: string
  displayText: string
  active: "Y" | "N"
  navigationUrl: string
  level: number
}

export type NavigationDropDownItem = {
  id: string
  name: string
  active: "Y" | "N"
}

export type NavigationDropdownParent = {
  id: string
  displayText: string
  active: "Y" | "N"
  navigationUrl: string
  dropDowns: NavigationDropDownItem[]
}

export type NavigationDropDownItemFormValues = {
  name: string
  active: "Y" | "N"
}

export const EMPTY_NAVIGATION_DROPDOWN_ITEM_FORM: NavigationDropDownItemFormValues = {
  name: "",
  active: "Y",
}

export type NavigationTreeNode = {
  id: string
  label: string
  children?: NavigationTreeNode[]
}
