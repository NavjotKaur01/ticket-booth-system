import type { FormEmailDefinition, FormEmailRecord } from "@/types/form-email"

const TEMPLATE_FORM_DEFINITIONS = new Map<string, FormEmailDefinition[]>([
  [
    "standupmedia",
    [
      { id: "contact-us", locationId: "standupmedia", name: "Contact Us" },
      { id: "employment", locationId: "standupmedia", name: "Employment" },
      { id: "gift-card", locationId: "standupmedia", name: "Gift Card" },
      { id: "group-events", locationId: "standupmedia", name: "Group Events" },
      { id: "rent-the-club", locationId: "standupmedia", name: "Rent the Club" },
    ],
  ],
  [
    "venue-b",
    [
      { id: "contact-us", locationId: "venue-b", name: "Contact Us" },
      { id: "private-events", locationId: "venue-b", name: "Private Events" },
      { id: "employment", locationId: "venue-b", name: "Employment" },
    ],
  ],
  [
    "venue-c",
    [
      { id: "contact-us", locationId: "venue-c", name: "Contact Us" },
      { id: "vip-club", locationId: "venue-c", name: "VIP Club" },
    ],
  ],
])

const TEMPLATE_FORM_EMAILS = new Map<string, FormEmailRecord[]>([
  [
    "standupmedia::employment",
    [
      {
        id: "employment-email-1",
        locationId: "standupmedia",
        formId: "employment",
        emailAddress: "jeff.richards@standupmedia.com",
      },
      {
        id: "employment-email-2",
        locationId: "standupmedia",
        formId: "employment",
        emailAddress: "max@standupmedia.com",
      },
      {
        id: "employment-email-3",
        locationId: "standupmedia",
        formId: "employment",
        emailAddress: "sandeep@standupmedia.com",
      },
    ],
  ],
  [
    "standupmedia::contact-us",
    [
      {
        id: "contact-email-1",
        locationId: "standupmedia",
        formId: "contact-us",
        emailAddress: "hello@standupmedia.com",
      },
      {
        id: "contact-email-2",
        locationId: "standupmedia",
        formId: "contact-us",
        emailAddress: "support@standupmedia.com",
      },
    ],
  ],
  [
    "standupmedia::gift-card",
    [
      {
        id: "gift-email-1",
        locationId: "standupmedia",
        formId: "gift-card",
        emailAddress: "gifts@standupmedia.com",
      },
    ],
  ],
  ["standupmedia::group-events", []],
  [
    "standupmedia::rent-the-club",
    [
      {
        id: "rent-email-1",
        locationId: "standupmedia",
        formId: "rent-the-club",
        emailAddress: "events@standupmedia.com",
      },
    ],
  ],
  [
    "venue-b::contact-us",
    [
      {
        id: "vb-contact-1",
        locationId: "venue-b",
        formId: "contact-us",
        emailAddress: "contact@venueb.example.com",
      },
    ],
  ],
  [
    "venue-b::private-events",
    [
      {
        id: "vb-private-1",
        locationId: "venue-b",
        formId: "private-events",
        emailAddress: "private@venueb.example.com",
      },
      {
        id: "vb-private-2",
        locationId: "venue-b",
        formId: "private-events",
        emailAddress: "manager@venueb.example.com",
      },
    ],
  ],
  ["venue-b::employment", []],
  [
    "venue-c::contact-us",
    [
      {
        id: "vc-contact-1",
        locationId: "venue-c",
        formId: "contact-us",
        emailAddress: "contact@venuec.example.com",
      },
    ],
  ],
  ["venue-c::vip-club", []],
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

function cloneForms(rows: FormEmailDefinition[]) {
  return rows.map((row) => ({ ...row }))
}

function cloneEmails(rows: FormEmailRecord[]) {
  return rows.map((row) => ({ ...row }))
}

function buildStorageKey(locationId: string, formId: string) {
  return `${locationId}::${formId}`
}

function buildRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `form-email-${Math.random().toString(36).slice(2, 10)}`
}

function getFormsForLocation(locationId: string, locationLabel?: string) {
  const byId = TEMPLATE_FORM_DEFINITIONS.get(locationId)
  if (byId) {
    return cloneForms(byId)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = TEMPLATE_FORM_DEFINITIONS.get(templateKey) ?? []
  return templateRows.map((row) => ({
    ...row,
    locationId,
  }))
}

function getEmailsForLocationAndForm(
  locationId: string,
  formId: string,
  locationLabel?: string
) {
  const byId = TEMPLATE_FORM_EMAILS.get(buildStorageKey(locationId, formId))
  if (byId) {
    return cloneEmails(byId)
  }

  const templateKey = resolveTemplateKey(locationLabel)
  if (!templateKey) {
    return []
  }

  const templateRows = TEMPLATE_FORM_EMAILS.get(buildStorageKey(templateKey, formId)) ?? []
  return templateRows.map((row) => ({
    ...row,
    id: `${locationId}-${row.id}`,
    locationId,
    formId,
  }))
}

function persistEmails(locationId: string, formId: string, rows: FormEmailRecord[]) {
  TEMPLATE_FORM_EMAILS.set(buildStorageKey(locationId, formId), cloneEmails(rows))
}

export async function getFormEmailFormsByLocation({
  locationId,
  locationLabel,
}: {
  locationId: string
  locationLabel?: string
}): Promise<FormEmailDefinition[]> {
  await wait(160)
  return getFormsForLocation(locationId, locationLabel)
}

export async function getFormEmailsByLocation({
  locationId,
  formId,
  locationLabel,
}: {
  locationId: string
  formId: string
  locationLabel?: string
}): Promise<FormEmailRecord[]> {
  await wait(160)
  return getEmailsForLocationAndForm(locationId, formId, locationLabel)
}

export async function createFormEmail({
  locationId,
  formId,
  locationLabel,
  emailAddress,
}: {
  locationId: string
  formId: string
  locationLabel?: string
  emailAddress: string
}): Promise<FormEmailRecord> {
  await wait(160)

  const rows = getEmailsForLocationAndForm(locationId, formId, locationLabel)
  const nextRow: FormEmailRecord = {
    id: buildRecordId(),
    locationId,
    formId,
    emailAddress,
  }

  rows.push(nextRow)
  persistEmails(locationId, formId, rows)
  return { ...nextRow }
}

export async function updateFormEmail({
  locationId,
  formId,
  locationLabel,
  emailId,
  emailAddress,
}: {
  locationId: string
  formId: string
  locationLabel?: string
  emailId: string
  emailAddress: string
}): Promise<FormEmailRecord> {
  await wait(160)

  const rows = getEmailsForLocationAndForm(locationId, formId, locationLabel)
  const rowIndex = rows.findIndex((row) => row.id === emailId)
  if (rowIndex < 0) {
    throw new Error("Unable to find the selected form email.")
  }

  const updatedRow: FormEmailRecord = {
    ...rows[rowIndex],
    emailAddress,
  }

  rows[rowIndex] = updatedRow
  persistEmails(locationId, formId, rows)
  return { ...updatedRow }
}

export async function deleteFormEmail({
  locationId,
  formId,
  locationLabel,
  emailId,
}: {
  locationId: string
  formId: string
  locationLabel?: string
  emailId: string
}): Promise<void> {
  await wait(160)

  const rows = getEmailsForLocationAndForm(locationId, formId, locationLabel).filter(
    (row) => row.id !== emailId
  )
  persistEmails(locationId, formId, rows)
}
