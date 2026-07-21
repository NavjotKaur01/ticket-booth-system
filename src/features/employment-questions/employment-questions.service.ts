import type { EmploymentQuestionRecord } from "@/types/employment-question"

const MOCK_EMPLOYMENT_QUESTIONS = new Map<string, EmploymentQuestionRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "question-1",
        locationId: "standupmedia",
        question: "When can you start?",
        active: true,
      },
      {
        id: "question-2",
        locationId: "standupmedia",
        question: "Are you available to work weekends?",
        active: true,
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "vb-question-1",
        locationId: "venue-b",
        question: "Do you have prior hospitality experience?",
        active: true,
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "vc-question-1",
        locationId: "venue-c",
        question: "Are you comfortable working late shifts?",
        active: true,
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

function cloneRows(rows: EmploymentQuestionRecord[]) {
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

  if (normalized === "venue c") {
    return "venue-c"
  }

  return null
}

function getRowsForLocation(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_EMPLOYMENT_QUESTIONS.get(locationId)
  if (rowsById) {
    return cloneRows(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_EMPLOYMENT_QUESTIONS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function persistRows(locationId: string, rows: EmploymentQuestionRecord[]) {
  MOCK_EMPLOYMENT_QUESTIONS.set(locationId, cloneRows(rows))
}

function buildQuestionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `question-${Math.random().toString(36).slice(2, 10)}`
}

export async function getEmploymentQuestionsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<EmploymentQuestionRecord[]> {
  await wait(160)
  return getRowsForLocation(locationId, locationLabel)
}

export async function createEmploymentQuestion({
  locationId,
  locationLabel,
  question,
  active,
}: {
  locationId: string
  locationLabel?: string
  question: string
  active: boolean
}): Promise<EmploymentQuestionRecord> {
  await wait(160)

  const rows = getRowsForLocation(locationId, locationLabel)
  const nextRow: EmploymentQuestionRecord = {
    id: buildQuestionId(),
    locationId,
    question,
    active,
  }

  rows.unshift(nextRow)
  persistRows(locationId, rows)
  return { ...nextRow }
}

export async function updateEmploymentQuestion({
  locationId,
  locationLabel,
  questionId,
  question,
  active,
}: {
  locationId: string
  locationLabel?: string
  questionId: string
  question: string
  active: boolean
}): Promise<EmploymentQuestionRecord> {
  await wait(160)

  const rows = getRowsForLocation(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === questionId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected employment question.")
  }

  const updatedRow: EmploymentQuestionRecord = {
    ...rows[rowIndex],
    question,
    active,
  }

  rows[rowIndex] = updatedRow
  persistRows(locationId, rows)
  return { ...updatedRow }
}
