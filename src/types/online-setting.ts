export type OnlineSetting = {
  id: string
  settingsName: string
  defaultValue: string
}

export type OnlineSettingFormValues = {
  settingsName: string
  defaultValue: string
}

export const EMPTY_ONLINE_SETTING_FORM: OnlineSettingFormValues = {
  settingsName: "",
  defaultValue: "",
}
