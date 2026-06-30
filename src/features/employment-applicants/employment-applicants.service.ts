import type {
  EmploymentApplicantFilterGroup,
  EmploymentApplicantRecord,
  EmploymentApplicantUpdateInput,
} from "@/types/employment-applicant"

const MOCK_FILTER_GROUPS = new Map<string, EmploymentApplicantFilterGroup[]>([
  [
    "standupmedia",
    [
      {
        id: "employment-opportunities",
        locationId: "standupmedia",
        label: "Employment Opportunities",
      },
      {
        id: "event-staff",
        locationId: "standupmedia",
        label: "Event Staff",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "hospitality-team",
        locationId: "venue-b",
        label: "Hospitality Team",
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "floor-team",
        locationId: "venue-c",
        label: "Floor Team",
      },
    ],
  ],
])

const MOCK_EMPLOYMENT_APPLICANTS = new Map<string, EmploymentApplicantRecord[]>([
  [
    "standupmedia",
    [
      {
        id: "applicant-1",
        locationId: "standupmedia",
        firstName: "Jeff",
        lastName: "Richards",
        email: "jeff.richards@example.com",
        phone: "(614) 392-8865",
        positionGroupId: "employment-opportunities",
        positionGroupLabel: "Employment Opportunities",
        opportunityId: "opening-1",
        opportunityTitle: "Cook",
        submittedOn: "2026-06-18",
        reviewed: true,
        reviewedBy: "Sandeep Kumar",
        hireDate: "2026-06-25",
        dismissalDate: null,
        notes: "Strong kitchen background with weekend availability.",
      },
      {
        id: "applicant-2",
        locationId: "standupmedia",
        firstName: "Ariana",
        lastName: "Bell",
        email: "ariana.bell@example.com",
        phone: "(614) 555-1801",
        positionGroupId: "employment-opportunities",
        positionGroupLabel: "Employment Opportunities",
        opportunityId: "opening-2",
        opportunityTitle: "Dishwasher",
        submittedOn: "2026-06-20",
        reviewed: false,
        reviewedBy: "",
        hireDate: null,
        dismissalDate: null,
        notes: "Looking for evening shifts after 5 PM.",
      },
      {
        id: "applicant-3",
        locationId: "standupmedia",
        firstName: "Marcus",
        lastName: "Lee",
        email: "marcus.lee@example.com",
        phone: "(740) 555-9120",
        positionGroupId: "event-staff",
        positionGroupLabel: "Event Staff",
        opportunityId: "opening-2",
        opportunityTitle: "Dishwasher",
        submittedOn: "2026-06-16",
        reviewed: true,
        reviewedBy: "Venue Manager",
        hireDate: null,
        dismissalDate: null,
        notes: "Good referral from a current team member.",
      },
      {
        id: "applicant-4",
        locationId: "standupmedia",
        firstName: "Nina",
        lastName: "Patel",
        email: "nina.patel@example.com",
        phone: "(937) 555-4478",
        positionGroupId: "employment-opportunities",
        positionGroupLabel: "Employment Opportunities",
        opportunityId: "opening-1",
        opportunityTitle: "Cook",
        submittedOn: "2026-06-11",
        reviewed: true,
        reviewedBy: "Sandeep Kumar",
        hireDate: null,
        dismissalDate: "2026-06-28",
        notes: "Role was filled before final onboarding could happen.",
      },
      {
        id: "applicant-5",
        locationId: "standupmedia",
        firstName: "Test",
        lastName: "Candidate",
        email: "test.candidate@example.com",
        phone: "(380) 555-0091",
        positionGroupId: "event-staff",
        positionGroupLabel: "Event Staff",
        opportunityId: "opening-1",
        opportunityTitle: "Cook",
        submittedOn: "2026-06-09",
        reviewed: false,
        reviewedBy: "",
        hireDate: null,
        dismissalDate: null,
        notes: "Open to cross-training for multiple back-of-house tasks.",
      },
    ],
  ],
  [
    "venue-b",
    [
      {
        id: "venue-b-applicant-1",
        locationId: "venue-b",
        firstName: "Liam",
        lastName: "Turner",
        email: "liam.turner@example.com",
        phone: "(518) 555-3434",
        positionGroupId: "hospitality-team",
        positionGroupLabel: "Hospitality Team",
        opportunityId: "vb-opening-1",
        opportunityTitle: "Server",
        submittedOn: "2026-06-19",
        reviewed: true,
        reviewedBy: "Venue B Manager",
        hireDate: null,
        dismissalDate: null,
        notes: "Previous restaurant floor experience.",
      },
    ],
  ],
  [
    "venue-c",
    [
      {
        id: "venue-c-applicant-1",
        locationId: "venue-c",
        firstName: "Emma",
        lastName: "Stone",
        email: "emma.stone@example.com",
        phone: "(216) 555-2112",
        positionGroupId: "floor-team",
        positionGroupLabel: "Floor Team",
        opportunityId: "vc-opening-1",
        opportunityTitle: "Host",
        submittedOn: "2026-06-21",
        reviewed: false,
        reviewedBy: "",
        hireDate: null,
        dismissalDate: null,
        notes: "Interested in guest-facing shifts and host stand training.",
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

function cloneGroups(rows: EmploymentApplicantFilterGroup[]) {
  return rows.map((row) => ({ ...row }))
}

function cloneApplicants(rows: EmploymentApplicantRecord[]) {
  return rows.map((row) => ({ ...row }))
}

function getGroupsForLocation(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_FILTER_GROUPS.get(locationId)
  if (rowsById) {
    return cloneGroups(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_FILTER_GROUPS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function getApplicantsForLocation(locationId: string, locationLabel?: string) {
  const rowsById = MOCK_EMPLOYMENT_APPLICANTS.get(locationId)
  if (rowsById) {
    return cloneApplicants(rowsById)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = MOCK_EMPLOYMENT_APPLICANTS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
  }))
}

function persistApplicants(locationId: string, rows: EmploymentApplicantRecord[]) {
  MOCK_EMPLOYMENT_APPLICANTS.set(locationId, cloneApplicants(rows))
}

export async function getEmploymentApplicantFilterGroupsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<EmploymentApplicantFilterGroup[]> {
  await wait(140)
  return getGroupsForLocation(locationId, locationLabel)
}

export async function getEmploymentApplicantsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<EmploymentApplicantRecord[]> {
  await wait(180)
  return getApplicantsForLocation(locationId, locationLabel)
}

export async function updateEmploymentApplicant({
  locationId,
  locationLabel,
  applicantId,
  input,
}: {
  locationId: string
  locationLabel?: string
  applicantId: string
  input: EmploymentApplicantUpdateInput
}): Promise<EmploymentApplicantRecord> {
  await wait(180)

  const rows = getApplicantsForLocation(locationId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === applicantId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected employment applicant.")
  }

  const updatedRow: EmploymentApplicantRecord = {
    ...rows[rowIndex],
    reviewed: input.reviewed,
    reviewedBy: input.reviewedBy.trim(),
    hireDate: input.hireDate,
    dismissalDate: input.dismissalDate,
    notes: input.notes.trim(),
  }

  rows[rowIndex] = updatedRow
  persistApplicants(locationId, rows)
  return { ...updatedRow }
}
