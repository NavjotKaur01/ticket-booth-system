import type { LookupModel } from "@/types/api/save-show"
import type { ApiDefaultShowSection } from "@/types/api/save-show"
import type {
  ApiSystemLookupItem,
  SectionLookupItem,
} from "@/types/api/system-lookup"

export function mapSystemLookupsToSectionItems(
  lookups: ApiSystemLookupItem[]
): SectionLookupItem[] {
  return lookups
    .filter((item) => item.LookupType?.trim().toUpperCase() === "SECTION")
    .map((item) => ({
      code: item.LookupCode?.trim() ?? "",
      description: (item.LookupSDesc ?? item.LookupLDesc ?? "").trim(),
      lookupType: item.LookupType?.trim() ?? "SECTION",
      lookupOrder: item.LookupOrder ?? 0,
    }))
    .filter((item) => item.code && item.description)
    .sort((left, right) => left.description.localeCompare(right.description))
}

export function createCustomSectionLookup(
  sectionName: string,
  existingSections: SectionLookupItem[],
  pendingCustomSections: SectionLookupItem[]
): SectionLookupItem {
  const existing = [...existingSections, ...pendingCustomSections].find(
    (item) => item.description === sectionName
  )
  if (existing) {
    return existing
  }

  const sectCodes = existingSections
    .filter((item) => /^SECT\d+$/i.test(item.code))
    .map((item) => Number.parseInt(item.code.slice(4), 10))
    .filter((value) => Number.isFinite(value))

  const pendingCodes = pendingCustomSections
    .filter((item) => /^SECT\d+$/i.test(item.code))
    .map((item) => Number.parseInt(item.code.slice(4), 10))
    .filter((value) => Number.isFinite(value))

  const maxCode = Math.max(0, ...sectCodes, ...pendingCodes)
  const nextCode = maxCode + 1

  return {
    code: `SECT${nextCode}`,
    description: sectionName,
    lookupType: "SECTION",
    lookupOrder: 99,
  }
}

export function resolveSectionCode(
  sectionName: string | null | undefined,
  showSec: string | null | undefined,
  dbSections: SectionLookupItem[],
  pendingCustomSections: SectionLookupItem[]
) {
  if (showSec?.trim()) {
    return showSec.trim()
  }

  const normalizedName = sectionName?.trim()
  if (!normalizedName) {
    return null
  }

  const dbMatch = dbSections.find((item) => item.description === normalizedName)
  if (dbMatch) {
    return dbMatch.code
  }

  return createCustomSectionLookup(
    normalizedName,
    dbSections,
    pendingCustomSections
  ).code
}

export function resolveSectionOrder(
  sectionName: string | null | undefined,
  showSec: string | null | undefined,
  dbSections: SectionLookupItem[],
  pendingCustomSections: SectionLookupItem[]
) {
  const normalizedName = sectionName?.trim()
  const normalizedCode = showSec?.trim()

  const dbMatch =
    dbSections.find((item) => item.description === normalizedName) ??
    dbSections.find((item) => item.code === normalizedCode)
  if (dbMatch) {
    return dbMatch.lookupOrder
  }

  const pendingMatch =
    pendingCustomSections.find((item) => item.description === normalizedName) ??
    pendingCustomSections.find((item) => item.code === normalizedCode)
  if (pendingMatch) {
    return pendingMatch.lookupOrder
  }

  return 99
}

export function buildNewLookupList(
  sectionRows: ApiDefaultShowSection[],
  dbSections: SectionLookupItem[],
  pendingCustomSections: SectionLookupItem[]
): LookupModel[] {
  const result: LookupModel[] = []
  const seenCodes = new Set<string>()

  for (const row of sectionRows) {
    const sectionName = row.Section?.trim()
    if (!sectionName) {
      continue
    }

    const existsInDb = dbSections.some(
      (item) => item.description === sectionName
    )
    if (existsInDb) {
      continue
    }

    const customSection = pendingCustomSections.find(
      (item) => item.description === sectionName
    )
    if (!customSection || seenCodes.has(customSection.code)) {
      continue
    }

    seenCodes.add(customSection.code)
    result.push({
      LookupCode: customSection.code,
      LookupType: customSection.lookupType,
      LookupSDesc: customSection.description,
      LookupLDesc: customSection.description,
      LookupOrder: customSection.lookupOrder,
    })
  }

  return result
}

export function collectPendingCustomSections(
  sectionRows: ApiDefaultShowSection[],
  dbSections: SectionLookupItem[]
) {
  const pendingCustomSections: SectionLookupItem[] = []

  for (const row of sectionRows) {
    const sectionName = row.Section?.trim()
    if (!sectionName || row.ShowSec?.trim()) {
      continue
    }

    const existsInDb = dbSections.some(
      (item) => item.description === sectionName
    )
    if (existsInDb) {
      continue
    }

    const customSection = createCustomSectionLookup(
      sectionName,
      dbSections,
      pendingCustomSections
    )
    if (
      !pendingCustomSections.some((item) => item.code === customSection.code)
    ) {
      pendingCustomSections.push(customSection)
    }
  }

  return pendingCustomSections
}

export function applySectionLookupCodes(
  sectionRows: ApiDefaultShowSection[],
  dbSections: SectionLookupItem[],
  pendingCustomSections: SectionLookupItem[]
) {
  return sectionRows.map((row) => {
    const resolvedCode = resolveSectionCode(
      row.Section,
      row.ShowSec,
      dbSections,
      pendingCustomSections
    )

    if (!resolvedCode || resolvedCode === row.ShowSec) {
      return row
    }

    return {
      ...row,
      ShowSec: resolvedCode,
    }
  })
}
