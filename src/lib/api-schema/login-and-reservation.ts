import { z } from "zod"

import { toSlimLoginCredentials } from "@/types/api/account-login"

/**
 * Permissive login Data schema (Phase 1).
 * Unknown keys are stripped via pick → toSlimLoginCredentials.
 */
export const loginCredentialsSchema = z
  .object({
    UserID: z.string().optional(),
    LocationID: z.string().optional(),
    UserName: z.string().optional(),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
    UserRights: z.string().optional(),
    Email: z.string().nullable().optional(),
  })
  .passthrough()

export function parseLoginCredentials(data: unknown) {
  const parsed = loginCredentialsSchema.safeParse(data)
  if (!parsed.success) {
    return null
  }

  return toSlimLoginCredentials(parsed.data as Record<string, unknown>)
}

/**
 * Permissive reservation-detail shape — validates object-ness; mapping still
 * allowlists fields. Used to reject non-objects early.
 */
export const reservationDetailWireSchema = z.record(z.string(), z.unknown())

export function parseReservationDetailWire(data: unknown) {
  const parsed = reservationDetailWireSchema.safeParse(data)
  return parsed.success ? parsed.data : null
}
