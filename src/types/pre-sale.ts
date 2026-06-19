export type PreSaleRecord = {
  id: string
  accessCode: string
  startDate: string
  endDate: string
  createdBy: string
  createDate: string
}

export type PreSaleFormValues = {
  showDate: string
  showId: string
  startDate: string
  endDate: string
  comicId: string
  accessCode: string
  startTime: string
  endTime: string
}

function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function createEmptyPreSaleForm(): PreSaleFormValues {
  return {
    showDate: todayDateValue(),
    showId: "",
    startDate: todayDateValue(),
    endDate: todayDateValue(),
    comicId: "",
    accessCode: "",
    startTime: "00:00",
    endTime: "00:00",
  }
}
