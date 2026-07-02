import dayjs from "dayjs"

export const DEFAULT_DATE_DISPLAY_FORMAT = "DD/MM/YYYY"

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
