/**
 * Write-only XLSX surface (Phase 1).
 *
 * Community `xlsx` still has published advisories with no fixed npm release.
 * This app only **writes** workbooks from trusted in-memory data — it never
 * calls `XLSX.read` / `readFile` on untrusted user uploads (the main
 * prototype-pollution / ReDoS vectors). Import from here instead of `xlsx`
 * so that policy stays obvious and auditable.
 */
import * as XLSX from "xlsx"

export { XLSX }
export default XLSX
