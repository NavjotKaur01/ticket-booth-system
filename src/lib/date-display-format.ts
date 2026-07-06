import dayjs from "dayjs"

export const DEFAULT_DATE_DISPLAY_FORMAT = "MM/DD/YYYY"

export function formatDateForDisplay(
  value: Date | string | null | undefined,
  placeholder = "",
  displayFormat = DEFAULT_DATE_DISPLAY_FORMAT
) {
  if (!value) {
    return placeholder
  }

  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(displayFormat) : placeholder
}

export const US_DATE_TIME_DISPLAY_FORMAT = "MM/DD/YYYY hh:mm A"

export function formatDateWithTimeUS(
  value: Date | string | null | undefined,
  placeholder = "",
) {
  return formatDateForDisplay(value, placeholder, US_DATE_TIME_DISPLAY_FORMAT)
}
