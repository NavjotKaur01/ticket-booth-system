import DOMPurify from "dompurify"

/**
 * Sanitize HTML before `dangerouslySetInnerHTML` (Phase 1).
 * Safe for TipTap previews and venue rotating-ad text.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) {
    return ""
  }

  return String(
    DOMPurify.sanitize(dirty, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "link"],
    })
  )
}
